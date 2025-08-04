package com.mislbd.spark.service;

import com.mislbd.spark.entity.JobType;
import com.mislbd.spark.repository.JobTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JobTypeService {
    private final JobTypeRepository jobTypeRepository;

    @Autowired
    public JobTypeService(JobTypeRepository jobTypeRepository) {
        this.jobTypeRepository = jobTypeRepository;
    }

    public List<JobType> getAllJobTypes() {
        return jobTypeRepository.findAll();
    }

    public Optional<JobType> getJobTypeById(Integer id) {
        return jobTypeRepository.findById(id);
    }

    public JobType saveJobType(JobType jobType) {
        return jobTypeRepository.save(jobType);
    }

    public void deleteJobType(Integer id) {
        jobTypeRepository.deleteById(id);
    }
}
