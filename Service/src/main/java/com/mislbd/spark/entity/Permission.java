package com.mislbd.spark.entity;

import com.mislbd.spark.repository.schema.SchemaConstant;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * Permission Entity for Role-Based Access Control (RBAC)
 * 
 * Represents individual permissions that can be assigned to roles.
 * Each permission defines access to a specific resource with a specific action.
 * 
 * Examples:
 * - users.read: Permission to view users
 * - users.write: Permission to create/edit users
 * - dashboard.read: Permission to access dashboard
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-12
 */
@Entity
@Table(name = SchemaConstant.PERMISSION_TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"rolePermissions"})
@EqualsAndHashCode(of = {"code"})
public class Permission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "permission_seq")
    @SequenceGenerator(name = "permission_seq", sequenceName = "SEQ_SPARK_PERMISSION", allocationSize = 1)
    @Column(name = "id")
    private Long id;

    /**
     * Unique machine-readable permission code
     * Examples: DASHBOARD_VIEW, USER_CREATE, TEAM_DELETE
     */
    @Column(name = "code", nullable = false, unique = true, length = 100)
    private String code;

    /**
     * Human-readable permission name
     * Examples: "View Dashboard", "Create User", "Delete Team"
     */
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    /**
     * Human-readable description of the permission
     */
    @Column(name = "description", nullable = false, length = 255)
    private String description;

    /**
     * Resource/module this permission applies to
     * Examples: users, roles, dashboard, teams, tasks


     */
    @Column(name = "\"resource\"", nullable = false, length = 50)
    private String resource;

    /**
     * Action that can be performed on the resource
     * Examples: read, write, delete, admin
     */
    @Column(name = "\"action\"", nullable = false, length = 20)
    private String action;

    /**
     * Permission category for UI grouping
     * Examples: USER_MANAGEMENT, SYSTEM_ADMIN, PROJECT_MANAGEMENT
     */
    @Column(name = "category", length = 50)
    private String category;

    /**
     * Display order for UI sorting
     */
    @Column(name = "display_order")
    private Integer displayOrder;

    /**
     * Whether this permission is active
     */
    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    /**
     * Whether this is a system permission (cannot be deleted)
     */
    @Column(name = "system_permission", nullable = false)
    @Builder.Default
    private Boolean systemPermission = false;

    /**
     * Creation timestamp
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Last update timestamp
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * User who created this permission
     */
    @Column(name = "created_by", length = 100)
    private String createdBy;

    /**
     * User who last updated this permission
     */
    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    /**
     * Role-permission mappings (inverse side of many-to-many relationship)
     */
    @OneToMany(mappedBy = "permission", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
    private Set<RolePermission> rolePermissions;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        
        if (active == null) {
            active = true;
        }
        if (systemPermission == null) {
            systemPermission = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Check if this permission matches a given resource and action
     */
    public boolean matches(String resource, String action) {
        return this.resource.equals(resource) && this.action.equals(action);
    }

    /**
     * Check if this permission allows access to a resource (any action)
     */
    public boolean allowsAccessTo(String resource) {
        return this.resource.equals(resource);
    }

    /**
     * Get full permission key in format: resource.action
     */
    public String getPermissionKey() {
        return resource + "." + action;
    }
}