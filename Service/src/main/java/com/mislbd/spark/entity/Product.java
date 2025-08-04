package com.mislbd.spark.entity;

import jakarta.persistence.*;
import lombok.*;
import java.sql.Clob;
import com.mislbd.spark.repository.schema.SchemaConstant;

@Entity
@Table(name = SchemaConstant.PRODUCT_TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 255)
    private String name;

    @Column(length = 20)
    private String status;

    @Lob
    private Clob vision;

    @Column(length = 50)
    private String version;

    @Column(name = "current_release", length = 50)
    private String currentRelease;

    @Column(name = "product_owner_id")
    private Integer productOwnerId;

    @Column(name = "dependent_products")
    private Integer dependentProducts;

    @Column(length = 255)
    private String client;
}
