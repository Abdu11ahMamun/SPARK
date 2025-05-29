package com.mislbd.spark.entity;

import com.mislbd.spark.entity.types.Roles;
import com.mislbd.spark.repository.schema.SchemaConstant;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = SchemaConstant.USER_TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String middleName;
    private String lastName;

    private String phone;
    private String employeeId;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    private Roles role;

    @Column(name = "ACTIVESTATUS")
    private String activeStatus;

    private LocalDateTime createdate;
    private LocalDateTime updatedate;

    @OneToMany(mappedBy = "user")
    private List<TeamMembership> memberships;
}