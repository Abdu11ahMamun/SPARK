package com.mislbd.spark.repository;

import com.mislbd.spark.entity.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Repository interface for RolePermission entity
 * 
 * Manages the many-to-many relationship between roles and permissions
 * with additional audit and control capabilities.
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-12
 */
@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {
    
    /**
     * Find specific role-permission mapping
     */
    Optional<RolePermission> findByRoleIdAndPermissionId(Long roleId, Long permissionId);
    
    /**
     * Find all permissions for a role
     */
    List<RolePermission> findByRoleIdAndActiveTrue(Long roleId);
    
    /**
     * Find all roles with a specific permission
     */
    List<RolePermission> findByPermissionIdAndActiveTrue(Long permissionId);
    
    /**
     * Find role permissions by role name
     */
    @Query("SELECT rp FROM RolePermission rp WHERE rp.role.name = :roleName AND rp.active = true")
    List<RolePermission> findByRoleNameAndActiveTrue(@Param("roleName") String roleName);
    
    /**
     * Find role permissions by permission name
     */
    @Query("SELECT rp FROM RolePermission rp WHERE rp.permission.name = :permissionName AND rp.active = true")
    List<RolePermission> findByPermissionNameAndActiveTrue(@Param("permissionName") String permissionName);
    
    /**
     * Check if role has permission
     */
    @Query("SELECT COUNT(rp) > 0 FROM RolePermission rp " +
           "WHERE rp.role.id = :roleId AND rp.permission.id = :permissionId AND rp.active = true")
    boolean existsByRoleIdAndPermissionIdAndActiveTrue(@Param("roleId") Long roleId, @Param("permissionId") Long permissionId);
    
    /**
     * Get permissions for multiple roles
     */
    @Query("SELECT rp FROM RolePermission rp WHERE rp.role.id IN :roleIds AND rp.active = true")
    List<RolePermission> findByRoleIdInAndActiveTrue(@Param("roleIds") Set<Long> roleIds);
    
    /**
     * Get active role permissions with role and permission details
     */
    @Query("SELECT rp FROM RolePermission rp " +
           "JOIN FETCH rp.role r " +
           "JOIN FETCH rp.permission p " +
           "WHERE rp.active = true AND r.active = true AND p.active = true")
    List<RolePermission> findAllActiveWithDetails();
    
    /**
     * Count permissions per role
     */
    @Query("SELECT r.name, COUNT(rp) FROM RolePermission rp " +
           "JOIN rp.role r WHERE rp.active = true " +
           "GROUP BY r.id, r.name ORDER BY r.name")
    List<Object[]> countPermissionsByRole();
    
    /**
     * Count roles per permission
     */
    @Query("SELECT p.name, COUNT(rp) FROM RolePermission rp " +
           "JOIN rp.permission p WHERE rp.active = true " +
           "GROUP BY p.id, p.name ORDER BY p.name")
    List<Object[]> countRolesByPermission();
    
    /**
     * Find role permissions granted by specific user
     */
    List<RolePermission> findByGrantedByAndActiveTrue(String grantedBy);
    
    /**
     * Find role permissions granted within date range
     */
    @Query("SELECT rp FROM RolePermission rp WHERE rp.active = true " +
           "AND rp.grantedAt BETWEEN :startDate AND :endDate")
    List<RolePermission> findByGrantedAtBetweenAndActiveTrue(
        @Param("startDate") java.time.LocalDateTime startDate,
        @Param("endDate") java.time.LocalDateTime endDate);
    
    /**
     * Deactivate all permissions for a role (bulk operation)
     */
    @Modifying
    @Query("UPDATE RolePermission rp SET rp.active = false WHERE rp.role.id = :roleId")
    int deactivateAllPermissionsForRole(@Param("roleId") Long roleId);
    
    /**
     * Deactivate specific permission for a role
     */
    @Modifying
    @Query("UPDATE RolePermission rp SET rp.active = false " +
           "WHERE rp.role.id = :roleId AND rp.permission.id = :permissionId")
    int deactivateRolePermission(@Param("roleId") Long roleId, @Param("permissionId") Long permissionId);
    
    /**
     * Activate specific permission for a role
     */
    @Modifying
    @Query("UPDATE RolePermission rp SET rp.active = true " +
           "WHERE rp.role.id = :roleId AND rp.permission.id = :permissionId")
    int activateRolePermission(@Param("roleId") Long roleId, @Param("permissionId") Long permissionId);
    
    /**
     * Delete all permissions for a role (hard delete)
     */
    void deleteByRoleId(Long roleId);
    
    /**
     * Delete all roles for a permission (hard delete)
     */
    void deleteByPermissionId(Long permissionId);
    
    /**
     * Find role permissions that need cleanup (inactive role or permission)
     */
    @Query("SELECT rp FROM RolePermission rp " +
           "WHERE rp.active = true AND (rp.role.active = false OR rp.permission.active = false)")
    List<RolePermission> findInactiveRolePermissions();
    
    /**
     * Get role permission statistics
     */
    @Query("SELECT " +
           "COUNT(rp) as totalMappings, " +
           "COUNT(CASE WHEN rp.active = true THEN 1 END) as activeMappings, " +
           "COUNT(DISTINCT rp.role.id) as rolesWithPermissions, " +
           "COUNT(DISTINCT rp.permission.id) as permissionsAssigned " +
           "FROM RolePermission rp")
    Object[] getRolePermissionStatistics();


    
    // Additional methods needed by the services
    
    /**
     * Count permissions for a role
     */
    long countByRoleIdAndActiveTrue(Long roleId);
    
    /**
     * Count usage of a permission
     */
    long countByPermissionIdAndActiveTrue(Long permissionId);
    
    /**
     * Find role permission by role and permission IDs (active only)
     */
    Optional<RolePermission> findByRoleIdAndPermissionIdAndActiveTrue(Long roleId, Long permissionId);
    
    /**
     * Find role permissions with permission details for a role
     */
    @Query("SELECT rp FROM RolePermission rp " +
           "JOIN FETCH rp.permission p " +
           "WHERE rp.role.id = :roleId AND rp.active = true AND p.active = true " +
           "ORDER BY p.category, p.displayOrder")
    List<RolePermission> findByRoleIdWithPermissionDetails(@Param("roleId") Long roleId);
}