package com.mislbd.spark.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * DTO for Sprint User Capacity Management
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SprintUserCapacityDto {
    
    private Long id;
    private Integer sprintId;
    private Long userId;
    private String userName;
    private BigDecimal userCapacityPercentage;
    private Integer leaveDays;
    private BigDecimal dailyWorkingHours;
    private BigDecimal totalWorkingHours;
    private BigDecimal availableWorkingHours;
    private BigDecimal allocatedHours;
    private BigDecimal remainingHours;
    private Integer status;
    private String notes;
    private String createdBy;
    private Instant createdTime;
    private String updatedBy;
    private Instant updatedTime;
    
    // Calculated fields
    private BigDecimal utilizationPercentage;
    private Boolean isOverAllocated;
    private Integer workingDays;
}
