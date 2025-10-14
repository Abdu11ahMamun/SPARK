package com.mislbd.spark.service;

import com.mislbd.spark.entity.Permission;
import com.mislbd.spark.entity.RolePermission;
import com.mislbd.spark.repository.PermissionRepository;
import com.mislbd.spark.repository.RolePermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Permission Service for RBAC system
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PermissionService {

    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;

    /**
     * Find all permissions
     */
    @Transactional(readOnly = true)
    public List<Permission> findAll() {
        return permissionRepository.findAll();
    }

    /**
     * Find all permissions ordered by category and display order
     */
    @Transactional(readOnly = true)
    public List<Permission> findAllOrdered() {
        return permissionRepository.findAllByOrderByCategoryAscDisplayOrderAsc();
    }

    /**
     * Find all active permissions
     */
    @Transactional(readOnly = true)
    public List<Permission> findAllActive() {
        return permissionRepository.findByActiveTrue();
    }

    /**
     * Find permission by ID
     */
    @Transactional(readOnly = true)
    public Optional<Permission> findById(Long id) {
        return permissionRepository.findById(id);
    }

    /**
     * Find permission by code
     */
    @Transactional(readOnly = true)
    public Optional<Permission> findByCode(String code) {
        return permissionRepository.findByCode(code);
    }

    /**
     * Find permissions by category
     */
    @Transactional(readOnly = true)
    public List<Permission> findByCategory(String category) {
        return permissionRepository.findByCategoryOrderByDisplayOrder(category);
    }

    /**
     * Find permissions by resource
     */
    @Transactional(readOnly = true)
    public List<Permission> findByResource(String resource) {
        return permissionRepository.findByResourceOrderByDisplayOrder(resource);
    }

    /**
     * Search permissions by text
     */
    @Transactional(readOnly = true)
    public List<Permission> searchPermissions(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return findAllOrdered();
        }
        Pageable pageable = PageRequest.of(0, 1000); // Get first 1000 results
        Page<Permission> permissionPage = permissionRepository.searchPermissions(searchTerm.trim(), pageable);
        return permissionPage.getContent();
    }

    /**
     * Get grouped permissions by category
     */
    @Transactional(readOnly = true)
    public Map<String, List<Permission>> getPermissionsGroupedByCategory() {
        List<Permission> permissions = findAllOrdered();
        return permissions.stream()
                .filter(p -> p.getCategory() != null)
                .collect(Collectors.groupingBy(Permission::getCategory));
    }

    /**
     * Get permission statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getPermissionStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalPermissions", permissionRepository.count());
        stats.put("activePermissions", permissionRepository.countByActiveTrue());
        stats.put("systemPermissions", permissionRepository.countBySystemPermissionTrue());
        
        // Category statistics
        List<Object[]> categoryStats = permissionRepository.countPermissionsByCategory();
        Map<String, Long> categoryCounts = categoryStats.stream()
                .collect(Collectors.toMap(
                    row -> (String) row[0], 
                    row -> (Long) row[1]
                ));
        stats.put("categoryCounts", categoryCounts);
        
        return stats;
    }

    /**
     * Check if permission code exists
     */
    @Transactional(readOnly = true)
    public boolean existsByCode(String code) {
        return permissionRepository.existsByCode(code);
    }

    /**
     * Create new permission
     */
    public Permission createPermission(Permission permission) {
        if (existsByCode(permission.getCode())) {
            throw new IllegalArgumentException("Permission with code '" + permission.getCode() + "' already exists");
        }
        
        permission.setCreatedAt(LocalDateTime.now());
        permission.setActive(permission.getActive() != null ? permission.getActive() : true);
        permission.setSystemPermission(permission.getSystemPermission() != null ? permission.getSystemPermission() : false);
        
        log.info("Creating new permission: {}", permission.getCode());
        return permissionRepository.save(permission);
    }

    /**
     * Update permission
     */
    public Permission updatePermission(Long id, Permission permissionDetails) {
        Permission existing = findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Permission not found with id: " + id));
        
        // Prevent updating system permissions in certain ways
        if (existing.getSystemPermission() && permissionDetails.getSystemPermission() != null && !permissionDetails.getSystemPermission()) {
            throw new IllegalArgumentException("Cannot change system permission to non-system");
        }
        
        // Update allowed fields
        if (permissionDetails.getName() != null) existing.setName(permissionDetails.getName());
        if (permissionDetails.getDescription() != null) existing.setDescription(permissionDetails.getDescription());
        if (permissionDetails.getCategory() != null) existing.setCategory(permissionDetails.getCategory());
        if (permissionDetails.getDisplayOrder() != null) existing.setDisplayOrder(permissionDetails.getDisplayOrder());
        if (permissionDetails.getActive() != null) existing.setActive(permissionDetails.getActive());
        
        existing.setUpdatedAt(LocalDateTime.now());
        existing.setUpdatedBy(permissionDetails.getUpdatedBy());
        
        log.info("Updating permission: {}", existing.getCode());
        return permissionRepository.save(existing);
    }

    /**
     * Delete permission (only if not system permission and not in use)
     */
    public void deletePermission(Long id) {
        Permission permission = findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Permission not found with id: " + id));
        
        if (permission.getSystemPermission()) {
            throw new IllegalArgumentException("Cannot delete system permission: " + permission.getCode());
        }
        
        // Check if permission is in use
        long usageCount = rolePermissionRepository.countByPermissionIdAndActiveTrue(id);
        if (usageCount > 0) {
            throw new IllegalArgumentException("Cannot delete permission that is assigned to roles. Currently assigned to " + usageCount + " role(s)");
        }
        
        log.info("Deleting permission: {}", permission.getCode());
        permissionRepository.deleteById(id);
    }

    /**
     * Activate/Deactivate permission
     */
    public Permission togglePermissionStatus(Long id) {
        Permission permission = findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Permission not found with id: " + id));
        
        permission.setActive(!permission.getActive());
        permission.setUpdatedAt(LocalDateTime.now());
        
        log.info("Toggling permission status: {} -> {}", permission.getCode(), permission.getActive());
        return permissionRepository.save(permission);
    }

    /**
     * Bulk operations on permissions
     */
    public Map<String, Object> bulkOperation(List<Long> permissionIds, String operation, String reason) {
        Map<String, Object> result = new HashMap<>();
        List<Long> processed = new ArrayList<>();
        List<Long> failed = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (Long id : permissionIds) {
            try {
                switch (operation.toLowerCase()) {
                    case "activate":
                        Permission activatePermission = findById(id).orElseThrow();
                        activatePermission.setActive(true);
                        activatePermission.setUpdatedAt(LocalDateTime.now());
                        permissionRepository.save(activatePermission);
                        processed.add(id);
                        break;
                        
                    case "deactivate":
                        Permission deactivatePermission = findById(id).orElseThrow();
                        deactivatePermission.setActive(false);
                        deactivatePermission.setUpdatedAt(LocalDateTime.now());
                        permissionRepository.save(deactivatePermission);
                        processed.add(id);
                        break;
                        
                    case "delete":
                        deletePermission(id);
                        processed.add(id);
                        break;
                        
                    default:
                        throw new IllegalArgumentException("Unknown operation: " + operation);
                }
            } catch (Exception e) {
                failed.add(id);
                errors.add("ID " + id + ": " + e.getMessage());
                log.error("Bulk operation failed for permission {}: {}", id, e.getMessage());
            }
        }

        result.put("processed", processed.size());
        result.put("failed", failed.size());
        result.put("failedIds", failed);
        result.put("errors", errors);
        result.put("operation", operation);
        result.put("reason", reason);

        log.info("Bulk operation '{}' completed: {} processed, {} failed", operation, processed.size(), failed.size());
        return result;
    }

    /**
     * Find permissions that are not assigned to any role
     */
    @Transactional(readOnly = true)
    public List<Permission> findUnassignedPermissions() {
        return permissionRepository.findUnassignedPermissions();
    }

    /**
     * Get all available categories
     */
    @Transactional(readOnly = true)
    public List<String> getAvailableCategories() {
        return permissionRepository.findAll().stream()
                .map(Permission::getCategory)
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    /**
     * Get all available resources
     */
    @Transactional(readOnly = true)
    public List<String> getAvailableResources() {
        return permissionRepository.findAll().stream()
                .map(Permission::getResource)
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    /**
     * Get all available actions
     */
    @Transactional(readOnly = true)
    public List<String> getAvailableActions() {
        return permissionRepository.findAll().stream()
                .map(Permission::getAction)
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }
}