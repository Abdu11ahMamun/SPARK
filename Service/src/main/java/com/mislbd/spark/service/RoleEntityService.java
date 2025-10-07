package com.mislbd.spark.service;

import com.mislbd.spark.entity.RoleEntity;
import com.mislbd.spark.repository.RoleEntityRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoleEntityService {
    private final RoleEntityRepository repository;

    public RoleEntityService(RoleEntityRepository repository) {
        this.repository = repository;
    }

    public List<RoleEntity> findAll() { return repository.findAll(); }
    public Optional<RoleEntity> findById(Long id) { return repository.findById(id); }
    public RoleEntity save(RoleEntity role) { return repository.save(role); }
    public void delete(Long id) { repository.deleteById(id); }
    public boolean nameExists(String name) { return repository.findByNameIgnoreCase(name).isPresent(); }
}
