package com.mislbd.spark.repository;

import com.mislbd.spark.entity.Permission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Repository interface for Permission entity
 * 
 * Provides data access operations for permission management
 * including custom queries for RBAC functionality.
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-12
 */
@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    
    /**
     * Find permission by name (unique)
     */
    Optional<Permission> findByName(String name);
    
    /**
     * Find permission by resource and action
     */
    Optional<Permission> findByResourceAndAction(String resource, String action);
    
    /**
     * Find all permissions for a specific resource
     */
    List<Permission> findByResourceAndActiveTrue(String resource);
    
    /**
     * Find all permissions by category
     */
    List<Permission> findByCategoryAndActiveTrueOrderByDisplayOrder(String category);
    
    /**
     * Find all active permissions ordered by category and display order
     */
    List<Permission> findByActiveTrueOrderByCategoryAscDisplayOrderAsc();
    
    /**
     * Find permissions by names (for bulk operations)
     */
    List<Permission> findByNameInAndActiveTrue(Set<String> names);
    
    /**
     * Find system permissions (cannot be deleted)
     */
    List<Permission> findBySystemPermissionTrueAndActiveTrue();
    
    /**
     * Find non-system permissions (can be deleted)
     */
    List<Permission> findBySystemPermissionFalseAndActiveTrue();
    
    /**
     * Search permissions by name or description
     */
    @Query("SELECT p FROM Permission p WHERE p.active = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Permission> searchPermissions(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    /**
     * Get permissions grouped by category
     */
    @Query("SELECT DISTINCT p.category FROM Permission p WHERE p.active = true ORDER BY p.category")
    List<String> findDistinctCategoriesOrderByCategory();
    
    /**
     * Count permissions by category
     */
    @Query("SELECT p.category, COUNT(p) FROM Permission p WHERE p.active = true GROUP BY p.category")
    List<Object[]> countPermissionsByCategory();
    
    /**
     * Find permissions not assigned to a specific role
     */
    @Query("SELECT p FROM Permission p WHERE p.active = true AND " +
           "p.id NOT IN (SELECT rp.permission.id FROM RolePermission rp WHERE rp.role.id = :roleId AND rp.active = true)")
    List<Permission> findPermissionsNotAssignedToRole(@Param("roleId") Long roleId);
    
    /**
     * Find permissions assigned to a specific role
     */
    @Query("SELECT p FROM Permission p JOIN RolePermission rp ON p.id = rp.permission.id " +
           "WHERE rp.role.id = :roleId AND rp.active = true AND p.active = true")
    List<Permission> findPermissionsAssignedToRole(@Param("roleId") Long roleId);
    
    /**
     * Find permissions by user (through roles)
     */
    @Query("SELECT DISTINCT p FROM Permission p " +
           "JOIN RolePermission rp ON p.id = rp.permission.id " +
           "JOIN UserRole ur ON rp.role.id = ur.role.id " +
           "WHERE ur.user.id = :userId AND ur.active = true AND rp.active = true AND p.active = true")
    List<Permission> findPermissionsByUserId(@Param("userId") Long userId);
    
    /**
     * Check if user has specific permission
     */
    @Query("SELECT COUNT(p) > 0 FROM Permission p " +
           "JOIN RolePermission rp ON p.id = rp.permission.id " +
           "JOIN UserRole ur ON rp.role.id = ur.role.id " +
           "WHERE ur.user.id = :userId AND p.name = :permissionName " +
           "AND ur.active = true AND rp.active = true AND p.active = true")
    boolean userHasPermission(@Param("userId") Long userId, @Param("permissionName") String permissionName);
    
    /**
     * Check if role has specific permission
     */
    @Query("SELECT COUNT(p) > 0 FROM Permission p " +
           "JOIN RolePermission rp ON p.id = rp.permission.id " +
           "WHERE rp.role.id = :roleId AND p.name = :permissionName " +
           "AND rp.active = true AND p.active = true")
    boolean roleHasPermission(@Param("roleId") Long roleId, @Param("permissionName") String permissionName);
    
    /**
     * Get permission statistics
     */
    @Query("SELECT " +
           "COUNT(p) as totalPermissions, " +
           "COUNT(CASE WHEN p.systemPermission = true THEN 1 END) as systemPermissions, " +
           "COUNT(CASE WHEN p.active = true THEN 1 END) as activePermissions " +
           "FROM Permission p")
    Object[] getPermissionStatistics();
    
    // Additional methods needed by PermissionService
    
    /**
     * Find all permissions ordered by category and display order
     */
    List<Permission> findAllByOrderByCategoryAscDisplayOrderAsc();
    
    /**
     * Find all active permissions
     */
    List<Permission> findByActiveTrue();
    
    /**
     * Find permission by code
     */
    Optional<Permission> findByCode(String code);
    
    /**
     * Check if permission exists by code
     */
    boolean existsByCode(String code);
    
    /**
     * Find permissions by category ordered by display order
     */
    List<Permission> findByCategoryOrderByDisplayOrder(String category);
    
    /**
     * Find permissions by resource ordered by display order  
     */
    List<Permission> findByResourceOrderByDisplayOrder(String resource);
    
    /**
     * Count active permissions
     */
    long countByActiveTrue();
    
    /**
     * Count system permissions
     */
    long countBySystemPermissionTrue();
    
    /**
     * Find permissions not assigned to any role
     */
    @Query("SELECT p FROM Permission p WHERE p.active = true AND " +
           "p.id NOT IN (SELECT rp.permission.id FROM RolePermission rp WHERE rp.active = true)")
    List<Permission> findUnassignedPermissions();
}