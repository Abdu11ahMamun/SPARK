package com.mislbd.spark.entity;

import jakarta.persistence.*;
import lombok.*;
import java.sql.Clob;
import java.time.Instant;
import com.mislbd.spark.repository.schema.SchemaConstant;

@Entity
@Table(name = SchemaConstant.SPRINT_INFO_TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SprintInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "sprint_name", length = 100)
    private String sprintName;

    @Column(name = "no_of_holidays")
    private Integer noOfHolidays;

    @Column(name = "from_date")
    private Instant fromDate;

    @Column(name = "to_date")
    private Instant toDate;

    @Column(name = "tram_id")
    private Integer tramId;

    @Column(name = "sprint_point")
    private Integer sprintPoint;

    @Column(name = "sprint_archive")
    private Integer sprintArchive;

    @Column(name = "details_remark", length = 1000)
    private String detailsRemark;

    @Column(name = "create_by", length = 10)
    private String createBy;

    @Column(name = "create_time")
    private Instant createTime;

    @Column
    private Integer status;

    @Lob
    private Clob comments;

    @Lob
    @Column(name = "sprint_outcome")
    private Clob sprintOutcome;
}
