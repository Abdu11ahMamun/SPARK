package com.spark.config.service;

import com.spark.dto.ModuleRepository;
import com.spark.entities.Module;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ModuleService {
    @Autowired
    private ModuleRepository moduleRepository;
    public void saveModule(Module module) {
        moduleRepository.save(module);
    }
    public Page<Module> getAllModules(Pageable pageable) {
        return moduleRepository.findAll(pageable);
    }
}
