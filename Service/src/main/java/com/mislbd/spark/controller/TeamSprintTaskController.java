package com.mislbd.spark.controller;

import com.mislbd.spark.dto.ApiResponse;
import com.mislbd.spark.dto.TeamSprintDto;
import com.mislbd.spark.dto.SprintTaskDto;
import com.mislbd.spark.service.TeamSprintTaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
// Authentication imports removed - no auth required
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Professional Team Sprint Task Controller
 * 
 * Provides comprehensive task management by team sprints with professional
 * filtering and display capabilities for the task page.
 * 
 * Features:
 * - Team-wise current sprint retrieval
 * - Sprint-based task filtering  
 * - User-specific task assignment tracking
 * - Professional task card data structure
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-30
 */
@RestController
@RequestMapping("/api/team-sprint-tasks")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class TeamSprintTaskController {
    
    private final TeamSprintTaskService teamSprintTaskService;
    
    /**
     * Helper method to get the current authenticated user
     * Falls back to "admin" if no authentication context exists
     */
    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return auth.getName();
        }
        return "admin"; // Fallback for testing
    }
    
    /**
     * Get all teams and their current active sprints for the authenticated user
     * 
     * This endpoint provides the foundation for the task page dropdown,
     * showing only teams where the user is a member and their active sprints.
     */
    @GetMapping("/user-team-sprints")
    public ResponseEntity<ApiResponse<List<TeamSprintDto>>> getUserTeamSprints() {
        // Get current authenticated user or fallback to admin
        String username = getCurrentUsername();
        
        try {
            List<TeamSprintDto> teamSprints = teamSprintTaskService.getUserTeamSprints(username);
            
            log.info("Retrieved {} team sprints for user: {}", teamSprints.size(), username);
            
            return ResponseEntity.ok(
                ApiResponse.<List<TeamSprintDto>>builder()
                    .success(true)
                    .message("Team sprints retrieved successfully")
                    .data(teamSprints)
                    .timestamp(java.time.LocalDateTime.now().toString())
                    .build()
            );
            
        } catch (Exception e) {
            log.error("Error retrieving team sprints: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                .body(ApiResponse.<List<TeamSprintDto>>builder()
                    .success(false)
                    .message("Error retrieving team sprints: " + e.getMessage())
                    .build());
        }
    }
    
    /**
     * Get tasks for a specific sprint with comprehensive task card information
     * 
     * This endpoint provides the task cards data for display after sprint selection.
     * Includes task details, assignee information, progress tracking, and status.
     * 
     * @param sprintId The sprint ID to get tasks for
     * @param teamId Optional team ID for additional filtering
     * @param assigneeFilter Optional filter to show only user's own tasks
     */
    @GetMapping("/sprint/{sprintId}/tasks")
    public ResponseEntity<ApiResponse<List<SprintTaskDto>>> getSprintTasks(
            @PathVariable Integer sprintId,
            @RequestParam(required = false) Integer teamId,
            @RequestParam(defaultValue = "false") boolean assigneeFilter) {
        
        // Get current authenticated user or fallback to admin
        String username = getCurrentUsername();
        
        try {
            List<SprintTaskDto> sprintTasks = teamSprintTaskService.getSprintTasks(
                sprintId, teamId, assigneeFilter ? username : null);
            
            log.info("Retrieved {} tasks for sprint {} (team: {}, user filter: {})", 
                     sprintTasks.size(), sprintId, teamId, assigneeFilter);
            
            return ResponseEntity.ok(
                ApiResponse.<List<SprintTaskDto>>builder()
                    .success(true)
                    .message("Sprint tasks retrieved successfully")
                    .data(sprintTasks)
                    .timestamp(java.time.LocalDateTime.now().toString())
                    .build()
            );
            
        } catch (Exception e) {
            log.error("Error retrieving sprint tasks for sprint {}: {}", sprintId, e.getMessage(), e);
            return ResponseEntity.status(500)
                .body(ApiResponse.<List<SprintTaskDto>>builder()
                    .success(false)
                    .message("Error retrieving sprint tasks: " + e.getMessage())
                    .build());
        }
    }
    
    /**
     * Get task statistics for a specific sprint
     * 
     * Provides aggregate information useful for sprint overview cards.
     */
    @GetMapping("/sprint/{sprintId}/statistics") 
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSprintTaskStatistics(@PathVariable Integer sprintId) {
        // Get current authenticated user or fallback to admin
        String username = getCurrentUsername();
        
        try {
            Map<String, Object> statistics = teamSprintTaskService.getSprintTaskStatistics(sprintId, username);
            
            return ResponseEntity.ok(
                ApiResponse.<Map<String, Object>>builder()
                    .success(true)
                    .message("Sprint statistics retrieved successfully")
                    .data(statistics)
                    .timestamp(java.time.LocalDateTime.now().toString())
                    .build()
            );
            
        } catch (Exception e) {
            log.error("Error retrieving sprint statistics for sprint {}: {}", sprintId, e.getMessage(), e);
            return ResponseEntity.status(500)
                .body(ApiResponse.<Map<String, Object>>builder()
                    .success(false)
                    .message("Error retrieving sprint statistics: " + e.getMessage())
                    .build());
        }
    }
    
    /**
     * Get user's personal task summary across all teams and sprints
     * 
     * Useful for dashboard widgets and quick overviews.
     */
    @GetMapping("/user-task-summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserTaskSummary() {
        // Get current authenticated user or fallback to admin
        String username = getCurrentUsername();
        
        try {
            Map<String, Object> summary = teamSprintTaskService.getUserTaskSummary(username);
            
            return ResponseEntity.ok(
                ApiResponse.<Map<String, Object>>builder()
                    .success(true)
                    .message("User task summary retrieved successfully")
                    .data(summary)
                    .timestamp(java.time.LocalDateTime.now().toString())
                    .build()
            );
            
        } catch (Exception e) {
            log.error("Error retrieving user task summary for user {}: {}", username, e.getMessage(), e);
            return ResponseEntity.status(500)
                .body(ApiResponse.<Map<String, Object>>builder()
                    .success(false)
                    .message("Error retrieving user task summary: " + e.getMessage())
                    .build());
        }
    }
}