package com.mislbd.spark.repository;

import com.mislbd.spark.entity.SprintInfo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Sprint Information Repository - Industry Standard Implementation
 * Provides data access operations for sprint management
 * 
 * @author SPARK Team
 * @version 1.0.0
 * @since 2025-08-17
 */
@Repository
public interface SprintInfoRepository extends JpaRepository<SprintInfo, Integer> {
    
    /**
     * Find sprints by status
     * @param status Sprint status (1 = active, 0 = inactive)
     * @return List of sprints with specified status
     */
    List<SprintInfo> findByStatus(Integer status);
    
    /**
     * Find sprints by team ID
     * @param teamId Team ID
     * @return List of sprints for the team
     */
    List<SprintInfo> findByTramId(Integer teamId);
    
    /**
     * Find sprints by team ID and status
     * @param teamId Team ID
     * @param status Sprint status
     * @return List of sprints for the team with specified status
     */
    List<SprintInfo> findByTramIdAndStatus(Integer teamId, Integer status);
    
    /**
     * Find sprints within date range
     * @param fromDate Start date
     * @param toDate End date
     * @return List of sprints within the date range
     */
    @Query("SELECT s FROM SprintInfo s WHERE s.fromDate >= :fromDate AND s.toDate <= :toDate")
    List<SprintInfo> findSprintsByDateRange(@Param("fromDate") LocalDate fromDate, 
                                           @Param("toDate") LocalDate toDate);
    
    /**
     * Find active sprints for a team within date range
     * @param teamId Team ID
     * @param fromDate Start date
     * @param toDate End date
     * @return List of active sprints for team within date range
     */
    @Query("SELECT s FROM SprintInfo s WHERE s.tramId = :teamId AND s.status = 1 " +
           "AND ((s.fromDate BETWEEN :fromDate AND :toDate) OR " +
           "(s.toDate BETWEEN :fromDate AND :toDate) OR " +
           "(s.fromDate <= :fromDate AND s.toDate >= :toDate))")
    List<SprintInfo> findActiveSprintsByTeamAndDateRange(@Param("teamId") Integer teamId,
                                                        @Param("fromDate") LocalDate fromDate,
                                                        @Param("toDate") LocalDate toDate);
    
    /**
     * Find sprints by sprint name containing text (case-insensitive)
     * @param sprintName Sprint name search term
     * @param pageable Pagination information
     * @return Page of sprints matching the name criteria
     */
    @Query("SELECT s FROM SprintInfo s WHERE LOWER(s.sprintName) LIKE LOWER(CONCAT('%', :sprintName, '%'))")
    Page<SprintInfo> findBySprintNameContainingIgnoreCase(@Param("sprintName") String sprintName, 
                                                          Pageable pageable);
    
    /**
     * Count active sprints for a team
     * @param teamId Team ID
     * @return Number of active sprints for the team
     */
    @Query("SELECT COUNT(s) FROM SprintInfo s WHERE s.tramId = :teamId AND s.status = 1")
    Long countActiveSprintsByTeam(@Param("teamId") Integer teamId);
    
    /**
     * Find current active sprints (sprints that are currently ongoing)
     * @param currentDate Current date
     * @return List of currently active sprints
     */
    @Query("SELECT s FROM SprintInfo s WHERE s.status = 1 AND :currentDate BETWEEN s.fromDate AND s.toDate")
    List<SprintInfo> findCurrentActiveSprintsByDate(@Param("currentDate") LocalDate currentDate);
}
