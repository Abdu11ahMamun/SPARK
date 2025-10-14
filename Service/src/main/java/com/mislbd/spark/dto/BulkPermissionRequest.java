package com.mislbd.spark.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * DTO for bulk permission operations
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-12
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkPermissionRequest {
    private String operation; // activate, deactivate, delete
    private List<Long> permissionIds;
    private String updatedBy;
}