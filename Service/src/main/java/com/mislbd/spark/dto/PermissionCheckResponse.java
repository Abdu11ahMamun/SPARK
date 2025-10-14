package com.mislbd.spark.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * DTO for permission check responses
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-12
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionCheckResponse {
    private boolean hasPermission;
    private String permissionCode;
    private String message;
    private List<String> grantedPermissions;
}