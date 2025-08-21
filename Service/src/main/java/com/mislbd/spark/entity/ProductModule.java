package com.mislbd.spark.entity;

import jakarta.persistence.*;
import lombok.*;
import com.mislbd.spark.repository.schema.SchemaConstant;

@Entity
@Table(name = SchemaConstant.PRODUCT_MODULE_TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductModule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 255)
    private String name;

    @Column(name = "product_id")
    private Integer productId;

    @Column(length = 50)
    private String release;

    @Column(name = "module_status", length = 20)
    private String moduleStatus;

    @Column(name = "module_owner_id")
    private Integer moduleOwnerId;

    @Column
    private Integer client;
}
