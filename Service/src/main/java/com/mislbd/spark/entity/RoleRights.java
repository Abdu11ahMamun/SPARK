package com.mislbd.spark.entity;

import jakarta.persistence.*;
import lombok.*;
import com.mislbd.spark.repository.schema.SchemaConstant;

@Entity
@Table(name = SchemaConstant.ROLE_RIGHTS_TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleRights {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "role_name", length = 100)
    private String roleName;

    @Column(name = "page_list", length = 500)
    private String pageList;

    @Column
    private Integer status;
}
