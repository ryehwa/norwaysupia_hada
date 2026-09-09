package com.hadasupia.web.admin;

import com.hadasupia.dto.CommonDtos.FeaturedSaveRequest;
import com.hadasupia.dto.CommonDtos.FeaturedSlotView;
import com.hadasupia.dto.ProjectDtos.*;
import com.hadasupia.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/** 관리자 — 시공사례 관리 */
@RestController
@RequestMapping("/api/admin")
public class AdminProjectController {

    private final ProjectService projectService;

    public AdminProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    /** 목록 — 카테고리 필터 + 초성 검색 + 페이지네이션(기본 12개 = 4×3) */
    @GetMapping("/projects")
    public PageResponse<ProjectSummary> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return projectService.search(category, q, page, size);
    }

    @GetMapping("/projects/{id}")
    public ProjectView get(@PathVariable Long id) {
        return projectService.get(id);
    }

    /** 새 사례 등록 — 제목·카테고리·설명 + 사진 여러 장을 한 번에 */
    @PostMapping(value = "/projects", consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectView create(@RequestPart("data") @Valid ProjectRequest data,
                              @RequestPart(value = "photos", required = false) List<MultipartFile> photos) {
        return projectService.create(data, photos);
    }

    @PutMapping("/projects/{id}")
    public ProjectView update(@PathVariable Long id, @Valid @RequestBody ProjectRequest req) {
        return projectService.update(id, req);
    }

    @DeleteMapping("/projects/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        projectService.delete(id);
    }

    /** 팝업에서 사진 추가 */
    @PostMapping(value = "/projects/{id}/photos", consumes = "multipart/form-data")
    public ProjectView addPhotos(@PathVariable Long id,
                                 @RequestPart("photos") List<MultipartFile> photos) {
        return projectService.addPhotos(id, photos);
    }

    /** 사진 개별 삭제 */
    @DeleteMapping("/photos/{photoId}")
    public ProjectView deletePhoto(@PathVariable Long photoId) {
        return projectService.deletePhoto(photoId);
    }

    /** 드래그로 바뀐 사진 순서 저장 */
    @PutMapping("/projects/{id}/photos/order")
    public ProjectView reorder(@PathVariable Long id, @RequestBody PhotoOrderRequest req) {
        return projectService.reorderPhotos(id, req.photoIds());
    }

    /** 대표 썸네일(★) 지정 */
    @PutMapping("/projects/{id}/thumbnail")
    public ProjectView setThumbnail(@PathVariable Long id, @RequestBody ThumbnailRequest req) {
        return projectService.setThumbnail(id, req.photoId());
    }

    /** 팝업에서 카테고리 수정 */
    @PutMapping("/projects/{id}/category")
    public ProjectView setCategory(@PathVariable Long id, @RequestParam String category) {
        return projectService.updateCategory(id, category);
    }

    // ----- HOME 노출 사례 (3칸 고정, 저장 버튼으로 확정) -----

    @GetMapping("/featured")
    public List<FeaturedSlotView> featured() {
        return projectService.featured();
    }

    @PutMapping("/featured")
    public List<FeaturedSlotView> saveFeatured(@RequestBody FeaturedSaveRequest req) {
        return projectService.saveFeatured(req.projectIds());
    }
}
