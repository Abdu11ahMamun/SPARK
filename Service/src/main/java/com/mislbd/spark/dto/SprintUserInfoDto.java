package com.mislbd.spark.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SprintUserInfoDto {
    private Integer id;
    private Integer sprintId;
    private Integer userId;
    private Integer leaveDays;
    private String createBy;
    private String createTime;
    private Integer userCapacity;
}
