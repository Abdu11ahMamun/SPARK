package com.mislbd.spark.controller;

import com.mislbd.spark.dto.SprintUserInfoDto;
import com.mislbd.spark.entity.SprintUserInfo;
import com.mislbd.spark.mapper.SprintUserInfoMapper;
import com.mislbd.spark.service.SprintUserInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sprint-user-infos")
public class SprintUserInfoController {
    private final SprintUserInfoService sprintUserInfoService;
    private final SprintUserInfoMapper sprintUserInfoMapper;

    @Autowired
    public SprintUserInfoController(SprintUserInfoService sprintUserInfoService, SprintUserInfoMapper sprintUserInfoMapper) {
        this.sprintUserInfoService = sprintUserInfoService;
        this.sprintUserInfoMapper = sprintUserInfoMapper;
    }

    @GetMapping
    public List<SprintUserInfoDto> getAllSprintUserInfos() {
        return sprintUserInfoService.getAllSprintUserInfos().stream().map(sprintUserInfoMapper::toDto).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SprintUserInfoDto> getSprintUserInfoById(@PathVariable Integer id) {
        return sprintUserInfoService.getSprintUserInfoById(id)
                .map(sprintUserInfoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public SprintUserInfoDto createSprintUserInfo(@RequestBody SprintUserInfoDto sprintUserInfoDto) {
        SprintUserInfo sprintUserInfo = sprintUserInfoMapper.toEntity(sprintUserInfoDto);
        return sprintUserInfoMapper.toDto(sprintUserInfoService.saveSprintUserInfo(sprintUserInfo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SprintUserInfoDto> updateSprintUserInfo(@PathVariable Integer id, @RequestBody SprintUserInfoDto sprintUserInfoDto) {
        return sprintUserInfoService.getSprintUserInfoById(id)
                .map(existing -> {
                    sprintUserInfoDto.setId(id);
                    SprintUserInfo updated = sprintUserInfoService.saveSprintUserInfo(sprintUserInfoMapper.toEntity(sprintUserInfoDto));
                    return ResponseEntity.ok(sprintUserInfoMapper.toDto(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSprintUserInfo(@PathVariable Integer id) {
        if (sprintUserInfoService.getSprintUserInfoById(id).isPresent()) {
            sprintUserInfoService.deleteSprintUserInfo(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
