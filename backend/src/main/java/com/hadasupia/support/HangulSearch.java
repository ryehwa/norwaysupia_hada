package com.hadasupia.support;

/**
 * 한글 검색 유틸. 일반 부분일치와 초성(자음) 검색을 함께 지원한다.
 * 예) "ㅇㅍㅌ" → "아파트 리모델링" 매칭
 */
public final class HangulSearch {

    private static final char[] CHOSUNG = {
            'ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ',
            'ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'
    };

    private HangulSearch() {}

    /** 문자열의 초성만 추출한다. 한글이 아닌 문자는 그대로 남긴다. */
    public static String chosung(String text) {
        if (text == null) return "";
        StringBuilder sb = new StringBuilder(text.length());
        for (char ch : text.toCharArray()) {
            if (ch >= 0xAC00 && ch <= 0xD7A3) {
                sb.append(CHOSUNG[(ch - 0xAC00) / 588]);
            } else {
                sb.append(ch);
            }
        }
        return sb.toString();
    }

    /** 질의가 자음만으로 이루어졌는지 (초성 검색 여부 판단) */
    public static boolean isChosungOnly(String query) {
        if (query == null || query.isBlank()) return false;
        for (char ch : query.replace(" ", "").toCharArray()) {
            if (!isChosungChar(ch)) return false;
        }
        return true;
    }

    private static boolean isChosungChar(char ch) {
        for (char c : CHOSUNG) {
            if (c == ch) return true;
        }
        return false;
    }

    /**
     * 검색 일치 여부. 질의가 자음만이면 초성으로, 그렇지 않으면
     * 원문과 초성 양쪽에 대해 부분일치를 확인한다.
     */
    public static boolean matches(String text, String query) {
        if (query == null || query.isBlank()) return true;
        if (text == null) return false;

        String t = text.replace(" ", "").toLowerCase();
        String q = query.replace(" ", "").toLowerCase();

        if (t.contains(q)) return true;
        return chosung(t).contains(chosung(q));
    }
}
