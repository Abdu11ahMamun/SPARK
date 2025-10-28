package com.mislbd.spark.entity;

import com.mislbd.spark.repository.schema.SchemaConstant;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * RolePermission Junction Entity for Many-to-Many Relationship
 * 
 * This entity represents the many-to-many relationship between Role and Permission.
 * It includes additional metadata about when and by whom the permission was granted.
 * 
 * Design Decision: Using explicit junction entity instead of @ManyToMany
 * for better control, auditing, and future extensibility.
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-12
 */
@Entity


@Table(name = SchemaConstant.ROLE_PERMISSION_TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"role", "permission"})
@EqualsAndHashCode(of = {"role", "permission"})
public class RolePermission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "role_permission_seq")
    @SequenceGenerator(name = "role_permission_seq", sequenceName = "SEQ_SPARK_ROLE_PERMISSION", allocationSize = 1)
    @Column(name = "id")
    private Long id;

    /**
     * Reference to Role entity
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "role_id", nullable = false, 
                foreignKey = @ForeignKey(name = "fk_role_permission_role"))
    private Role role;

    /**
     * Reference to Permission entity
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "permission_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_role_permission_permission"))
    private Permission permission;

    /**
     * Timestamp when permission was granted to role
     */
    @Column(name = "granted_at", nullable = false, updatable = false)
    private LocalDateTime grantedAt;

    /**
     * User who granted this permission to the role
     */
    @Column(name = "granted_by", length = 100)
    private String grantedBy;

    /**
     * Optional notes about why this permission was granted
     */
    @Column(name = "notes", length = 500)
    private String notes;

    /**
     * Whether this permission assignment is active
     * Allows temporary disabling without deletion
     */
    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @PrePersist
    protected void onCreate() {
        grantedAt = LocalDateTime.now();
        if (active == null) {
            active = true;
        }
    }

    /**
     * Convenience constructor for quick role-permission association
     */
    public RolePermission(Role role, Permission permission, String grantedBy) {
        this.role = role;
        this.permission = permission;
        this.grantedBy = grantedBy;
        this.active = true;
        this.grantedAt = LocalDateTime.now();
    }

    /**
     * Check if this role-permission assignment is currently effective
     */
    public boolean isEffective() {
        return active && 
               role != null && role.getActive() && 
               permission != null && permission.getActive();
    }

    /**
     * Get permission name for quick access
     */
    public String getPermissionName() {
        return permission != null ? permission.getName() : null;
    }

    /**
     * Get role name for quick access
     */
    public String getRoleName() {
        return role != null ? role.getName() : null;
    }
}