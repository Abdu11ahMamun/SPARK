package com.mislbd.spark.controller;

import com.mislbd.spark.dto.PermissionDto;
import com.mislbd.spark.dto.RolePermissionDto;
import com.mislbd.spark.entity.Permission;
import com.mislbd.spark.entity.RolePermission;
import com.mislbd.spark.service.RolePermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Role-Permission Management REST Controller
 */
@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "*", allowCredentials = "false")
@RequiredArgsConstructor
@Slf4j
public class RolePermissionController {

    private final RolePermissionService rolePermissionService;

    /**
     * GET /api/roles/{id}/permissions - Get role's permissions
     */
    @GetMapping("/{id}/permissions")
    public ResponseEntity<List<PermissionDto>> getRolePermissions(@PathVariable Long id) {
        try {
            List<Permission> permissions = rolePermissionService.getRolePermissions(id);
            List<PermissionDto> permissionDtos = permissions.stream()
                    .map(this::convertPermissionToDto)
                    .collect(Collectors.toList());
            
            log.debug("Retrieved {} permissions for role {}", permissionDtos.size(), id);
            return ResponseEntity.ok(permissionDtos);
        } catch (Exception e) {
            log.error("Error retrieving permissions for role {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/roles/{id}/permissions/details - Get role's permission mappings with details
     */
    @GetMapping("/{id}/permissions/details")
    public ResponseEntity<List<RolePermissionDto>> getRolePermissionDetails(@PathVariable Long id) {
        try {
            List<RolePermission> rolePermissions = rolePermissionService.getRolePermissionMappings(id);
            List<RolePermissionDto> rolePermissionDtos = rolePermissions.stream()
                    .map(this::convertRolePermissionToDto)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(rolePermissionDtos);
        } catch (Exception e) {
            log.error("Error retrieving permission details for role {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/roles/{roleId}/permissions/{permissionId}/check - Check if role has specific permission
     */
    @GetMapping("/{roleId}/permissions/{permissionId}/check")
    public ResponseEntity<Map<String, Object>> checkRolePermission(@PathVariable Long roleId, 
                                                                  @PathVariable Long permissionId) {
        try {
            boolean hasPermission = rolePermissionService.hasPermission(roleId, permissionId);
            
            Map<String, Object> result = Map.of(
                "roleId", roleId,
                "permissionId", permissionId,
                "hasPermission", hasPermission
            );
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error checking permission {} for role {}", permissionId, roleId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/roles/{roleId}/permissions/check/{permissionCode} - Check role permission by code
     */
    @GetMapping("/{roleId}/permissions/check/{permissionCode}")
    public ResponseEntity<Map<String, Object>> checkRolePermissionByCode(@PathVariable Long roleId, 
                                                                        @PathVariable String permissionCode) {
        try {
            boolean hasPermission = rolePermissionService.hasPermission(roleId, permissionCode);
            
            Map<String, Object> result = Map.of(
                "roleId", roleId,
                "permissionCode", permissionCode,
                "hasPermission", hasPermission
            );
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error checking permission code {} for role {}", permissionCode, roleId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * POST /api/roles/{id}/permissions - Assign permissions to role
     */
    @PostMapping("/{id}/permissions")
    public ResponseEntity<?> assignPermissionsToRole(@PathVariable Long id, 
                                                    @RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Object> permissionIdsRaw = (List<Object>) request.get("permissionIds");
            String grantedBy = (String) request.getOrDefault("grantedBy", "system");
            String notes = (String) request.get("notes");

            if (permissionIdsRaw == null || permissionIdsRaw.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Permission IDs are required"));
            }

            // Convert Integer/Long objects to Long
            List<Long> permissionIds = permissionIdsRaw.stream()
                    .map(obj -> obj instanceof Integer ? ((Integer) obj).longValue() : (Long) obj)
                    .collect(Collectors.toList());

            Map<String, Object> result;
            if (permissionIds.size() == 1) {
                // Single permission assignment
                RolePermission rolePermission = rolePermissionService.assignPermissionToRole(
                    id, permissionIds.get(0), grantedBy, notes);
                result = Map.of(
                    "roleId", id,
                    "permissionId", permissionIds.get(0),
                    "assigned", true,
                    "assignmentId", rolePermission.getId()
                );
            } else {
                // Bulk assignment
                result = rolePermissionService.bulkAssignPermissions(id, permissionIds, grantedBy, notes);
            }
            
            log.info("Assigned {} permissions to role {}", permissionIds.size(), id);
            return ResponseEntity.ok(result);
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid permission assignment for role {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (ClassCastException e) {
            log.warn("Invalid request format for role permission assignment: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid request format"));
        } catch (Exception e) {
            log.error("Error assigning permissions to role {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to assign permissions"));
        }
    }

    /**
     * DELETE /api/roles/{id}/permissions/{permissionId} - Remove permission from role
     */
    @DeleteMapping("/{id}/permissions/{permissionId}")
    public ResponseEntity<?> removePermissionFromRole(@PathVariable Long id, 
                                                     @PathVariable Long permissionId) {
        try {
            rolePermissionService.removePermissionFromRole(id, permissionId);
            
            log.info("Removed permission {} from role {}", permissionId, id);
            return ResponseEntity.ok(Map.of(
                "roleId", id,
                "permissionId", permissionId,
                "removed", true
            ));
            
        } catch (IllegalArgumentException e) {
            log.warn("Cannot remove permission {} from role {}: {}", permissionId, id, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error removing permission {} from role {}", permissionId, id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to remove permission"));
        }
    }

    /**
     * DELETE /api/roles/{id}/permissions - Bulk remove permissions from role
     */
    @DeleteMapping("/{id}/permissions")
    public ResponseEntity<?> bulkRemovePermissions(@PathVariable Long id, 
                                                  @RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Object> permissionIdsRaw = (List<Object>) request.get("permissionIds");

            if (permissionIdsRaw == null || permissionIdsRaw.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Permission IDs are required"));
            }

            // Convert Integer/Long objects to Long
            List<Long> permissionIds = permissionIdsRaw.stream()
                    .map(obj -> obj instanceof Integer ? ((Integer) obj).longValue() : (Long) obj)
                    .collect(Collectors.toList());

            Map<String, Object> result = rolePermissionService.bulkRemovePermissions(id, permissionIds);
            
            log.info("Bulk removed {} permissions from role {}", permissionIds.size(), id);
            return ResponseEntity.ok(result);
            
        } catch (ClassCastException e) {
            log.warn("Invalid request format for bulk permission removal: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid request format"));
        } catch (Exception e) {
            log.error("Error bulk removing permissions from role {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to remove permissions"));
        }
    }

    /**
     * PUT /api/roles/{id}/permissions - Replace all permissions for role
     */
    @PutMapping("/{id}/permissions")
    public ResponseEntity<?> replaceRolePermissions(@PathVariable Long id, 
                                                   @RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Long> permissionIds = (List<Long>) request.get("permissionIds");
            String grantedBy = (String) request.get("grantedBy");
            String notes = (String) request.get("notes");

            if (permissionIds == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Permission IDs are required"));
            }

            Map<String, Object> result = rolePermissionService.replaceRolePermissions(id, permissionIds, grantedBy, notes);
            
            log.info("Replaced permissions for role {}", id);
            return ResponseEntity.ok(result);
            
        } catch (IllegalArgumentException e) {
            log.warn("Cannot replace permissions for role {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (ClassCastException e) {
            log.warn("Invalid request format for permission replacement: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid request format"));
        } catch (Exception e) {
            log.error("Error replacing permissions for role {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to replace permissions"));
        }
    }

    /**
     * POST /api/roles/{sourceId}/permissions/copy/{targetId} - Copy permissions between roles
     */
    @PostMapping("/{sourceId}/permissions/copy/{targetId}")
    public ResponseEntity<?> copyPermissions(@PathVariable Long sourceId, 
                                           @PathVariable Long targetId,
                                           @RequestParam(defaultValue = "false") boolean replace,
                                           @RequestBody(required = false) Map<String, String> request) {
        try {
            String grantedBy = request != null ? request.get("grantedBy") : "SYSTEM";
            
            Map<String, Object> result = rolePermissionService.copyPermissions(sourceId, targetId, grantedBy, replace);
            
            log.info("Copied permissions from role {} to role {} (replace={})", sourceId, targetId, replace);
            return ResponseEntity.ok(result);
            
        } catch (IllegalArgumentException e) {
            log.warn("Cannot copy permissions from role {} to role {}: {}", sourceId, targetId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error copying permissions from role {} to role {}", sourceId, targetId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to copy permissions"));
        }
    }

    /**
     * GET /api/roles/permissions/matrix - Get permission matrix for role comparison
     */
    @GetMapping("/permissions/matrix")
    public ResponseEntity<?> getPermissionMatrix(@RequestParam List<Long> roleIds) {
        try {
            if (roleIds == null || roleIds.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Role IDs are required"));
            }

            Map<String, Object> matrix = rolePermissionService.getPermissionMatrix(roleIds);
            return ResponseEntity.ok(matrix);
            
        } catch (Exception e) {
            log.error("Error generating permission matrix for roles {}", roleIds, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to generate permission matrix"));
        }
    }

    /**
     * GET /api/roles/permissions/statistics - Get role-permission statistics
     */
    @GetMapping("/permissions/statistics")
    public ResponseEntity<?> getRolePermissionStatistics() {
        try {
            Map<String, Object> statistics = rolePermissionService.getRoleStatistics();
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            log.error("Error retrieving role-permission statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve statistics"));
        }
    }

    /**
     * Convert Permission entity to DTO
     */
    private PermissionDto convertPermissionToDto(Permission permission) {
        return PermissionDto.builder()
                .id(permission.getId())
                .code(permission.getCode())
                .name(permission.getName())
                .description(permission.getDescription())
                .resource(permission.getResource())
                .action(permission.getAction())
                .category(permission.getCategory())
                .displayOrder(permission.getDisplayOrder())
                .active(permission.getActive())
                .systemPermission(permission.getSystemPermission())
                .createdAt(permission.getCreatedAt())
                .updatedAt(permission.getUpdatedAt())
                .createdBy(permission.getCreatedBy())
                .updatedBy(permission.getUpdatedBy())
                .build();
    }

    /**
     * Convert RolePermission entity to DTO
     */
    private RolePermissionDto convertRolePermissionToDto(RolePermission rolePermission) {
        return RolePermissionDto.builder()
                .id(rolePermission.getId())
                .roleId(rolePermission.getRole().getId())
                .permissionId(rolePermission.getPermission().getId())
                .grantedAt(rolePermission.getGrantedAt())
                .grantedBy(rolePermission.getGrantedBy())
                .notes(rolePermission.getNotes())
                .active(rolePermission.getActive())
                .build();
    }
}