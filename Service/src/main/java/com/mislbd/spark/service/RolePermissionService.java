package com.mislbd.spark.service;

import com.mislbd.spark.entity.Role;
import com.mislbd.spark.entity.Permission;
import com.mislbd.spark.entity.RolePermission;
import com.mislbd.spark.repository.RoleRepository;
import com.mislbd.spark.repository.PermissionRepository;
import com.mislbd.spark.repository.RolePermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Role-Permission Service for managing role-permission relationships
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RolePermissionService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;

    /**
     * Get all permissions for a role
     */
    @Transactional(readOnly = true)
    public List<Permission> getRolePermissions(Long roleId) {
        List<RolePermission> rolePermissions = rolePermissionRepository.findByRoleIdAndActiveTrue(roleId);
        return rolePermissions.stream()
                .map(RolePermission::getPermission)
                .collect(Collectors.toList());
    }

    /**
     * Get role-permission mappings with details
     */
    @Transactional(readOnly = true)
    public List<RolePermission> getRolePermissionMappings(Long roleId) {
        return rolePermissionRepository.findByRoleIdWithPermissionDetails(roleId);
    }

    /**
     * Check if role has specific permission
     */
    @Transactional(readOnly = true)
    public boolean hasPermission(Long roleId, String permissionCode) {
        Permission permission = permissionRepository.findByCode(permissionCode).orElse(null);
        if (permission == null) {
            return false;
        }
        return rolePermissionRepository.existsByRoleIdAndPermissionIdAndActiveTrue(roleId, permission.getId());
    }

    /**
     * Check if role has specific permission by ID
     */
    @Transactional(readOnly = true)
    public boolean hasPermission(Long roleId, Long permissionId) {
        return rolePermissionRepository.existsByRoleIdAndPermissionIdAndActiveTrue(roleId, permissionId);
    }

    /**
     * Assign single permission to role
     */
    public RolePermission assignPermissionToRole(Long roleId, Long permissionId, String grantedBy, String notes) {
        // Validate role and permission exist
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found with id: " + roleId));
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new IllegalArgumentException("Permission not found with id: " + permissionId));

        // Check if mapping already exists
        Optional<RolePermission> existing = rolePermissionRepository.findByRoleIdAndPermissionId(roleId, permissionId);
        if (existing.isPresent()) {
            RolePermission rolePermission = existing.get();
            if (rolePermission.getActive()) {
                throw new IllegalArgumentException("Permission already assigned to role");
            } else {
                // Reactivate existing mapping
                rolePermission.setActive(true);
                rolePermission.setGrantedAt(LocalDateTime.now());
                rolePermission.setGrantedBy(grantedBy);
                rolePermission.setNotes(notes);
                log.info("Reactivated permission {} for role {}", permission.getCode(), role.getName());
                return rolePermissionRepository.save(rolePermission);
            }
        }

        // Create new mapping
        RolePermission rolePermission = RolePermission.builder()
                .role(role)
                .permission(permission)
                .grantedAt(LocalDateTime.now())
                .grantedBy(grantedBy)
                .notes(notes)
                .active(true)
                .build();

        log.info("Assigned permission {} to role {}", permission.getCode(), role.getName());
        return rolePermissionRepository.save(rolePermission);
    }

    /**
     * Remove permission from role
     */
    public void removePermissionFromRole(Long roleId, Long permissionId) {
        RolePermission rolePermission = rolePermissionRepository.findByRoleIdAndPermissionIdAndActiveTrue(roleId, permissionId)
                .orElseThrow(() -> new IllegalArgumentException("Permission not assigned to role"));

        Role role = rolePermission.getRole();
        Permission permission = rolePermission.getPermission();

        // Deactivate instead of delete for audit purposes
        rolePermission.setActive(false);
        rolePermissionRepository.save(rolePermission);

        log.info("Removed permission {} from role {}", permission.getCode(), role.getName());
    }

    /**
     * Bulk assign permissions to role
     */
    public Map<String, Object> bulkAssignPermissions(Long roleId, List<Long> permissionIds, String grantedBy, String notes) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found with id: " + roleId));

        Map<String, Object> result = new HashMap<>();
        List<Long> processed = new ArrayList<>();
        List<Long> failed = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (Long permissionId : permissionIds) {
            try {
                assignPermissionToRole(roleId, permissionId, grantedBy, notes);
                processed.add(permissionId);
            } catch (Exception e) {
                failed.add(permissionId);
                errors.add("Permission " + permissionId + ": " + e.getMessage());
                log.error("Failed to assign permission {} to role {}: {}", permissionId, roleId, e.getMessage());
            }
        }

        result.put("roleId", roleId);
        result.put("processed", processed.size());
        result.put("failed", failed.size());
        result.put("failedPermissionIds", failed);
        result.put("errors", errors);
        result.put("totalPermissions", rolePermissionRepository.countByRoleIdAndActiveTrue(roleId));

        log.info("Bulk assign to role {}: {} processed, {} failed", role.getName(), processed.size(), failed.size());
        return result;
    }

    /**
     * Bulk remove permissions from role
     */
    public Map<String, Object> bulkRemovePermissions(Long roleId, List<Long> permissionIds) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found with id: " + roleId));

        Map<String, Object> result = new HashMap<>();
        List<Long> processed = new ArrayList<>();
        List<Long> failed = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (Long permissionId : permissionIds) {
            try {
                removePermissionFromRole(roleId, permissionId);
                processed.add(permissionId);
            } catch (Exception e) {
                failed.add(permissionId);
                errors.add("Permission " + permissionId + ": " + e.getMessage());
                log.error("Failed to remove permission {} from role {}: {}", permissionId, roleId, e.getMessage());
            }
        }

        result.put("roleId", roleId);
        result.put("processed", processed.size());
        result.put("failed", failed.size());
        result.put("failedPermissionIds", failed);
        result.put("errors", errors);
        result.put("totalPermissions", rolePermissionRepository.countByRoleIdAndActiveTrue(roleId));

        log.info("Bulk remove from role {}: {} processed, {} failed", role.getName(), processed.size(), failed.size());
        return result;
    }

    /**
     * Replace all permissions for a role
     */
    public Map<String, Object> replaceRolePermissions(Long roleId, List<Long> newPermissionIds, String grantedBy, String notes) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found with id: " + roleId));

        // Note: System role protection can be added later if needed

        // Get current permissions
        List<RolePermission> currentMappings = rolePermissionRepository.findByRoleIdAndActiveTrue(roleId);
        Set<Long> currentPermissionIds = currentMappings.stream()
                .map(rp -> rp.getPermission().getId())
                .collect(Collectors.toSet());

        Set<Long> newPermissionSet = new HashSet<>(newPermissionIds);

        // Permissions to remove
        Set<Long> toRemove = new HashSet<>(currentPermissionIds);
        toRemove.removeAll(newPermissionSet);

        // Permissions to add
        Set<Long> toAdd = new HashSet<>(newPermissionSet);
        toAdd.removeAll(currentPermissionIds);

        int processed = 0;
        List<String> errors = new ArrayList<>();

        // Remove permissions
        for (Long permissionId : toRemove) {
            try {
                removePermissionFromRole(roleId, permissionId);
                processed++;
            } catch (Exception e) {
                errors.add("Remove " + permissionId + ": " + e.getMessage());
            }
        }

        // Add permissions
        for (Long permissionId : toAdd) {
            try {
                assignPermissionToRole(roleId, permissionId, grantedBy, notes);
                processed++;
            } catch (Exception e) {
                errors.add("Add " + permissionId + ": " + e.getMessage());
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("roleId", roleId);
        result.put("processed", processed);
        result.put("removed", toRemove.size());
        result.put("added", toAdd.size());
        result.put("errors", errors);
        result.put("totalPermissions", rolePermissionRepository.countByRoleIdAndActiveTrue(roleId));

        log.info("Replaced permissions for role {}: {} removed, {} added", role.getName(), toRemove.size(), toAdd.size());
        return result;
    }

    /**
     * Get permission matrix for role comparison
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getPermissionMatrix(List<Long> roleIds) {
        List<Role> roles = roleRepository.findAllById(roleIds);
        List<Permission> allPermissions = permissionRepository.findAllByOrderByCategoryAscDisplayOrderAsc();

        // Build matrix
        Map<Long, Map<Long, Boolean>> matrix = new HashMap<>();
        Map<Long, Integer> uniquePermissionCounts = new HashMap<>();
        int sharedPermissions = 0;

        for (Role role : roles) {
            List<Permission> rolePermissions = getRolePermissions(role.getId());
            Set<Long> rolePermissionIds = rolePermissions.stream()
                    .map(Permission::getId)
                    .collect(Collectors.toSet());

            Map<Long, Boolean> roleMatrix = new HashMap<>();
            for (Permission permission : allPermissions) {
                boolean hasPermission = rolePermissionIds.contains(permission.getId());
                roleMatrix.put(permission.getId(), hasPermission);
            }
            matrix.put(role.getId(), roleMatrix);
            uniquePermissionCounts.put(role.getId(), rolePermissionIds.size());
        }

        // Calculate shared permissions
        if (roles.size() > 1) {
            for (Permission permission : allPermissions) {
                boolean allRolesHave = roles.stream()
                        .allMatch(role -> matrix.get(role.getId()).get(permission.getId()));
                if (allRolesHave) {
                    sharedPermissions++;
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("roles", roles);
        result.put("permissions", allPermissions);
        result.put("matrix", matrix);
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalPermissions", allPermissions.size());
        statistics.put("sharedPermissions", sharedPermissions);
        statistics.put("uniquePermissions", uniquePermissionCounts);
        result.put("statistics", statistics);

        return result;
    }

    /**
     * Get role statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getRoleStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        List<Object[]> rolePermissionCounts = rolePermissionRepository.countPermissionsByRole();
        Map<Long, Long> permissionCountsByRole = rolePermissionCounts.stream()
                .collect(Collectors.toMap(
                    row -> (Long) row[0], 
                    row -> (Long) row[1]
                ));
        
        stats.put("permissionCountsByRole", permissionCountsByRole);
        
        // Find role with most permissions
        Optional<Map.Entry<Long, Long>> maxEntry = permissionCountsByRole.entrySet().stream()
                .max(Map.Entry.comparingByValue());
        if (maxEntry.isPresent()) {
            Role roleWithMost = roleRepository.findById(maxEntry.get().getKey()).orElse(null);
            if (roleWithMost != null) {
                Map<String, Object> mostPermissionsRole = new HashMap<>();
                mostPermissionsRole.put("role", roleWithMost);
                mostPermissionsRole.put("count", maxEntry.get().getValue());
                stats.put("roleWithMostPermissions", mostPermissionsRole);
            }
        }
        
        return stats;
    }

    /**
     * Copy permissions from one role to another
     */
    public Map<String, Object> copyPermissions(Long sourceRoleId, Long targetRoleId, String grantedBy, boolean replace) {
        Role sourceRole = roleRepository.findById(sourceRoleId)
                .orElseThrow(() -> new IllegalArgumentException("Source role not found with id: " + sourceRoleId));
        Role targetRole = roleRepository.findById(targetRoleId)
                .orElseThrow(() -> new IllegalArgumentException("Target role not found with id: " + targetRoleId));

        List<Permission> sourcePermissions = getRolePermissions(sourceRoleId);
        List<Long> sourcePermissionIds = sourcePermissions.stream()
                .map(Permission::getId)
                .collect(Collectors.toList());

        String notes = "Copied from role: " + sourceRole.getName();

        if (replace) {
            return replaceRolePermissions(targetRoleId, sourcePermissionIds, grantedBy, notes);
        } else {
            return bulkAssignPermissions(targetRoleId, sourcePermissionIds, grantedBy, notes);
        }
    }
}