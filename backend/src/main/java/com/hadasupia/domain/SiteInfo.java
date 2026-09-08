package com.hadasupia.domain;

import jakarta.persistence.*;

/** 푸터·오시는 길에 노출되는 사이트 정보. 단일 행(id=1)으로 관리한다. */
@Entity
@Table(name = "site_info")
public class SiteInfo {

    @Id
    private Long id = 1L;

    @Column(nullable = false, length = 300)
    private String address = "서울시 동작구 사당로 16가길 106, 1층";

    @Column(nullable = false, length = 50)
    private String phone = "02-6052-0479";

    @Column(nullable = false, length = 100)
    private String email = "hada2nc@gmail.com";

    @Column(nullable = false, length = 200)
    private String businessHours = "매일 09:00–19:00 · 일요일·공휴일 휴무";

    public Long getId() { return id; }
    public void setId(Long v) { this.id = v; }
    public String getAddress() { return address; }
    public void setAddress(String v) { this.address = v; }
    public String getPhone() { return phone; }
    public void setPhone(String v) { this.phone = v; }
    public String getEmail() { return email; }
    public void setEmail(String v) { this.email = v; }
    public String getBusinessHours() { return businessHours; }
    public void setBusinessHours(String v) { this.businessHours = v; }
}
