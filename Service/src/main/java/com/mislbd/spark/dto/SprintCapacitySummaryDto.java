package com.mislbd.spark.dto;

import lombok.*;
import java.math.BigDecimal;

/**
 * DTO for Sprint Capacity Summary
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SprintCapacitySummaryDto {
    
    private Integer totalTeamMembers;
    private Integer activeMembers;
    private Integer membersOnLeave;
    
    private BigDecimal totalCapacityHours;
    private BigDecimal totalAllocatedHours;
    private BigDecimal totalRemainingHours;
    private BigDecimal averageUtilization;
    
    private BigDecimal totalPotentialHours;
    private BigDecimal totalLostHoursToLeave;
    private BigDecimal totalLostHoursToCapacity;
    
    private Integer totalLeaveDays;
    private BigDecimal teamEfficiency;
    
    // Risk indicators
    private Integer overAllocatedMembers;
    private Integer underUtilizedMembers;
    private Boolean hasCapacityRisks;
    
    // Sprint timeline
    private Integer sprintDurationDays;
    private Integer workingDays;
    private Integer holidays;
}
