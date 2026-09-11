package com.hadasupia.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 쿠버네티스 프로브용 엔드포인트.
 * DB 를 건드리지 않으므로 커넥션이 막혀도 프로세스 생존 여부만 정확히 보고한다.
 */
@RestController
public class HealthController {

    @GetMapping("/api/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("ok");
    }
}
