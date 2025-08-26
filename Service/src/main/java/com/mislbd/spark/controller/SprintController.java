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
@RequestMapping("/api/sprints")
public class SprintController {
    private final SprintInfoService sprintInfoService;
    private final SprintInfoMapper sprintInfoMapper;

    @Autowired
    public SprintController(SprintInfoService sprintInfoService, SprintInfoMapper sprintInfoMapper) {
        this.sprintInfoService = sprintInfoService;
        this.sprintInfoMapper = sprintInfoMapper;
    }

    @GetMapping
    public List<SprintInfoDto> getAllSprints() {
        return sprintInfoService.getAllSprintInfos().stream()
                .map(sprintInfoMapper::toDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SprintInfoDto> getSprintById(@PathVariable Integer id) {
        return sprintInfoService.getSprintInfoById(id)
                .map(sprintInfoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public SprintInfoDto createSprint(@RequestBody SprintInfoDto sprintDto) {
        SprintInfo sprintInfo = sprintInfoMapper.toEntity(sprintDto);
        SprintInfo savedSprint = sprintInfoService.saveSprintInfo(sprintInfo);
        return sprintInfoMapper.toDto(savedSprint);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SprintInfoDto> updateSprint(@PathVariable Integer id, @RequestBody SprintInfoDto sprintDto) {
        return sprintInfoService.getSprintInfoById(id)
                .map(existing -> {
                    sprintDto.setId(id);
                    SprintInfo updated = sprintInfoService.saveSprintInfo(sprintInfoMapper.toEntity(sprintDto));
                    return ResponseEntity.ok(sprintInfoMapper.toDto(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSprint(@PathVariable Integer id) {
        if (sprintInfoService.getSprintInfoById(id).isPresent()) {
            sprintInfoService.deleteSprintInfo(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
