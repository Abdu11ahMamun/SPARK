package com.mislbd.spark.service;

import com.mislbd.spark.entity.RoleEntity;
import com.mislbd.spark.repository.RoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoleService {
    private final RoleRepository repository;
    private static final Logger log = LoggerFactory.getLogger(RoleService.class);

    public RoleService(RoleRepository repository) {
        this.repository = repository;
    }

    public List<RoleEntity> findAll() {
        List<RoleEntity> list = repository.findAll();
        return list;
    }
    public Optional<RoleEntity> findById(Long id) { return repository.findById(id); }
    public RoleEntity save(RoleEntity role) { return repository.save(role); }
    public void delete(Long id) { repository.deleteById(id); }
    public boolean nameExists(String name) { return repository.findByNameIgnoreCase(name).isPresent(); }
}
