package com.hadasupia.dto;

import com.hadasupia.domain.SiteInfo;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalTime;
import java.util.List;

public final class CommonDtos {

    private CommonDtos() {}

    public record LoginRequest(
            @NotBlank(message = "아이디를 입력해 주세요.") String username,
            @NotBlank(message = "비밀번호를 입력해 주세요.") String password
    ) {}

    public record MeResponse(String username, String displayName) {}

    public record SiteInfoView(String address, String phone, String email, String businessHours) {
        public static SiteInfoView of(SiteInfo s) {
            return new SiteInfoView(s.getAddress(), s.getPhone(), s.getEmail(), s.getBusinessHours());
        }
    }

    public record SiteInfoRequest(
            @NotBlank String address,
            @NotBlank String phone,
            @NotBlank String email,
            @NotBlank String businessHours
    ) {}

    /** 관리자 시간대 화면의 한 칸 */
    public record SlotView(LocalTime time, String state, String reservedBy) {}

    /** 관리자: 특정 날짜의 마감 시간 목록을 통째로 저장 */
    public record SlotClosureRequest(List<LocalTime> closedTimes) {}

    /** HOME 노출 3칸 */
    public record FeaturedSlotView(int slotIndex, ProjectDtos.ProjectSummary project) {}

    /** 저장 버튼: 3칸의 projectId 배열 (빈 칸은 null) */
    public record FeaturedSaveRequest(List<Long> projectIds) {}

    public record DashboardView(long projectCount, long pendingCount, long totalInquiryCount,
                                List<InquiryDtos.InquiryRow> recentInquiries) {}
}
