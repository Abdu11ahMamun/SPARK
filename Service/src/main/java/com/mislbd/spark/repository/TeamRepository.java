package com.mislbd.spark.repository;


import com.mislbd.spark.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRepository extends JpaRepository<Team, Long> {}