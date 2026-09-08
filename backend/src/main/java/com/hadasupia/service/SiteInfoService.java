package com.hadasupia.service;

import com.hadasupia.domain.SiteInfo;
import com.hadasupia.dto.CommonDtos.SiteInfoRequest;
import com.hadasupia.dto.CommonDtos.SiteInfoView;
import com.hadasupia.repository.SiteInfoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SiteInfoService {

    private final SiteInfoRepository repository;

    public SiteInfoService(SiteInfoRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public SiteInfoView get() {
        return SiteInfoView.of(load());
    }

    @Transactional
    public SiteInfoView update(SiteInfoRequest req) {
        SiteInfo s = load();
        s.setAddress(req.address());
        s.setPhone(req.phone());
        s.setEmail(req.email());
        s.setBusinessHours(req.businessHours());
        return SiteInfoView.of(s);
    }

    private SiteInfo load() {
        return repository.findById(1L).orElseGet(() -> repository.save(new SiteInfo()));
    }
}
