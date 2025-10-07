package com.mislbd.spark.controller;

import com.mislbd.spark.dto.TaskTypeDto;
import com.mislbd.spark.entity.TaskTypeEntity;
import com.mislbd.spark.mapper.TaskTypeEntityMapper;
import com.mislbd.spark.service.TaskTypeEntityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/task-types-dynamic")
@CrossOrigin(origins = "*", allowCredentials = "false")
public class TaskTypeEntityController {
    private final TaskTypeEntityService service;
    private final TaskTypeEntityMapper mapper;

    public TaskTypeEntityController(TaskTypeEntityService service, TaskTypeEntityMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public List<TaskTypeDto> all() { return service.findAll().stream().map(mapper::toDto).collect(Collectors.toList()); }

    @GetMapping("/{id}")
    public ResponseEntity<TaskTypeDto> one(@PathVariable Long id) {
        return service.findById(id)
                .map(e -> ResponseEntity.ok(mapper.toDto(e)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TaskTypeDto> create(@RequestBody TaskTypeDto dto) {
        if (dto.getName() == null || dto.getName().isBlank()) return ResponseEntity.badRequest().build();
        if (service.nameExists(dto.getName())) return ResponseEntity.status(409).build();
        TaskTypeEntity saved = service.save(mapper.toEntity(dto));
        return ResponseEntity.ok(mapper.toDto(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskTypeDto> update(@PathVariable Long id, @RequestBody TaskTypeDto dto) {
        return service.findById(id).map(existing -> {
            TaskTypeEntity toUpdate = mapper.toEntity(dto);
            toUpdate.setId(id);
            if (toUpdate.getActive() == null) toUpdate.setActive(existing.getActive());
            TaskTypeEntity saved = service.save(toUpdate);
            return ResponseEntity.ok(mapper.toDto(saved));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (service.findById(id).isEmpty()) return ResponseEntity.notFound().build();
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
