package com.hadasupia.support;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/** 이미 예약이 차 있는 시간대에 재예약을 시도한 경우 등 */
@ResponseStatus(HttpStatus.CONFLICT)
public class ConflictException extends RuntimeException {
    public ConflictException(String message) { super(message); }
}
