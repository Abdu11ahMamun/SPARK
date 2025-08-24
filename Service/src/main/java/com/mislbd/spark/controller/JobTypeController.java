package com.mislbd.spark.controller;

import com.mislbd.spark.dto.JobTypeDto;
import com.mislbd.spark.entity.JobType;
import com.mislbd.spark.mapper.JobTypeMapper;
import com.mislbd.spark.service.JobTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/job-types")
@CrossOrigin(origins = "*", allowCredentials = "false")
public class JobTypeController {
    private final JobTypeService jobTypeService;
    private final JobTypeMapper jobTypeMapper;

    @Autowired
    public JobTypeController(JobTypeService jobTypeService, JobTypeMapper jobTypeMapper) {
        this.jobTypeService = jobTypeService;
        this.jobTypeMapper = jobTypeMapper;
    }

    @GetMapping
    public List<JobTypeDto> getAllJobTypes() {
        return jobTypeService.getAllJobTypes().stream()
                .map(jobTypeMapper::toDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobTypeDto> getJobTypeById(@PathVariable Integer id) {
        return jobTypeService.getJobTypeById(id)
                .map(jobType -> ResponseEntity.ok(jobTypeMapper.toDto(jobType)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public JobTypeDto createJobType(@RequestBody JobTypeDto jobTypeDto) {
        JobType jobType = jobTypeMapper.toEntity(jobTypeDto);
        JobType savedJobType = jobTypeService.saveJobType(jobType);
        return jobTypeMapper.toDto(savedJobType);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobTypeDto> updateJobType(@PathVariable Integer id, @RequestBody JobTypeDto jobTypeDto) {
        return jobTypeService.getJobTypeById(id)
                .map(existing -> {
                    jobTypeDto.setId(id);
                    JobType updated = jobTypeService.saveJobType(jobTypeMapper.toEntity(jobTypeDto));
                    return ResponseEntity.ok(jobTypeMapper.toDto(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobType(@PathVariable Integer id) {
        if (jobTypeService.getJobTypeById(id).isPresent()) {
            jobTypeService.deleteJobType(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
