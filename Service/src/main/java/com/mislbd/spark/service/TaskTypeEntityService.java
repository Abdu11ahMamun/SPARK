package com.mislbd.spark.service;

import com.mislbd.spark.entity.TaskTypeEntity;
import com.mislbd.spark.repository.TaskTypeEntityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaskTypeEntityService {
    private final TaskTypeEntityRepository repository;
    private static final Logger log = LoggerFactory.getLogger(TaskTypeEntityService.class);

    public TaskTypeEntityService(TaskTypeEntityRepository repository) {
        this.repository = repository;
    }

    public List<TaskTypeEntity> findAll() {
        long start = System.currentTimeMillis();
        List<TaskTypeEntity> list = repository.findAll();
        log.debug("Loaded {} task types in {} ms", list.size(), System.currentTimeMillis()-start);
        return list;
    }
    public Optional<TaskTypeEntity> findById(Long id) { return repository.findById(id); }
    public TaskTypeEntity save(TaskTypeEntity e) { return repository.save(e); }
    public void delete(Long id) { repository.deleteById(id); }
    public boolean nameExists(String name) { return repository.findByNameIgnoreCase(name).isPresent(); }
}
