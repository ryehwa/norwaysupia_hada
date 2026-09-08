package com.hadasupia.repository;

import com.hadasupia.domain.Category;
import com.hadasupia.domain.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findAllByOrderByCreatedAtDesc();
    List<Project> findAllByCategoryOrderByCreatedAtDesc(Category category);
}
