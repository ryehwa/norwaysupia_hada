package com.hadasupia.service;

import com.hadasupia.domain.Inquiry;
import com.hadasupia.repository.InquiryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

/**
 * 알림 발송을 트랜잭션 밖으로 분리한다.
 *
 * 문의 저장과 메일 발송은 한 트랜잭션으로 묶을 수 없다 — DB 는 롤백되지만
 * 이미 나간 메일은 회수할 수 없기 때문이다. 그래서 커밋이 끝난 뒤에만 보내고,
 * 실패하면 문의 행에 흔적을 남겨 스케줄러가 이어서 재시도한다.
 * 발송 여부와 무관하게 문의 데이터 자체는 이미 저장돼 있다.
 */
@Component
public class InquiryNotifier {

    private static final Logger log = LoggerFactory.getLogger(InquiryNotifier.class);

    /** 이 기간이 지난 미발송 건은 자동 재시도하지 않는다. */
    static final Duration RETRY_WINDOW = Duration.ofDays(7);

    /**
     * 접수 직후 이 시간 동안은 스케줄러가 건드리지 않는다.
     * 최초 발송(AFTER_COMMIT)이 아직 진행 중일 수 있는데, 그 트랜잭션이
     * 커밋되기 전에는 스케줄러 눈에 미발송으로 보여 같은 건을 또 보내게 된다.
     * SMTP 타임아웃 합계보다 넉넉히 잡으면 겹칠 일이 없다.
     */
    private static final Duration SETTLE_DELAY = Duration.ofMinutes(3);

    private final MailService mailService;
    private final InquiryRepository repository;

    public InquiryNotifier(MailService mailService, InquiryRepository repository) {
        this.mailService = mailService;
        this.repository = repository;
    }

    /** 커밋이 끝난 뒤에 실행된다. 롤백되면 호출되지 않는다. */
    @Async
    @TransactionalEventListener
    public void onSubmitted(InquirySubmitted event) {
        mailService.send(event.inquiryId());
    }

    /**
     * 못 보낸 건을 주기적으로 다시 시도한다.
     * 서버가 재시작돼도 DB 에 남아 있으므로 이어서 처리된다.
     */
    @Scheduled(fixedDelayString = "${app.mail.retry-interval-ms:300000}", initialDelay = 60_000)
    public void retryUnsent() {
        Instant now = Instant.now();
        List<Inquiry> pending = repository
                .findTop20ByNotifiedAtIsNullAndNotifyTriesLessThanAndSubmittedAtBetweenOrderByIdAsc(
                        MailService.MAX_TRIES, now.minus(RETRY_WINDOW), now.minus(SETTLE_DELAY));
        if (pending.isEmpty()) return;

        log.info("미발송 알림 {}건 재시도", pending.size());
        for (Inquiry q : pending) {
            mailService.send(q.getId());
        }
    }
}
