package com.mislbd.spark.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import com.mislbd.spark.repository.schema.SchemaConstant;

@Entity
@Table(name = SchemaConstant.SPRINT_USER_INFO_TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SprintUserInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "sprint_id")
    private Integer sprintId;

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "leave_days")
    private Integer leaveDays;

    @Column(name = "create_by", length = 10)
    private String createBy;

    @Column(name = "create_time")
    private Instant createTime;

    @Column(name = "user_capacity")
    private Integer userCapacity;
}
