package com.mislbd.spark.repository;

import com.mislbd.spark.entity.SprintInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SprintInfoRepository extends JpaRepository<SprintInfo, Integer> {
    // Custom query methods if needed
}
