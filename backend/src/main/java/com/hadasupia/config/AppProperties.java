package com.hadasupia.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.LocalTime;

@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private String frontendOrigin = "http://localhost:3000";
    private String uploadDir = "./uploads";
    private Admin admin = new Admin();
    private Mail mail = new Mail();
    private Consult consult = new Consult();

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
    public String getUploadDir() { return uploadDir; }
    public void setUploadDir(String v) { this.uploadDir = v; }
    public Admin getAdmin() { return admin; }
    public void setAdmin(Admin v) { this.admin = v; }
    public Mail getMail() { return mail; }
    public void setMail(Mail v) { this.mail = v; }
    public Consult getConsult() { return consult; }
    public void setConsult(Consult v) { this.consult = v; }
}
