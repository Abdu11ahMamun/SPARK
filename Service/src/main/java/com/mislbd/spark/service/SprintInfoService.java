package com.mislbd.spark.service;

import com.mislbd.spark.entity.SprintInfo;
import com.mislbd.spark.repository.SprintInfoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SprintInfoService {
    private final SprintInfoRepository sprintInfoRepository;

    @Autowired
    public SprintInfoService(SprintInfoRepository sprintInfoRepository) {
        this.sprintInfoRepository = sprintInfoRepository;
    }

    public List<SprintInfo> getAllSprintInfos() {
        return sprintInfoRepository.findAll();
    }

    public Optional<SprintInfo> getSprintInfoById(Integer id) {
        return sprintInfoRepository.findById(id);
    }

    public SprintInfo saveSprintInfo(SprintInfo sprintInfo) {
        return sprintInfoRepository.save(sprintInfo);
    }

    public void deleteSprintInfo(Integer id) {
        sprintInfoRepository.deleteById(id);
    }
}
