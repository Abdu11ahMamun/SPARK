package com.mislbd.spark.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SprintInfoDto {
    private Integer id;
    private String sprintName;
    private Integer noOfHolidays;
    private String fromDate;
    private String toDate;
    private Integer tramId;
    private Integer sprintPoint;
    private Integer sprintArchive;
    private String detailsRemark;
    private String createBy;
    private String createTime;
    private Integer status;
    private String comments;
    private String sprintOutcome;
}
