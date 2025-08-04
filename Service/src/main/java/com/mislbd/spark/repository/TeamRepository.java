package com.mislbd.spark.repository;


import com.mislbd.spark.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeamRepository extends JpaRepository<Team, Integer> {
    // Custom query methods if needed
}