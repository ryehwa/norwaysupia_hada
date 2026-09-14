package com.hadasupia.service;

import com.hadasupia.config.AppProperties;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

/**
 * 업로드된 사진을 MinIO(S3 호환 스토리지)에 저장한다.
 * 버킷은 비공개로 두고, 조회는 만료 있는 presigned URL 로만 내보낸다.
 */
@Service
public class StorageService {

    private static final Logger log = LoggerFactory.getLogger(StorageService.class);

    /** 지원 형식: JPG · PNG · WEBP · GIF · HEIC */
    private static final List<String> ALLOWED_EXTENSIONS =
            List.of("jpg", "jpeg", "png", "webp", "gif", "heic", "heif");

    private static final Map<String, String> CONTENT_TYPES = Map.of(
            "jpg", "image/jpeg",
            "jpeg", "image/jpeg",
            "png", "image/png",
            "webp", "image/webp",
            "gif", "image/gif",
            "heic", "image/heic",
            "heif", "image/heif");

    private static final long MAX_SIZE = 10L * 1024 * 1024; // 10MB

    private final S3Client s3;
    private final S3Presigner presigner;
    private final AppProperties.Minio props;

    public StorageService(S3Client s3, S3Presigner presigner, AppProperties appProperties) {
        this.s3 = s3;
        this.presigner = presigner;
        this.props = appProperties.getMinio();
    }

    /** 버킷이 없으면 만든다. 접근 자체가 안 되면 기동을 멈춘다. */
    @PostConstruct
    void ensureBucket() {
        String bucket = props.getBucket();
        try {
            s3.headBucket(HeadBucketRequest.builder().bucket(bucket).build());
        } catch (NoSuchBucketException e) {
            log.info("버킷이 없어 새로 만듭니다: {}", bucket);
            s3.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
        } catch (S3Exception e) {
            throw new IllegalStateException(
                    "MinIO 버킷에 접근할 수 없습니다: " + bucket + " (" + props.getEndpoint() + ")", e);
        }
    }

    public String store(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("빈 파일은 업로드할 수 없습니다.");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException("사진 한 장의 최대 크기는 10MB입니다.");
        }

        String ext = extensionOf(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new IllegalArgumentException(
                    "지원하지 않는 형식입니다. JPG · PNG · WEBP · GIF · HEIC 만 업로드할 수 있습니다.");
        }

        LocalDate today = LocalDate.now();
        String objectKey = String.format("%d/%02d/%s.%s",
                today.getYear(), today.getMonthValue(),
                UUID.randomUUID().toString().replace("-", ""), ext);

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(props.getBucket())
                .key(objectKey)
                .contentType(CONTENT_TYPES.getOrDefault(ext, "application/octet-stream"))
                .contentLength(file.getSize())
                .build();

        try (var in = file.getInputStream()) {
            s3.putObject(request, RequestBody.fromInputStream(in, file.getSize()));
        } catch (IOException e) {
            throw new UncheckedIOException("사진 저장에 실패했습니다.", e);
        }
        return objectKey;
    }

    public void delete(String objectKey) {
        if (objectKey == null || objectKey.isBlank()) return;
        try {
            s3.deleteObject(DeleteObjectRequest.builder()
                    .bucket(props.getBucket())
                    .key(objectKey)
                    .build());
        } catch (S3Exception e) {
            log.warn("사진 삭제 실패: {}", objectKey, e);
        }
    }

    /** 브라우저가 직접 받아갈 수 있는 만료 있는 URL. 버킷이 비공개라 매 응답마다 새로 만든다. */
    public String url(String objectKey) {
        if (objectKey == null || objectKey.isBlank()) return null;
        GetObjectPresignRequest request = GetObjectPresignRequest.builder()
                .signatureDuration(props.getUrlExpiry())
                .getObjectRequest(GetObjectRequest.builder()
                        .bucket(props.getBucket())
                        .key(objectKey)
                        .build())
                .build();
        return presigner.presignGetObject(request).url().toString();
    }

    private String extensionOf(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        if (dot < 0 || dot == filename.length() - 1) return "";
        return filename.substring(dot + 1).toLowerCase(Locale.ROOT);
    }
}
