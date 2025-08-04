package com.mislbd.spark.service;

import com.mislbd.spark.entity.RoleRights;
import com.mislbd.spark.repository.RoleRightsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoleRightsService {
    private final RoleRightsRepository roleRightsRepository;

    @Autowired
    public RoleRightsService(RoleRightsRepository roleRightsRepository) {
        this.roleRightsRepository = roleRightsRepository;
    }

    public List<RoleRights> getAllRoleRights() {
        return roleRightsRepository.findAll();
    }

    public Optional<RoleRights> getRoleRightsById(Integer id) {
        return roleRightsRepository.findById(id);
    }

    public RoleRights saveRoleRights(RoleRights roleRights) {
        return roleRightsRepository.save(roleRights);
    }

    public void deleteRoleRights(Integer id) {
        roleRightsRepository.deleteById(id);
    }
}
