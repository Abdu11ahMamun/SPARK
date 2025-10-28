
package com.mislbd.spark.repository;

import com.mislbd.spark.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Repository interface for UserRole entity
 * 
 * Manages the many-to-many relationship between users and roles
 * with support for role assignment tracking and expiration.
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-12
 */
@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, Long> {
    
    /**
     * Find specific user-role mapping
     */
    Optional<UserRole> findByUserIdAndRoleId(Long userId, Long roleId);
    
    /**
     * Find all roles for a user (active only)
     */
    List<UserRole> findByUserIdAndActiveTrue(Long userId);
    
    /**
     * Find all effective roles for a user (active and not expired)
     */
    @Query("SELECT ur FROM UserRole ur WHERE ur.user.id = :userId AND ur.active = true " +
           "AND (ur.expiresAt IS NULL OR ur.expiresAt > :now)")
    List<UserRole> findEffectiveRolesByUserId(@Param("userId") Long userId, @Param("now") LocalDateTime now);
    
    /**
     * Find all users with a specific role
     */
    List<UserRole> findByRoleIdAndActiveTrue(Long roleId);
    
    /**
     * Find user's primary role
     */
    Optional<UserRole> findByUserIdAndIsPrimaryTrueAndActiveTrue(Long userId);
    
    /**
     * Find users by role name
     */
    @Query("SELECT ur FROM UserRole ur WHERE ur.role.name = :roleName AND ur.active = true")
    List<UserRole> findByRoleNameAndActiveTrue(@Param("roleName") String roleName);
    
    /**
     * Find user roles by username
     */
    @Query("SELECT ur FROM UserRole ur WHERE ur.user.username = :username AND ur.active = true")
    List<UserRole> findByUsernameAndActiveTrue(@Param("username") String username);
    
    /**
     * Check if user has specific role
     */
    @Query("SELECT COUNT(ur) > 0 FROM UserRole ur " +
           "WHERE ur.user.id = :userId AND ur.role.id = :roleId AND ur.active = true " +
           "AND (ur.expiresAt IS NULL OR ur.expiresAt > :now)")
    boolean userHasRole(@Param("userId") Long userId, @Param("roleId") Long roleId, @Param("now") LocalDateTime now);
    
    /**
     * Check if user has role by name
     */
    @Query("SELECT COUNT(ur) > 0 FROM UserRole ur " +
           "WHERE ur.user.id = :userId AND ur.role.name = :roleName AND ur.active = true " +
           "AND (ur.expiresAt IS NULL OR ur.expiresAt > :now)")
    boolean userHasRoleByName(@Param("userId") Long userId, @Param("roleName") String roleName, @Param("now") LocalDateTime now);
    
    /**
     * Get roles for multiple users
     */
    @Query("SELECT ur FROM UserRole ur WHERE ur.user.id IN :userIds AND ur.active = true")
    List<UserRole> findByUserIdInAndActiveTrue(@Param("userIds") Set<Long> userIds);
    
    /**
     * Find expired role assignments
     */
    @Query("SELECT ur FROM UserRole ur WHERE ur.active = true AND ur.expiresAt < :now")
    List<UserRole> findExpiredRoles(@Param("now") LocalDateTime now);
    
    /**
     * Find roles expiring soon (within specified days)
     */
    @Query("SELECT ur FROM UserRole ur WHERE ur.active = true " +
           "AND ur.expiresAt BETWEEN :now AND :expiryThreshold")
    List<UserRole> findRolesExpiringSoon(@Param("now") LocalDateTime now, 
                                        @Param("expiryThreshold") LocalDateTime expiryThreshold);
    
    /**
     * Count users per role
     */
    @Query("SELECT r.name, COUNT(ur) FROM UserRole ur " +
           "JOIN ur.role r WHERE ur.active = true " +
           "GROUP BY r.id, r.name ORDER BY r.name")
    List<Object[]> countUsersByRole();
    
    /**
     * Count roles per user
     */
    @Query("SELECT u.username, COUNT(ur) FROM UserRole ur " +
           "JOIN ur.user u WHERE ur.active = true " +
           "GROUP BY u.id, u.username ORDER BY u.username")
    List<Object[]> countRolesByUser();
    
    /**
     * Find user roles assigned by specific user
     */
    List<UserRole> findByAssignedByAndActiveTrue(String assignedBy);
    
    /**
     * Find user roles assigned within date range
     */
    @Query("SELECT ur FROM UserRole ur WHERE ur.active = true " +
           "AND ur.assignedAt BETWEEN :startDate AND :endDate")
    List<UserRole> findByAssignedAtBetweenAndActiveTrue(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);
    
    /**
     * Get active user roles with user and role details
     */
    @Query("SELECT ur FROM UserRole ur " +
           "JOIN FETCH ur.user u " +
           "JOIN FETCH ur.role r " +
           "WHERE ur.active = true AND r.active = true")
    List<UserRole> findAllActiveWithDetails();
    
    /**
     * Deactivate all roles for a user (bulk operation)
     */
    @Modifying
    @Query("UPDATE UserRole ur SET ur.active = false WHERE ur.user.id = :userId")
    int deactivateAllRolesForUser(@Param("userId") Long userId);
    
    /**
     * Deactivate specific role for a user
     */
    @Modifying
    @Query("UPDATE UserRole ur SET ur.active = false " +
           "WHERE ur.user.id = :userId AND ur.role.id = :roleId")
    int deactivateUserRole(@Param("userId") Long userId, @Param("roleId") Long roleId);
    
    /**
     * Activate specific role for a user
     */
    @Modifying
    @Query("UPDATE UserRole ur SET ur.active = true " +
           "WHERE ur.user.id = :userId AND ur.role.id = :roleId")
    int activateUserRole(@Param("userId") Long userId, @Param("roleId") Long roleId);
    
    /**
     * Set primary role for user (deactivate all other primary flags first)
     */
    @Modifying
    @Query("UPDATE UserRole ur SET ur.isPrimary = false WHERE ur.user.id = :userId")
    int removeAllPrimaryRolesForUser(@Param("userId") Long userId);
    
    /**
     * Set specific role as primary for user
     */
    @Modifying
    @Query("UPDATE UserRole ur SET ur.isPrimary = true " +
           "WHERE ur.user.id = :userId AND ur.role.id = :roleId AND ur.active = true")
    int setPrimaryRoleForUser(@Param("userId") Long userId, @Param("roleId") Long roleId);
    
    /**
     * Expire roles (set active = false for expired ones)
     */
    @Modifying
    @Query("UPDATE UserRole ur SET ur.active = false WHERE ur.expiresAt < :now AND ur.active = true")
    int expireRoles(@Param("now") LocalDateTime now);
    
    /**
     * Delete all roles for a user (hard delete)
     */
    void deleteByUserId(Long userId);
    
    /**
     * Delete all users for a role (hard delete)
     */
    void deleteByRoleId(Long roleId);
    
    /**
     * Find user roles that need cleanup (inactive user or role)
     */
    @Query("SELECT ur FROM UserRole ur " +
           "WHERE ur.active = true AND ur.role.active = false")
    List<UserRole> findInactiveUserRoles();
    
    /**
     * Get user role statistics
     */
    @Query("SELECT " +
           "COUNT(ur) as totalAssignments, " +
           "COUNT(CASE WHEN ur.active = true THEN 1 END) as activeAssignments, " +
           "COUNT(CASE WHEN ur.isPrimary = true THEN 1 END) as primaryAssignments, " +
           "COUNT(CASE WHEN ur.expiresAt < :now THEN 1 END) as expiredAssignments, " +
           "COUNT(DISTINCT ur.user.id) as usersWithRoles, " +
           "COUNT(DISTINCT ur.role.id) as rolesAssigned " +
           "FROM UserRole ur")
    Object[] getUserRoleStatistics(@Param("now") LocalDateTime now);
}