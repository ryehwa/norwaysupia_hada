package com.hadasupia.repository;

import com.hadasupia.domain.Inquiry;
import com.hadasupia.domain.InquiryStatus;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    List<Inquiry> findAllByStatus(InquiryStatus status, Sort sort);
    List<Inquiry> findAllByReservedTrueAndConsultDate(LocalDate consultDate);
    long countByStatus(InquiryStatus status);

    /**
     * 아직 알림을 못 보냈고 시도 횟수가 남은, 최근 문의 — 스케줄러가 쓴다.
     * 기간을 끊는 이유는 두 가지다. 오래된 건은 이미 콘솔에서 확인했을 것이고,
     * 컬럼을 새로 추가한 직후 과거 문의 전체가 재발송되는 사고를 막는다.
     */
    List<Inquiry> findTop20ByNotifiedAtIsNullAndNotifyTriesLessThanAndSubmittedAtBetweenOrderByIdAsc(
            int maxTries, Instant since, Instant until);

    /**
     * 최근 미발송 건수 — 대시보드 경고용.
     * 전체 기간을 세면 한 번 실패한 건이 영구히 남아 경고등이 꺼지지 않는다.
     * 재시도 기간과 같은 창을 쓰면 원인을 고쳤을 때 자연히 0 이 된다.
     */
    long countByNotifiedAtIsNullAndSubmittedAtAfter(Instant since);
}
