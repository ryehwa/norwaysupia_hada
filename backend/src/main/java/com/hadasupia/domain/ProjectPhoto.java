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

    /**
     * MinIO 오브젝트 키 (예: 2026/09/abc.jpg).
     * 조회용 URL 은 만료가 있어 저장하지 않고 응답할 때마다 새로 서명한다.
     */
    @Column(name = "object_key", nullable = false, length = 500)
    private String objectKey;

    @Column(nullable = false)
    private int sortOrder;

    @Column(nullable = false)
    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long v) { this.id = v; }
    public Project getProject() { return project; }
    public void setProject(Project v) { this.project = v; }
    public String getObjectKey() { return objectKey; }
    public void setObjectKey(String v) { this.objectKey = v; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int v) { this.sortOrder = v; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant v) { this.createdAt = v; }
}
