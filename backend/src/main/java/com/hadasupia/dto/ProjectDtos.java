package com.hadasupia.dto;

import com.hadasupia.domain.Project;
import com.hadasupia.domain.ProjectPhoto;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.List;

public final class ProjectDtos {

    private ProjectDtos() {}

    public record PhotoView(Long id, String url, int sortOrder, boolean thumbnail) {
        public static PhotoView of(ProjectPhoto photo, Long thumbnailId) {
            boolean isThumb = thumbnailId != null && thumbnailId.equals(photo.getId());
            return new PhotoView(photo.getId(), photo.getUrl(), photo.getSortOrder(), isThumb);
        }
    }

    public record ProjectView(
            Long id,
            String title,
            String category,
            String description,
            String thumbnailUrl,
            int photoCount,
            List<PhotoView> photos,
            Instant createdAt
    ) {
        public static ProjectView of(Project p) {
            ProjectPhoto thumb = p.thumbnail();
            Long thumbId = thumb == null ? null : thumb.getId();
            return new ProjectView(
                    p.getId(),
                    p.getTitle(),
                    p.getCategory().getLabel(),
                    p.getDescription(),
                    thumb == null ? null : thumb.getUrl(),
                    p.getPhotos().size(),
                    p.getPhotos().stream().map(ph -> PhotoView.of(ph, thumbId)).toList(),
                    p.getCreatedAt()
            );
        }
    }

    /** 목록용 축약형 — 사진 배열 없이 썸네일만 */
    public record ProjectSummary(
            Long id, String title, String category, String thumbnailUrl, int photoCount
    ) {
        public static ProjectSummary of(Project p) {
            ProjectPhoto thumb = p.thumbnail();
            return new ProjectSummary(
                    p.getId(), p.getTitle(), p.getCategory().getLabel(),
                    thumb == null ? null : thumb.getUrl(), p.getPhotos().size()
            );
        }
    }

    public record ProjectRequest(
            @NotBlank(message = "사례 제목을 입력해 주세요.") String title,
            @NotBlank(message = "카테고리를 선택해 주세요.") String category,
            String description
    ) {}

    public record PhotoOrderRequest(List<Long> photoIds) {}

    public record ThumbnailRequest(Long photoId) {}

    public record PageResponse<T>(List<T> items, int page, int size, long total, int totalPages) {
        public static <T> PageResponse<T> of(List<T> all, int page, int size) {
            int from = Math.max(0, page * size);
            int to = Math.min(all.size(), from + size);
            List<T> slice = from >= all.size() ? List.of() : all.subList(from, to);
            int totalPages = (int) Math.ceil(all.size() / (double) size);
            return new PageResponse<>(slice, page, size, all.size(), Math.max(totalPages, 1));
        }
    }
}
