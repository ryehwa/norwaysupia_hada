package com.hadasupia.service;

import com.hadasupia.domain.Category;
import com.hadasupia.domain.Inquiry;
import com.hadasupia.domain.InquiryStatus;
import com.hadasupia.dto.InquiryDtos.*;
import com.hadasupia.repository.InquiryRepository;
import com.hadasupia.support.ConflictException;
import com.hadasupia.support.NotFoundException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InquiryService {

    private final InquiryRepository repository;
    private final SlotService slotService;
    private final MailService mailService;

    public InquiryService(InquiryRepository repository, SlotService slotService, MailService mailService) {
        this.repository = repository;
        this.slotService = slotService;
        this.mailService = mailService;
    }

    // ----- 접수 (유저 사이트) -----

    @Transactional
    public Long submit(InquiryRequest req) {
        if (!req.privacyAgreed()) {
            throw new IllegalArgumentException("개인 정보 수집에 동의해 주세요.");
        }
        if (req.consultDate() != null && req.consultTime() != null
                && !slotService.isBookable(req.consultDate(), req.consultTime(), null)) {
            throw new ConflictException("선택한 상담 시간은 이미 마감되었습니다. 다른 시간을 선택해 주세요.");
        }

        Inquiry q = new Inquiry();
        q.setName(req.name().trim());
        q.setPhone(req.phone().replaceAll("[^0-9]", ""));
        q.setAddress(req.address().trim());
        q.setAddressDetail(req.addressDetail());
        q.setSpaceType(Category.fromLabel(req.spaceType()));
        q.setSize(req.size());
        if (req.sizeUnit() != null && !req.sizeUnit().isBlank()) q.setSizeUnit(req.sizeUnit());
        q.setWorkDate(req.workDate());
        q.setConsultDate(req.consultDate());
        q.setConsultTime(req.consultTime());
        q.setNote(req.note());
        // 확정 전에도 슬롯을 점유한다
        q.setReserved(req.consultDate() != null && req.consultTime() != null);
        q.setConfirmed(false);
        q.setStatus(InquiryStatus.PENDING);

        repository.save(q);
        mailService.notifyNewInquiry(q);
        return q.getId();
    }

    // ----- 목록 / 상세 (관리자) -----

    /**
     * @param statusLabel "대기" 또는 "완료"
     * @param sortKey     "submittedAt" | "consult"
     * @param dir         "asc" | "desc"
     */
    @Transactional(readOnly = true)
    public List<InquiryRow> list(String statusLabel, String sortKey, String dir) {
        Sort.Direction direction = "asc".equalsIgnoreCase(dir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sort = "consult".equalsIgnoreCase(sortKey)
                ? Sort.by(direction, "consultDate", "consultTime")
                : Sort.by(direction, "submittedAt");

        List<Inquiry> found = (statusLabel == null || statusLabel.isBlank())
                ? repository.findAll(sort)
                : repository.findAllByStatus(InquiryStatus.fromLabel(statusLabel), sort);

        return found.stream().map(InquiryRow::of).toList();
    }

    @Transactional(readOnly = true)
    public InquiryDetail detail(Long id) {
        Inquiry q = find(id);
        return InquiryDetail.of(q, slotService.endTimeOf(q.getConsultTime()));
    }

    private Inquiry find(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("문의를 찾을 수 없습니다: " + id));
    }

    // ----- 상담 예약 플로우 -----
    // 확정 · 해제 · 재예약 중 하나라도 거치면 상태가 완료로 넘어간다.

    @Transactional
    public InquiryDetail confirm(Long id) {
        Inquiry q = find(id);
        if (!q.isReserved()) {
            throw new ConflictException("예약이 해제된 문의입니다. 먼저 재예약해 주세요.");
        }
        q.setConfirmed(true);
        q.setStatus(InquiryStatus.DONE);
        return detail(id);
    }

    /** 예약 해제 — 점유했던 시간대가 다시 열린다. 상담 희망일시 값 자체는 남긴다. */
    @Transactional
    public InquiryDetail release(Long id) {
        Inquiry q = find(id);
        q.setReserved(false);
        q.setConfirmed(false);
        q.setStatus(InquiryStatus.DONE);
        return detail(id);
    }

    /** 해제된 예약을 같은 시간으로 다시 확정. 그 사이 다른 예약이 찼으면 409. */
    @Transactional
    public InquiryDetail rereserve(Long id) {
        Inquiry q = find(id);
        if (q.getConsultDate() == null || q.getConsultTime() == null) {
            throw new IllegalArgumentException("상담 희망일시가 없는 문의입니다.");
        }
        if (!slotService.isBookable(q.getConsultDate(), q.getConsultTime(), q.getId())) {
            throw new ConflictException("해당 시간대에는 이미 다른 예약이 차 있습니다.");
        }
        q.setReserved(true);
        q.setConfirmed(true);
        q.setStatus(InquiryStatus.DONE);
        return detail(id);
    }

    @Transactional
    public InquiryDetail setStatus(Long id, String statusLabel) {
        Inquiry q = find(id);
        q.setStatus(InquiryStatus.fromLabel(statusLabel));
        return detail(id);
    }

    @Transactional(readOnly = true)
    public long countPending() { return repository.countByStatus(InquiryStatus.PENDING); }

    @Transactional(readOnly = true)
    public long countAll() { return repository.count(); }

    @Transactional(readOnly = true)
    public List<InquiryRow> recent(int limit) {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "submittedAt"))
                .stream().limit(limit).map(InquiryRow::of).toList();
    }
}
