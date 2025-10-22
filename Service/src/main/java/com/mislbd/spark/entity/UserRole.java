package com.mislbd.spark.entity;

import com.mislbd.spark.repository.schema.SchemaConstant;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * UserRole Junction Entity for User-Role Many-to-Many Relationship
 * 
 * This entity manages the assignment of roles to users with audit information.
 * Supports multiple roles per user and tracks assignment history.
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-12
 */
@Entity
@Table(name = SchemaConstant.USER_ROLE_TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"user", "role"})
@EqualsAndHashCode(of = {"user", "role"})
public class UserRole {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_role_seq")
    @SequenceGenerator(name = "user_role_seq", sequenceName = "SEQ_SPARK_USER_ROLE", allocationSize = 1)
    @Column(name = "id")
    private Long id;

    /**
     * Reference to User entity
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_user_role_user"))
    private User user;

    /**
     * Reference to Role entity
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "role_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_user_role_role"))
    private Role role;

    /**
     * Timestamp when role was assigned to user
     */
    @Column(name = "assigned_at", nullable = false, updatable = false)
    private LocalDateTime assignedAt;

    /**
     * User who assigned this role
     */
    @Column(name = "assigned_by", length = 100)
    private String assignedBy;

    /**
     * Optional expiry date for temporary role assignments
     */
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    /**
     * Whether this role assignment is active
     */
    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    /**
     * Whether this is the user's primary role
     */
    @Column(name = "is_primary", nullable = false)
    @Builder.Default
    private Boolean isPrimary = false;

    /**
     * Optional notes about the role assignment
     */
    @Column(name = "notes", length = 500)
    private String notes;

    @PrePersist
    protected void onCreate() {
        assignedAt = LocalDateTime.now();
        if (active == null) {
            active = true;
        }
        if (isPrimary == null) {
            isPrimary = false;
        }
    }

    /**
     * Convenience constructor for quick user-role association
     */
    public UserRole(User user, Role role, String assignedBy) {
        this.user = user;
        this.role = role;
        this.assignedBy = assignedBy;
        this.active = true;
        this.isPrimary = false;
        this.assignedAt = LocalDateTime.now();
    }

    /**
     * Check if this role assignment is currently effective
     */
    public boolean isEffective() {
        LocalDateTime now = LocalDateTime.now();
        return active && 
               role != null && role.getActive() && 
               user != null && 
               (expiresAt == null || expiresAt.isAfter(now));
    }

    /**
     * Check if this role assignment has expired
     */
    public boolean isExpired() {
        return expiresAt != null && expiresAt.isBefore(LocalDateTime.now());
    }

    /**
     * Get role name for quick access
     */
    public String getRoleName() {
        return role != null ? role.getName() : null;
    }

    /**
     * Get user username for quick access
     */
    public String getUsername() {
        return user != null ? user.getUsername() : null;
    }
}