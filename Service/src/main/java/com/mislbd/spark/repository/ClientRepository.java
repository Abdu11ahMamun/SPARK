package com.mislbd.spark.repository;

import com.mislbd.spark.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClientRepository extends JpaRepository<Client, Integer> {
    // Custom query methods (if needed) go here
}
