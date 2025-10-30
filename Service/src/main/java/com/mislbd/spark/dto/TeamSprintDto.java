package com.mislbd.spark.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

/**
 * Team Sprint Data Transfer Object
 * 
 * Professional representation of team and their current sprints for 
 * task page dropdown functionality.
 * 
 * @author SPARK Team
 * @version 1.0 
 * @since 2025-10-30
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamSprintDto {
    
    private Integer teamId;
    private String teamName;
    private String teamDescription;
    private String userRoleInTeam;
    
    // Current active sprints for this team
    private List<SprintInfo> activeSprints;
    
    // Team statistics
    private Integer totalMembers;
    private Integer activeTaskCount;
    private Integer completedTaskCount;
    
    /**
     * Sprint Information nested class
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SprintInfo {
        private Integer sprintId;
        private String sprintName;
        private LocalDate startDate;
        private LocalDate endDate;
        private Integer status; // 0=Planning, 1=Active, 2=Completed, 3=Cancelled
        private String statusDisplayName;
        private Integer totalTasks;
        private Integer completedTasks;
        private Integer assignedPoints;
        private Integer completedPoints;
        private Double progressPercentage;
        private Integer daysRemaining;
        private boolean isCurrent; // True if sprint is currently active (between start and end dates)
    }
}