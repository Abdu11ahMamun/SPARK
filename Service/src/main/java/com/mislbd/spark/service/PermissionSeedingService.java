package com.mislbd.spark.service;

import com.mislbd.spark.entity.Permission;
import com.mislbd.spark.entity.Role;
import com.mislbd.spark.entity.RolePermission;
import com.mislbd.spark.repository.PermissionRepository;
import com.mislbd.spark.repository.RoleRepository;
import com.mislbd.spark.repository.RolePermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Permission Seeding Service for initial data setup
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PermissionSeedingService {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;

    /**
     * Seed all default permissions
     */
    public Map<String, Object> seedPermissions(boolean force) {
        Map<String, Object> result = new HashMap<>();
        List<String> created = new ArrayList<>();
        List<String> skipped = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        log.info("Starting permission seeding process (force={})", force);

        try {
            // Define all default permissions
            List<PermissionDefinition> defaultPermissions = getDefaultPermissions();

            for (PermissionDefinition def : defaultPermissions) {
                try {
                    Optional<Permission> existing = permissionRepository.findByCode(def.getCode());
                    
                    if (existing.isPresent() && !force) {
                        skipped.add(def.getCode());
                        continue;
                    }

                    Permission permission;
                    if (existing.isPresent()) {
                        // Update existing permission
                        permission = existing.get();
                        permission.setName(def.getName());
                        permission.setDescription(def.getDescription());
                        permission.setResource(def.getResource());
                        permission.setAction(def.getAction());
                        permission.setCategory(def.getCategory());
                        permission.setDisplayOrder(def.getDisplayOrder());
                        permission.setUpdatedAt(LocalDateTime.now());
                        permission.setUpdatedBy("SYSTEM_SEED");
                    } else {
                        // Create new permission
                        permission = Permission.builder()
                                .code(def.getCode())
                                .name(def.getName())
                                .description(def.getDescription())
                                .resource(def.getResource())
                                .action(def.getAction())
                                .category(def.getCategory())
                                .displayOrder(def.getDisplayOrder())
                                .active(true)
                                .systemPermission(true)
                                .createdAt(LocalDateTime.now())
                                .createdBy("SYSTEM_SEED")
                                .build();
                    }

                    permissionRepository.save(permission);
                    created.add(def.getCode());
                    log.debug("Seeded permission: {}", def.getCode());

                } catch (Exception e) {
                    errors.add(def.getCode() + ": " + e.getMessage());
                    log.error("Failed to seed permission {}: {}", def.getCode(), e.getMessage());
                }
            }

            result.put("success", true);
            result.put("totalDefinitions", defaultPermissions.size());
            result.put("created", created);
            result.put("skipped", skipped);
            result.put("errors", errors);
            result.put("createdCount", created.size());
            result.put("skippedCount", skipped.size());
            result.put("errorCount", errors.size());

            log.info("Permission seeding completed: {} created, {} skipped, {} errors", 
                    created.size(), skipped.size(), errors.size());

        } catch (Exception e) {
            log.error("Permission seeding failed", e);
            result.put("success", false);
            result.put("error", e.getMessage());
        }

        return result;
    }

    /**
     * Seed role-permission assignments
     */
    public Map<String, Object> seedRolePermissions(boolean force) {
        Map<String, Object> result = new HashMap<>();
        List<String> assigned = new ArrayList<>();
        List<String> skipped = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        log.info("Starting role-permission seeding process (force={})", force);

        try {
            Map<String, List<String>> defaultRolePermissions = getDefaultRolePermissions();

            for (Map.Entry<String, List<String>> entry : defaultRolePermissions.entrySet()) {
                String roleName = entry.getKey();
                List<String> permissionCodes = entry.getValue();

                Optional<Role> roleOpt = roleRepository.findByName(roleName);
                if (roleOpt.isEmpty()) {
                    errors.add("Role not found: " + roleName);
                    continue;
                }

                Role role = roleOpt.get();

                for (String permissionCode : permissionCodes) {
                    try {
                        Optional<Permission> permissionOpt = permissionRepository.findByCode(permissionCode);
                        if (permissionOpt.isEmpty()) {
                            errors.add("Permission not found: " + permissionCode);
                            continue;
                        }

                        Permission permission = permissionOpt.get();
                        
                        Optional<RolePermission> existing = rolePermissionRepository
                                .findByRoleIdAndPermissionId(role.getId(), permission.getId());

                        if (existing.isPresent() && !force) {
                            skipped.add(roleName + ":" + permissionCode);
                            continue;
                        }

                        RolePermission rolePermission;
                        if (existing.isPresent()) {
                            // Reactivate existing mapping
                            rolePermission = existing.get();
                            rolePermission.setActive(true);
                            rolePermission.setGrantedAt(LocalDateTime.now());
                            rolePermission.setGrantedBy("SYSTEM_SEED");
                        } else {
                            // Create new mapping
                            rolePermission = RolePermission.builder()
                                    .role(role)
                                    .permission(permission)
                                    .grantedAt(LocalDateTime.now())
                                    .grantedBy("SYSTEM_SEED")
                                    .notes("System default assignment")
                                    .active(true)
                                    .build();
                        }

                        rolePermissionRepository.save(rolePermission);
                        assigned.add(roleName + ":" + permissionCode);

                    } catch (Exception e) {
                        errors.add(roleName + ":" + permissionCode + " - " + e.getMessage());
                        log.error("Failed to assign permission {} to role {}: {}", permissionCode, roleName, e.getMessage());
                    }
                }
            }

            result.put("success", true);
            result.put("assigned", assigned);
            result.put("skipped", skipped);
            result.put("errors", errors);
            result.put("assignedCount", assigned.size());
            result.put("skippedCount", skipped.size());
            result.put("errorCount", errors.size());

            log.info("Role-permission seeding completed: {} assigned, {} skipped, {} errors", 
                    assigned.size(), skipped.size(), errors.size());

        } catch (Exception e) {
            log.error("Role-permission seeding failed", e);
            result.put("success", false);
            result.put("error", e.getMessage());
        }

        return result;
    }

    /**
     * Complete seeding process (permissions + role assignments)
     */
    public Map<String, Object> seedAll(boolean force) {
        Map<String, Object> result = new HashMap<>();

        try {
            // First seed permissions
            Map<String, Object> permissionResult = seedPermissions(force);
            result.put("permissions", permissionResult);

            // Then seed role-permission assignments
            Map<String, Object> rolePermissionResult = seedRolePermissions(force);
            result.put("rolePermissions", rolePermissionResult);

            boolean overallSuccess = (Boolean) permissionResult.get("success") && 
                                   (Boolean) rolePermissionResult.get("success");
            result.put("success", overallSuccess);

            log.info("Complete seeding process finished with success: {}", overallSuccess);

        } catch (Exception e) {
            log.error("Complete seeding process failed", e);
            result.put("success", false);
            result.put("error", e.getMessage());
        }

        return result;
    }

    /**
     * Define all default permissions
     */
    private List<PermissionDefinition> getDefaultPermissions() {
        List<PermissionDefinition> permissions = new ArrayList<>();

        // Dashboard Permissions
        permissions.add(new PermissionDefinition("DASHBOARD_VIEW", "dashboard.read", "Access Dashboard", "dashboard", "read", "DASHBOARD", 100));
        permissions.add(new PermissionDefinition("DASHBOARD_ADMIN", "dashboard.admin", "Dashboard Administration", "dashboard", "admin", "DASHBOARD", 101));

        // User Management Permissions
        permissions.add(new PermissionDefinition("USER_VIEW", "users.read", "View Users", "users", "read", "USER_MANAGEMENT", 200));
        permissions.add(new PermissionDefinition("USER_CREATE", "users.write", "Create/Edit Users", "users", "write", "USER_MANAGEMENT", 201));
        permissions.add(new PermissionDefinition("USER_DELETE", "users.delete", "Delete Users", "users", "delete", "USER_MANAGEMENT", 202));
        permissions.add(new PermissionDefinition("USER_ADMIN", "users.admin", "User Administration", "users", "admin", "USER_MANAGEMENT", 203));

        // Role Management Permissions
        permissions.add(new PermissionDefinition("ROLE_VIEW", "roles.read", "View Roles", "roles", "read", "ROLE_MANAGEMENT", 300));
        permissions.add(new PermissionDefinition("ROLE_CREATE", "roles.write", "Create/Edit Roles", "roles", "write", "ROLE_MANAGEMENT", 301));
        permissions.add(new PermissionDefinition("ROLE_DELETE", "roles.delete", "Delete Roles", "roles", "delete", "ROLE_MANAGEMENT", 302));
        permissions.add(new PermissionDefinition("ROLE_ADMIN", "roles.admin", "Role Administration", "roles", "admin", "ROLE_MANAGEMENT", 303));

        // Team Management Permissions
        permissions.add(new PermissionDefinition("TEAM_VIEW", "teams.read", "View Teams", "teams", "read", "TEAM_MANAGEMENT", 400));
        permissions.add(new PermissionDefinition("TEAM_CREATE", "teams.write", "Create/Edit Teams", "teams", "write", "TEAM_MANAGEMENT", 401));
        permissions.add(new PermissionDefinition("TEAM_DELETE", "teams.delete", "Delete Teams", "teams", "delete", "TEAM_MANAGEMENT", 402));
        permissions.add(new PermissionDefinition("TEAM_ADMIN", "teams.admin", "Team Administration", "teams", "admin", "TEAM_MANAGEMENT", 403));

        // Task Management Permissions
        permissions.add(new PermissionDefinition("TASK_VIEW", "tasks.read", "View Tasks", "tasks", "read", "TASK_MANAGEMENT", 500));
        permissions.add(new PermissionDefinition("TASK_CREATE", "tasks.write", "Create/Edit Tasks", "tasks", "write", "TASK_MANAGEMENT", 501));
        permissions.add(new PermissionDefinition("TASK_DELETE", "tasks.delete", "Delete Tasks", "tasks", "delete", "TASK_MANAGEMENT", 502));
        permissions.add(new PermissionDefinition("TASK_ADMIN", "tasks.admin", "Task Administration", "tasks", "admin", "TASK_MANAGEMENT", 503));
        permissions.add(new PermissionDefinition("TASK_TYPE_VIEW", "task-types.read", "View Task Types", "task-types", "read", "TASK_MANAGEMENT", 510));
        permissions.add(new PermissionDefinition("TASK_TYPE_CREATE", "task-types.write", "Create/Edit Task Types", "task-types", "write", "TASK_MANAGEMENT", 511));
        permissions.add(new PermissionDefinition("TASK_TYPE_DELETE", "task-types.delete", "Delete Task Types", "task-types", "delete", "TASK_MANAGEMENT", 512));

        // Project Management Permissions
        permissions.add(new PermissionDefinition("PROJECT_VIEW", "projects.read", "View Projects", "projects", "read", "PROJECT_MANAGEMENT", 600));
        permissions.add(new PermissionDefinition("PROJECT_CREATE", "projects.write", "Create/Edit Projects", "projects", "write", "PROJECT_MANAGEMENT", 601));
        permissions.add(new PermissionDefinition("PROJECT_DELETE", "projects.delete", "Delete Projects", "projects", "delete", "PROJECT_MANAGEMENT", 602));
        permissions.add(new PermissionDefinition("SPRINT_VIEW", "sprints.read", "View Sprints", "sprints", "read", "PROJECT_MANAGEMENT", 610));
        permissions.add(new PermissionDefinition("SPRINT_CREATE", "sprints.write", "Create/Edit Sprints", "sprints", "write", "PROJECT_MANAGEMENT", 611));
        permissions.add(new PermissionDefinition("SPRINT_DELETE", "sprints.delete", "Delete Sprints", "sprints", "delete", "PROJECT_MANAGEMENT", 612));

        // System Administration Permissions
        permissions.add(new PermissionDefinition("ADMIN_ACCESS", "system.read", "View System Settings", "system", "read", "SYSTEM_ADMIN", 900));
        permissions.add(new PermissionDefinition("SYSTEM_CONFIG", "system.write", "Modify System Settings", "system", "write", "SYSTEM_ADMIN", 901));
        permissions.add(new PermissionDefinition("SYSTEM_ADMIN", "system.admin", "System Administration", "system", "admin", "SYSTEM_ADMIN", 902));

        return permissions;
    }

    /**
     * Define default role-permission mappings
     */
    private Map<String, List<String>> getDefaultRolePermissions() {
        Map<String, List<String>> rolePermissions = new HashMap<>();

        // ADMIN Role: Full access to everything
        rolePermissions.put("ADMIN", Arrays.asList(
            "DASHBOARD_VIEW", "DASHBOARD_ADMIN",
            "USER_VIEW", "USER_CREATE", "USER_DELETE", "USER_ADMIN",
            "ROLE_VIEW", "ROLE_CREATE", "ROLE_DELETE", "ROLE_ADMIN",
            "TEAM_VIEW", "TEAM_CREATE", "TEAM_DELETE", "TEAM_ADMIN",
            "TASK_VIEW", "TASK_CREATE", "TASK_DELETE", "TASK_ADMIN",
            "TASK_TYPE_VIEW", "TASK_TYPE_CREATE", "TASK_TYPE_DELETE",
            "PROJECT_VIEW", "PROJECT_CREATE", "PROJECT_DELETE",
            "SPRINT_VIEW", "SPRINT_CREATE", "SPRINT_DELETE",
            "ADMIN_ACCESS", "SYSTEM_CONFIG", "SYSTEM_ADMIN"
        ));

        // DEV Role: Development-focused permissions
        rolePermissions.put("DEV", Arrays.asList(
            "DASHBOARD_VIEW",
            "TEAM_VIEW", "TEAM_CREATE",
            "TASK_VIEW", "TASK_CREATE", "TASK_DELETE",
            "TASK_TYPE_VIEW", "TASK_TYPE_CREATE",
            "PROJECT_VIEW", "PROJECT_CREATE",
            "SPRINT_VIEW", "SPRINT_CREATE"
        ));

        // QA Role: Quality assurance permissions
        rolePermissions.put("QA", Arrays.asList(
            "DASHBOARD_VIEW",
            "TEAM_VIEW",
            "TASK_VIEW", "TASK_CREATE",
            "TASK_TYPE_VIEW",
            "PROJECT_VIEW",
            "SPRINT_VIEW"
        ));

        // PROJECT_MANAGER Role: Project management permissions
        rolePermissions.put("PROJECT_MANAGER", Arrays.asList(
            "DASHBOARD_VIEW",
            "TEAM_VIEW", "TEAM_CREATE",
            "TASK_VIEW", "TASK_CREATE", "TASK_ADMIN",
            "TASK_TYPE_VIEW",
            "PROJECT_VIEW", "PROJECT_CREATE", "PROJECT_DELETE",
            "SPRINT_VIEW", "SPRINT_CREATE", "SPRINT_DELETE",
            "USER_VIEW"
        ));

        // VIEWER Role: Read-only access
        rolePermissions.put("VIEWER", Arrays.asList(
            "DASHBOARD_VIEW",
            "TEAM_VIEW",
            "TASK_VIEW",
            "TASK_TYPE_VIEW",
            "PROJECT_VIEW",
            "SPRINT_VIEW"
        ));

        return rolePermissions;
    }

    /**
     * Permission definition helper class
     */
    private static class PermissionDefinition {
        private final String code;
        private final String name;
        private final String description;
        private final String resource;
        private final String action;
        private final String category;
        private final Integer displayOrder;

        public PermissionDefinition(String code, String name, String description, String resource, 
                                  String action, String category, Integer displayOrder) {
            this.code = code;
            this.name = name;
            this.description = description;
            this.resource = resource;
            this.action = action;
            this.category = category;
            this.displayOrder = displayOrder;
        }

        public String getCode() { return code; }
        public String getName() { return name; }
        public String getDescription() { return description; }
        public String getResource() { return resource; }
        public String getAction() { return action; }
        public String getCategory() { return category; }
        public Integer getDisplayOrder() { return displayOrder; }
    }
}