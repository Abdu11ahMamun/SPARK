package com.mislbd.spark.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * DTO for grouped permissions by category
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-12
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupedPermissionsDto {
    private String category;
    private List<PermissionDto> permissions;
    private Long count;
}