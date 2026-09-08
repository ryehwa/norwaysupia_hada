package com.hadasupia.service;

import com.hadasupia.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

/** 업로드된 사진을 로컬 디렉터리에 저장한다. (S3로 교체할 경우 이 클래스만 바꾸면 된다) */
@Service
public class StorageService {

    private static final Logger log = LoggerFactory.getLogger(StorageService.class);

    /** 지원 형식: JPG · PNG · WEBP · GIF · HEIC */
    private static final List<String> ALLOWED_EXTENSIONS =
            List.of("jpg", "jpeg", "png", "webp", "gif", "heic", "heif");

    private static final long MAX_SIZE = 10L * 1024 * 1024; // 10MB

    private final Path root;

    public StorageService(AppProperties props) {
        this.root = Paths.get(props.getUploadDir()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new UncheckedIOException("업로드 디렉터리를 만들 수 없습니다: " + root, e);
        }
    }

    public record Stored(String url, String storagePath) {}

    public Stored store(MultipartFile file) {
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
        String relativeDir = String.format("%d/%02d", today.getYear(), today.getMonthValue());
        String filename = UUID.randomUUID().toString().replace("-", "") + "." + ext;

        try {
            Path dir = root.resolve(relativeDir);
            Files.createDirectories(dir);
            Path target = dir.resolve(filename);
            file.transferTo(target);
            return new Stored("/uploads/" + relativeDir + "/" + filename, target.toString());
        } catch (IOException e) {
            throw new UncheckedIOException("사진 저장에 실패했습니다.", e);
        }
    }

    public void delete(String storagePath) {
        if (storagePath == null || storagePath.isBlank()) return;
        try {
            Files.deleteIfExists(Paths.get(storagePath));
        } catch (IOException e) {
            log.warn("사진 파일 삭제 실패: {}", storagePath, e);
        }
    }

    private String extensionOf(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        if (dot < 0 || dot == filename.length() - 1) return "";
        return filename.substring(dot + 1).toLowerCase(Locale.ROOT);
    }
}
