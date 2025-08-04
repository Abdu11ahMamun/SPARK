package com.mislbd.spark.service;

import com.mislbd.spark.entity.AppConfig;
import com.mislbd.spark.repository.AppConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AppConfigService {
    private final AppConfigRepository appConfigRepository;

    @Autowired
    public AppConfigService(AppConfigRepository appConfigRepository) {
        this.appConfigRepository = appConfigRepository;
    }

    public List<AppConfig> getAllAppConfigs() {
        return appConfigRepository.findAll();
    }

    public Optional<AppConfig> getAppConfigById(Integer id) {
        return appConfigRepository.findById(id);
    }

    public AppConfig saveAppConfig(AppConfig appConfig) {
        return appConfigRepository.save(appConfig);
    }

    public void deleteAppConfig(Integer id) {
        appConfigRepository.deleteById(id);
    }
}
