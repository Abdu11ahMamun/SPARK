package com.mislbd.spark.repository;

import com.mislbd.spark.entity.User;
import com.mislbd.spark.entity.UserSessionMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for UserSessionMetadata Entity
 * 
 * Handles CRUD operations and custom queries for user session metadata
 * that stores RBAC information for fast authorization checking.
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-22
 */
@Repository
public interface UserSessionMetadataRepository extends JpaRepository<UserSessionMetadata, Long> {

    /**
     * Find active session by session token
     */
    @Query("SELECT s FROM UserSessionMetadata s WHERE s.sessionToken = :token AND s.active = true")
    Optional<UserSessionMetadata> findBySessionTokenAndActive(@Param("token") String sessionToken);

    /**
     * Find all active sessions for a user
     */
    @Query("SELECT s FROM UserSessionMetadata s WHERE s.user = :user AND s.active = true ORDER BY s.createdAt DESC")
    List<UserSessionMetadata> findActiveSessionsByUser(@Param("user") User user);

    /**
     * Find all active sessions for a user by user ID
     */
    @Query("SELECT s FROM UserSessionMetadata s WHERE s.user.id = :userId AND s.active = true ORDER BY s.createdAt DESC")
    List<UserSessionMetadata> findActiveSessionsByUserId(@Param("userId") Long userId);

    /**
     * Count active sessions for a user
     */
    @Query("SELECT COUNT(s) FROM UserSessionMetadata s WHERE s.user.id = :userId AND s.active = true")
    long countActiveSessionsByUserId(@Param("userId") Long userId);

    /**
     * Find sessions that have expired
     */
    @Query("SELECT s FROM UserSessionMetadata s WHERE s.active = true AND s.expiresAt < :now")
    List<UserSessionMetadata> findExpiredSessions(@Param("now") LocalDateTime now);

    /**
     * Find sessions with no activity for specified duration
     */
    @Query("SELECT s FROM UserSessionMetadata s WHERE s.active = true AND s.lastActivityAt < :cutoffTime")
    List<UserSessionMetadata> findInactiveSessions(@Param("cutoffTime") LocalDateTime cutoffTime);

    /**
     * Invalidate all sessions for a user
     */
    @Modifying
    @Query("UPDATE UserSessionMetadata s SET s.active = false, s.lastActivityAt = CURRENT_TIMESTAMP WHERE s.user.id = :userId AND s.active = true")
    int invalidateAllUserSessions(@Param("userId") Long userId);

    /**
     * Invalidate specific session
     */
    @Modifying
    @Query("UPDATE UserSessionMetadata s SET s.active = false, s.lastActivityAt = CURRENT_TIMESTAMP WHERE s.sessionToken = :token")
    int invalidateSession(@Param("token") String sessionToken);

    /**
     * Update last activity for a session
     */
    @Modifying
    @Query("UPDATE UserSessionMetadata s SET s.lastActivityAt = :now WHERE s.sessionToken = :token AND s.active = true")
    int updateLastActivity(@Param("token") String sessionToken, @Param("now") LocalDateTime now);

    /**
     * Clean up expired sessions
     */
    @Modifying
    @Query("UPDATE UserSessionMetadata s SET s.active = false WHERE s.expiresAt < :now AND s.active = true")
    int cleanupExpiredSessions(@Param("now") LocalDateTime now);

    /**
     * Clean up inactive sessions (based on last activity)
     */
    @Modifying
    @Query("UPDATE UserSessionMetadata s SET s.active = false WHERE s.lastActivityAt < :cutoffTime AND s.active = true")
    int cleanupInactiveSessions(@Param("cutoffTime") LocalDateTime cutoffTime);

    /**
     * Find sessions by IP address (security monitoring)
     */
    @Query("SELECT s FROM UserSessionMetadata s WHERE s.ipAddress = :ipAddress AND s.active = true ORDER BY s.createdAt DESC")
    List<UserSessionMetadata> findActiveSessionsByIpAddress(@Param("ipAddress") String ipAddress);

    /**
     * Find sessions by device type
     */
    @Query("SELECT s FROM UserSessionMetadata s WHERE s.deviceType = :deviceType AND s.active = true ORDER BY s.createdAt DESC")
    List<UserSessionMetadata> findActiveSessionsByDeviceType(@Param("deviceType") String deviceType);

    /**
     * Find admin sessions (for monitoring)
     */
    @Query("SELECT s FROM UserSessionMetadata s WHERE s.isAdmin = true AND s.active = true ORDER BY s.createdAt DESC")
    List<UserSessionMetadata> findActiveAdminSessions();

    /**
     * Find system admin sessions (for security monitoring)
     */
    @Query("SELECT s FROM UserSessionMetadata s WHERE s.isSystemAdmin = true AND s.active = true ORDER BY s.createdAt DESC")
    List<UserSessionMetadata> findActiveSystemAdminSessions();

    /**
     * Get session statistics
     */
    @Query("SELECT COUNT(s), AVG(s.permissionsCount), MAX(s.lastActivityAt) FROM UserSessionMetadata s WHERE s.active = true")
    List<Object[]> getSessionStatistics();

    /**
     * Find sessions created between dates
     */
    @Query("SELECT s FROM UserSessionMetadata s WHERE s.createdAt BETWEEN :startDate AND :endDate ORDER BY s.createdAt DESC")
    List<UserSessionMetadata> findSessionsBetweenDates(@Param("startDate") LocalDateTime startDate, 
                                                       @Param("endDate") LocalDateTime endDate);

    /**
     * Find most recent session for user (for single session enforcement)
     */
    @Query("SELECT s FROM UserSessionMetadata s WHERE s.user.id = :userId ORDER BY s.createdAt DESC")
    List<UserSessionMetadata> findLatestSessionByUserId(@Param("userId") Long userId);
}