package com.mislbd.spark.service;

import com.mislbd.spark.entity.BacklogTask;
import com.mislbd.spark.repository.BacklogTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BacklogTaskService {
    private final BacklogTaskRepository backlogTaskRepository;

    @Autowired
    public BacklogTaskService(BacklogTaskRepository backlogTaskRepository) {
        this.backlogTaskRepository = backlogTaskRepository;
    }

    public List<BacklogTask> getAllBacklogTasks() {
        return backlogTaskRepository.findAll();
    }

    public Optional<BacklogTask> getBacklogTaskById(Integer id) {
        return backlogTaskRepository.findById(id);
    }

    public BacklogTask saveBacklogTask(BacklogTask backlogTask) {
        return backlogTaskRepository.save(backlogTask);
    }

    public void deleteBacklogTask(Integer id) {
        backlogTaskRepository.deleteById(id);
    }

    public List<BacklogTask> getUndoneTasksByTeam(Integer teamId) {
        return backlogTaskRepository.findUndoneTasksByTeamExcludingSprint(teamId);
    }

    public List<BacklogTask> assignTasksToSprint(Integer sprintId, List<Integer> taskIds) {
        List<BacklogTask> tasks = backlogTaskRepository.findAllById(taskIds);
        tasks.forEach(t -> t.setSprintid(sprintId));
        return backlogTaskRepository.saveAll(tasks);
    }
}
