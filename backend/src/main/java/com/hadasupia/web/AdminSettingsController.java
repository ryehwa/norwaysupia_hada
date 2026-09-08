package com.hadasupia.web;

import com.hadasupia.dto.CommonDtos.SiteInfoRequest;
import com.hadasupia.dto.CommonDtos.SiteInfoView;
import com.hadasupia.dto.CommonDtos.SlotClosureRequest;
import com.hadasupia.dto.CommonDtos.SlotView;
import com.hadasupia.service.SiteInfoService;
import com.hadasupia.service.SlotService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/** 관리자 — 상담 시간대 관리 및 사이트 정보 */
@RestController
@RequestMapping("/api/admin")
public class AdminSettingsController {

    private final SlotService slotService;
    private final SiteInfoService siteInfoService;

    public AdminSettingsController(SlotService slotService, SiteInfoService siteInfoService) {
        this.slotService = slotService;
        this.siteInfoService = siteInfoService;
    }

    /** 날짜별 시간대 상태 — open / closed / reserved(예약자명 포함) */
    @GetMapping("/slots")
    public Map<String, Object> slots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<SlotView> slots = slotService.adminView(date);
        long open = slots.stream().filter(s -> "open".equals(s.state())).count();
        return Map.of("date", date, "slots", slots, "openCount", open);
    }

    /** 그 날짜의 마감 시간 목록을 통째로 저장 */
    @PutMapping("/slots")
    public Map<String, Object> saveSlots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestBody SlotClosureRequest req) {
        slotService.replaceClosures(date, req.closedTimes());
        return slots(date);
    }

    @GetMapping("/site-info")
    public SiteInfoView siteInfo() {
        return siteInfoService.get();
    }

    @PutMapping("/site-info")
    public SiteInfoView updateSiteInfo(@Valid @RequestBody SiteInfoRequest req) {
        return siteInfoService.update(req);
    }
}
