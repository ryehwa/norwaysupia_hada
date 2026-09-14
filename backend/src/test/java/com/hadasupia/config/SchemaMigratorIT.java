package com.hadasupia.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 실제 Postgres 로 스키마 정리를 확인한다.
 *   docker run -d -p 15434:5432 -e POSTGRES_PASSWORD=test -e POSTGRES_DB=hada postgres:16-alpine
 *   PG_TEST_URL=jdbc:postgresql://localhost:15434/hada ./gradlew test
 */
@EnabledIfEnvironmentVariable(named = "PG_TEST_URL", matches = ".+")
class SchemaMigratorIT {

    private JdbcTemplate jdbc;

    @BeforeEach
    void setUp() {
        DriverManagerDataSource ds = new DriverManagerDataSource();
        ds.setUrl(System.getenv("PG_TEST_URL"));
        ds.setUsername(System.getenv().getOrDefault("PG_TEST_USER", "postgres"));
        ds.setPassword(System.getenv().getOrDefault("PG_TEST_PASSWORD", "test"));
        jdbc = new JdbcTemplate(ds);
        jdbc.execute("DROP TABLE IF EXISTS project_photos");
    }

    /** 전환 전 스키마 — url(NOT NULL) + storage_path */
    private void createLegacyTable() {
        jdbc.execute("""
                CREATE TABLE project_photos (
                  id bigserial PRIMARY KEY,
                  project_id bigint NOT NULL DEFAULT 1,
                  url varchar(500) NOT NULL,
                  storage_path varchar(500),
                  sort_order int NOT NULL DEFAULT 0)""");
    }

    private void migrate() throws Exception {
        new SchemaMigrator().migrateSchema(jdbc).run(null);
    }

    private List<String> columns() {
        return jdbc.queryForList(
                "SELECT column_name FROM information_schema.columns "
                        + "WHERE table_name = 'project_photos' ORDER BY column_name",
                String.class);
    }

    @Test
    void 구버전_스키마를_object_key_로_정리한다() throws Exception {
        createLegacyTable();
        jdbc.update("INSERT INTO project_photos (url, storage_path) VALUES (?, ?)",
                "/uploads/2026/09/abc.jpg", "/app/uploads/2026/09/abc.jpg");

        migrate();

        assertThat(columns()).contains("object_key").doesNotContain("url", "storage_path");
        assertThat(jdbc.queryForObject("SELECT object_key FROM project_photos", String.class))
                .isEqualTo("2026/09/abc.jpg");
        // 정리 뒤에는 NOT NULL 이어야 한다 — 키 없는 사진이 들어오지 못하게
        assertThat(jdbc.queryForObject(
                "SELECT is_nullable FROM information_schema.columns "
                        + "WHERE table_name='project_photos' AND column_name='object_key'", String.class))
                .isEqualTo("NO");
    }

    @Test
    void 사진이_없어도_제약을_걷어낸다() throws Exception {
        createLegacyTable();

        migrate();

        assertThat(columns()).contains("object_key").doesNotContain("url", "storage_path");
        // 새 코드가 하는 것처럼 url 없이 넣어도 통해야 한다
        jdbc.update("INSERT INTO project_photos (object_key) VALUES ('2026/09/new.jpg')");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM project_photos", Integer.class)).isEqualTo(1);
    }

    @Test
    void 여러_번_돌려도_안전하다() throws Exception {
        createLegacyTable();
        jdbc.update("INSERT INTO project_photos (url) VALUES ('/uploads/2026/09/x.png')");

        migrate();
        migrate();
        migrate();

        assertThat(columns()).contains("object_key").doesNotContain("url", "storage_path");
        assertThat(jdbc.queryForObject("SELECT object_key FROM project_photos", String.class))
                .isEqualTo("2026/09/x.png");
    }

    @Test
    void 테이블이_없으면_아무것도_하지_않는다() throws Exception {
        migrate(); // DROP 된 상태 — 예외 없이 지나가야 한다
        assertThat(columns()).isEmpty();
    }
}
