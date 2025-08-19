package com.mislbd.spark.entity;

import com.mislbd.spark.repository.schema.SchemaConstant;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.math.BigDecimal;

/**
 * Sprint User Capacity Entity - Manages user capacity and availability for sprints
 */
@Entity
@Table(name = "SPARK_SPRINT_USER_CAPACITY", indexes = {
        @Index(name = "IDX_SPRINT_USER_CAP_SPRINT", columnList = "sprint_id"),
        @Index(name = "IDX_SPRINT_USER_CAP_USER", columnList = "user_id"),
        @Index(name = "IDX_SPRINT_USER_CAP_UNIQUE", columnList = "sprint_id, user_id", unique = true)
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class SprintUserCapacity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sprint_user_capacity_seq")
    @SequenceGenerator(name = "sprint_user_capacity_seq", sequenceName = "SPARK_SPRINT_USER_CAP_SEQ", allocationSize = 1)
    private Long id;

    @Column(name = "sprint_id", nullable = false)
    private Integer sprintId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_name", length = 200, nullable = false)
    private String userName;

    @Column(name = "user_capacity_percentage", precision = 5, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal userCapacityPercentage = BigDecimal.valueOf(100.00);

    @Column(name = "leave_days", nullable = false)
    @Builder.Default
    private Integer leaveDays = 0;

    @Column(name = "daily_working_hours", precision = 4, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal dailyWorkingHours = BigDecimal.valueOf(8.00);

    @Column(name = "total_working_hours", precision = 8, scale = 2, nullable = false)
    private BigDecimal totalWorkingHours;

    @Column(name = "available_working_hours", precision = 8, scale = 2, nullable = false)
    private BigDecimal availableWorkingHours;

    @Column(name = "allocated_hours", precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal allocatedHours = BigDecimal.ZERO;

    @Column(name = "remaining_hours", precision = 8, scale = 2)
    private BigDecimal remainingHours;

    @Column(name = "status", nullable = false)
    @Builder.Default
    private Integer status = 1; // 1=Active, 0=Inactive

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "created_by", length = 50)
    private String createdBy;

    @CreatedDate
    @Column(name = "created_time", nullable = false, updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Instant createdTime;

    @Column(name = "updated_by", length = 50)
    private String updatedBy;

    @Column(name = "updated_time", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Instant updatedTime;

    // Business logic methods
    @PrePersist
    @PreUpdate
    protected void calculateWorkingHours() {
        if (createdTime == null) {
            createdTime = Instant.now();
        }
        updatedTime = Instant.now();
        
        // Calculate remaining hours
        if (allocatedHours != null && availableWorkingHours != null) {
            remainingHours = availableWorkingHours.subtract(allocatedHours);
        }
    }

    /**
     * Calculate available working hours based on sprint duration, leave days, and capacity
     */
    public void calculateAvailableHours(int sprintDurationDays) {
        if (sprintDurationDays <= 0 || leaveDays == null || dailyWorkingHours == null || userCapacityPercentage == null) {
            availableWorkingHours = BigDecimal.ZERO;
            totalWorkingHours = BigDecimal.ZERO;
            return;
        }

        // Total potential hours = sprint days * daily hours
        totalWorkingHours = BigDecimal.valueOf(sprintDurationDays).multiply(dailyWorkingHours);
        
        // Working days = sprint days - leave days
        int workingDays = Math.max(0, sprintDurationDays - leaveDays);
        
        // Available hours = working days * daily hours * capacity percentage
        BigDecimal baseHours = BigDecimal.valueOf(workingDays).multiply(dailyWorkingHours);
        availableWorkingHours = baseHours.multiply(userCapacityPercentage.divide(BigDecimal.valueOf(100)));
        
        // Recalculate remaining hours
        if (allocatedHours != null) {
            remainingHours = availableWorkingHours.subtract(allocatedHours);
        } else {
            remainingHours = availableWorkingHours;
        }
    }

    public boolean isOverAllocated() {
        return allocatedHours != null && availableWorkingHours != null 
               && allocatedHours.compareTo(availableWorkingHours) > 0;
    }

    public BigDecimal getUtilizationPercentage() {
        if (availableWorkingHours == null || availableWorkingHours.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        if (allocatedHours == null) {
            return BigDecimal.ZERO;
        }
        return allocatedHours.multiply(BigDecimal.valueOf(100)).divide(availableWorkingHours, 2, BigDecimal.ROUND_HALF_UP);
    }
}
