package com.hadasupia.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "inquiries", indexes = {
        @Index(name = "idx_inquiry_status", columnList = "status"),
        @Index(name = "idx_inquiry_consult", columnList = "consultDate, consultTime"),
        @Index(name = "idx_inquiry_submitted", columnList = "submittedAt"),
        // 스케줄러가 미발송 건만 골라내는 조건
        @Index(name = "idx_inquiry_notify", columnList = "notifiedAt")
})
public class Inquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 60)
    private String name;

    @Column(nullable = false, length = 30)
    private String phone;

    /** 시공 장소 — 주소 검색 API 결과 */
    @Column(nullable = false, length = 300)
    private String address;

    @Column(length = 200)
    private String addressDetail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Category spaceType;

    /** 공간 크기 (숫자) */
    @Column(length = 20)
    private String size;

    /** 평 또는 m² */
    @Column(length = 10)
    private String sizeUnit = "평";

    /** 공사 희망일자 */
    private LocalDate workDate;

    /** 상담 희망일시 — 시간대 관리의 슬롯과 연결된다 */
    private LocalDate consultDate;
    private LocalTime consultTime;

    /** 슬롯을 점유하고 있는지. 확정 전에도 true (문의 접수 시점부터 마감) */
    @Column(nullable = false)
    private boolean reserved = true;

    /** 관리자가 상담일자를 확정했는지 */
    @Column(nullable = false)
    private boolean confirmed = false;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InquiryStatus status = InquiryStatus.PENDING;

    @Column(nullable = false)
    private Instant submittedAt = Instant.now();

    /** 알림 메일 발송 완료 시각. null 이면 아직 못 보낸 건이다. */
    private Instant notifiedAt;

    /** 마지막 발송 실패 사유 (SMTP 응답 코드 포함) */
    @Column(length = 300)
    private String notifyError;

    /** 발송 시도 횟수. 일정 횟수를 넘기면 스케줄러가 더 시도하지 않는다. */
    @Column(nullable = false)
    private int notifyTries;

    public Long getId() { return id; }
    public void setId(Long v) { this.id = v; }
    public String getName() { return name; }
    public void setName(String v) { this.name = v; }
    public String getPhone() { return phone; }
    public void setPhone(String v) { this.phone = v; }
    public String getAddress() { return address; }
    public void setAddress(String v) { this.address = v; }
    public String getAddressDetail() { return addressDetail; }
    public void setAddressDetail(String v) { this.addressDetail = v; }
    public Category getSpaceType() { return spaceType; }
    public void setSpaceType(Category v) { this.spaceType = v; }
    public String getSize() { return size; }
    public void setSize(String v) { this.size = v; }
    public String getSizeUnit() { return sizeUnit; }
    public void setSizeUnit(String v) { this.sizeUnit = v; }
    public LocalDate getWorkDate() { return workDate; }
    public void setWorkDate(LocalDate v) { this.workDate = v; }
    public LocalDate getConsultDate() { return consultDate; }
    public void setConsultDate(LocalDate v) { this.consultDate = v; }
    public LocalTime getConsultTime() { return consultTime; }
    public void setConsultTime(LocalTime v) { this.consultTime = v; }
    public boolean isReserved() { return reserved; }
    public void setReserved(boolean v) { this.reserved = v; }
    public boolean isConfirmed() { return confirmed; }
    public void setConfirmed(boolean v) { this.confirmed = v; }
    public String getNote() { return note; }
    public void setNote(String v) { this.note = v; }
    public InquiryStatus getStatus() { return status; }
    public void setStatus(InquiryStatus v) { this.status = v; }
    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant v) { this.submittedAt = v; }
    public Instant getNotifiedAt() { return notifiedAt; }
    public void setNotifiedAt(Instant v) { this.notifiedAt = v; }
    public String getNotifyError() { return notifyError; }
    public void setNotifyError(String v) { this.notifyError = v; }
    public int getNotifyTries() { return notifyTries; }
    public void setNotifyTries(int v) { this.notifyTries = v; }
}
