package com.mislbd.spark.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO for permission summary view
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-12
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionSummary {
    private Long id;
    private String code;
    private String name;
    private String resource;
    private String action;
    private String category;
    private Boolean active;
    private LocalDateTime createdAt;
}