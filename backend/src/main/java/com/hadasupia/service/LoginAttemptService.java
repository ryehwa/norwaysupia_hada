package com.hadasupia.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 로그인 실패 횟수를 세어 무차별 대입을 막는다.
 *
 * 잠금 기준을 아이디가 아니라 요청 출처(IP)로 잡는다. 아이디 기준으로 잠그면
 * 공격자가 틀린 비밀번호를 반복해 관리자를 로그인 못 하게 만들 수 있기 때문이다.
 * 관리자가 한 명뿐이라 그 피해가 그대로 서비스 마비가 된다.
 *
 * 상태는 메모리에만 둔다. 재시작하면 초기화되고 파드가 여러 대면 각자 센다.
 * 정확한 집계보다 공격 비용을 올리는 것이 목적이라 이 정도로 충분하다.
 */
@Service
public class LoginAttemptService {

    private static final Logger log = LoggerFactory.getLogger(LoginAttemptService.class);

    public static final int MAX_ATTEMPTS = 5;
    public static final Duration LOCK_DURATION = Duration.ofMinutes(10);
    /** 이 시간 동안 실패가 없으면 카운트를 잊는다 */
    private static final Duration COUNT_WINDOW = Duration.ofMinutes(10);

    private record Attempt(int count, Instant lastFailure, Instant lockedUntil) {}

    private final Map<String, Attempt> attempts = new ConcurrentHashMap<>();

    /** 잠겨 있으면 남은 시간, 아니면 null */
    public Duration lockRemaining(String key) {
        Attempt a = attempts.get(key);
        if (a == null || a.lockedUntil() == null) return null;
        Duration left = Duration.between(Instant.now(), a.lockedUntil());
        return left.isNegative() ? null : left;
    }

    public void recordFailure(String key) {
        Instant now = Instant.now();
        attempts.compute(key, (k, prev) -> {
            // 마지막 실패가 오래됐으면 처음부터 다시 센다
            int count = (prev == null || Duration.between(prev.lastFailure(), now).compareTo(COUNT_WINDOW) > 0)
                    ? 1 : prev.count() + 1;
            Instant lockedUntil = count >= MAX_ATTEMPTS ? now.plus(LOCK_DURATION) : null;
            if (lockedUntil != null) {
                log.warn("로그인 {}회 실패로 잠금 — {} ({}분)", count, k, LOCK_DURATION.toMinutes());
            }
            return new Attempt(count, now, lockedUntil);
        });
    }

    public void reset(String key) {
        attempts.remove(key);
    }

    /** 오래된 기록을 치운다. 두지 않으면 맵이 계속 커진다. */
    @Scheduled(fixedDelay = 30 * 60 * 1000, initialDelay = 30 * 60 * 1000)
    public void sweep() {
        Instant cutoff = Instant.now().minus(LOCK_DURATION).minus(COUNT_WINDOW);
        attempts.entrySet().removeIf(e -> e.getValue().lastFailure().isBefore(cutoff));
    }
}
