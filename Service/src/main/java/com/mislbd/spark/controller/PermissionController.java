package com.mislbd.spark.controller;

import com.mislbd.spark.dto.PermissionDto;
import com.mislbd.spark.entity.Permission;
import com.mislbd.spark.service.PermissionService;
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
 * Permission Management REST Controller
 */
@RestController
@RequestMapping("/api/permissions")
@CrossOrigin(origins = "*", allowCredentials = "false")
@RequiredArgsConstructor
@Slf4j
public class PermissionController {

    private final PermissionService permissionService;

    /**
     * GET /api/permissions - List all available permissions
     */
    @GetMapping
    public ResponseEntity<List<PermissionDto>> getAllPermissions() {
        try {
            List<Permission> permissions = permissionService.findAllOrdered();
            List<PermissionDto> permissionDtos = permissions.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            
            log.debug("Retrieved {} permissions", permissionDtos.size());
            return ResponseEntity.ok(permissionDtos);
        } catch (Exception e) {
            log.error("Error retrieving permissions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/permissions/active - List all active permissions
     */
    @GetMapping("/active")
    public ResponseEntity<List<PermissionDto>> getActivePermissions() {
        try {
            List<Permission> permissions = permissionService.findAllActive();
            List<PermissionDto> permissionDtos = permissions.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(permissionDtos);
        } catch (Exception e) {
            log.error("Error retrieving active permissions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/permissions/{id} - Get permission by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<PermissionDto> getPermissionById(@PathVariable Long id) {
        try {
            return permissionService.findById(id)
                    .map(permission -> ResponseEntity.ok(convertToDto(permission)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error retrieving permission with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/permissions/code/{code} - Get permission by code
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<PermissionDto> getPermissionByCode(@PathVariable String code) {
        try {
            return permissionService.findByCode(code)
                    .map(permission -> ResponseEntity.ok(convertToDto(permission)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error retrieving permission with code: {}", code, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/permissions/category/{category} - Get permissions by category
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<PermissionDto>> getPermissionsByCategory(@PathVariable String category) {
        try {
            List<Permission> permissions = permissionService.findByCategory(category);
            List<PermissionDto> permissionDtos = permissions.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(permissionDtos);
        } catch (Exception e) {
            log.error("Error retrieving permissions for category: {}", category, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/permissions/resource/{resource} - Get permissions by resource
     */
    @GetMapping("/resource/{resource}")
    public ResponseEntity<List<PermissionDto>> getPermissionsByResource(@PathVariable String resource) {
        try {
            List<Permission> permissions = permissionService.findByResource(resource);
            List<PermissionDto> permissionDtos = permissions.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(permissionDtos);
        } catch (Exception e) {
            log.error("Error retrieving permissions for resource: {}", resource, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/permissions/search - Search permissions
     */
    @GetMapping("/search")
    public ResponseEntity<List<PermissionDto>> searchPermissions(@RequestParam String query) {
        try {
            List<Permission> permissions = permissionService.searchPermissions(query);
            List<PermissionDto> permissionDtos = permissions.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(permissionDtos);
        } catch (Exception e) {
            log.error("Error searching permissions with query: {}", query, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/permissions/grouped - Get permissions grouped by category
     */
    @GetMapping("/grouped")
    public ResponseEntity<Map<String, List<PermissionDto>>> getPermissionsGrouped() {
        try {
            Map<String, List<Permission>> groupedPermissions = permissionService.getPermissionsGroupedByCategory();
            
            Map<String, List<PermissionDto>> result = groupedPermissions.entrySet().stream()
                    .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue().stream()
                                .map(this::convertToDto)
                                .collect(Collectors.toList())
                    ));
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error retrieving grouped permissions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/permissions/statistics - Get permission statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getPermissionStatistics() {
        try {
            Map<String, Object> statistics = permissionService.getPermissionStatistics();
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            log.error("Error retrieving permission statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/permissions/metadata - Get metadata (categories, resources, actions)
     */
    @GetMapping("/metadata")
    public ResponseEntity<Map<String, List<String>>> getPermissionMetadata() {
        try {
            Map<String, List<String>> metadata = Map.of(
                "categories", permissionService.getAvailableCategories(),
                "resources", permissionService.getAvailableResources(),
                "actions", permissionService.getAvailableActions()
            );
            return ResponseEntity.ok(metadata);
        } catch (Exception e) {
            log.error("Error retrieving permission metadata", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/permissions/unassigned - Get permissions not assigned to any role
     */
    @GetMapping("/unassigned")
    public ResponseEntity<List<PermissionDto>> getUnassignedPermissions() {
        try {
            List<Permission> permissions = permissionService.findUnassignedPermissions();
            List<PermissionDto> permissionDtos = permissions.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(permissionDtos);
        } catch (Exception e) {
            log.error("Error retrieving unassigned permissions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * POST /api/permissions - Create new permission (Admin only)
     */
    @PostMapping
    public ResponseEntity<?> createPermission(@Valid @RequestBody PermissionDto permissionDto) {
        try {
            if (permissionService.existsByCode(permissionDto.getCode())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "Permission code already exists: " + permissionDto.getCode()));
            }

            Permission permission = convertToEntity(permissionDto);
            Permission savedPermission = permissionService.createPermission(permission);
            
            log.info("Created new permission: {}", savedPermission.getCode());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(convertToDto(savedPermission));
                    
        } catch (IllegalArgumentException e) {
            log.warn("Invalid permission creation request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating permission", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create permission"));
        }
    }

    /**
     * PUT /api/permissions/{id} - Update permission
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePermission(@PathVariable Long id, 
                                            @Valid @RequestBody PermissionDto permissionDto) {
        try {
            Permission permissionDetails = convertToEntity(permissionDto);
            Permission updatedPermission = permissionService.updatePermission(id, permissionDetails);
            
            log.info("Updated permission: {}", updatedPermission.getCode());
            return ResponseEntity.ok(convertToDto(updatedPermission));
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid permission update request for id {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating permission with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update permission"));
        }
    }

    /**
     * DELETE /api/permissions/{id} - Delete permission
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePermission(@PathVariable Long id) {
        try {
            permissionService.deletePermission(id);
            log.info("Deleted permission with id: {}", id);
            return ResponseEntity.noContent().build();
            
        } catch (IllegalArgumentException e) {
            log.warn("Cannot delete permission with id {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting permission with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete permission"));
        }
    }

    /**
     * PATCH /api/permissions/{id}/toggle - Toggle permission status
     */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<?> togglePermissionStatus(@PathVariable Long id) {
        try {
            Permission updatedPermission = permissionService.togglePermissionStatus(id);
            
            log.info("Toggled permission status for id {}: {}", id, updatedPermission.getActive());
            return ResponseEntity.ok(convertToDto(updatedPermission));
            
        } catch (IllegalArgumentException e) {
            log.warn("Cannot toggle permission status for id {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error toggling permission status for id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to toggle permission status"));
        }
    }

    /**
     * POST /api/permissions/bulk - Bulk operations on permissions
     */
    @PostMapping("/bulk")
    public ResponseEntity<?> bulkPermissionOperation(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Long> permissionIds = (List<Long>) request.get("permissionIds");
            String operation = (String) request.get("operation");
            String reason = (String) request.get("reason");

            if (permissionIds == null || permissionIds.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Permission IDs are required"));
            }

            if (operation == null || operation.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Operation is required"));
            }

            Map<String, Object> result = permissionService.bulkOperation(permissionIds, operation, reason);
            
            log.info("Bulk operation '{}' completed on {} permissions", operation, permissionIds.size());
            return ResponseEntity.ok(result);
            
        } catch (ClassCastException e) {
            log.warn("Invalid bulk operation request format: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid request format"));
        } catch (Exception e) {
            log.error("Error processing bulk permission operation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process bulk operation"));
        }
    }

    /**
     * Convert Permission entity to DTO
     */
    private PermissionDto convertToDto(Permission permission) {
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
     * Convert DTO to Permission entity
     */
    private Permission convertToEntity(PermissionDto dto) {
        return Permission.builder()
                .id(dto.getId())
                .code(dto.getCode())
                .name(dto.getName())
                .description(dto.getDescription())
                .resource(dto.getResource())
                .action(dto.getAction())
                .category(dto.getCategory())
                .displayOrder(dto.getDisplayOrder())
                .active(dto.getActive())
                .systemPermission(dto.getSystemPermission())
                .createdBy(dto.getCreatedBy())
                .updatedBy(dto.getUpdatedBy())
                .build();
    }
}