package com.spark.config.service;

import com.spark.dto.SprintRepository;
import com.spark.entities.Sprint;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class SprintService {

    private final SprintRepository sprintRepository;

    @Autowired
    public SprintService(SprintRepository sprintRepository) {
        this.sprintRepository = sprintRepository;
    }

    public Sprint addSprint(Sprint sprint) {
        return sprintRepository.save(sprint);
    }
    public Page<Sprint> getAllSprints(Pageable pageable) {
        return sprintRepository.findAll(pageable);
    }

}