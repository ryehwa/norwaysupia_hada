package com.hadasupia.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

/**
 * MinIO 접속 빈. 업로드·삭제는 {@link #s3Client} 가 내부 주소로 처리하고,
 * 브라우저에 내려줄 presigned URL 은 {@link #s3Presigner} 가 외부 주소로 서명한다.
 */
@Configuration
public class MinioConfig {

    private final AppProperties.Minio props;

    public MinioConfig(AppProperties appProperties) {
        this.props = appProperties.getMinio();
    }

    private StaticCredentialsProvider credentials() {
        return StaticCredentialsProvider.create(
                AwsBasicCredentials.create(props.getAccessKey(), props.getSecretKey()));
    }

    /** MinIO 는 가상 호스트 방식(bucket.host)을 쓰지 않으므로 path-style 을 강제한다. */
    private S3Configuration pathStyle() {
        return S3Configuration.builder().pathStyleAccessEnabled(true).build();
    }

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .endpointOverride(URI.create(props.getEndpoint()))
                .credentialsProvider(credentials())
                .region(Region.of(props.getRegion()))
                .serviceConfiguration(pathStyle())
                .httpClient(UrlConnectionHttpClient.create())
                .build();
    }

    /**
     * 서명은 순수 계산이라 이 엔드포인트로 실제 연결이 되지 않아도 된다.
     * 백엔드에서는 닿지 않는 외부 주소를 넣어도 문제없다.
     */
    @Bean
    public S3Presigner s3Presigner() {
        return S3Presigner.builder()
                .endpointOverride(URI.create(props.resolvedPublicEndpoint()))
                .credentialsProvider(credentials())
                .region(Region.of(props.getRegion()))
                .serviceConfiguration(pathStyle())
                .build();
    }
}
