package com.hadasupia.config;

import com.hadasupia.domain.AdminUser;
import com.hadasupia.domain.FeaturedSlot;
import com.hadasupia.domain.SiteInfo;
import com.hadasupia.repository.AdminUserRepository;
import com.hadasupia.repository.FeaturedSlotRepository;
import com.hadasupia.repository.SiteInfoRepository;
import com.hadasupia.service.ProjectService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/** 최초 실행 시 관리자 계정 · 사이트 정보 · HOME 3칸을 준비한다. */
@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public ApplicationRunner seed(AdminUserRepository adminRepository,
                                  SiteInfoRepository siteInfoRepository,
                                  FeaturedSlotRepository featuredRepository,
                                  PasswordEncoder encoder,
                                  AppProperties props) {
        return args -> {
            String username = props.getAdmin().getUsername();
            String rawPassword = props.getAdmin().getPassword();

            // 계정이 있으면 건너뛰던 것을 매번 비밀번호를 맞추도록 바꿨다.
            // 이전에는 환경변수를 바꿔도 반영되지 않아, 비밀번호를 교체한 줄 알았는데
            // 옛 비밀번호가 그대로 유효한 상태가 됐다.
            AdminUser admin = adminRepository.findByUsername(username).orElseGet(() -> {
                AdminUser created = new AdminUser();
                created.setUsername(username);
                created.setDisplayName("관리자");
                log.info("관리자 계정 생성: {}", username);
                return created;
            });

            if (admin.getPasswordHash() == null
                    || !encoder.matches(rawPassword, admin.getPasswordHash())) {
                admin.setPasswordHash(encoder.encode(rawPassword));
                if (admin.getId() != null) {
                    log.info("관리자 비밀번호를 환경변수 값으로 갱신: {}", username);
                }
            }
            adminRepository.save(admin);

            if (siteInfoRepository.findById(1L).isEmpty()) {
                siteInfoRepository.save(new SiteInfo());
                log.info("사이트 정보 기본값 생성");
            }

            long slots = featuredRepository.count();
            for (int i = (int) slots; i < ProjectService.FEATURED_SLOTS; i++) {
                featuredRepository.save(new FeaturedSlot(i));
            }
        };
    }
}
