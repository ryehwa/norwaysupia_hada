package com.hadasupia.service;

import com.hadasupia.config.AppProperties;
import com.hadasupia.domain.Inquiry;
import com.hadasupia.repository.InquiryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.MessagingException;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/** 새 문의가 접수되면 지메일로 알림을 보낸다. */
@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);
    /** "550 5.1.1 ..." 같은 응답에서 앞의 3자리 코드를 뽑는다. */
    private static final java.util.regex.Pattern SMTP_CODE =
            java.util.regex.Pattern.compile("\\b([45]\\d{2})\\b");

    private static final DateTimeFormatter STAMP =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm").withZone(ZoneId.of("Asia/Seoul"));

    /** 이 횟수를 넘기면 스케줄러가 더 시도하지 않는다. */
    public static final int MAX_TRIES = 5;

    private final JavaMailSender mailSender;
    private final AppProperties props;
    private final InquiryRepository repository;

    public MailService(JavaMailSender mailSender, AppProperties props, InquiryRepository repository) {
        this.mailSender = mailSender;
        this.props = props;
        this.repository = repository;
    }

    /**
     * 알림 메일을 보내고 결과를 문의 행에 기록한다.
     * 커밋 이후(InquiryNotifier)와 스케줄러 재시도에서 호출되며,
     * 예외를 밖으로 던지지 않는다 — 문의 접수 자체는 이미 끝났기 때문이다.
     *
     * @return 발송 성공 여부
     */
    @Transactional
    public boolean send(Long inquiryId) {
        Inquiry q = repository.findById(inquiryId).orElse(null);
        if (q == null) return false;

        String to = props.getMail().getTo();
        if (!props.getMail().isEnabled() || to == null || to.isBlank()) {
            log.info("메일 알림 비활성 상태 — 문의 #{} 발송 건너뜀", inquiryId);
            return false;
        }
        if (q.getNotifiedAt() != null) return true; // 이미 보냈다

        q.setNotifyTries(q.getNotifyTries() + 1);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("[홈페이지] 새 문의 — " + q.getName() + " (" + q.getSpaceType().getLabel() + ")");
            message.setText(body(q));
            mailSender.send(message);

            q.setNotifiedAt(Instant.now());
            q.setNotifyError(null);
            log.info("문의 #{} 알림 메일 발송 완료 ({}회차)", inquiryId, q.getNotifyTries());
            return true;
        } catch (Exception e) {
            String reason = describe(e);
            q.setNotifyError(reason);
            if (isPermanent(e)) {
                // 재시도해도 결과가 같은 오류다. 횟수를 소진시켜 스케줄러가 잡지 않게 한다.
                q.setNotifyTries(MAX_TRIES);
                log.error("문의 #{} 알림 메일 발송 실패 — 재시도 중단: {}", inquiryId, reason);
            } else {
                log.error("문의 #{} 알림 메일 발송 실패 ({}/{}) — {}",
                        inquiryId, q.getNotifyTries(), MAX_TRIES, reason);
            }
            return false;
        }
    }

    /**
     * 재시도해도 결과가 달라지지 않는 오류인지 판단한다.
     * 인증 실패(앱 비밀번호 오류)와 5xx 영구 거부가 여기 해당한다.
     * 4xx 는 일시적이므로 재시도 대상으로 남긴다.
     */
    private boolean isPermanent(Exception e) {
        if (e instanceof MailAuthenticationException) return true;
        java.util.regex.Matcher m = SMTP_CODE.matcher(rootMessage(e));
        return m.find() && m.group(1).startsWith("5");
    }

    /** 예외에서 SMTP 응답 코드를 뽑아 한 줄로 만든다. */
    private String describe(Exception e) {
        if (e instanceof MailAuthenticationException) {
            return "인증 실패 — 앱 비밀번호를 확인하세요 (" + rootMessage(e) + ")";
        }
        String msg = rootMessage(e);
        java.util.regex.Matcher m = SMTP_CODE.matcher(msg);
        if (m.find()) {
            String code = m.group(1);
            String kind = code.startsWith("4") ? "일시 오류" : "영구 오류";
            return "SMTP " + code + " " + kind + " — " + msg;
        }
        return msg;
    }

    private String rootMessage(Throwable e) {
        Throwable t = e;
        while (t.getCause() != null && t.getCause() != t) t = t.getCause();
        String m = t instanceof MessagingException ? t.getMessage() : t.toString();
        if (m == null) m = t.toString();
        return m.length() > 200 ? m.substring(0, 200) : m;
    }

    private String body(Inquiry q) {
        StringBuilder sb = new StringBuilder();
        sb.append("새 문의가 접수되었습니다.\n\n");
        sb.append("이름: ").append(q.getName()).append('\n');
        sb.append("연락처: ").append(q.getPhone()).append('\n');
        sb.append("문의 일시: ").append(STAMP.format(q.getSubmittedAt())).append('\n');
        sb.append("시공 장소: ").append(q.getAddress());
        if (q.getAddressDetail() != null && !q.getAddressDetail().isBlank()) {
            sb.append(' ').append(q.getAddressDetail());
        }
        sb.append('\n');
        sb.append("공간 유형: ").append(q.getSpaceType().getLabel()).append('\n');
        if (q.getSize() != null && !q.getSize().isBlank()) {
            sb.append("공간 크기: ").append(q.getSize()).append(q.getSizeUnit()).append('\n');
        }
        if (q.getWorkDate() != null) {
            sb.append("공사 희망일자: ").append(q.getWorkDate()).append('\n');
        }
        if (q.getConsultDate() != null) {
            sb.append("상담 희망일시: ").append(q.getConsultDate()).append(' ').append(q.getConsultTime()).append('\n');
        }
        if (q.getNote() != null && !q.getNote().isBlank()) {
            sb.append("\n비고:\n").append(q.getNote()).append('\n');
        }
        sb.append("\n관리자 콘솔에서 확인하세요.\n");
        sb.append(props.getFrontendOrigin()).append("/admin/inquiries?id=").append(q.getId()).append('\n');
        return sb.toString();
    }
}
