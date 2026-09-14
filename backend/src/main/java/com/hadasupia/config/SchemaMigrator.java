package com.hadasupia.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;

/**
 * ddl-auto: update 가 손대지 못하는 스키마 정리를 기동할 때 한 번 한다.
 * Hibernate 는 컬럼을 추가만 하고 지우거나 제약을 바꾸지 않기 때문이다.
 *
 * 지금 정리하는 것: 사진을 로컬 파일시스템에서 MinIO 로 옮기면서 쓰이지 않게 된
 * project_photos.url · storage_path. url 은 NOT NULL 이라 남겨 두면 새 사진을
 * 올릴 때 INSERT 가 제약 위반으로 실패한다.
 *
 * 할 일이 없으면 조용히 넘어가므로 매 기동마다 돌아도 무해하다.
 */
@Configuration
public class SchemaMigrator {

    private static final Logger log = LoggerFactory.getLogger(SchemaMigrator.class);

    @Bean
    @Order(0) // 데이터를 넣는 DataInitializer 보다 먼저 스키마를 맞춘다
    public ApplicationRunner migrateSchema(JdbcTemplate jdbc) {
        return args -> movePhotosToObjectKey(jdbc);
    }

    private void movePhotosToObjectKey(JdbcTemplate jdbc) {
        if (!hasTable(jdbc, "project_photos")) return;

        boolean hasUrl = hasColumn(jdbc, "project_photos", "url");
        boolean hasStoragePath = hasColumn(jdbc, "project_photos", "storage_path");
        if (!hasUrl && !hasStoragePath) return; // 이미 정리된 스키마

        log.info("project_photos 스키마 정리 시작 (url·storage_path → object_key)");

        // Hibernate 가 새 컬럼을 만들지 못했을 때를 대비한다(기존 행이 있으면 NOT NULL 을 못 건다).
        jdbc.execute("ALTER TABLE project_photos ADD COLUMN IF NOT EXISTS object_key varchar(500)");

        if (hasUrl) {
            // 기존 url 은 '/uploads/2026/09/abc.jpg' 형태 — 앞을 떼면 그대로 오브젝트 키다.
            int moved = jdbc.update(
                    "UPDATE project_photos SET object_key = regexp_replace(url, '^/uploads/', '') "
                            + "WHERE object_key IS NULL");
            if (moved > 0) log.info("사진 {}건의 경로를 오브젝트 키로 옮김", moved);
        }

        jdbc.execute("ALTER TABLE project_photos ALTER COLUMN object_key SET NOT NULL");
        jdbc.execute("ALTER TABLE project_photos DROP COLUMN IF EXISTS url");
        jdbc.execute("ALTER TABLE project_photos DROP COLUMN IF EXISTS storage_path");

        log.info("project_photos 스키마 정리 완료");
    }

    private boolean hasTable(JdbcTemplate jdbc, String table) {
        Integer n = jdbc.queryForObject(
                "SELECT count(*) FROM information_schema.tables "
                        + "WHERE table_schema = current_schema() AND table_name = ?",
                Integer.class, table);
        return n != null && n > 0;
    }

    private boolean hasColumn(JdbcTemplate jdbc, String table, String column) {
        Integer n = jdbc.queryForObject(
                "SELECT count(*) FROM information_schema.columns "
                        + "WHERE table_schema = current_schema() AND table_name = ? AND column_name = ?",
                Integer.class, table, column);
        return n != null && n > 0;
    }
}
