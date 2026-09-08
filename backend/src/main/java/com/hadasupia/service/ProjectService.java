package com.hadasupia.service;

import com.hadasupia.domain.Category;
import com.hadasupia.domain.FeaturedSlot;
import com.hadasupia.domain.Project;
import com.hadasupia.domain.ProjectPhoto;
import com.hadasupia.dto.CommonDtos.FeaturedSlotView;
import com.hadasupia.dto.ProjectDtos.*;
import com.hadasupia.repository.FeaturedSlotRepository;
import com.hadasupia.repository.ProjectPhotoRepository;
import com.hadasupia.repository.ProjectRepository;
import com.hadasupia.support.HangulSearch;
import com.hadasupia.support.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProjectService {

    /** HOME에는 항상 3칸이 노출된다. */
    public static final int FEATURED_SLOTS = 3;

    private final ProjectRepository projectRepository;
    private final ProjectPhotoRepository photoRepository;
    private final FeaturedSlotRepository featuredRepository;
    private final StorageService storageService;

    public ProjectService(ProjectRepository projectRepository,
                          ProjectPhotoRepository photoRepository,
                          FeaturedSlotRepository featuredRepository,
                          StorageService storageService) {
        this.projectRepository = projectRepository;
        this.photoRepository = photoRepository;
        this.featuredRepository = featuredRepository;
        this.storageService = storageService;
    }

    // ----- 조회 -----

    /** 카테고리 필터 + 검색(초성 포함) + 페이지네이션 */
    @Transactional(readOnly = true)
    public PageResponse<ProjectSummary> search(String categoryLabel, String query, int page, int size) {
        List<Project> base = (categoryLabel == null || categoryLabel.isBlank() || "전체".equals(categoryLabel))
                ? projectRepository.findAllByOrderByCreatedAtDesc()
                : projectRepository.findAllByCategoryOrderByCreatedAtDesc(Category.fromLabel(categoryLabel));

        List<ProjectSummary> filtered = base.stream()
                .filter(p -> HangulSearch.matches(p.getTitle(), query))
                .map(ProjectSummary::of)
                .toList();

        return PageResponse.of(filtered, page, size);
    }

    @Transactional(readOnly = true)
    public ProjectView get(Long id) {
        return ProjectView.of(find(id));
    }

    private Project find(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("사례를 찾을 수 없습니다: " + id));
    }

    // ----- 등록 / 수정 / 삭제 -----

    @Transactional
    public ProjectView create(ProjectRequest req, List<MultipartFile> photos) {
        Project p = new Project();
        p.setTitle(req.title());
        p.setCategory(Category.fromLabel(req.category()));
        p.setDescription(req.description());
        projectRepository.save(p);

        if (photos != null) {
            for (MultipartFile file : photos) {
                if (file != null && !file.isEmpty()) attach(p, file);
            }
        }
        return ProjectView.of(p);
    }

    @Transactional
    public ProjectView update(Long id, ProjectRequest req) {
        Project p = find(id);
        p.setTitle(req.title());
        p.setCategory(Category.fromLabel(req.category()));
        p.setDescription(req.description());
        return ProjectView.of(p);
    }

    @Transactional
    public void delete(Long id) {
        Project p = find(id);
        for (ProjectPhoto photo : p.getPhotos()) {
            storageService.delete(photo.getStoragePath());
        }
        // HOME에 노출 중이던 칸은 비운다
        featuredRepository.findAllByOrderBySlotIndexAsc().stream()
                .filter(slot -> slot.getProject() != null && slot.getProject().getId().equals(id))
                .forEach(slot -> slot.setProject(null));
        projectRepository.delete(p);
    }

    // ----- 사진 -----

    @Transactional
    public ProjectView addPhotos(Long projectId, List<MultipartFile> files) {
        Project p = find(projectId);
        if (files != null) {
            for (MultipartFile file : files) {
                if (file != null && !file.isEmpty()) attach(p, file);
            }
        }
        return ProjectView.of(p);
    }

    private void attach(Project p, MultipartFile file) {
        StorageService.Stored stored = storageService.store(file);
        ProjectPhoto photo = new ProjectPhoto();
        photo.setUrl(stored.url());
        photo.setStoragePath(stored.storagePath());
        p.addPhoto(photo);
        photoRepository.save(photo);
    }

    /** 사진 개별 삭제. 대표 썸네일을 지우면 남은 첫 사진이 대표가 된다. */
    @Transactional
    public ProjectView deletePhoto(Long photoId) {
        ProjectPhoto photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new NotFoundException("사진을 찾을 수 없습니다: " + photoId));
        Project p = photo.getProject();

        p.getPhotos().remove(photo);
        storageService.delete(photo.getStoragePath());
        photoRepository.delete(photo);

        if (photo.getId().equals(p.getThumbnailPhotoId())) {
            p.setThumbnailPhotoId(p.getPhotos().isEmpty() ? null : p.getPhotos().get(0).getId());
        }
        resequence(p);
        return ProjectView.of(p);
    }

    /** 드래그로 바뀐 순서를 저장한다. */
    @Transactional
    public ProjectView reorderPhotos(Long projectId, List<Long> photoIds) {
        Project p = find(projectId);
        if (photoIds == null || photoIds.isEmpty()) return ProjectView.of(p);

        List<ProjectPhoto> ordered = new ArrayList<>();
        for (Long id : photoIds) {
            p.getPhotos().stream()
                    .filter(ph -> ph.getId().equals(id))
                    .findFirst()
                    .ifPresent(ordered::add);
        }
        // 목록에 없던 사진은 뒤에 붙인다
        for (ProjectPhoto ph : p.getPhotos()) {
            if (!ordered.contains(ph)) ordered.add(ph);
        }

        p.getPhotos().clear();
        p.getPhotos().addAll(ordered);
        resequence(p);
        return ProjectView.of(p);
    }

    private void resequence(Project p) {
        List<ProjectPhoto> photos = p.getPhotos();
        for (int i = 0; i < photos.size(); i++) {
            photos.get(i).setSortOrder(i);
        }
    }

    /** 대표 썸네일 지정 — 사례당 하나만 */
    @Transactional
    public ProjectView setThumbnail(Long projectId, Long photoId) {
        Project p = find(projectId);
        boolean owned = p.getPhotos().stream().anyMatch(ph -> ph.getId().equals(photoId));
        if (!owned) {
            throw new IllegalArgumentException("해당 사례의 사진이 아닙니다.");
        }
        p.setThumbnailPhotoId(photoId);
        return ProjectView.of(p);
    }

    @Transactional
    public ProjectView updateCategory(Long projectId, String categoryLabel) {
        Project p = find(projectId);
        p.setCategory(Category.fromLabel(categoryLabel));
        return ProjectView.of(p);
    }

    // ----- HOME 노출 사례 (3칸 고정) -----

    @Transactional
    public List<FeaturedSlotView> featured() {
        List<FeaturedSlot> slots = ensureSlots();
        List<FeaturedSlotView> views = new ArrayList<>();
        for (FeaturedSlot slot : slots) {
            views.add(new FeaturedSlotView(
                    slot.getSlotIndex(),
                    slot.getProject() == null ? null : ProjectSummary.of(slot.getProject())
            ));
        }
        return views;
    }

    /** 관리자 화면의 저장 버튼 — 3칸을 한 번에 반영한다. */
    @Transactional
    public List<FeaturedSlotView> saveFeatured(List<Long> projectIds) {
        List<FeaturedSlot> slots = ensureSlots();
        for (int i = 0; i < FEATURED_SLOTS; i++) {
            Long projectId = (projectIds != null && i < projectIds.size()) ? projectIds.get(i) : null;
            slots.get(i).setProject(projectId == null ? null : find(projectId));
        }
        return featured();
    }

    private List<FeaturedSlot> ensureSlots() {
        List<FeaturedSlot> slots = featuredRepository.findAllByOrderBySlotIndexAsc();
        if (slots.size() < FEATURED_SLOTS) {
            for (int i = slots.size(); i < FEATURED_SLOTS; i++) {
                featuredRepository.save(new FeaturedSlot(i));
            }
            slots = featuredRepository.findAllByOrderBySlotIndexAsc();
        }
        return slots;
    }

    @Transactional(readOnly = true)
    public long count() { return projectRepository.count(); }
}
