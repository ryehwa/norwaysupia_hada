package com.hadasupia.web.admin;

import com.hadasupia.dto.CommonDtos.LoginRequest;
import com.hadasupia.dto.CommonDtos.MeResponse;
import com.hadasupia.repository.AdminUserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import com.hadasupia.service.LoginAttemptService;

import java.time.Duration;
import java.util.Map;

/** 세션 기반 관리자 로그인 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AdminUserRepository adminUserRepository;
    private final LoginAttemptService loginAttempts;
    private final SecurityContextRepository contextRepository = new HttpSessionSecurityContextRepository();

    public AuthController(AuthenticationManager authenticationManager,
                          AdminUserRepository adminUserRepository,
                          LoginAttemptService loginAttempts) {
        this.authenticationManager = authenticationManager;
        this.adminUserRepository = adminUserRepository;
        this.loginAttempts = loginAttempts;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req,
                                   HttpServletRequest request,
                                   HttpServletResponse response) {
        String key = clientKey(request);
        Duration locked = loginAttempts.lockRemaining(key);
        if (locked != null) {
            long minutes = Math.max(1, locked.toMinutes());
            return ResponseEntity.status(429)
                    .body(Map.of("message", "로그인 시도가 너무 많습니다. " + minutes + "분 후 다시 시도해 주세요."));
        }

        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.username(), req.password()));

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(auth);
            SecurityContextHolder.setContext(context);
            contextRepository.saveContext(context, request, response);

            loginAttempts.reset(key);

            String displayName = adminUserRepository.findByUsername(req.username())
                    .map(u -> u.getDisplayName() == null ? u.getUsername() : u.getDisplayName())
                    .orElse(req.username());

            return ResponseEntity.ok(new MeResponse(req.username(), displayName));
        } catch (BadCredentialsException e) {
            loginAttempts.recordFailure(key);
            return ResponseEntity.status(401).body(Map.of("message", "아이디 또는 비밀번호가 올바르지 않습니다."));
        }
    }

    /**
     * 시도 횟수를 셀 기준. 인그레스 뒤에서는 remoteAddr 가 프록시 주소라 모든 사용자가
     * 한 덩어리로 묶이므로, 프록시가 남긴 원래 IP 를 우선 쓴다.
     */
    private String clientKey(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    @PostMapping("/logout")
    public Map<String, String> logout(HttpServletRequest request) {
        request.getSession().invalidate();
        SecurityContextHolder.clearContext();
        return Map.of("message", "로그아웃되었습니다.");
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다."));
        }
        String username = auth.getName();
        String displayName = adminUserRepository.findByUsername(username)
                .map(u -> u.getDisplayName() == null ? u.getUsername() : u.getDisplayName())
                .orElse(username);
        return ResponseEntity.ok(new MeResponse(username, displayName));
    }
}
