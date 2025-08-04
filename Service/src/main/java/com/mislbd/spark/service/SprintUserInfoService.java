package com.mislbd.spark.service;

import com.mislbd.spark.entity.SprintUserInfo;
import com.mislbd.spark.repository.SprintUserInfoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SprintUserInfoService {
    private final SprintUserInfoRepository sprintUserInfoRepository;

    @Autowired
    public SprintUserInfoService(SprintUserInfoRepository sprintUserInfoRepository) {
        this.sprintUserInfoRepository = sprintUserInfoRepository;
    }

    public List<SprintUserInfo> getAllSprintUserInfos() {
        return sprintUserInfoRepository.findAll();
    }

    public Optional<SprintUserInfo> getSprintUserInfoById(Integer id) {
        return sprintUserInfoRepository.findById(id);
    }

    public SprintUserInfo saveSprintUserInfo(SprintUserInfo sprintUserInfo) {
        return sprintUserInfoRepository.save(sprintUserInfo);
    }

    public void deleteSprintUserInfo(Integer id) {
        sprintUserInfoRepository.deleteById(id);
    }
}
