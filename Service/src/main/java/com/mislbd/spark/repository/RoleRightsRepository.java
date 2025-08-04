package com.mislbd.spark.repository;

import com.mislbd.spark.entity.RoleRights;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRightsRepository extends JpaRepository<RoleRights, Integer> {}
