package com.mislbd.spark.service;

import com.mislbd.spark.entity.Role;
import com.mislbd.spark.repository.RoleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoleService {
    private final RoleRepository repository;

    public RoleService(RoleRepository repository) {
        this.repository = repository;
    }

    public List<Role> findAll() {
        return repository.findAll();
    }
    public Optional<Role> findById(Long id) { return repository.findById(id); }
    public Role save(Role role) { return repository.save(role); }
    public void delete(Long id) { repository.deleteById(id); }
    public boolean nameExists(String name) { return repository.findByNameIgnoreCase(name).isPresent(); }
}
