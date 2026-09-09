package com.hadasupia.service;

/** 문의가 접수되어 커밋까지 끝났음을 알린다. 알림 발송의 방아쇠. */
public record InquirySubmitted(Long inquiryId) {}
