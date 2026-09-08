package com.hadasupia.domain;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalTime;

/** 관리자가 직접 마감해 둔 시간대. 행이 있으면 그 시각은 닫힘. */
@Entity
@Table(name = "slot_closures", uniqueConstraints =
        @UniqueConstraint(columnNames = {"closed_date", "closed_time"}))
public class SlotClosure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "closed_date", nullable = false)
    private LocalDate date;

    @Column(name = "closed_time", nullable = false)
    private LocalTime time;

    public SlotClosure() {}

    public SlotClosure(LocalDate date, LocalTime time) {
        this.date = date;
        this.time = time;
    }

    public Long getId() { return id; }
    public void setId(Long v) { this.id = v; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate v) { this.date = v; }
    public LocalTime getTime() { return time; }
    public void setTime(LocalTime v) { this.time = v; }
}
