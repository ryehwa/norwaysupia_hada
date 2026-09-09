package com.hadasupia.dto;

import com.hadasupia.domain.Inquiry;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public final class InquiryDtos {

    private InquiryDtos() {}

    /** 유저 사이트의 프로젝트 문의 폼에서 실제로 받는 값만 담는다. */
    public record InquiryRequest(
            @NotBlank(message = "이름을 입력해 주세요.") String name,
            @NotBlank(message = "연락처를 입력해 주세요.")
            @Pattern(regexp = "^[0-9-]{9,20}$", message = "연락처는 숫자만 입력해 주세요.") String phone,
            @NotBlank(message = "시공 장소를 입력해 주세요.") String address,
            String addressDetail,
            @NotBlank(message = "공간 유형을 선택해 주세요.") String spaceType,
            String size,
            String sizeUnit,
            LocalDate workDate,
            LocalDate consultDate,
            LocalTime consultTime,
            String note,
            boolean privacyAgreed
    ) {}

    /** 목록 행 */
    public record InquiryRow(
            Long id,
            String name,
            String phone,
            String address,
            String spaceType,
            LocalDate consultDate,
            LocalTime consultTime,
            Instant submittedAt,
            String status,
            boolean reserved,
            boolean confirmed,
            boolean notified,
            String notifyError
    ) {
        public static InquiryRow of(Inquiry q) {
            return new InquiryRow(
                    q.getId(), q.getName(), q.getPhone(), q.getAddress(),
                    q.getSpaceType().getLabel(), q.getConsultDate(), q.getConsultTime(),
                    q.getSubmittedAt(), q.getStatus().getLabel(),
                    q.isReserved(), q.isConfirmed(),
                    q.getNotifiedAt() != null, q.getNotifyError()
            );
        }
    }

    /** 상세 — 문의 폼에서 받은 항목 전체 */
    public record InquiryDetail(
            Long id,
            String name,
            String phone,
            Instant submittedAt,
            String address,
            String addressDetail,
            String spaceType,
            String size,
            String sizeUnit,
            LocalDate workDate,
            LocalDate consultDate,
            LocalTime consultTime,
            LocalTime consultEndTime,
            boolean reserved,
            boolean confirmed,
            String note,
            String status,
            boolean notified,
            Instant notifiedAt,
            String notifyError,
            int notifyTries
    ) {
        public static InquiryDetail of(Inquiry q, LocalTime endTime) {
            return new InquiryDetail(
                    q.getId(), q.getName(), q.getPhone(), q.getSubmittedAt(),
                    q.getAddress(), q.getAddressDetail(), q.getSpaceType().getLabel(),
                    q.getSize(), q.getSizeUnit(), q.getWorkDate(),
                    q.getConsultDate(), q.getConsultTime(), endTime,
                    q.isReserved(), q.isConfirmed(), q.getNote(), q.getStatus().getLabel(),
                    q.getNotifiedAt() != null, q.getNotifiedAt(), q.getNotifyError(), q.getNotifyTries()
            );
        }
    }
}
