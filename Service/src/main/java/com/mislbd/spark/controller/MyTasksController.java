package com.mislbd.spark.controller;

import com.mislbd.spark.dto.BacklogTaskDto;
import com.mislbd.spark.entity.BacklogTask;
import com.mislbd.spark.entity.Sprint;
import com.mislbd.spark.entity.TeamMembership;
import com.mislbd.spark.entity.User;
import com.mislbd.spark.mapper.BacklogTaskMapper;
import com.mislbd.spark.repository.BacklogTaskRepository;
import com.mislbd.spark.repository.SprintRepository;
import com.mislbd.spark.repository.TeamMembershipRepository;
import com.mislbd.spark.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/my-tasks")
@CrossOrigin(origins = "*", allowCredentials = "false")
public class MyTasksController {
    
    private final UserRepository userRepository;
    private final TeamMembershipRepository teamMembershipRepository;
    private final SprintRepository sprintRepository;
    private final BacklogTaskRepository backlogTaskRepository;
    private final BacklogTaskMapper backlogTaskMapper;

    @Autowired
    public MyTasksController(
            UserRepository userRepository,
            TeamMembershipRepository teamMembershipRepository,
            SprintRepository sprintRepository,
            BacklogTaskRepository backlogTaskRepository,
            BacklogTaskMapper backlogTaskMapper) {
        this.userRepository = userRepository;
        this.teamMembershipRepository = teamMembershipRepository;
        this.sprintRepository = sprintRepository;
        this.backlogTaskRepository = backlogTaskRepository;
        this.backlogTaskMapper = backlogTaskMapper;
    }

    // Deprecated username-based endpoint kept temporarily for backward compatibility
    @GetMapping("/user/{username}")
    @Deprecated
    public ResponseEntity<List<BacklogTaskDto>> getMyTasksByUsername(@PathVariable String username) {
        return getTasksForResolvedUser(username);
    }

    /**
     * New session-based endpoint: GET /api/my-tasks
     * TEMPORARY: Authentication disabled for testing - using first available user
     */
    @GetMapping
    public ResponseEntity<List<BacklogTaskDto>> getMyTasks() {
        try {
            // Return ALL tasks - no authentication needed
            List<BacklogTask> allTasks = backlogTaskRepository.findAll();
            List<BacklogTaskDto> taskDtos = allTasks.stream()
                .map(backlogTaskMapper::toDto)
                .collect(Collectors.toList());
            return ResponseEntity.ok(taskDtos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    private ResponseEntity<List<BacklogTaskDto>> getTasksForResolvedUser(String username) {
        try {
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

            List<TeamMembership> memberships = teamMembershipRepository.findByUserId(user.getId());
            if (memberships.isEmpty()) {
                return ResponseEntity.ok(new ArrayList<>());
            }

            List<Sprint> currentSprints = getCurrentSprintsForUserTeams(memberships);
            List<BacklogTask> myTasks = findTasksForUserInSprints(user.getId(), currentSprints);
            List<BacklogTaskDto> taskDtos = myTasks.stream()
                .map(backlogTaskMapper::toDto)
                .collect(Collectors.toList());
            return ResponseEntity.ok(taskDtos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new ArrayList<>());
        }
    }

    /**
     * Update task status for a specific task
     * @param taskId The ID of the task to update
     * @param statusUpdate Map containing the new status
     * @return Updated task DTO
     */
    // Legacy PUT endpoint (will be superseded by PATCH)
    @PutMapping("/task/{taskId}/status")
    public ResponseEntity<BacklogTaskDto> updateTaskStatusPut(
            @PathVariable Integer taskId,
            @RequestBody Map<String, String> statusUpdate) {
        return updateTaskStatusInternal(taskId, statusUpdate);
    }

    // Preferred PATCH endpoint (idempotent status change)
    @PatchMapping("/{taskId}/status")
    public ResponseEntity<BacklogTaskDto> updateTaskStatus(
            @PathVariable Integer taskId,
            @RequestBody Map<String, String> statusUpdate) {
        return updateTaskStatusInternal(taskId, statusUpdate);
    }

    private ResponseEntity<BacklogTaskDto> updateTaskStatusInternal(Integer taskId, Map<String, String> statusUpdate) {
        try {
            String newStatus = statusUpdate.get("status");
            if (newStatus == null || newStatus.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(null);
            }

            // Find the task
            BacklogTask task = backlogTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));

            // Update the status
            task.setStatus(newStatus.toUpperCase());
            BacklogTask updatedTask = backlogTaskRepository.save(task); // TODO: optionally set modifieddate / dateOfDone

            // Convert to DTO and return
            BacklogTaskDto taskDto = backlogTaskMapper.toDto(updatedTask);
            return ResponseEntity.ok(taskDto);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(null);
        }
    }

    /**
     * Get current sprints for all teams that a user belongs to
     * @param memberships List of team memberships for the user
     * @return List of current active sprints
     */
    private List<Sprint> getCurrentSprintsForUserTeams(List<TeamMembership> memberships) {
        List<Sprint> currentSprints = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (TeamMembership membership : memberships) {
            Integer teamId = membership.getTeam().getId();
            
            // Find all sprints for this team
            List<Sprint> teamSprints = sprintRepository.findByTeamId(teamId);
            
            // Find current sprint (where today falls between start and end date)
            Sprint currentSprint = teamSprints.stream()
                .filter(sprint -> {
                    LocalDate startDate = sprint.getStartDate();
                    LocalDate endDate = sprint.getEndDate();
                    return startDate != null && endDate != null && 
                           !today.isBefore(startDate) && !today.isAfter(endDate);
                })
                .findFirst()
                .orElse(null);
            
            if (currentSprint != null) {
                currentSprints.add(currentSprint);
            }
        }
        
        return currentSprints;
    }

    /**
     * Find all tasks assigned to a user in the given sprints
     * @param userId The user ID
     * @param sprints List of sprints to search in
     * @return List of BacklogTask assigned to the user
     */
    private List<BacklogTask> findTasksForUserInSprints(Long userId, List<Sprint> sprints) {
        if (sprints.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Extract team IDs from sprints
        List<Integer> teamIds = sprints.stream()
            .map(Sprint::getTeamId)
            .distinct()
            .collect(Collectors.toList());
        
        // Use the more efficient repository method to find active tasks for user across teams
        return backlogTaskRepository.findActiveTasksByUserAndTeams(userId.intValue(), teamIds);
    }

    /**
     * Get current sprint information for a specific team
     * @param teamId The team ID
     * @return Current sprint details or null if no current sprint
     */
    @GetMapping("/team/{teamId}/current-sprint")
    public ResponseEntity<Map<String, Object>> getCurrentSprintForTeam(@PathVariable Integer teamId) {
        try {
            LocalDate today = LocalDate.now();
            
            List<Sprint> teamSprints = sprintRepository.findByTeamId(teamId);
            
            Sprint currentSprint = teamSprints.stream()
                .filter(sprint -> {
                    LocalDate startDate = sprint.getStartDate();
                    LocalDate endDate = sprint.getEndDate();
                    return startDate != null && endDate != null && 
                           !today.isBefore(startDate) && !today.isAfter(endDate);
                })
                .findFirst()
                .orElse(null);
            
            Map<String, Object> response = new HashMap<>();
            if (currentSprint != null) {
                response.put("sprintId", currentSprint.getId());
                response.put("sprintName", currentSprint.getName());
                response.put("startDate", currentSprint.getStartDate());
                response.put("endDate", currentSprint.getEndDate());
                response.put("teamId", currentSprint.getTeamId());
            } else {
                response.put("message", "No current sprint found for team " + teamId);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get user's team information with current sprints
     * @param username The username
     * @return User's teams and their current sprints
     */
    @GetMapping("/user/{username}/teams")
    public ResponseEntity<List<Map<String, Object>>> getUserTeamsWithSprints(@PathVariable String username) {
        try {
            // Find user by username
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

            // Find all team memberships for this user
            List<TeamMembership> memberships = teamMembershipRepository.findByUserId(user.getId());
            
            List<Map<String, Object>> teamsWithSprints = new ArrayList<>();
            LocalDate today = LocalDate.now();
            
            for (TeamMembership membership : memberships) {
                Map<String, Object> teamInfo = new HashMap<>();
                teamInfo.put("teamId", membership.getTeam().getId());
                teamInfo.put("teamName", membership.getTeam().getTeamName());
                teamInfo.put("teamRole", membership.getTeamRole());
                
                // Find current sprint for this team
                List<Sprint> teamSprints = sprintRepository.findByTeamId(membership.getTeam().getId());
                
                Sprint currentSprint = teamSprints.stream()
                    .filter(sprint -> {
                        LocalDate startDate = sprint.getStartDate();
                        LocalDate endDate = sprint.getEndDate();
                        return startDate != null && endDate != null && 
                               !today.isBefore(startDate) && !today.isAfter(endDate);
                    })
                    .findFirst()
                    .orElse(null);
                
                if (currentSprint != null) {
                    teamInfo.put("currentSprint", Map.of(
                        "sprintId", currentSprint.getId(),
                        "sprintName", currentSprint.getName(),
                        "startDate", currentSprint.getStartDate(),
                        "endDate", currentSprint.getEndDate()
                    ));
                } else {
                    teamInfo.put("currentSprint", null);
                }
                
                teamsWithSprints.add(teamInfo);
            }
            
            return ResponseEntity.ok(teamsWithSprints);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new ArrayList<>());
        }
    }
}