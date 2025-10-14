package com.mislbd.spark.service;

import com.mislbd.spark.entity.Permission;
import com.mislbd.spark.entity.Role;
import com.mislbd.spark.entity.User;
import com.mislbd.spark.entity.UserRole;
import com.mislbd.spark.repository.PermissionRepository;
import com.mislbd.spark.repository.RolePermissionRepository;
import com.mislbd.spark.repository.UserRoleRepository;
import com.mislbd.spark.constants.PermissionConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for RBAC (Role-Based Access Control) operations
 * 
 * This service provides centralized methods for checking permissions,
 * managing role assignments, and enforcing access control throughout
 * the application.
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-12
 */
@Service
@Transactional
public class RBACService {
    
    @Autowired
    private UserRoleRepository userRoleRepository;
    
    @Autowired
    private PermissionRepository permissionRepository;
    
    @Autowired
    private RolePermissionRepository rolePermissionRepository;
    
    /**
     * Check if user has specific permission
     * 
     * @param userId User ID to check
     * @param permissionCode Permission code to check
     * @return true if user has permission
     */
    public boolean hasPermission(Long userId, String permissionCode) {
        return permissionRepository.userHasPermission(userId, permissionCode);
    }
    
    /**
     * Check if user has any of the specified permissions
     * 
     * @param userId User ID to check
     * @param permissionCodes List of permission codes
     * @return true if user has at least one permission
     */
    public boolean hasAnyPermission(Long userId, List<String> permissionCodes) {
        return permissionCodes.stream()
                .anyMatch(code -> permissionRepository.userHasPermission(userId, code));
    }
    
    /**
     * Check if user has all specified permissions
     * 
     * @param userId User ID to check
     * @param permissionCodes List of permission codes
     * @return true if user has all permissions
     */
    public boolean hasAllPermissions(Long userId, List<String> permissionCodes) {
        return permissionCodes.stream()
                .allMatch(code -> permissionRepository.userHasPermission(userId, code));
    }
    
    /**
     * Get all permissions for a user
     * 
     * @param userId User ID
     * @return Set of permission codes
     */
    public Set<String> getUserPermissions(Long userId) {
        return permissionRepository.findPermissionsByUserId(userId)
                .stream()
                .map(Permission::getCode)
                .collect(Collectors.toSet());
    }
    
    /**
     * Get effective roles for a user
     * 
     * @param userId User ID
     * @return List of effective user roles
     */
    public List<UserRole> getUserRoles(Long userId) {
        return userRoleRepository.findByUserIdAndActiveTrue(userId);
    }
    
    /**
     * Check if user can access specific page/module
     * 
     * @param userId User ID
     * @param module Module name (e.g., "teams", "roles", "task-types")
     * @return true if user can access the module
     */
    public boolean canAccessModule(Long userId, String module) {
        switch (module.toLowerCase()) {
            case "dashboard":
                return hasPermission(userId, PermissionConstants.DASHBOARD_VIEW);
            case "teams":
                return hasPermission(userId, PermissionConstants.TEAM_VIEW);
            case "roles":
                return hasPermission(userId, PermissionConstants.ROLE_VIEW);
            case "task-types":
                return hasPermission(userId, PermissionConstants.TASK_TYPE_VIEW);
            case "users":
                return hasPermission(userId, PermissionConstants.USER_VIEW);
            case "projects":
                return hasPermission(userId, PermissionConstants.PROJECT_VIEW);
            case "reports":
                return hasPermission(userId, PermissionConstants.REPORT_VIEW);
            case "admin":
                return hasPermission(userId, PermissionConstants.ADMIN_ACCESS);
            default:
                return false;
        }
    }
    
    /**
     * Check if user is admin
     * 
     * @param userId User ID
     * @return true if user has admin privileges
     */
    public boolean isAdmin(Long userId) {
        return hasPermission(userId, PermissionConstants.ADMIN_ACCESS) ||
               userRoleRepository.userHasRoleByName(userId, "ADMIN", LocalDateTime.now());
    }
    
    /**
     * Check if user is developer
     * 
     * @param userId User ID
     * @return true if user has developer role
     */
    public boolean isDeveloper(Long userId) {
        return userRoleRepository.findByUsernameAndActiveTrue("DEVELOPER").stream()
                .anyMatch(ur -> ur.getUser().getId().equals(userId));
    }

    /**
     * Check if user is QA
     * 
     * @param userId User ID
     * @return true if user has QA role
     */
    public boolean isQA(Long userId) {
        return userRoleRepository.findByRoleNameAndActiveTrue("QA").stream()
                .anyMatch(ur -> ur.getUser().getId().equals(userId));
    }    /**
     * Check CRUD permissions for an entity
     * 
     * @param userId User ID
     * @param entity Entity name (e.g., "team", "role", "user")
     * @param operation Operation (create, read, update, delete)
     * @return true if user can perform operation
     */
    public boolean canPerformOperation(Long userId, String entity, String operation) {
        String permissionCode = entity.toUpperCase() + "_" + operation.toUpperCase();
        return hasPermission(userId, permissionCode);
    }
    
    /**
     * Get accessible modules for a user
     * 
     * @param userId User ID
     * @return List of module names user can access
     */
    public List<String> getAccessibleModules(Long userId) {
        List<String> modules = List.of("dashboard", "teams", "roles", "task-types", 
                                      "users", "projects", "reports", "admin");
        
        return modules.stream()
                .filter(module -> canAccessModule(userId, module))
                .collect(Collectors.toList());
    }
    
    /**
     * Assign role to user
     * 
     * @param userId User ID
     * @param roleId Role ID
     * @param assignedBy Who assigned the role
     * @param expiresAt When the role expires (null for permanent)
     * @param isPrimary Whether this is the primary role
     * @return Created UserRole
     */
    public UserRole assignRole(Long userId, Long roleId, String assignedBy, 
                              LocalDateTime expiresAt, boolean isPrimary) {
        // Check if assignment already exists
        if (userRoleRepository.userHasRole(userId, roleId, LocalDateTime.now())) {
            throw new IllegalStateException("User already has this role");
        }
        
        // Create User and Role objects (you may want to inject UserRepository and RoleRepository)
        User user = new User();
        user.setId(userId);
        
        Role role = new Role();
        role.setId(roleId);
        
        UserRole userRole = new UserRole();
        userRole.setUser(user);
        userRole.setRole(role);
        userRole.setAssignedBy(assignedBy);
        userRole.setAssignedAt(LocalDateTime.now());
        userRole.setExpiresAt(expiresAt);
        userRole.setIsPrimary(isPrimary);
        userRole.setActive(true);
        
        // If this is primary role, remove primary flag from other roles
        if (isPrimary) {
            userRoleRepository.removeAllPrimaryRolesForUser(userId);
        }
        
        return userRoleRepository.save(userRole);
    }
    
    /**
     * Remove role from user
     * 
     * @param userId User ID
     * @param roleId Role ID
     * @return Number of roles deactivated
     */
    public int removeRole(Long userId, Long roleId) {
        return userRoleRepository.deactivateUserRole(userId, roleId);
    }
    
    /**
     * Expire old roles (cleanup job)
     * 
     * @return Number of roles expired
     */
    public int expireOldRoles() {
        return userRoleRepository.expireRoles(LocalDateTime.now());
    }
    
    /**
     * Get permission hierarchy for debugging
     * 
     * @param userId User ID
     * @return Detailed permission breakdown
     */
    public String getPermissionBreakdown(Long userId) {
        List<UserRole> roles = getUserRoles(userId);
        Set<String> permissions = getUserPermissions(userId);
        
        StringBuilder breakdown = new StringBuilder();
        breakdown.append("User ID: ").append(userId).append("\n");
        breakdown.append("Active Roles: ").append(roles.size()).append("\n");
        
        for (UserRole userRole : roles) {
            breakdown.append("- Role: ").append(userRole.getRole().getName())
                    .append(" (Primary: ").append(userRole.getIsPrimary()).append(")\n");
        }
        
        breakdown.append("Total Permissions: ").append(permissions.size()).append("\n");
        permissions.forEach(permission -> 
            breakdown.append("- ").append(permission).append("\n"));
        
        return breakdown.toString();
    }
}