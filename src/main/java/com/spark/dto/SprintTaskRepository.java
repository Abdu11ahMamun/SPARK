package com.spark.dto;

import com.spark.entities.SprintTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SprintTaskRepository extends JpaRepository<SprintTask, Long> {
    List<SprintTask> findBySprintId(Long sprintId);
}
