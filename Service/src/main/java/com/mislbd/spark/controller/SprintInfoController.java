package com.mislbd.spark.controller;

import com.mislbd.spark.dto.SprintInfoDto;
import com.mislbd.spark.entity.SprintInfo;
import com.mislbd.spark.mapper.SprintInfoMapper;
import com.mislbd.spark.service.SprintInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sprint-infos")
public class SprintInfoController {
    private final SprintInfoService sprintInfoService;
    private final SprintInfoMapper sprintInfoMapper;

    @Autowired
    public SprintInfoController(SprintInfoService sprintInfoService, SprintInfoMapper sprintInfoMapper) {
        this.sprintInfoService = sprintInfoService;
        this.sprintInfoMapper = sprintInfoMapper;
    }

    @GetMapping
    public List<SprintInfoDto> getAllSprintInfos() {
        return sprintInfoService.getAllSprintInfos().stream().map(sprintInfoMapper::toDto).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SprintInfoDto> getSprintInfoById(@PathVariable Integer id) {
        return sprintInfoService.getSprintInfoById(id)
                .map(sprintInfoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public SprintInfoDto createSprintInfo(@RequestBody SprintInfoDto sprintInfoDto) {
        SprintInfo sprintInfo = sprintInfoMapper.toEntity(sprintInfoDto);
        return sprintInfoMapper.toDto(sprintInfoService.saveSprintInfo(sprintInfo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SprintInfoDto> updateSprintInfo(@PathVariable Integer id, @RequestBody SprintInfoDto sprintInfoDto) {
        return sprintInfoService.getSprintInfoById(id)
                .map(existing -> {
                    sprintInfoDto.setId(id);
                    SprintInfo updated = sprintInfoService.saveSprintInfo(sprintInfoMapper.toEntity(sprintInfoDto));
                    return ResponseEntity.ok(sprintInfoMapper.toDto(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSprintInfo(@PathVariable Integer id) {
        if (sprintInfoService.getSprintInfoById(id).isPresent()) {
            sprintInfoService.deleteSprintInfo(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
