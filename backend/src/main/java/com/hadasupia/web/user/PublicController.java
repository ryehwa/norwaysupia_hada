package com.hadasupia.web.user;

import com.hadasupia.dto.CommonDtos.FeaturedSlotView;
import com.hadasupia.dto.CommonDtos.SiteInfoView;
import com.hadasupia.dto.InquiryDtos.InquiryRequest;
import com.hadasupia.dto.ProjectDtos.PageResponse;
import com.hadasupia.dto.ProjectDtos.ProjectSummary;
import com.hadasupia.dto.ProjectDtos.ProjectView;
import com.hadasupia.service.InquiryService;
import com.hadasupia.service.ProjectService;
import com.hadasupia.service.SiteInfoService;
import com.hadasupia.service.SlotService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

/** 유저 사이트가 쓰는 공개 API — 인증 없이 접근 가능 */
@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final ProjectService projectService;
    private final InquiryService inquiryService;
    private final SlotService slotService;
    private final SiteInfoService siteInfoService;

    public PublicController(ProjectService projectService,
                            InquiryService inquiryService,
                            SlotService slotService,
                            SiteInfoService siteInfoService) {
        this.projectService = projectService;
        this.inquiryService = inquiryService;
        this.slotService = slotService;
        this.siteInfoService = siteInfoService;
    }

    /** 시공사례 목록 — 카테고리 필터, 초성 검색, 페이지네이션(기본 9개 = 3×3) */
    @GetMapping("/projects")
    public PageResponse<ProjectSummary> projects(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size) {
        return projectService.search(category, q, page, size);
    }

    @GetMapping("/projects/{id}")
    public ProjectView project(@PathVariable Long id) {
        return projectService.get(id);
    }

    /** HOME에 노출되는 사례 3건 */
    @GetMapping("/featured")
    public List<FeaturedSlotView> featured() {
        return projectService.featured();
    }

    @GetMapping("/site-info")
    public SiteInfoView siteInfo() {
        return siteInfoService.get();
    }

    /** 문의 폼의 상담 예약에서 고를 수 있는 시간 (예약이 1시간을 쓰므로 뒤 칸까지 빈 시각만) */
    @GetMapping("/slots")
    public Map<String, Object> slots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<LocalTime> available = slotService.availableStartTimes(date);
        return Map.of(
                "date", date,
                "availableTimes", available,
                "bookableDays", slotService.bookableDays()
        );
    }

    /** 문의 접수 — 성공 시 지메일 알림이 발송된다 */
    @PostMapping("/inquiries")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> submit(@Valid @RequestBody InquiryRequest request) {
        Long id = inquiryService.submit(request);
        return Map.of("id", id, "message", "문의가 접수되었습니다.");
    }
}
