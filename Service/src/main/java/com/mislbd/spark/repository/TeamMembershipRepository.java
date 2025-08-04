package com.mislbd.spark.repository;

import com.mislbd.spark.entity.TeamMembership;
import com.mislbd.spark.entity.TeamMembershipId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamMembershipRepository extends JpaRepository<TeamMembership, TeamMembershipId> {
    
    @Query("SELECT tm FROM TeamMembership tm WHERE tm.team.id = :teamId")
    List<TeamMembership> findByTeamId(@Param("teamId") Integer teamId);
    
    @Query("SELECT tm FROM TeamMembership tm WHERE tm.user.id = :userId")
    List<TeamMembership> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(tm) FROM TeamMembership tm WHERE tm.team.id = :teamId")
    Long countByTeamId(@Param("teamId") Integer teamId);
}
