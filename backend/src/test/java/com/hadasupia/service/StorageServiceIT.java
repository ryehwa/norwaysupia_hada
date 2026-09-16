package com.hadasupia.service;

import com.hadasupia.config.AppProperties;
import com.hadasupia.config.MinioConfig;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.mock.web.MockMultipartFile;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * 실제 MinIO 에 붙어 업로드 → presigned URL 내려받기 → 삭제까지 확인한다.
 * MinIO 가 필요하므로 MINIO_TEST_ENDPOINT 가 있을 때만 돈다.
 *
 *   docker run -d -p 19000:9000 -e MINIO_ROOT_USER=testkey \
 *     -e MINIO_ROOT_PASSWORD=testsecret123 minio/minio server /data
 *   MINIO_TEST_ENDPOINT=http://localhost:19000 ./gradlew test
 */
@EnabledIfEnvironmentVariable(named = "MINIO_TEST_ENDPOINT", matches = ".+")
class StorageServiceIT {

    private static final byte[] PNG = {
            (byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 1, 2, 3, 4
    };

    private StorageService newService() {
        AppProperties props = new AppProperties();
        AppProperties.Minio minio = props.getMinio();
        minio.setEndpoint(System.getenv("MINIO_TEST_ENDPOINT"));
        minio.setAccessKey(System.getenv().getOrDefault("MINIO_TEST_ACCESS_KEY", "testkey"));
        minio.setSecretKey(System.getenv().getOrDefault("MINIO_TEST_SECRET_KEY", "testsecret123"));
        minio.setBucket("hada-test-" + UUID.randomUUID().toString().substring(0, 8));

        MinioConfig config = new MinioConfig(props);
        StorageService service = new StorageService(config.s3Client(), config.s3Presigner(), props);
        service.ensureBucket();
        return service;
    }

    @Test
    void 올린_사진을_presigned_URL_로_그대로_받아온다() throws Exception {
        StorageService service = newService();
        MockMultipartFile file = new MockMultipartFile("photo", "거실.png", "image/png", PNG);

        String key = service.store(file);
        // 키는 연/월 아래에 확장자를 유지한 채 들어간다
        assertThat(key).matches("\\d{4}/\\d{2}/[0-9a-f]{32}\\.png");

        String url = service.url(key);
        assertThat(url).contains(key).contains("X-Amz-Signature");

        HttpResponse<byte[]> res = HttpClient.newHttpClient().send(
                HttpRequest.newBuilder(URI.create(url)).build(),
                HttpResponse.BodyHandlers.ofByteArray());

        assertThat(res.statusCode()).isEqualTo(200);
        assertThat(res.body()).isEqualTo(PNG);
        assertThat(res.headers().firstValue("content-type")).contains("image/png");

        // 삭제하면 같은 URL 이 더는 내려주지 않는다
        service.delete(key);
        HttpResponse<byte[]> gone = HttpClient.newHttpClient().send(
                HttpRequest.newBuilder(URI.create(service.url(key))).build(),
                HttpResponse.BodyHandlers.ofByteArray());
        assertThat(gone.statusCode()).isEqualTo(404);
    }

    @Test
    void 허용하지_않는_형식은_올리지_않는다() {
        StorageService service = newService();
        MockMultipartFile pdf = new MockMultipartFile("photo", "견적서.pdf", "application/pdf", PNG);

        assertThatThrownBy(() -> service.store(pdf))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("지원하지 않는 형식");
    }

    @Test
    void presigned_URL_은_브라우저용_주소로_서명한다() {
        AppProperties props = new AppProperties();
        AppProperties.Minio minio = props.getMinio();
        minio.setEndpoint(System.getenv("MINIO_TEST_ENDPOINT"));
        minio.setPublicEndpoint("https://photos.example.com");
        minio.setAccessKey("testkey");
        minio.setSecretKey("testsecret123");
        minio.setBucket("hada-test");

        MinioConfig config = new MinioConfig(props);
        StorageService service = new StorageService(config.s3Client(), config.s3Presigner(), props);

        // 백엔드가 붙는 내부 주소가 아니라 외부 주소가 URL 에 들어가야 한다
        assertThat(service.url("2026/09/abc.png"))
                .startsWith("https://photos.example.com/hada-test/2026/09/abc.png");
    }
}
