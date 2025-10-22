package com.mislbd.spark.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * Data Transfer Object for User Session Metadata
 * 
 * Used to transfer session information to frontend and other services
 * without exposing internal entity structure.
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-22
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSessionMetadataDto {
    
    private Long id;
    private String sessionToken;
    private Long userId;
    private String username;
    private String displayName;
    private String email;
    private String primaryRole;
    
    /**
     * User's roles for this session
     */
    private Set<String> roles;
    
    /**
     * User's permissions for this session
     */
    private Set<String> permissions;
    
    /**
     * Resources user has access to
     */
    private Set<String> resources;
    
    /**
     * Quick admin check flags
     */
    private Boolean isAdmin;
    private Boolean isSystemAdmin;
    
    /**
     * Counts for metrics
     */
    private Integer permissionsCount;
    private Integer rolesCount;
    
    /**
     * Session timing information
     */
    private LocalDateTime createdAt;
    private LocalDateTime lastActivityAt;
    private LocalDateTime expiresAt;
    private Boolean active;
    
    /**
     * Session context information
     */
    private String ipAddress;
    private String deviceType;
    private String loginSource;
    
    /**
     * Calculated properties for frontend
     */
    
    /**
     * Check if session is currently valid
     */
    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        return active != null && active && 
               expiresAt != null && expiresAt.isAfter(now);
    }
    
    /**
     * Check if session will expire soon (within 30 minutes)
     */
    public boolean isExpiringSoon() {
        if (expiresAt == null) return false;
        return expiresAt.isBefore(LocalDateTime.now().plusMinutes(30));
    }
    
    /**
     * Get minutes until expiry
     */
    public long getMinutesUntilExpiry() {
        if (expiresAt == null) return 0;
        LocalDateTime now = LocalDateTime.now();
        return java.time.Duration.between(now, expiresAt).toMinutes();
    }
    
    /**
     * Check if user has specific permission
     */
    public boolean hasPermission(String permissionCode) {
        return permissions != null && permissions.contains(permissionCode);
    }
    
    /**
     * Check if user has specific role
     */
    public boolean hasRole(String roleCode) {
        return roles != null && roles.contains(roleCode);
    }
    
    /**
     * Check if user has access to specific resource
     */
    public boolean hasResourceAccess(String resource) {
        return resources != null && resources.contains(resource);
    }
    
    /**
     * Get session duration in minutes
     */
    public long getSessionDurationMinutes() {
        if (createdAt == null || lastActivityAt == null) return 0;
        return java.time.Duration.between(createdAt, lastActivityAt).toMinutes();
    }
}