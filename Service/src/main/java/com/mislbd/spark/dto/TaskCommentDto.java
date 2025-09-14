package com.mislbd.spark.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskCommentDto {
    private Long id;
    private Integer taskId;
    private String commentText;
    private Integer authorUserId;
    private LocalDateTime createdAt;
}
