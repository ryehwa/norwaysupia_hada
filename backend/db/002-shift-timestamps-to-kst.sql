-- 타임스탬프 저장 시간대를 UTC → KST 로 바꿀 때 한 번만 실행한다.
--
-- 배경: Hibernate 6 은 Instant 를 TIMESTAMP_UTC 로 매핑해 UTC 로 저장한다.
-- 엔티티에 @JdbcTypeCode(SqlTypes.TIMESTAMP) 를 주고 hibernate.jdbc.time_zone 을
-- Asia/Seoul 로 지정하면서 저장 기준이 KST 로 바뀌었다.
-- 그 전에 쌓인 행은 UTC 값이므로 9시간을 더해야 새 기준과 맞는다.
--
-- 실행 시점: 새 코드로 배포하기 직전(애플리케이션 중지 상태).
-- 한 번만 실행할 것. 두 번 돌리면 18시간이 더해진다.

UPDATE inquiries      SET submitted_at = DATE_ADD(submitted_at, INTERVAL 9 HOUR);
UPDATE inquiries      SET notified_at  = DATE_ADD(notified_at,  INTERVAL 9 HOUR) WHERE notified_at IS NOT NULL;
UPDATE projects       SET created_at   = DATE_ADD(created_at,   INTERVAL 9 HOUR),
                          updated_at   = DATE_ADD(updated_at,   INTERVAL 9 HOUR);
UPDATE project_photos SET created_at   = DATE_ADD(created_at,   INTERVAL 9 HOUR);
UPDATE featured_slots SET updated_at   = DATE_ADD(updated_at,   INTERVAL 9 HOUR);
