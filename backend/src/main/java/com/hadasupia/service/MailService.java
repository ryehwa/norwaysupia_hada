package com.hadasupia.service;

import com.hadasupia.config.AppProperties;
import com.hadasupia.domain.Inquiry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/** 새 문의가 접수되면 지메일로 알림을 보낸다. */
@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);
    private static final DateTimeFormatter STAMP =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm").withZone(ZoneId.of("Asia/Seoul"));

    private final JavaMailSender mailSender;
    private final AppProperties props;

    public MailService(JavaMailSender mailSender, AppProperties props) {
        this.mailSender = mailSender;
        this.props = props;
    }

    /** 메일 발송이 실패해도 문의 접수 자체는 성공시켜야 하므로 예외를 삼킨다. */
    @Async
    public void notifyNewInquiry(Inquiry q) {
        String to = props.getMail().getTo();
        if (!props.getMail().isEnabled() || to == null || to.isBlank()) {
            log.info("메일 알림 비활성 상태 — 문의 #{} 발송 건너뜀", q.getId());
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("[홈페이지] 새 문의 — " + q.getName() + " (" + q.getSpaceType().getLabel() + ")");
            message.setText(body(q));
            mailSender.send(message);
            log.info("문의 #{} 알림 메일 발송 완료", q.getId());
        } catch (Exception e) {
            log.error("문의 #{} 알림 메일 발송 실패", q.getId(), e);
        }
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
        return sb.toString();
    }
}
