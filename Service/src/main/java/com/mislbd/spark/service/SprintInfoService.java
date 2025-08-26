package com.mislbd.spark.service;

import com.mislbd.spark.entity.SprintInfo;
import com.mislbd.spark.repository.SprintInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Sprint Information Service - Industry Standard Implementation
 * Provides business logic for sprint management operations
 * 
 * @author SPARK Team
 * @version 1.0.0
 * @since 2025-08-17
 */
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class SprintInfoService {
    
    private final SprintInfoRepository sprintInfoRepository;

    /**
     * Retrieve all sprint information records
     * @return List of all sprints
     */
    public List<SprintInfo> getAllSprintInfos() {
        log.debug("Fetching all sprint information");
        return sprintInfoRepository.findAll();
    }

    /**
     * Retrieve paginated sprint information
     * @param pageable Pagination information
     * @return Page of sprints
     */
    public Page<SprintInfo> getAllSprintInfos(Pageable pageable) {
        log.debug("Fetching paginated sprint information: {}", pageable);
        return sprintInfoRepository.findAll(pageable);
    }

    /**
     * Retrieve sprint information by ID
     * @param id Sprint ID
     * @return Optional sprint information
     */
    public Optional<SprintInfo> getSprintInfoById(Integer id) {
        log.debug("Fetching sprint information by ID: {}", id);
        return sprintInfoRepository.findById(id);
    }

    /**
     * Create or update sprint information
     * @param sprintInfo Sprint information to save
     * @return Saved sprint information
     */
    @Transactional
    public SprintInfo saveSprintInfo(SprintInfo sprintInfo) {
        log.info("Saving sprint information: {}", sprintInfo.getSprintName());
        
        // Set creation time if new entity
        if (sprintInfo.getId() == null) {
            sprintInfo.setCreateTime(Instant.now());
        }
        
        // Validate business rules
        validateSprintDates(sprintInfo);
        
        SprintInfo savedSprint = sprintInfoRepository.save(sprintInfo);
        log.info("Successfully saved sprint with ID: {}", savedSprint.getId());
        
        return savedSprint;
    }

    /**
     * Delete sprint information by ID
     * @param id Sprint ID to delete
     */
    @Transactional
    public void deleteSprintInfo(Integer id) {
        log.info("Deleting sprint information with ID: {}", id);
        
        if (!sprintInfoRepository.existsById(id)) {
            log.warn("Attempted to delete non-existent sprint with ID: {}", id);
            throw new RuntimeException("Sprint not found with ID: " + id);
        }
        
        sprintInfoRepository.deleteById(id);
        log.info("Successfully deleted sprint with ID: {}", id);
    }

    /**
     * Get active sprints
     * @return List of active sprints
     */
    public List<SprintInfo> getActiveSprintInfos() {
        log.debug("Fetching active sprint information");
        return sprintInfoRepository.findByStatus(1);
    }

    /**
     * Get sprints by team ID
     * @param teamId Team ID
     * @return List of sprints for the team
     */
    public List<SprintInfo> getSprintInfosByTeam(Integer teamId) {
        log.debug("Fetching sprint information for team ID: {}", teamId);
        return sprintInfoRepository.findByTramId(teamId);
    }

    /**
     * Validate sprint business rules
     * @param sprintInfo Sprint to validate
     */
    private void validateSprintDates(SprintInfo sprintInfo) {
        if (sprintInfo.getFromDate() != null && sprintInfo.getToDate() != null) {
            if (sprintInfo.getFromDate().isAfter(sprintInfo.getToDate())) {
                throw new IllegalArgumentException("Sprint start date cannot be after end date");
            }
        }
    }
}
