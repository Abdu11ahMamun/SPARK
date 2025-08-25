package com.mislbd.spark.dto;

    import lombok.*;
    import java.time.LocalDate;
    import java.time.LocalDateTime;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public class BacklogTaskDto {
        private Integer id;
        private String title;
        private String description;
        private String status;
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