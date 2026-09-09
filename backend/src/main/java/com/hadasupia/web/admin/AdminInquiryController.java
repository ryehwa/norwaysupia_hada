package com.hadasupia.web.admin;

import com.hadasupia.dto.CommonDtos.DashboardView;
import com.hadasupia.dto.InquiryDtos.InquiryDetail;
import com.hadasupia.dto.InquiryDtos.InquiryRow;
import com.hadasupia.service.InquiryService;
import com.hadasupia.service.ProjectService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** 관리자 — 문의 관리 및 대시보드 */
@RestController
@RequestMapping("/api/admin")
public class AdminInquiryController {

    private final InquiryService inquiryService;
    private final ProjectService projectService;

    public AdminInquiryController(InquiryService inquiryService, ProjectService projectService) {
        this.inquiryService = inquiryService;
        this.projectService = projectService;
    }

    @GetMapping("/dashboard")
    public DashboardView dashboard() {
        return new DashboardView(
                projectService.count(),
                inquiryService.countPending(),
                inquiryService.countAll(),
                inquiryService.countUnnotified(),
                inquiryService.recent(4)
        );
    }

    /**
     * 문의 목록. 처리 전(대기)과 완료 섹션을 각각 다른 정렬로 불러올 수 있다.
     * @param status "대기" | "완료" (생략 시 전체)
     * @param sort   "submittedAt"(문의일시) | "consult"(상담 희망)
     * @param dir    "desc" | "asc"
     */
    @GetMapping("/inquiries")
    public List<InquiryRow> list(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "submittedAt") String sort,
            @RequestParam(defaultValue = "desc") String dir) {
        return inquiryService.list(status, sort, dir);
    }

    @GetMapping("/inquiries/{id}")
    public InquiryDetail detail(@PathVariable Long id) {
        return inquiryService.detail(id);
    }

    /** 상담일자 확정 */
    @PostMapping("/inquiries/{id}/confirm")
    public InquiryDetail confirm(@PathVariable Long id) {
        return inquiryService.confirm(id);
    }

    /** 상담예약 해제 — 점유했던 시간대가 다시 열린다 */
    @PostMapping("/inquiries/{id}/release")
    public InquiryDetail release(@PathVariable Long id) {
        return inquiryService.release(id);
    }

    /** 해제된 예약 재확정 — 겹치면 409 */
    @PostMapping("/inquiries/{id}/rereserve")
    public InquiryDetail rereserve(@PathVariable Long id) {
        return inquiryService.rereserve(id);
    }

    @PatchMapping("/inquiries/{id}/status")
    public InquiryDetail setStatus(@PathVariable Long id, @RequestParam String status) {
        return inquiryService.setStatus(id, status);
    }
}
