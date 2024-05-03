package com.spark.dto;

import com.spark.entities.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {
    // You can define additional methods if needed
    Optional<Sprint> findById(Long id);
}
