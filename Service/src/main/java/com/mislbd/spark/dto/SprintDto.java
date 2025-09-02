package com.mislbd.spark.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SprintDto {
    private Integer id;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer teamId;
    private Integer totalSprintDays;
    private Integer numberOfHolidays;
    private Integer totalUsers;
    private Integer userLeaveDays;
    private Integer sprintPoints;
    private String detailedRemarks;
    private String status;
    private Boolean isActive;
    private LocalDate createdDate;
    private LocalDate modifiedDate;
    
    // Additional fields for UI display
    private String teamName;
}
