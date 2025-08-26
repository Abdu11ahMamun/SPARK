package com.mislbd.spark.entity;

import com.mislbd.spark.entity.types.TaskType;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import com.mislbd.spark.repository.schema.SchemaConstant;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = SchemaConstant.BACKLOG_TASK_TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BacklogTask {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 255)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(length = 20)
    private String status;

    @Column(length = 10)
    private String priority;

    private LocalDate deadline;
    private LocalDateTime createddate;
    private LocalDateTime modifieddate;

    private Integer assignedto;
    private Integer sprintid;
    private Integer productid;
    private Integer points;
    private Integer tasktypeid;
    private Integer productModuleId;
    private Integer parentId;
    private Integer primaryClient;
    private String sptrackingId;
    private String issueRaceVia;
    private Integer mitsId;
    private Integer taskStatus;
    private Integer taskType;
    private String createBy;
    private String updateBy;
    private LocalDateTime updatedate;
    private Integer teamId;
}