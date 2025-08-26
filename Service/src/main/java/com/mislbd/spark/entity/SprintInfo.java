package com.mislbd.spark.entity;

import com.mislbd.spark.repository.schema.SchemaConstant;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.sql.Clob;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Sprint Information Entity
 */
@Entity
@Table(name = SchemaConstant.SPRINT_INFO_TABLE_NAME, indexes = {
        @Index(name = "IDX_SPRINT_STATUS", columnList = "status"),
        @Index(name = "IDX_SPRINT_DATES", columnList = "from_date, to_date"),
        @Index(name = "IDX_SPRINT_TEAM", columnList = "tram_id")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"comments", "sprintOutcome"})
public class SprintInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sprint_seq")
    @SequenceGenerator(name = "sprint_seq", sequenceName = "SPARK_SPRINT_INFO_SEQ", allocationSize = 1)
    private Integer id;

    @Column(name = "sprint_name", length = 100, nullable = false)
    private String sprintName;

    @Column(name = "no_of_holidays", nullable = false)
    @Builder.Default
    private Integer noOfHolidays = 0;

    // Oracle DATE -> Java LocalDate (avoid ORA-17059)
    @Column(name = "from_date", nullable = false, columnDefinition = "DATE")
    private LocalDate fromDate;

    @Column(name = "to_date", nullable = false, columnDefinition = "DATE")
    private LocalDate toDate;

    @Column(name = "tram_id", nullable = false)
    private Integer tramId;

    @Column(name = "sprint_point")
    private Integer sprintPoint;

    @Column(name = "sprint_archive")
    @Builder.Default
    private Integer sprintArchive = 0;

    @Column(name = "details_remark", length = 1000)
    private String detailsRemark;

    @Column(name = "create_by", length = 10)
    private String createBy;

    // DB: TIMESTAMP WITH TIME ZONE
    @CreatedDate
    @Column(name = "create_time", nullable = false, updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Instant createTime;

    /**
     * 0 = Planning, 1 = Active, 2 = Completed, 3 = Cancelled
     */
    @Column(name = "status", nullable = false)
    @Builder.Default
    private Integer status = 1;

    @Lob
    @Column(name = "comments")
    private Clob comments;

    @Lob
    @Column(name = "sprint_outcome")
    private Clob sprintOutcome;

    @PrePersist
    protected void onCreate() {
        if (createTime == null) {
            createTime = Instant.now();
        }
        if (status == null) {
            status = 1;
        }
    }

    // Convenience checks
    public boolean isActive() { return status != null && status == 1; }
    public boolean isCompleted() { return status != null && status == 2; }
    public boolean isPlanning() { return status != null && status == 0; }
    public boolean isCancelled() { return status != null && status == 3; }
}
