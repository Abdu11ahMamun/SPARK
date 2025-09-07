package com.mislbd.spark.controller;

import com.mislbd.spark.dto.*;
import com.mislbd.spark.entity.SprintInfo;
import com.mislbd.spark.service.SprintCapacityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * REST Controller for Sprint Capacity Management
 */
@RestController
@RequestMapping("/api/sprint-capacity")
@RequiredArgsConstructor
@Slf4j
@Validated
public class SprintCapacityController {

    private final SprintCapacityService sprintCapacityService;

    /**
     * Create sprint with capacity planning
     */
    @PostMapping("/create-sprint")
    public ResponseEntity<SprintInfo> createSprintWithCapacity(@RequestBody SprintCreationDto sprintDto) {
        log.info("Creating sprint with capacity: {} (team={} from={} to={})", sprintDto.getSprintName(), sprintDto.getTramId(), sprintDto.getFromDate(), sprintDto.getToDate());
        SprintInfo sprint = sprintCapacityService.createSprintWithCapacity(sprintDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(sprint);
    }

    /**
     * Add or update user capacity for a sprint
     */
    @PostMapping("/sprint/{sprintId}/user-capacity")
    public ResponseEntity<SprintUserCapacityDto> addOrUpdateUserCapacity(
            @PathVariable Integer sprintId,
            @RequestBody SprintUserCapacityDto capacityDto) {
        log.info("Adding/updating user capacity for sprint {} and user {}", sprintId, capacityDto.getUserId());
        SprintUserCapacityDto result = sprintCapacityService.addOrUpdateUserCapacity(sprintId, capacityDto);
        return ResponseEntity.ok(result);
    }

    /**
     * Get all user capacities for a sprint
     */
    @GetMapping("/sprint/{sprintId}/user-capacities")
    public ResponseEntity<List<SprintUserCapacityDto>> getSprintUserCapacities(@PathVariable Integer sprintId) {
        log.info("Getting user capacities for sprint {}", sprintId);
        List<SprintUserCapacityDto> capacities = sprintCapacityService.getSprintUserCapacities(sprintId);
        return ResponseEntity.ok(capacities);
    }

    /**
     * Get sprint capacity summary
     */
    @GetMapping("/sprint/{sprintId}/summary")
    public ResponseEntity<SprintCapacitySummaryDto> getSprintCapacitySummary(@PathVariable Integer sprintId) {
        log.info("Getting capacity summary for sprint {}", sprintId);
        SprintCapacitySummaryDto summary = sprintCapacityService.getSprintCapacitySummary(sprintId);
        return ResponseEntity.ok(summary);
    }

    /**
     * Remove user from sprint
     */
    @DeleteMapping("/sprint/{sprintId}/user/{userId}")
    public ResponseEntity<Void> removeUserFromSprint(
            @PathVariable Integer sprintId,
            @PathVariable Long userId) {
        log.info("Removing user {} from sprint {}", userId, sprintId);
        sprintCapacityService.removeUserFromSprint(sprintId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Update user allocation hours
     */
    @PutMapping("/sprint/{sprintId}/user/{userId}/allocation")
    public ResponseEntity<SprintUserCapacityDto> updateUserAllocation(
            @PathVariable Integer sprintId,
            @PathVariable Long userId,
            @RequestParam BigDecimal allocatedHours) {
        log.info("Updating allocation for user {} in sprint {} to {} hours", userId, sprintId, allocatedHours);
        SprintUserCapacityDto result = sprintCapacityService.updateUserAllocation(sprintId, userId, allocatedHours);
        return ResponseEntity.ok(result);
    }

    /**
     * Get team members for sprint planning
     */
    @GetMapping("/team/{teamId}/members")
    public ResponseEntity<List<TeamMemberDto>> getTeamMembers(@PathVariable Integer teamId) {
        log.info("Getting team members for team {}", teamId);
        List<TeamMemberDto> members = sprintCapacityService.getTeamMembers(teamId);
        return ResponseEntity.ok(members);
    }

    /**
     * Get user progress for a sprint
     */
    @GetMapping("/sprint/{sprintId}/user-progress")
    public ResponseEntity<List<SprintUserProgressDto>> getSprintUserProgress(@PathVariable Integer sprintId) {
        log.info("Getting user progress for sprint {}", sprintId);
        List<SprintUserProgressDto> progress = sprintCapacityService.getSprintUserProgress(sprintId);
        return ResponseEntity.ok(progress);
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Sprint Capacity Management Service is running");
    }
}
