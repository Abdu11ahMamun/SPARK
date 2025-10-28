package com.mislbd.spark.entity;

import com.mislbd.spark.repository.schema.SchemaConstant;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.HashSet;

/**
 * User Session Metadata Entity
 * 
 * Stores comprehensive RBAC metadata when user logs in for fast permission checking.
 * This denormalized table eliminates complex joins during session-based authorization.
 * 
 * Flow:
 * 1. User logs in
 * 2. System calculates all permissions from user's roles
 * 3. Metadata is stored in this table with session info
 * 4. Frontend/Backend uses this cached data for authorization
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-22
 */
@Entity
@Table(name = SchemaConstant.USER_SESSION_METADATA_TABLE_NAME, 
       indexes = {
           @Index(name = "idx_session_id", columnList = "session_id"),
           @Index(name = "idx_user_active", columnList = "user_id, active"),
           @Index(name = "idx_expires_at", columnList = "expires_at")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"user"})
@EqualsAndHashCode(of = {"sessionToken"})
public class UserSessionMetadata {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "session_metadata_seq")
    @SequenceGenerator(name = "session_metadata_seq", sequenceName = "SEQ_SPARK_SESSION_METADATA", allocationSize = 1)
    @Column(name = "id")
    private Long id;

    /**
     * Reference to User entity
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_session_metadata_user"))
    private User user;

    /**
     * User ID for quick access without joining to user table
     */
    @Column(name = "user_id", insertable = false, updatable = false)
    private Long userId;

    /**
     * Username for quick access without joining to user table
     */
    @Column(name = "username", nullable = false, length = 100)
    private String username;

    /**
     * Unique session token for this login session
     */
    @Column(name = "session_id", nullable = false, unique = true, length = 255)
    private String sessionToken;

    /**
     * JSON string containing all user's role codes
     * Example: ["ADMIN", "PROJECT_MANAGER", "DEVELOPER"]
     */
    @Column(name = "roles_json", columnDefinition = "CLOB")
    private String rolesJson;

    /**
     * JSON string containing all user's permission codes
     * Example: ["USER_VIEW", "USER_CREATE", "DASHBOARD_VIEW", "TEAM_MANAGE"]
     */
    @Column(name = "permissions_json", columnDefinition = "CLOB")
    private String permissionsJson;

    /**
     * JSON string containing user's resources access
     * Example: ["users", "dashboard", "teams", "projects"]
     */
    @Column(name = "resources_json", columnDefinition = "CLOB")
    private String resourcesJson;

    /**
     * User's primary role code for UI display
     */
    @Column(name = "primary_role", length = 100)
    private String primaryRole;

    /**
     * User's display name for session
     */
    @Column(name = "display_name", length = 150)
    private String displayName;

    /**
     * User's email for session
     */
    @Column(name = "email", length = 255)
    private String email;

    /**
     * Whether user has admin privileges (quick check)
     */
    @Column(name = "is_admin", nullable = false)
    @Builder.Default
    private Boolean isAdmin = false;

    /**
     * Whether user has system admin privileges (quick check)
     */
    @Column(name = "is_system_admin", nullable = false)
    @Builder.Default
    private Boolean isSystemAdmin = false;

    /**
     * Total count of permissions for metrics
     */
    @Column(name = "permissions_count")
    private Integer permissionsCount;

    /**
     * Total count of roles for metrics
     */
    @Column(name = "roles_count")
    private Integer rolesCount;

    /**
     * Session creation timestamp
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Last activity timestamp (updated on each request)
     */
    @Column(name = "last_activity_at")
    private LocalDateTime lastActivityAt;

    /**
     * Session expiry timestamp
     */
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    /**
     * Whether this session is active
     */
    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    /**
     * IP address of the session
     */
    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    /**
     * User agent string
     */
    @Column(name = "user_agent", length = 500)
    private String userAgent;

    /**
     * Device type (Web, Mobile, API)
     */
    @Column(name = "device_type", length = 20)
    @Builder.Default
    private String deviceType = "Web";

    /**
     * Login source (Manual, SSO, API)
     */
    @Column(name = "login_source", length = 20)
    @Builder.Default
    private String loginSource = "Manual";

    /**
     * Optional notes about the session
     */
    @Column(name = "notes", length = 500)
    private String notes;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        lastActivityAt = now;
        
        // Default 8-hour session if not set
        if (expiresAt == null) {
            expiresAt = now.plusHours(8);
        }
        
        if (active == null) {
            active = true;
        }
        if (isAdmin == null) {
            isAdmin = false;
        }
        if (isSystemAdmin == null) {
            isSystemAdmin = false;
        }
    }

    /**
     * Update last activity timestamp
     */
    public void updateLastActivity() {
        this.lastActivityAt = LocalDateTime.now();
    }

    /**
     * Check if session is currently valid
     */
    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        return active && 
               expiresAt != null && expiresAt.isAfter(now) &&
               user != null;
    }

    /**
     * Check if session has expired
     */
    public boolean isExpired() {
        return expiresAt != null && expiresAt.isBefore(LocalDateTime.now());
    }

    /**
     * Extend session expiry by specified hours
     */
    public void extendSession(int hours) {
        if (expiresAt != null) {
            expiresAt = expiresAt.plusHours(hours);
        }
    }

    /**
     * Invalidate this session
     */
    public void invalidate() {
        this.active = false;
        this.lastActivityAt = LocalDateTime.now();
    }

    /**
     * Get username from cached field (avoid lazy loading)
     */
    public String getUsername() {
        return username;
    }

    /**
     * Get user ID from cached field (avoid lazy loading)
     */
    public Long getUserId() {
        return userId;
    }
}