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
}
