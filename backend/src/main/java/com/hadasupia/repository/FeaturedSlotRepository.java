package com.hadasupia.repository;

import com.hadasupia.domain.FeaturedSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeaturedSlotRepository extends JpaRepository<FeaturedSlot, Long> {
    List<FeaturedSlot> findAllByOrderBySlotIndexAsc();
}
