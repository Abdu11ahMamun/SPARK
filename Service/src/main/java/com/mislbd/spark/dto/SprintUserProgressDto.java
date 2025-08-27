package com.mislbd.spark.dto;

import lombok.*;
import java.math.BigDecimal;

/**
 * Aggregated sprint user progress combining capacity (planned) and task delivery (executed).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SprintUserProgressDto {
    private Long userId;
    private String userName;

    // Capacity side
    private BigDecimal totalWorkingHours;      // total potential hours before leave
    private BigDecimal availableWorkingHours;  // after leave / capacity %
    private BigDecimal allocatedHours;         // hours allocated (if tracked)
    private BigDecimal remainingHours;         // available - allocated
    private BigDecimal utilizationPercentage;  // allocated / available * 100
    private Boolean overAllocated;             // flag from capacity row

    // Task progress side
    private Integer tasksTotal;
    private Integer tasksDone;
    private Integer pointsTotal;
    private Integer pointsDone;
    private Integer completionPercentage;      // tasksDone / tasksTotal * 100
    private Integer pointsCompletionPercentage;// pointsDone / pointsTotal * 100

    // Derived velocity-ish metric (pointsDone / working days)
    private BigDecimal velocityPointsPerDay;
}
