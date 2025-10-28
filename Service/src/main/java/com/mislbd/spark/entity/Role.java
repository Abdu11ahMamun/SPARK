package com.mislbd.spark.entity;

import com.mislbd.spark.repository.schema.SchemaConstant;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Role Entity for User Role Management
 * 
 * Represents roles that can be assigned to users.
 * Basic role entity without RBAC extensions.
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-12
 */
@Entity
@Table(name = SchemaConstant.ROLE_TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor


@AllArgsConstructor
@Builder
@ToString
public class Role {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name", nullable = false, unique = true, length = 80)
    private String name;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
