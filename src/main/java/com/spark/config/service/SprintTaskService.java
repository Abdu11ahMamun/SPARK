package com.spark.config.service;

import com.spark.entities.SprintTask;
import com.spark.dto.SprintTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class SprintTaskService {
    private final SprintTaskRepository sprintTaskRepository;

    @Autowired
    public SprintTaskService(SprintTaskRepository sprintTaskRepository) {
        this.sprintTaskRepository = sprintTaskRepository;
    }


    public List<SprintTask> getSprintTasksBySprintIdWithBacklogDetails(Long sprintId) {
        return sprintTaskRepository.findBySprintIdWithBacklogDetails(sprintId);
    }
}