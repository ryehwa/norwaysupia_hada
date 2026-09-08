package com.hadasupia.domain;

import jakarta.persistence.*;

import java.time.Instant;

/**
 * HOME에 노출되는 사례 칸. 항상 3개(slotIndex 0,1,2)가 존재하고
 * project가 null이면 빈 칸(관리자 화면의 + 표시)이다.
 */
@Entity
@Table(name = "featured_slots", uniqueConstraints = @UniqueConstraint(columnNames = "slot_index"))
public class FeaturedSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "slot_index", nullable = false)
    private int slotIndex;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    public FeaturedSlot() {}

    public FeaturedSlot(int slotIndex) { this.slotIndex = slotIndex; }

    public Long getId() { return id; }
    public void setId(Long v) { this.id = v; }
    public int getSlotIndex() { return slotIndex; }
    public void setSlotIndex(int v) { this.slotIndex = v; }
    public Project getProject() { return project; }
    public void setProject(Project v) { this.project = v; this.updatedAt = Instant.now(); }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant v) { this.updatedAt = v; }
}
