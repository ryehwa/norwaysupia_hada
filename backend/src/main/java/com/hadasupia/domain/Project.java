package com.hadasupia.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Category category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, id ASC")
    private List<ProjectPhoto> photos = new ArrayList<>();

    /** 대표 썸네일로 지정된 사진. null이면 첫 번째 사진을 사용한다. */
    private Long thumbnailPhotoId;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    void onUpdate() { this.updatedAt = Instant.now(); }

    public void addPhoto(ProjectPhoto photo) {
        photo.setProject(this);
        photo.setSortOrder(photos.size());
        photos.add(photo);
    }

    /** 대표 썸네일 사진 (지정이 없거나 삭제된 경우 첫 사진) */
    public ProjectPhoto thumbnail() {
        if (photos.isEmpty()) return null;
        if (thumbnailPhotoId != null) {
            for (ProjectPhoto p : photos) {
                if (thumbnailPhotoId.equals(p.getId())) return p;
            }
        }
        return photos.get(0);
    }

    public Long getId() { return id; }
    public void setId(Long v) { this.id = v; }
    public String getTitle() { return title; }
    public void setTitle(String v) { this.title = v; }
    public Category getCategory() { return category; }
    public void setCategory(Category v) { this.category = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { this.description = v; }
    public List<ProjectPhoto> getPhotos() { return photos; }
    public void setPhotos(List<ProjectPhoto> v) { this.photos = v; }
    public Long getThumbnailPhotoId() { return thumbnailPhotoId; }
    public void setThumbnailPhotoId(Long v) { this.thumbnailPhotoId = v; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant v) { this.createdAt = v; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant v) { this.updatedAt = v; }
}
