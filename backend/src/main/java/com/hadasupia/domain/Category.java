package com.hadasupia.domain;

/** 시공사례 · 문의의 공간 분류 */
public enum Category {
    RESIDENTIAL("주거"),
    COMMERCIAL("상업");

    private final String label;

    Category(String label) { this.label = label; }

    public String getLabel() { return label; }

    public static Category fromLabel(String v) {
        if (v == null) return null;
        for (Category c : values()) {
            if (c.label.equals(v) || c.name().equalsIgnoreCase(v)) return c;
        }
        throw new IllegalArgumentException("알 수 없는 카테고리: " + v);
    }
}
