package com.hadasupia.repository;

import com.hadasupia.domain.SlotClosure;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface SlotClosureRepository extends JpaRepository<SlotClosure, Long> {
    List<SlotClosure> findAllByDate(LocalDate date);
    void deleteAllByDate(LocalDate date);
}
