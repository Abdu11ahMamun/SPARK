package com.mislbd.spark.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.mislbd.spark.repository.schema.SchemaConstant;

@Entity
@Table(name = "SPARK_TASK_COMMENT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskComment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer taskId; // references BacklogTask.id (no FK constraint added here for flexibility)

    @Column(length = 500, nullable = false)
    private String commentText;

    private Integer authorUserId; // optional user id

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
