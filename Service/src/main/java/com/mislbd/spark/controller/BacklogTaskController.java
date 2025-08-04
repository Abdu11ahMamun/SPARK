package com.mislbd.spark.controller;

import com.mislbd.spark.dto.BacklogTaskDto;
import com.mislbd.spark.entity.BacklogTask;
import com.mislbd.spark.mapper.BacklogTaskMapper;
import com.mislbd.spark.service.BacklogTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/backlog-tasks")
public class BacklogTaskController {
    private final BacklogTaskService backlogTaskService;
    private final BacklogTaskMapper backlogTaskMapper;

    @Autowired
    public BacklogTaskController(BacklogTaskService backlogTaskService, BacklogTaskMapper backlogTaskMapper) {
        this.backlogTaskService = backlogTaskService;
        this.backlogTaskMapper = backlogTaskMapper;
    }

    @GetMapping
    public List<BacklogTaskDto> getAllBacklogTasks() {
        return backlogTaskService.getAllBacklogTasks().stream().map(backlogTaskMapper::toDto).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BacklogTaskDto> getBacklogTaskById(@PathVariable Integer id) {
        return backlogTaskService.getBacklogTaskById(id)
                .map(backlogTaskMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public BacklogTaskDto createBacklogTask(@RequestBody BacklogTaskDto backlogTaskDto) {
        BacklogTask backlogTask = backlogTaskMapper.toEntity(backlogTaskDto);
        return backlogTaskMapper.toDto(backlogTaskService.saveBacklogTask(backlogTask));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BacklogTaskDto> updateBacklogTask(@PathVariable Integer id, @RequestBody BacklogTaskDto backlogTaskDto) {
        return backlogTaskService.getBacklogTaskById(id)
                .map(existing -> {
                    backlogTaskDto.setId(id);
                    BacklogTask updated = backlogTaskService.saveBacklogTask(backlogTaskMapper.toEntity(backlogTaskDto));
                    return ResponseEntity.ok(backlogTaskMapper.toDto(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBacklogTask(@PathVariable Integer id) {
        if (backlogTaskService.getBacklogTaskById(id).isPresent()) {
            backlogTaskService.deleteBacklogTask(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
