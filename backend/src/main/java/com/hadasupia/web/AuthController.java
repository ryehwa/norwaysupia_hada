package com.hadasupia.web;

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

import java.util.Map;

/** 세션 기반 관리자 로그인 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AdminUserRepository adminUserRepository;
    private final SecurityContextRepository contextRepository = new HttpSessionSecurityContextRepository();

    public AuthController(AuthenticationManager authenticationManager,
                          AdminUserRepository adminUserRepository) {
        this.authenticationManager = authenticationManager;
        this.adminUserRepository = adminUserRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req,
                                   HttpServletRequest request,
                                   HttpServletResponse response) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.username(), req.password()));

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(auth);
            SecurityContextHolder.setContext(context);
            contextRepository.saveContext(context, request, response);

            String displayName = adminUserRepository.findByUsername(req.username())
                    .map(u -> u.getDisplayName() == null ? u.getUsername() : u.getDisplayName())
                    .orElse(req.username());

            return ResponseEntity.ok(new MeResponse(req.username(), displayName));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("message", "아이디 또는 비밀번호가 올바르지 않습니다."));
        }
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
