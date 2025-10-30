package com.mislbd.spark.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Sprint Task Data Transfer Object
 * 
 * Professional representation of task information for task cards display.
 * Includes comprehensive task details, assignee information, and progress tracking.
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-30
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SprintTaskDto {
    
    // Core Task Information
    private Integer taskId;
    private String title;
    private String description;
    private String mitsNo;
    
    // Task Classification
    private String taskType;
    private String taskTypeDisplayName;
    private String priority;
    private String status;
    private String statusDisplayName;
    
    // Assignment and Ownership
    private Integer assigneeUserId;
    private String assigneeName;
    private String assigneeEmail;
    private String assigneeAvatar;
    
    // Sprint and Team Context
    private Integer sprintId;
    private String sprintName;
    private Integer teamId;
    private String teamName;
    
    // Product and Module Context  
    private Integer productId;
    private String productName;
    private Integer moduleId;
    private String moduleName;
    
    // Effort and Progress
    private Integer storyPoints;
    private Integer estimatedHours;
    private Integer actualHours;
    private Integer remainingHours;
    private Double completionPercentage;
    
    // Dates and Timeline
    private LocalDate deadline;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
    private LocalDateTime completedAt;
    private Integer daysUntilDeadline;
    private boolean isOverdue;
    
    // Task Card Display Properties
    private String priorityColor; // CSS color class for priority indication
    private String statusColor;   // CSS color class for status indication
    private String cardBorderColor; // Professional card styling
    
    // Task Relationships
    private Integer parentTaskId;
    private String parentTaskTitle;
    private boolean hasSubTasks;
    private Integer subTaskCount;
    
    // Additional Metadata
    private String createdBy;
    private String lastModifiedBy;
    private Integer commentCount;
    private boolean hasAttachments;
    
    /**
     * Helper method to determine if task needs attention
     */
    public boolean needsAttention() {
        return isOverdue || 
               "HIGH".equalsIgnoreCase(priority) || 
               "CRITICAL".equalsIgnoreCase(priority) ||
               (daysUntilDeadline != null && daysUntilDeadline <= 2);
    }
    
    /**
     * Helper method to get display-friendly priority
     */
    public String getPriorityDisplay() {
        if (priority == null) return "Medium";
        return switch (priority.toUpperCase()) {
            case "LOW" -> "Low";
            case "MEDIUM" -> "Medium"; 
            case "HIGH" -> "High";
            case "CRITICAL" -> "Critical";
            default -> "Medium";
        };
    }
    
    /**
     * Helper method to get display-friendly status
     */
    public String getStatusDisplay() {
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
}