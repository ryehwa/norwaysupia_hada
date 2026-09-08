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
            if (adminRepository.findByUsername(username).isEmpty()) {
                AdminUser admin = new AdminUser();
                admin.setUsername(username);
                admin.setPasswordHash(encoder.encode(props.getAdmin().getPassword()));
                admin.setDisplayName("관리자");
                adminRepository.save(admin);
                log.info("관리자 계정 생성: {}", username);
            }

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
