package com.spark.config.service;

import com.spark.dto.BacklogRepository;
import com.spark.dto.SprintRepository;
import com.spark.dto.SprintTaskRepository;
import com.spark.entities.Backlog;
import com.spark.entities.Sprint;
import com.spark.entities.SprintTask;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SprintService {

    private final SprintRepository sprintRepository;
    @Autowired
    private BacklogRepository backlogRepository;

    @Autowired
    private SprintTaskRepository sprintTaskRepository;

    @Autowired
    public SprintService(SprintRepository sprintRepository, BacklogRepository backlogRepository) {
        this.sprintRepository = sprintRepository;
        this.backlogRepository = backlogRepository;
    }
    public Sprint addSprint(Sprint sprint) {
        return sprintRepository.save(sprint);
    }
    public Page<Sprint> getAllSprints(Pageable pageable) {
        return sprintRepository.findAll(pageable);
    }
//    @Transactional
//    public void assignBacklogsToSprint(List<Long> backlogIds, Long sprintId) {
//    Sprint sprint = sprintRepository.findById(sprintId).orElseThrow(() -> new RuntimeException("Sprint not found"));
//    List<Backlog> backlogs = backlogRepository.findAllById(backlogIds);
//    for (Backlog backlog : backlogs) {
//        backlog.setSprint(sprint);
//    }
//    backlogRepository.saveAll(backlogs);
//    }
public void assignBacklogsToSprint(List<Long> backlogIds, Long sprintId) {
    Sprint sprint = sprintRepository.findById(sprintId).orElseThrow(() -> new RuntimeException("Sprint not found"));
    List<Backlog> backlogs = backlogRepository.findAllById(backlogIds);
    for (Backlog backlog : backlogs) {
        backlog.setSprint(sprint);

        // Create a new SprintTask for the backlog
        SprintTask sprintTask = new SprintTask();
        sprintTask.setBacklog(backlog);
        sprintTask.setSprint(sprint);
        // Set other properties of the SprintTask as needed
//        sprintTask.setStatus("Not Started");
//        sprintTask.setStartDate(LocalDate.now());
//        sprintTask.setEndDate(LocalDate.now().plusDays(14));

        sprintTaskRepository.save(sprintTask);
    }
    backlogRepository.saveAll(backlogs);
    }

}