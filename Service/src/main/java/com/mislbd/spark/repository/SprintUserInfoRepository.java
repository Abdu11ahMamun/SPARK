package com.mislbd.spark.repository;

import com.mislbd.spark.entity.SprintUserInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SprintUserInfoRepository extends JpaRepository<SprintUserInfo, Integer> {
    // Custom query methods if needed
}
