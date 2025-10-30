package com.mislbd.spark.service;

import com.mislbd.spark.dto.TeamSprintDto;
import com.mislbd.spark.dto.SprintTaskDto;
import com.mislbd.spark.entity.*;
import com.mislbd.spark.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Professional Team Sprint Task Service
 * 
 * Provides comprehensive business logic for team-based sprint task management.
 * Handles complex queries involving user teams, sprints, and task assignments
 * with professional data aggregation and filtering capabilities.
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-30
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TeamSprintTaskService {
    
    private final UserRepository userRepository;
    private final TeamMembershipRepository teamMembershipRepository;
    private final SprintRepository sprintRepository;
    private final SprintInfoRepository sprintInfoRepository;
    private final BacklogTaskRepository backlogTaskRepository;

    
    /**
     * Get user's teams with their current active sprints
     */
    public List<TeamSprintDto> getUserTeamSprints(String username) {
        log.debug("Retrieving team sprints for user: {}", username);
        
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));
            
        List<TeamMembership> memberships = teamMembershipRepository.findByUserId(user.getId());
        
        return memberships.stream()
            .map(membership -> buildTeamSprintDto(membership, user.getId()))
            .collect(Collectors.toList());
    }
    
    /**
     * Get tasks for a specific sprint with comprehensive task information
     */
    public List<SprintTaskDto> getSprintTasks(Integer sprintId, Integer teamId, String usernameFilter) {
        log.debug("Retrieving tasks for sprint: {}, team: {}, user filter: {}", sprintId, teamId, usernameFilter);
        
        List<BacklogTask> tasks;
        
        if (teamId != null) {
            // Filter by both sprint and team
            tasks = backlogTaskRepository.findAll().stream()
                .filter(task -> Objects.equals(task.getSprintid(), sprintId))
                .filter(task -> Objects.equals(task.getTeamId(), teamId))
                .collect(Collectors.toList());
        } else {
            // Filter by sprint only
            tasks = backlogTaskRepository.findAll().stream()
                .filter(task -> Objects.equals(task.getSprintid(), sprintId))
                .collect(Collectors.toList());
        }
        
        // Apply user filter if specified
        if (usernameFilter != null) {
            User filterUser = userRepository.findByUsername(usernameFilter).orElse(null);
            if (filterUser != null) {
                Integer filterUserId = filterUser.getId().intValue();
                tasks = tasks.stream()
                    .filter(task -> Objects.equals(task.getAssignedto(), filterUserId))
                    .collect(Collectors.toList());
            }
        }
        
        return tasks.stream()
            .map(this::buildSprintTaskDto)
            .sorted((a, b) -> {
                // Sort by priority (Critical > High > Medium > Low), then by deadline
                int priorityCompare = getPriorityOrder(b.getPriority()) - getPriorityOrder(a.getPriority());
                if (priorityCompare != 0) return priorityCompare;
                
                if (a.getDeadline() == null && b.getDeadline() == null) return 0;
                if (a.getDeadline() == null) return 1;
                if (b.getDeadline() == null) return -1;
                return a.getDeadline().compareTo(b.getDeadline());
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Get sprint task statistics for overview displays
     */
    public Map<String, Object> getSprintTaskStatistics(Integer sprintId, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));
            
        List<BacklogTask> allSprintTasks = backlogTaskRepository.findAll().stream()
            .filter(task -> Objects.equals(task.getSprintid(), sprintId))
            .collect(Collectors.toList());
            
        List<BacklogTask> userTasks = allSprintTasks.stream()
            .filter(task -> Objects.equals(task.getAssignedto(), user.getId().intValue()))
            .collect(Collectors.toList());
            
        Map<String, Object> stats = new HashMap<>();
        
        // Overall sprint statistics
        stats.put("totalTasks", allSprintTasks.size());
        stats.put("completedTasks", countTasksByStatus(allSprintTasks, "DONE"));
        stats.put("inProgressTasks", countTasksByStatus(allSprintTasks, "IN_PROGRESS"));
        stats.put("blockedTasks", countTasksByStatus(allSprintTasks, "BLOCKED"));
        
        // User-specific statistics
        stats.put("userTotalTasks", userTasks.size());
        stats.put("userCompletedTasks", countTasksByStatus(userTasks, "DONE"));
        stats.put("userInProgressTasks", countTasksByStatus(userTasks, "IN_PROGRESS"));
        stats.put("userBlockedTasks", countTasksByStatus(userTasks, "BLOCKED"));
        
        // Progress calculations
        int totalPoints = allSprintTasks.stream().mapToInt(t -> t.getPoints() != null ? t.getPoints() : 0).sum();
        int completedPoints = allSprintTasks.stream()
            .filter(t -> "DONE".equalsIgnoreCase(t.getStatus()))
            .mapToInt(t -> t.getPoints() != null ? t.getPoints() : 0).sum();
            
        stats.put("totalPoints", totalPoints);
        stats.put("completedPoints", completedPoints);
        stats.put("progressPercentage", totalPoints > 0 ? (completedPoints * 100.0 / totalPoints) : 0.0);
        
        return stats;
    }
    
    /**
     * Get comprehensive user task summary across all teams and sprints
     */
    public Map<String, Object> getUserTaskSummary(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));
            
        List<BacklogTask> userTasks = backlogTaskRepository.findByAssignedToUserId(user.getId().intValue());
        
        Map<String, Object> summary = new HashMap<>();
        
        // Task counts by status
        summary.put("totalAssignedTasks", userTasks.size());
        summary.put("openTasks", countTasksByStatus(userTasks, "OPEN"));
        summary.put("inProgressTasks", countTasksByStatus(userTasks, "IN_PROGRESS"));
        summary.put("completedTasks", countTasksByStatus(userTasks, "DONE"));
        summary.put("blockedTasks", countTasksByStatus(userTasks, "BLOCKED"));
        
        // Task counts by priority
        summary.put("criticalTasks", countTasksByPriority(userTasks, "CRITICAL"));
        summary.put("highTasks", countTasksByPriority(userTasks, "HIGH"));
        summary.put("mediumTasks", countTasksByPriority(userTasks, "MEDIUM"));
        summary.put("lowTasks", countTasksByPriority(userTasks, "LOW"));
        
        // Overdue tasks
        long overdueTasks = userTasks.stream()
            .filter(task -> task.getDeadline() != null)
            .filter(task -> task.getDeadline().isBefore(LocalDate.now()))
            .filter(task -> !"DONE".equalsIgnoreCase(task.getStatus()))
            .count();
        summary.put("overdueTasks", overdueTasks);
        
        // Team participation
        List<TeamMembership> memberships = teamMembershipRepository.findByUserId(user.getId());
        summary.put("activeTeams", memberships.size());
        
        return summary;
    }
    
    // Private helper methods
    
    private TeamSprintDto buildTeamSprintDto(TeamMembership membership, Long userId) {
        Team team = membership.getTeam();
        
        // Get active sprints for this team (either SprintInfo or Sprint entities)
        List<TeamSprintDto.SprintInfo> activeSprints = new ArrayList<>();
        
        // Try SprintInfo first (if using that table)
        try {
            List<SprintInfo> sprintInfos = sprintInfoRepository.findByTramId(team.getId());
            activeSprints = sprintInfos.stream()
                .map(this::buildSprintInfoDto)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.debug("SprintInfo not available, trying Sprint repository");
        }
        
        // Fallback to Sprint repository if SprintInfo is empty or not available
        if (activeSprints.isEmpty()) {
            List<Sprint> sprints = sprintRepository.findByTeamId(team.getId());
            activeSprints = sprints.stream()
                .map(this::buildSprintInfoFromSprint)
                .collect(Collectors.toList());
        }
        
        // Calculate team task statistics
        List<BacklogTask> teamTasks = backlogTaskRepository.findAll().stream()
            .filter(task -> Objects.equals(task.getTeamId(), team.getId()))
            .collect(Collectors.toList());
            
        int activeTaskCount = (int) teamTasks.stream()
            .filter(task -> !"DONE".equalsIgnoreCase(task.getStatus()) && !"CANCELLED".equalsIgnoreCase(task.getStatus()))
            .count();
            
        int completedTaskCount = (int) teamTasks.stream()
            .filter(task -> "DONE".equalsIgnoreCase(task.getStatus()))
            .count();
        
        return TeamSprintDto.builder()
            .teamId(team.getId())
            .teamName(team.getTeamName())
            .teamDescription(team.getDescription())
            .userRoleInTeam(membership.getTeamRole())
            .activeSprints(activeSprints)
            .totalMembers(getTeamMemberCount(team.getId()))
            .activeTaskCount(activeTaskCount)
            .completedTaskCount(completedTaskCount)
            .build();
    }
    
    private TeamSprintDto.SprintInfo buildSprintInfoDto(SprintInfo sprintInfo) {
        LocalDate today = LocalDate.now();
        LocalDate startDate = sprintInfo.getFromDate();
        LocalDate endDate = sprintInfo.getToDate();
        
        boolean isCurrent = startDate != null && endDate != null && 
                           !today.isBefore(startDate) && !today.isAfter(endDate);
        
        int daysRemaining = endDate != null ? (int) ChronoUnit.DAYS.between(today, endDate) : 0;
        
        // Get tasks for this sprint
        List<BacklogTask> sprintTasks = backlogTaskRepository.findAll().stream()
            .filter(task -> Objects.equals(task.getSprintid(), sprintInfo.getId()))
            .collect(Collectors.toList());
            
        int totalTasks = sprintTasks.size();
        int completedTasks = (int) sprintTasks.stream()
            .filter(task -> "DONE".equalsIgnoreCase(task.getStatus()))
            .count();
            
        int assignedPoints = sprintTasks.stream().mapToInt(t -> t.getPoints() != null ? t.getPoints() : 0).sum();
        int completedPoints = sprintTasks.stream()
            .filter(t -> "DONE".equalsIgnoreCase(t.getStatus()))
            .mapToInt(t -> t.getPoints() != null ? t.getPoints() : 0).sum();
            
        double progressPercentage = totalTasks > 0 ? (completedTasks * 100.0 / totalTasks) : 0.0;
        
        return TeamSprintDto.SprintInfo.builder()
            .sprintId(sprintInfo.getId())
            .sprintName(sprintInfo.getSprintName())
            .startDate(startDate)
            .endDate(endDate)
            .status(sprintInfo.getStatus())
            .statusDisplayName(getSprintStatusDisplayName(sprintInfo.getStatus()))
            .totalTasks(totalTasks)
            .completedTasks(completedTasks)
            .assignedPoints(assignedPoints)
            .completedPoints(completedPoints)
            .progressPercentage(progressPercentage)
            .daysRemaining(Math.max(0, daysRemaining))
            .isCurrent(isCurrent)
            .build();
    }
    
    private TeamSprintDto.SprintInfo buildSprintInfoFromSprint(Sprint sprint) {
        LocalDate today = LocalDate.now();
        LocalDate startDate = sprint.getStartDate();
        LocalDate endDate = sprint.getEndDate();
        
        boolean isCurrent = startDate != null && endDate != null && 
                           !today.isBefore(startDate) && !today.isAfter(endDate);
        
        int daysRemaining = endDate != null ? (int) ChronoUnit.DAYS.between(today, endDate) : 0;
        
        return TeamSprintDto.SprintInfo.builder()
            .sprintId(sprint.getId())
            .sprintName(sprint.getName())
            .startDate(startDate)
            .endDate(endDate)
            .status(1) // Assume active for Sprint entity
            .statusDisplayName("Active")
            .totalTasks(0) // Will be calculated if needed
            .completedTasks(0)
            .assignedPoints(0)
            .completedPoints(0)
            .progressPercentage(0.0)
            .daysRemaining(Math.max(0, daysRemaining))
            .isCurrent(isCurrent)
            .build();
    }
    
    private SprintTaskDto buildSprintTaskDto(BacklogTask task) {
        // Get assignee information
        String assigneeName = null;
        String assigneeEmail = null;
        if (task.getAssignedto() != null) {
            User assignee = userRepository.findById(task.getAssignedto().longValue()).orElse(null);
            if (assignee != null) {
                assigneeName = String.format("%s %s", 
                    assignee.getFirstName() != null ? assignee.getFirstName() : "",
                    assignee.getLastName() != null ? assignee.getLastName() : "").trim();
                assigneeEmail = assignee.getEmail();
            }
        }
        
        // Get sprint information
        String sprintName = null;
        if (task.getSprintid() != null) {
            // Try SprintInfo first
            Optional<SprintInfo> sprintInfo = sprintInfoRepository.findById(task.getSprintid());
            if (sprintInfo.isPresent()) {
                sprintName = sprintInfo.get().getSprintName();
            } else {
                // Fallback to Sprint
                Optional<Sprint> sprint = sprintRepository.findById(task.getSprintid());
                sprintName = sprint.map(Sprint::getName).orElse(null);
            }
        }
        
        // Get team information
        String teamName = null;
        if (task.getTeamId() != null) {
            // Assuming Team entity exists with repository (add if needed)
            teamName = "Team " + task.getTeamId(); // Placeholder - replace with actual team lookup
        }
        
        // Get product information
        String productName = null;
        String moduleName = null;
        if (task.getProductid() != null) {
            productName = "Product " + task.getProductid(); // Placeholder - replace with actual product lookup
        }
        if (task.getProductModuleId() != null) {
            moduleName = "Module " + task.getProductModuleId(); // Placeholder - replace with actual module lookup  
        }
        
        // Calculate deadline information
        Integer daysUntilDeadline = null;
        boolean isOverdue = false;
        if (task.getDeadline() != null) {
            daysUntilDeadline = (int) ChronoUnit.DAYS.between(LocalDate.now(), task.getDeadline());
            isOverdue = daysUntilDeadline < 0 && !"DONE".equalsIgnoreCase(task.getStatus());
        }
        
        // Determine display colors
        String priorityColor = getPriorityColor(task.getPriority());
        String statusColor = getStatusColor(task.getStatus());
        String cardBorderColor = isOverdue ? "border-red-500" : priorityColor;
        
        return SprintTaskDto.builder()
            .taskId(task.getId())
            .title(task.getTitle())
            .description(task.getDescription())
            .mitsNo(task.getMitsId() != null ? task.getMitsId().toString() : null)
            .taskType(getTaskTypeDisplayName(task.getTasktypeid()))
            .taskTypeDisplayName(getTaskTypeDisplayName(task.getTasktypeid()))
            .priority(task.getPriority())
            .status(task.getStatus())
            .statusDisplayName(getStatusDisplayName(task.getStatus()))
            .assigneeUserId(task.getAssignedto())
            .assigneeName(assigneeName)
            .assigneeEmail(assigneeEmail)
            .sprintId(task.getSprintid())
            .sprintName(sprintName)
            .teamId(task.getTeamId())
            .teamName(teamName)
            .productId(task.getProductid())
            .productName(productName)
            .moduleId(task.getProductModuleId())
            .moduleName(moduleName)
            .storyPoints(task.getPoints())
            .estimatedHours(0) // Add to BacklogTask if needed
            .actualHours(0)    // Add to BacklogTask if needed  
            .remainingHours(0) // Calculate based on status
            .completionPercentage(getCompletionPercentage(task.getStatus()))
            .deadline(task.getDeadline())
            .createdAt(task.getCreateddate())
            .modifiedAt(task.getModifieddate())
            .completedAt(task.getDateOfDone())
            .daysUntilDeadline(daysUntilDeadline)
            .isOverdue(isOverdue)
            .priorityColor(priorityColor)
            .statusColor(statusColor)
            .cardBorderColor(cardBorderColor)
            .parentTaskId(task.getParentId())
            .hasSubTasks(false) // Calculate if needed
            .subTaskCount(0)    // Calculate if needed
            .createdBy(task.getCreateBy())
            .lastModifiedBy(task.getUpdateBy())
            .commentCount(0)    // Calculate from TaskComment if needed
            .hasAttachments(false) // Add if attachment functionality exists
            .build();
    }
    
    // Utility methods
    
    private int countTasksByStatus(List<BacklogTask> tasks, String status) {
        return (int) tasks.stream()
            .filter(task -> status.equalsIgnoreCase(task.getStatus()))
            .count();
    }
    
    private int countTasksByPriority(List<BacklogTask> tasks, String priority) {
        return (int) tasks.stream()
            .filter(task -> priority.equalsIgnoreCase(task.getPriority()))
            .count();
    }
    
    private int getPriorityOrder(String priority) {
        if (priority == null) return 2;
        return switch (priority.toUpperCase()) {
            case "CRITICAL" -> 4;
            case "HIGH" -> 3;
            case "MEDIUM" -> 2;
            case "LOW" -> 1;
            default -> 2;
        };
    }
    
    private String getPriorityColor(String priority) {
        if (priority == null) return "border-gray-300";
        return switch (priority.toUpperCase()) {
            case "CRITICAL" -> "border-red-600";
            case "HIGH" -> "border-orange-500";
            case "MEDIUM" -> "border-yellow-400";
            case "LOW" -> "border-green-400";
            default -> "border-gray-300";
        };
    }
    
    private String getStatusColor(String status) {
        if (status == null) return "bg-gray-100";
        return switch (status.toUpperCase()) {
            case "OPEN" -> "bg-blue-100";
            case "IN_PROGRESS" -> "bg-yellow-100";
            case "BLOCKED" -> "bg-red-100";
            case "DONE" -> "bg-green-100";
            case "CANCELLED" -> "bg-gray-100";
            default -> "bg-gray-100";
        };
    }
    
    private String getSprintStatusDisplayName(Integer status) {
        if (status == null) return "Unknown";
        return switch (status) {
            case 0 -> "Planning";
            case 1 -> "Active";
            case 2 -> "Completed";
            case 3 -> "Cancelled";
            default -> "Unknown";
        };
    }
    
    private String getTaskTypeDisplayName(Integer taskTypeId) {
        if (taskTypeId == null) return "Task";
        return switch (taskTypeId) {
            case 1 -> "Feature";
            case 2 -> "Bug";
            case 3 -> "Enhancement";
            case 4 -> "Research";
            default -> "Task";
        };
    }
    
    private String getStatusDisplayName(String status) {
        if (status == null) return "Open";
        return switch (status.toUpperCase()) {
            case "OPEN" -> "Open";
            case "IN_PROGRESS" -> "In Progress";
            case "BLOCKED" -> "Blocked";
            case "DONE" -> "Completed";
            case "CANCELLED" -> "Cancelled";
            default -> "Open";
        };
    }
    
    private Double getCompletionPercentage(String status) {
        if (status == null) return 0.0;
        return switch (status.toUpperCase()) {
            case "OPEN" -> 0.0;
            case "IN_PROGRESS" -> 50.0;
            case "BLOCKED" -> 25.0;
            case "DONE" -> 100.0;
            case "CANCELLED" -> 0.0;
            default -> 0.0;
        };
    }
    
    private Integer getTeamMemberCount(Integer teamId) {
        List<TeamMembership> memberships = teamMembershipRepository.findByTeamId(teamId);
        return memberships.size();
    }
}