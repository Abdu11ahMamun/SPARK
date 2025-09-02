package com.mislbd.spark.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import com.mislbd.spark.repository.schema.SchemaConstant;

@Entity
@Table(name = SchemaConstant.SPRINT_TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sprint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private LocalDate startDate;
    
    @Column(nullable = false)
    private LocalDate endDate;
    
    private Integer teamId;
    
    private Integer totalSprintDays;
    
    private Integer numberOfHolidays;
    
    private Integer totalUsers;
    
    private Integer userLeaveDays;
    
    private Integer sprintPoints;
    
    @Column(length = 1000)
    private String detailedRemarks;
    
    @Column(length = 20)
    private String status; // PLANNING, ACTIVE, COMPLETED
    
    @Column(nullable = false)
    private Boolean isActive;
    
    private LocalDate createdDate;
    
    private LocalDate modifiedDate;
}
