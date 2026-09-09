package com.hadasupia.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

@Entity
@Table(name = "project_photos")
public class ProjectPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    /** 공개 URL (예: /uploads/2026/09/abc.jpg) */
    @Column(nullable = false, length = 500)
    private String url;

    /** 저장소 상의 실제 경로 — 삭제 시 파일까지 지우기 위해 보관 */
    @Column(length = 500)
    private String storagePath;

    @Column(nullable = false)
    private int sortOrder;

    @Column(nullable = false)
    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long v) { this.id = v; }
    public Project getProject() { return project; }
    public void setProject(Project v) { this.project = v; }
    public String getUrl() { return url; }
    public void setUrl(String v) { this.url = v; }
    public String getStoragePath() { return storagePath; }
    public void setStoragePath(String v) { this.storagePath = v; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int v) { this.sortOrder = v; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant v) { this.createdAt = v; }
}
