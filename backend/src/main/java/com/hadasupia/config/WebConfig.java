package com.hadasupia.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/** 비동기 · 스케줄링 활성화. 사진은 MinIO 가 presigned URL 로 직접 서빙한다. */
@Configuration
@EnableAsync
@EnableScheduling
public class WebConfig {
}
