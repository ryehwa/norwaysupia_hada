package com.hadasupia.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;
import java.time.LocalTime;

@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private String frontendOrigin = "http://localhost:3000";
    private Minio minio = new Minio();
    private Admin admin = new Admin();
    private Mail mail = new Mail();
    private Consult consult = new Consult();

    /** 업로드된 사진을 보관하는 S3 호환 스토리지(MinIO) 설정 */
    public static class Minio {
        /** 백엔드가 붙는 주소. 클러스터 안에서는 내부 Service 주소를 쓴다. */
        private String endpoint;
        /**
         * presigned URL 에 들어갈 주소 — 브라우저가 직접 닿을 수 있어야 한다.
         * 서명에 호스트가 포함되므로 내부 주소로 서명하면 브라우저에서 실패한다.
         */
        private String publicEndpoint;
        private String accessKey;
        private String secretKey;
        private String bucket;
        /** MinIO 는 리전 개념이 없지만 SigV4 서명에는 값이 필요하다. */
        private String region = "us-east-1";
        /** presigned URL 유효 기간 */
        private Duration urlExpiry = Duration.ofHours(1);

        public String getEndpoint() { return endpoint; }
        public void setEndpoint(String v) { this.endpoint = v; }
        public String getPublicEndpoint() { return publicEndpoint; }
        public void setPublicEndpoint(String v) { this.publicEndpoint = v; }
        public String getAccessKey() { return accessKey; }
        public void setAccessKey(String v) { this.accessKey = v; }
        public String getSecretKey() { return secretKey; }
        public void setSecretKey(String v) { this.secretKey = v; }
        public String getBucket() { return bucket; }
        public void setBucket(String v) { this.bucket = v; }
        public String getRegion() { return region; }
        public void setRegion(String v) { this.region = v; }
        public Duration getUrlExpiry() { return urlExpiry; }
        public void setUrlExpiry(Duration v) { this.urlExpiry = v; }

        /** 브라우저용 주소가 따로 없으면 내부 주소를 그대로 쓴다. (로컬 개발) */
        public String resolvedPublicEndpoint() {
            return (publicEndpoint == null || publicEndpoint.isBlank()) ? endpoint : publicEndpoint;
        }
    }

    public static class Admin {
        private String username = "admin";
        private String password;
        public String getUsername() { return username; }
        public void setUsername(String v) { this.username = v; }
        public String getPassword() { return password; }
        public void setPassword(String v) { this.password = v; }
    }

    public static class Mail {
        private String to = "";
        private boolean enabled = true;
        /** 미발송 알림을 다시 시도하는 주기 */
        private long retryIntervalMs = 300_000;
        public String getTo() { return to; }
        public void setTo(String v) { this.to = v; }
        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean v) { this.enabled = v; }
        public long getRetryIntervalMs() { return retryIntervalMs; }
        public void setRetryIntervalMs(long v) { this.retryIntervalMs = v; }
    }

    /** 상담 예약 시간대 규칙: 30분 단위로 열리고, 예약 1건은 60분(2칸)을 차지한다. */
    public static class Consult {
        private LocalTime openTime = LocalTime.of(11, 0);
        private LocalTime closeTime = LocalTime.of(20, 30);
        private int stepMinutes = 30;
        private int durationMinutes = 60;
        private int bookableDays = 30;

        public LocalTime getOpenTime() { return openTime; }
        public void setOpenTime(LocalTime v) { this.openTime = v; }
        public LocalTime getCloseTime() { return closeTime; }
        public void setCloseTime(LocalTime v) { this.closeTime = v; }
        public int getStepMinutes() { return stepMinutes; }
        public void setStepMinutes(int v) { this.stepMinutes = v; }
        public int getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(int v) { this.durationMinutes = v; }
        public int getBookableDays() { return bookableDays; }
        public void setBookableDays(int v) { this.bookableDays = v; }

        /** 예약 1건이 차지하는 칸 수 (60분 / 30분 = 2) */
        public int slotsPerReservation() {
            return Math.max(1, durationMinutes / stepMinutes);
        }
    }

    public String getFrontendOrigin() { return frontendOrigin; }
    public void setFrontendOrigin(String v) { this.frontendOrigin = v; }
    public Minio getMinio() { return minio; }
    public void setMinio(Minio v) { this.minio = v; }
    public Admin getAdmin() { return admin; }
    public void setAdmin(Admin v) { this.admin = v; }
    public Mail getMail() { return mail; }
    public void setMail(Mail v) { this.mail = v; }
    public Consult getConsult() { return consult; }
    public void setConsult(Consult v) { this.consult = v; }
}
