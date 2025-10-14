package com.mislbd.spark.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating new permissions
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-12
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionRequest {
    private String code;
    private String name;
    private String description;
    private String resource;
    private String action;
    private String category;
    private Integer displayOrder;
    private Boolean active;
    private Boolean systemPermission;
    private String createdBy;
}