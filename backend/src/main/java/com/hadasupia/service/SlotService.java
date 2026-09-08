package com.hadasupia.service;

import com.hadasupia.config.AppProperties;
import com.hadasupia.domain.Inquiry;
import com.hadasupia.domain.SlotClosure;
import com.hadasupia.dto.CommonDtos.SlotView;
import com.hadasupia.repository.InquiryRepository;
import com.hadasupia.repository.SlotClosureRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 상담 시간대 규칙
 * - 시간대는 30분 단위로 열린다.
 * - 예약 1건은 60분(연속 2칸)을 차지한다.
 * - 확정 전에도 문의가 접수되면 그 시간은 마감된다.
 * - 예약이 해제되면 차지했던 칸이 모두 다시 열린다.
 */
@Service
public class SlotService {

    private final SlotClosureRepository closureRepository;
    private final InquiryRepository inquiryRepository;
    private final AppProperties.Consult consult;

    public SlotService(SlotClosureRepository closureRepository,
                       InquiryRepository inquiryRepository,
                       AppProperties props) {
        this.closureRepository = closureRepository;
        this.inquiryRepository = inquiryRepository;
        this.consult = props.getConsult();
    }

    /** 영업 시간 안의 모든 30분 슬롯 */
    public List<LocalTime> allTimes() {
        List<LocalTime> times = new ArrayList<>();
        LocalTime t = consult.getOpenTime();
        while (!t.isAfter(consult.getCloseTime())) {
            times.add(t);
            t = t.plusMinutes(consult.getStepMinutes());
        }
        return times;
    }

    /** 예약 1건이 차지하는 칸들 (시작 시각 포함, 60분 = 2칸) */
    public List<LocalTime> occupiedBy(LocalTime start) {
        List<LocalTime> result = new ArrayList<>();
        if (start == null) return result;
        for (int i = 0; i < consult.slotsPerReservation(); i++) {
            result.add(start.plusMinutes((long) i * consult.getStepMinutes()));
        }
        return result;
    }

    /** 상담 종료 시각 (시작 + 60분) */
    public LocalTime endTimeOf(LocalTime start) {
        return start == null ? null : start.plusMinutes(consult.getDurationMinutes());
    }

    /** 해당 날짜에 예약이 점유한 시각 → 예약자 이름 */
    @Transactional(readOnly = true)
    public Map<LocalTime, String> reservedTimes(LocalDate date, Long excludeInquiryId) {
        Map<LocalTime, String> reserved = new HashMap<>();
        for (Inquiry q : inquiryRepository.findAllByReservedTrueAndConsultDate(date)) {
            if (excludeInquiryId != null && excludeInquiryId.equals(q.getId())) continue;
            for (LocalTime t : occupiedBy(q.getConsultTime())) {
                reserved.put(t, q.getName());
            }
        }
        return reserved;
    }

    /** 관리자가 마감해 둔 시각 */
    @Transactional(readOnly = true)
    public List<LocalTime> closedTimes(LocalDate date) {
        return closureRepository.findAllByDate(date).stream().map(SlotClosure::getTime).toList();
    }

    /** 관리자 화면용 — 칸별 상태(open / closed / reserved) */
    @Transactional(readOnly = true)
    public List<SlotView> adminView(LocalDate date) {
        Map<LocalTime, String> reserved = reservedTimes(date, null);
        List<LocalTime> closed = closedTimes(date);

        List<SlotView> views = new ArrayList<>();
        for (LocalTime t : allTimes()) {
            if (reserved.containsKey(t)) {
                views.add(new SlotView(t, "reserved", reserved.get(t)));
            } else if (closed.contains(t)) {
                views.add(new SlotView(t, "closed", null));
            } else {
                views.add(new SlotView(t, "open", null));
            }
        }
        return views;
    }

    /**
     * 유저 사이트용 — 실제로 예약 가능한 시작 시각만.
     * 예약이 60분을 쓰므로 뒤따르는 칸까지 비어 있어야 선택할 수 있다.
     */
    @Transactional(readOnly = true)
    public List<LocalTime> availableStartTimes(LocalDate date) {
        Map<LocalTime, String> reserved = reservedTimes(date, null);
        List<LocalTime> closed = closedTimes(date);
        List<LocalTime> all = allTimes();

        List<LocalTime> available = new ArrayList<>();
        for (LocalTime start : all) {
            List<LocalTime> needed = occupiedBy(start);
            boolean ok = needed.stream()
                    .allMatch(t -> all.contains(t) && !reserved.containsKey(t) && !closed.contains(t));
            if (ok) available.add(start);
        }
        return available;
    }

    /** 특정 시각에 예약을 넣을 수 있는지 (재예약 충돌 검사에 사용) */
    @Transactional(readOnly = true)
    public boolean isBookable(LocalDate date, LocalTime start, Long excludeInquiryId) {
        if (date == null || start == null) return false;
        Map<LocalTime, String> reserved = reservedTimes(date, excludeInquiryId);
        List<LocalTime> closed = closedTimes(date);
        List<LocalTime> all = allTimes();
        return occupiedBy(start).stream()
                .allMatch(t -> all.contains(t) && !reserved.containsKey(t) && !closed.contains(t));
    }

    /** 관리자: 그 날짜의 마감 시간 목록을 통째로 교체 */
    @Transactional
    public void replaceClosures(LocalDate date, List<LocalTime> closedTimes) {
        closureRepository.deleteAllByDate(date);
        if (closedTimes == null) return;
        for (LocalTime t : closedTimes) {
            closureRepository.save(new SlotClosure(date, t));
        }
    }

    public int bookableDays() { return consult.getBookableDays(); }
}
