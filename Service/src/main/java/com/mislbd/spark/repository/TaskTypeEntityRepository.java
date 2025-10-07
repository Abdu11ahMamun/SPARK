package com.mislbd.spark.repository;

import com.mislbd.spark.entity.TaskTypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TaskTypeEntityRepository extends JpaRepository<TaskTypeEntity, Long> {
    Optional<TaskTypeEntity> findByNameIgnoreCase(String name);
}
