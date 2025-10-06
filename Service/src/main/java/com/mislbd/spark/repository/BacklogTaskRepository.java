package com.mislbd.spark.repository;

import com.mislbd.spark.entity.BacklogTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BacklogTaskRepository extends JpaRepository<BacklogTask, Integer> {
    // Undone tasks by team (status NOT in DONE/CANCELLED)
    @Query("SELECT t FROM BacklogTask t WHERE t.teamId = :teamId AND (t.status IS NULL OR UPPER(t.status) NOT IN ('DONE','COMPLETED','CANCELLED'))")
    List<BacklogTask> findUndoneTasksByTeamExcludingSprint(@Param("teamId") Integer teamId);
    
    // Find tasks assigned to a specific user
    @Query("SELECT t FROM BacklogTask t WHERE t.assignedto = :userId")
    List<BacklogTask> findByAssignedToUserId(@Param("userId") Integer userId);
    
    // Find tasks assigned to a user in a specific team
    @Query("SELECT t FROM BacklogTask t WHERE t.assignedto = :userId AND t.teamId = :teamId")
    List<BacklogTask> findByAssignedToUserIdAndTeamId(@Param("userId") Integer userId, @Param("teamId") Integer teamId);
    
    // Find active tasks assigned to a user in a specific team (not DONE/CANCELLED)
    @Query("SELECT t FROM BacklogTask t WHERE t.assignedto = :userId AND t.teamId = :teamId AND " +
           "(t.status IS NULL OR UPPER(t.status) NOT IN ('DONE','COMPLETED','CANCELLED'))")
    List<BacklogTask> findActiveTasksByUserAndTeam(@Param("userId") Integer userId, @Param("teamId") Integer teamId);
    
    // Find tasks assigned to a user in multiple teams
    @Query("SELECT t FROM BacklogTask t WHERE t.assignedto = :userId AND t.teamId IN :teamIds")
    List<BacklogTask> findByAssignedToUserIdAndTeamIds(@Param("userId") Integer userId, @Param("teamIds") List<Integer> teamIds);
    
    // Find active tasks assigned to a user across multiple teams
    @Query("SELECT t FROM BacklogTask t WHERE t.assignedto = :userId AND t.teamId IN :teamIds AND " +
           "(t.status IS NULL OR UPPER(t.status) NOT IN ('DONE','COMPLETED','CANCELLED'))")
    List<BacklogTask> findActiveTasksByUserAndTeams(@Param("userId") Integer userId, @Param("teamIds") List<Integer> teamIds);

    // Find active tasks assigned to a user across multiple teams limited to specific sprint IDs
    @Query("SELECT t FROM BacklogTask t WHERE t.assignedto = :userId AND t.teamId IN :teamIds AND t.sprintid IN :sprintIds AND " +
           "(t.status IS NULL OR UPPER(t.status) NOT IN ('DONE','COMPLETED','CANCELLED'))")
    List<BacklogTask> findActiveTasksByUserTeamsAndSprints(@Param("userId") Integer userId,
                                                           @Param("teamIds") List<Integer> teamIds,
                                                           @Param("sprintIds") List<Integer> sprintIds);
}