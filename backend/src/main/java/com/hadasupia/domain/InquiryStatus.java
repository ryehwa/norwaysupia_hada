package com.hadasupia.domain;

/** 문의 처리 상태 — 상담 확정/해제/재예약 중 하나라도 거치면 DONE으로 넘어간다. */
public enum InquiryStatus {
    PENDING("대기"),
    DONE("완료");

    private final String label;

    InquiryStatus(String label) { this.label = label; }

    public String getLabel() { return label; }

    public static InquiryStatus fromLabel(String v) {
        if (v == null) return null;
        for (InquiryStatus s : values()) {
            if (s.label.equals(v) || s.name().equalsIgnoreCase(v)) return s;
        }
        throw new IllegalArgumentException("알 수 없는 상태: " + v);
    }
}
