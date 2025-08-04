package com.mislbd.spark.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import com.mislbd.spark.repository.schema.SchemaConstant;

@Entity
@Table(name = SchemaConstant.TEAM_TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "teamname", nullable = false, length = 100)
    private String teamName;

    @Column(length = 255)
    private String description;

    @Column(name = "createdat")
    private Instant createdAt;

    @Column(name = "updatedat")
    private Instant updatedAt;

    @Column
    private Integer status;

    @Column(name = "powner")
    private Integer pOwner;

    @Column(name = "smaster")
    private Integer sMaster;
}
