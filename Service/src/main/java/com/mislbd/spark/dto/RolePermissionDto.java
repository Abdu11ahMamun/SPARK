package com.mislbd.spark.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Role-Permission mapping DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RolePermissionDto {
    private Long id;
    private Long roleId;
    private Long permissionId;
    private LocalDateTime grantedAt;
    private String grantedBy;
    private String notes;
    private Boolean active;
}