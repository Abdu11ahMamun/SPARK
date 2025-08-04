package com.mislbd.spark.repository;

import com.mislbd.spark.entity.BacklogTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BacklogTaskRepository extends JpaRepository<BacklogTask, Integer> {
    // Custom query methods if needed
}
