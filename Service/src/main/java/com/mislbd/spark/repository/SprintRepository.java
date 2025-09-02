package com.mislbd.spark.repository;

import com.mislbd.spark.entity.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Integer> {
    List<Sprint> findByTeamId(Integer teamId);
    List<Sprint> findByStatus(String status);
    List<Sprint> findByIsActiveTrue();
}
