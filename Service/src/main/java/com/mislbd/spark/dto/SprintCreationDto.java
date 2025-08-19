package com.mislbd.spark.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO for Sprint Creation with Capacity Planning
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SprintCreationDto {
    
    // Basic Sprint Information
    private String sprintName;
    private LocalDate fromDate;
    private LocalDate toDate;
    private Integer tramId;
    private Integer sprintPoint;
    private String detailsRemark;
    private String createBy;
    private Integer noOfHolidays;
    
    // Sprint Duration
    private Integer sprintDurationDays;
    private BigDecimal defaultDailyHours;
    
    // User Capacity Information
    private List<SprintUserCapacityDto> userCapacities;
    
    // Sprint Summary
    private SprintCapacitySummaryDto capacitySummary;
}
