
package com.mislbd.spark.constants;

/**
 * Constants for RBAC permission codes
 * 
 * This class contains all permission codes used throughout the RBAC system.
 * These constants ensure type safety and prevent typos when checking permissions.
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-12
 */
public final class PermissionConstants {
    
    // Prevent instantiation
    private PermissionConstants() {
        throw new AssertionError("Constants class should not be instantiated");
    }
    
    // Dashboard Module
    public static final String DASHBOARD_VIEW = "DASHBOARD_VIEW";
    public static final String DASHBOARD_ADMIN = "DASHBOARD_ADMIN";
    
    // Team Management
    public static final String TEAM_VIEW = "TEAM_VIEW";
    public static final String TEAM_CREATE = "TEAM_CREATE";
    public static final String TEAM_UPDATE = "TEAM_UPDATE";
    public static final String TEAM_DELETE = "TEAM_DELETE";
    
    // Role Management
    public static final String ROLE_VIEW = "ROLE_VIEW";
    public static final String ROLE_CREATE = "ROLE_CREATE";
    public static final String ROLE_UPDATE = "ROLE_UPDATE";
    public static final String ROLE_DELETE = "ROLE_DELETE";
    
    // User Management
    public static final String USER_VIEW = "USER_VIEW";
    public static final String USER_CREATE = "USER_CREATE";
    public static final String USER_UPDATE = "USER_UPDATE";
    public static final String USER_DELETE = "USER_DELETE";
    
    // Task Type Management
    public static final String TASK_TYPE_VIEW = "TASK_TYPE_VIEW";
    public static final String TASK_TYPE_CREATE = "TASK_TYPE_CREATE";
    public static final String TASK_TYPE_UPDATE = "TASK_TYPE_UPDATE";
    public static final String TASK_TYPE_DELETE = "TASK_TYPE_DELETE";
    
    // Project Management
    public static final String PROJECT_VIEW = "PROJECT_VIEW";
    public static final String PROJECT_CREATE = "PROJECT_CREATE";
    public static final String PROJECT_UPDATE = "PROJECT_UPDATE";
    public static final String PROJECT_DELETE = "PROJECT_DELETE";
    
    // Reporting
    public static final String REPORT_VIEW = "REPORT_VIEW";
    public static final String REPORT_GENERATE = "REPORT_GENERATE";
    
    // System Administration
    public static final String ADMIN_ACCESS = "ADMIN_ACCESS";
    public static final String SYSTEM_CONFIG = "SYSTEM_CONFIG";
    
    // Permission Categories (for grouping)
    public static final class Categories {
        public static final String READ = "READ";
        public static final String WRITE = "WRITE";
        public static final String DELETE = "DELETE";
        public static final String ADMIN = "ADMIN";
    }
    
    // Module Names (for permission checking)
    public static final class Modules {
        public static final String DASHBOARD = "DASHBOARD";
        public static final String TEAM = "TEAM";
        public static final String ROLE = "ROLE";
        public static final String USER = "USER";
        public static final String TASK_TYPE = "TASK_TYPE";
        public static final String PROJECT = "PROJECT";
        public static final String REPORT = "REPORT";
        public static final String SYSTEM = "SYSTEM";
    }
    
    // Role Names (for quick role checking)
    public static final class Roles {
        public static final String ADMIN = "ADMIN";
        public static final String PROJECT_MANAGER = "PROJECT_MANAGER";
        public static final String DEVELOPER = "DEVELOPER";
        public static final String QA = "QA";
        public static final String USER = "USER";
    }
}