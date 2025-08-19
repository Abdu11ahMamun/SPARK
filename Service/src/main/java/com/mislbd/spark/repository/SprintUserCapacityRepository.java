package com.mislbd.spark.repository;

import com.mislbd.spark.entity.SprintUserCapacity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Sprint User Capacity Management
 */
@Repository
public interface SprintUserCapacityRepository extends JpaRepository<SprintUserCapacity, Long> {

    /**
     * Find all capacity records for a specific sprint
     */
    List<SprintUserCapacity> findBySprintIdAndStatus(Integer sprintId, Integer status);

    /**
     * Find all capacity records for a specific sprint (including inactive)
     */
    List<SprintUserCapacity> findBySprintId(Integer sprintId);

    /**
     * Find capacity record for a specific user in a specific sprint
     */
    Optional<SprintUserCapacity> findBySprintIdAndUserId(Integer sprintId, Long userId);

    /**
     * Find all sprints a user is involved in
     */
    List<SprintUserCapacity> findByUserIdAndStatus(Long userId, Integer status);

    /**
     * Check if user is already assigned to sprint
     */
    boolean existsBySprintIdAndUserId(Integer sprintId, Long userId);

    /**
     * Get sprint capacity summary statistics
     */
    @Query("""
        SELECT 
            COUNT(suc) as totalMembers,
            SUM(suc.totalWorkingHours) as totalPotentialHours,
            SUM(suc.availableWorkingHours) as totalAvailableHours,
            SUM(suc.allocatedHours) as totalAllocatedHours,
            SUM(suc.remainingHours) as totalRemainingHours,
            SUM(suc.leaveDays) as totalLeaveDays,
            AVG(suc.userCapacityPercentage) as averageCapacity
        FROM SprintUserCapacity suc 
        WHERE suc.sprintId = :sprintId AND suc.status = 1
        """)
    Object[] getSprintCapacitySummary(@Param("sprintId") Integer sprintId);

    /**
     * Find over-allocated team members
     */
    @Query("""
        SELECT suc FROM SprintUserCapacity suc 
        WHERE suc.sprintId = :sprintId 
        AND suc.status = 1 
        AND suc.allocatedHours > suc.availableWorkingHours
        """)
    List<SprintUserCapacity> findOverAllocatedMembers(@Param("sprintId") Integer sprintId);

    /**
     * Find under-utilized team members (less than threshold utilization)
     */
    @Query("""
        SELECT suc FROM SprintUserCapacity suc 
        WHERE suc.sprintId = :sprintId 
        AND suc.status = 1 
        AND (suc.allocatedHours * 100 / suc.availableWorkingHours) < :utilizationThreshold
        """)
    List<SprintUserCapacity> findUnderUtilizedMembers(@Param("sprintId") Integer sprintId, 
                                                      @Param("utilizationThreshold") Double utilizationThreshold);

    /**
     * Delete all capacity records for a sprint
     */
    void deleteBySprintId(Integer sprintId);

    /**
     * Get team members with leave days
     */
    @Query("""
        SELECT suc FROM SprintUserCapacity suc 
        WHERE suc.sprintId = :sprintId 
        AND suc.status = 1 
        AND suc.leaveDays > 0
        ORDER BY suc.leaveDays DESC
        """)
    List<SprintUserCapacity> findMembersWithLeave(@Param("sprintId") Integer sprintId);
}
