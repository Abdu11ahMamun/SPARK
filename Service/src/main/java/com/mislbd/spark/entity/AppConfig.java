package com.mislbd.spark.entity;

import jakarta.persistence.*;
import lombok.*;
import com.mislbd.spark.repository.schema.SchemaConstant;

@Entity
@Table(name = SchemaConstant.APP_CONFIG_TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "config_name", length = 200)
    private String configName;

    @Column
    private Integer status;

    @Column(length = 200, nullable = false)
    private String value;
}
