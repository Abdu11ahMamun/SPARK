package com.mislbd.spark.entity.types;

/**
 * Permission Constants for RBAC System
 * 
 * This class contains all system permissions as constants to ensure
 * type safety and prevent typos when checking permissions in code.
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-12
 */
public final class PermissionConstants {
    
    // Prevent instantiation
    private PermissionConstants() {
        throw new AssertionError("Cannot instantiate constants class");
    }
    
    // ============================================================================
    // DASHBOARD PERMISSIONS
    // ============================================================================
    public static final String DASHBOARD_READ = "dashboard.read";
    public static final String DASHBOARD_ADMIN = "dashboard.admin";
    
    // ============================================================================
    // USER MANAGEMENT PERMISSIONS
    // ============================================================================
    public static final String USERS_READ = "users.read";
    public static final String USERS_WRITE = "users.write";
    public static final String USERS_DELETE = "users.delete";
    public static final String USERS_ADMIN = "users.admin";
    
    // ============================================================================
    // ROLE MANAGEMENT PERMISSIONS
    // ============================================================================
    public static final String ROLES_READ = "roles.read";
    public static final String ROLES_WRITE = "roles.write";
    public static final String ROLES_DELETE = "roles.delete";
    public static final String ROLES_ADMIN = "roles.admin";
    
    // ============================================================================
    // TEAM MANAGEMENT PERMISSIONS
    // ============================================================================
    public static final String TEAMS_READ = "teams.read";
    public static final String TEAMS_WRITE = "teams.write";
    public static final String TEAMS_DELETE = "teams.delete";
    public static final String TEAMS_ADMIN = "teams.admin";
    
    // ============================================================================
    // TASK MANAGEMENT PERMISSIONS
    // ============================================================================
    public static final String TASKS_READ = "tasks.read";
    public static final String TASKS_WRITE = "tasks.write";
    public static final String TASKS_DELETE = "tasks.delete";
    public static final String TASKS_ADMIN = "tasks.admin";
    
    public static final String TASK_TYPES_READ = "task-types.read";
    public static final String TASK_TYPES_WRITE = "task-types.write";
    public static final String TASK_TYPES_DELETE = "task-types.delete";
    
    // ============================================================================
    // PROJECT MANAGEMENT PERMISSIONS
    // ============================================================================
    public static final String PROJECTS_READ = "projects.read";
    public static final String PROJECTS_WRITE = "projects.write";
    public static final String PROJECTS_DELETE = "projects.delete";
    
    public static final String SPRINTS_READ = "sprints.read";
    public static final String SPRINTS_WRITE = "sprints.write";
    public static final String SPRINTS_DELETE = "sprints.delete";
    
    // ============================================================================
    // SYSTEM ADMINISTRATION PERMISSIONS
    // ============================================================================
    public static final String SYSTEM_READ = "system.read";
    public static final String SYSTEM_WRITE = "system.write";
    public static final String SYSTEM_ADMIN = "system.admin";
    
    // ============================================================================
    // PERMISSION CATEGORIES
    // ============================================================================
    public static final class Categories {
        public static final String DASHBOARD = "DASHBOARD";
        public static final String USER_MANAGEMENT = "USER_MANAGEMENT";
        public static final String ROLE_MANAGEMENT = "ROLE_MANAGEMENT";
        public static final String TEAM_MANAGEMENT = "TEAM_MANAGEMENT";
        public static final String TASK_MANAGEMENT = "TASK_MANAGEMENT";
        public static final String PROJECT_MANAGEMENT = "PROJECT_MANAGEMENT";
        public static final String SYSTEM_ADMIN = "SYSTEM_ADMIN";
    }
    
    // ============================================================================
    // PERMISSION ACTIONS
    // ============================================================================
    public static final class Actions {
        public static final String READ = "read";
        public static final String WRITE = "write";
        public static final String DELETE = "delete";
        public static final String ADMIN = "admin";
        public static final String EXECUTE = "execute";
    }
    
    // ============================================================================
    // RESOURCES
    // ============================================================================
    public static final class Resources {
        public static final String DASHBOARD = "dashboard";
        public static final String USERS = "users";
        public static final String ROLES = "roles";
        public static final String TEAMS = "teams";
        public static final String TASKS = "tasks";
        public static final String TASK_TYPES = "task-types";
        public static final String PROJECTS = "projects";
        public static final String SPRINTS = "sprints";
        public static final String SYSTEM = "system";
    }
    
    // ============================================================================
    // DEFAULT ROLE NAMES
    // ============================================================================
    public static final class Roles {
        public static final String ADMIN = "ADMIN";
        public static final String DEV = "DEV";
        public static final String QA = "QA";
        public static final String PROJECT_MANAGER = "PROJECT_MANAGER";
        public static final String VIEWER = "VIEWER";
    }
    
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    
    /**
     * Create permission name from resource and action
     */
    public static String createPermission(String resource, String action) {
        return resource + "." + action;
    }
    
    /**
     * Extract resource from permission name
     */
    public static String extractResource(String permission) {
        int dotIndex = permission.indexOf('.');
        return dotIndex > 0 ? permission.substring(0, dotIndex) : permission;
    }
    
    /**
     * Extract action from permission name
     */
    public static String extractAction(String permission) {
        int dotIndex = permission.indexOf('.');
        return dotIndex > 0 && dotIndex < permission.length() - 1 
               ? permission.substring(dotIndex + 1) 
               : "";
    }
    
    /**
     * Check if permission name is valid format
     */
    public static boolean isValidPermissionFormat(String permission) {
        return permission != null && 
               permission.contains(".") && 
               !permission.startsWith(".") && 
               !permission.endsWith(".");
    }
    
    /**
     * Get all available permissions as array
     */
    public static String[] getAllPermissions() {
        return new String[] {
            // Dashboard
            DASHBOARD_READ, DASHBOARD_ADMIN,
            
            // Users
            USERS_READ, USERS_WRITE, USERS_DELETE, USERS_ADMIN,
            
            // Roles
            ROLES_READ, ROLES_WRITE, ROLES_DELETE, ROLES_ADMIN,
            
            // Teams
            TEAMS_READ, TEAMS_WRITE, TEAMS_DELETE, TEAMS_ADMIN,
            
            // Tasks
            TASKS_READ, TASKS_WRITE, TASKS_DELETE, TASKS_ADMIN,
            TASK_TYPES_READ, TASK_TYPES_WRITE, TASK_TYPES_DELETE,
            
            // Projects
            PROJECTS_READ, PROJECTS_WRITE, PROJECTS_DELETE,
            SPRINTS_READ, SPRINTS_WRITE, SPRINTS_DELETE,
            
            // System
            SYSTEM_READ, SYSTEM_WRITE, SYSTEM_ADMIN
        };
    }
}