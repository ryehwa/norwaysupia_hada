package com.hadasupia.repository;

import com.hadasupia.domain.Inquiry;
import com.hadasupia.domain.InquiryStatus;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    List<Inquiry> findAllByStatus(InquiryStatus status, Sort sort);
    List<Inquiry> findAllByReservedTrueAndConsultDate(LocalDate consultDate);
    long countByStatus(InquiryStatus status);
}
