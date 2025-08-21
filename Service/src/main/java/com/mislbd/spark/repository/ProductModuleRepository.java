package com.mislbd.spark.repository;

import com.mislbd.spark.entity.ProductModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductModuleRepository extends JpaRepository<ProductModule, Integer> {
    // Custom query methods if needed
}
