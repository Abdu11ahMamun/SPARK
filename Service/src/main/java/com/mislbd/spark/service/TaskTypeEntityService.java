package com.mislbd.spark.service;

import com.mislbd.spark.entity.TaskTypeEntity;
import com.mislbd.spark.repository.TaskTypeEntityRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaskTypeEntityService {
    private final TaskTypeEntityRepository repository;

    public TaskTypeEntityService(TaskTypeEntityRepository repository) {
        this.repository = repository;
    }

    public List<TaskTypeEntity> findAll() { return repository.findAll(); }
    public Optional<TaskTypeEntity> findById(Long id) { return repository.findById(id); }
    public TaskTypeEntity save(TaskTypeEntity e) { return repository.save(e); }
    public void delete(Long id) { repository.deleteById(id); }
    public boolean nameExists(String name) { return repository.findByNameIgnoreCase(name).isPresent(); }
}
