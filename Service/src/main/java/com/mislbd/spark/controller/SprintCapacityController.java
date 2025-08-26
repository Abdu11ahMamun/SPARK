package com.mislbd.spark.controller;

import com.mislbd.spark.dto.*;
import com.mislbd.spark.entity.SprintInfo;
import com.mislbd.spark.entity.User;
import com.mislbd.spark.service.SprintCapacityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
public class SprintCapacityController {

    private final SprintCapacityService sprintCapacityService;

    /**
     * Create sprint with capacity planning
     */
    @PostMapping("/create-sprint")
    public ResponseEntity<SprintInfo> createSprintWithCapacity(@RequestBody SprintCreationDto sprintDto) {
        try {
            log.info("Creating sprint with capacity: {}", sprintDto.getSprintName());
            SprintInfo sprint = sprintCapacityService.createSprintWithCapacity(sprintDto);
            return ResponseEntity.ok(sprint);
        } catch (Exception e) {
            log.error("Error creating sprint with capacity", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Add or update user capacity for a sprint
     */
    @PostMapping("/sprint/{sprintId}/user-capacity")
    public ResponseEntity<SprintUserCapacityDto> addOrUpdateUserCapacity(
            @PathVariable Integer sprintId,
            @RequestBody SprintUserCapacityDto capacityDto) {
        try {
            log.info("Adding/updating user capacity for sprint {} and user {}", sprintId, capacityDto.getUserId());
            SprintUserCapacityDto result = sprintCapacityService.addOrUpdateUserCapacity(sprintId, capacityDto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error adding/updating user capacity", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all user capacities for a sprint
     */
    @GetMapping("/sprint/{sprintId}/user-capacities")
    public ResponseEntity<List<SprintUserCapacityDto>> getSprintUserCapacities(@PathVariable Integer sprintId) {
        try {
            log.info("Getting user capacities for sprint {}", sprintId);
            List<SprintUserCapacityDto> capacities = sprintCapacityService.getSprintUserCapacities(sprintId);
            return ResponseEntity.ok(capacities);
        } catch (Exception e) {
            log.error("Error getting sprint user capacities", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get sprint capacity summary
     */
    @GetMapping("/sprint/{sprintId}/summary")
    public ResponseEntity<SprintCapacitySummaryDto> getSprintCapacitySummary(@PathVariable Integer sprintId) {
        try {
            log.info("Getting capacity summary for sprint {}", sprintId);
            SprintCapacitySummaryDto summary = sprintCapacityService.getSprintCapacitySummary(sprintId);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            log.error("Error getting sprint capacity summary", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Remove user from sprint
     */
    @DeleteMapping("/sprint/{sprintId}/user/{userId}")
    public ResponseEntity<Void> removeUserFromSprint(
            @PathVariable Integer sprintId,
            @PathVariable Long userId) {
        try {
            log.info("Removing user {} from sprint {}", userId, sprintId);
            sprintCapacityService.removeUserFromSprint(sprintId, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error removing user from sprint", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update user allocation hours
     */
    @PutMapping("/sprint/{sprintId}/user/{userId}/allocation")
    public ResponseEntity<SprintUserCapacityDto> updateUserAllocation(
            @PathVariable Integer sprintId,
            @PathVariable Long userId,
            @RequestParam BigDecimal allocatedHours) {
        try {
            log.info("Updating allocation for user {} in sprint {} to {} hours", userId, sprintId, allocatedHours);
            SprintUserCapacityDto result = sprintCapacityService.updateUserAllocation(sprintId, userId, allocatedHours);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error updating user allocation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get team members for sprint planning
     */
    @GetMapping("/team/{teamId}/members")
    public ResponseEntity<List<TeamMemberDto>> getTeamMembers(@PathVariable Integer teamId) {
        try {
            log.info("Getting team members for team {}", teamId);
            List<TeamMemberDto> members = sprintCapacityService.getTeamMembers(teamId);
            return ResponseEntity.ok(members);
        } catch (Exception e) {
            log.error("Error getting team members", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Sprint Capacity Management Service is running");
    }
}
