package com.mislbd.spark.repository;

import com.mislbd.spark.entity.MitsDocuments;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MitsDocumentsRepository extends JpaRepository<MitsDocuments, Integer> {}
