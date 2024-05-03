package com.spark.dto;

import com.spark.entities.SprintTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SprintTaskRepository extends JpaRepository<SprintTask, Long> {
    List<SprintTask> findBySprintId(Long sprintId);

//    @Query("SELECT st FROM SprintTask st JOIN FETCH st.backlog b JOIN FETCH b.module m JOIN FETCH b.client c WHERE st.sprint.id = :sprintId")
//    List<SprintTask> findBySprintIdWithBacklogDetails(@Param("sprintId") Long sprintId);
@Query("SELECT st FROM SprintTask st " +
        "JOIN FETCH st.backlog b " +
        "JOIN FETCH b.module m " +
        "JOIN FETCH b.client c " +
        "JOIN FETCH b.assignedTo u " +
        "WHERE st.sprint.id = :sprintId")
List<SprintTask> findBySprintIdWithBacklogDetails(@Param("sprintId") Long sprintId);

}
