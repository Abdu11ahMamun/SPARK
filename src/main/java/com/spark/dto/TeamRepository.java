package com.spark.dto;

import com.spark.entities.Team;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamRepository extends JpaRepository<Team, Integer> {
    // List<Team> findAllById(List<Long> teamIds);

}