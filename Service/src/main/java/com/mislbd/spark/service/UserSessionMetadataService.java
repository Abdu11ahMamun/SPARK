package com.mislbd.spark.service;

import com.mislbd.spark.entity.User;
import com.mislbd.spark.entity.UserRole;
import com.mislbd.spark.entity.UserSessionMetadata;
import com.mislbd.spark.entity.Permission;
import com.mislbd.spark.repository.UserRepository;
import com.mislbd.spark.repository.UserRoleRepository;
import com.mislbd.spark.repository.UserSessionMetadataRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for Managing User Session Metadata
 * 
 * Handles creation, retrieval, and management of user session metadata
 * that stores complete RBAC information for fast authorization checking.
 * 
 * Key Responsibilities:
 * 1. Create session metadata when user logs in
 * 2. Update session activity and extend expiry
 * 3. Invalidate sessions on logout
 * 4. Clean up expired sessions
 * 5. Provide fast permission checking via cached data
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-22
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class UserSessionMetadataService {

    private final UserSessionMetadataRepository sessionRepository;
    private final UserRoleRepository userRoleRepository;
    private final UserRepository userRepository;
    private final RolePermissionService rolePermissionService;
    private final ObjectMapper objectMapper;

    /**
     * Create comprehensive session metadata when user logs in
     */
    public UserSessionMetadata createSessionMetadata(Long userId, String sessionToken, 
                                                   String ipAddress, String userAgent) {
        log.info("Creating session metadata for user ID: {}", userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        
        // Get all active roles for the user
        List<UserRole> userRoles = userRoleRepository.findEffectiveRolesByUserId(userId, LocalDateTime.now());
        
        // Extract role information
        Set<String> roleCodes = userRoles.stream()
            .map(ur -> ur.getRole().getName())
            .collect(Collectors.toSet());
        
        // Get primary role
        String primaryRole = userRoles.stream()
            .filter(UserRole::getIsPrimary)
            .map(ur -> ur.getRole().getName())
            .findFirst()
            .orElse(userRoles.isEmpty() ? null : userRoles.get(0).getRole().getName());
        
        // Get all permissions from all roles
        Set<String> allPermissions = new HashSet<>();
        Set<String> allResources = new HashSet<>();
        
        for (UserRole userRole : userRoles) {
            List<Permission> rolePermissions = rolePermissionService.getRolePermissions(userRole.getRole().getId());
            rolePermissions.forEach(permission -> {
                allPermissions.add(permission.getCode());
                allResources.add(permission.getResource());
            });
        }
        
        // Check admin privileges
        boolean isAdmin = roleCodes.contains("ADMIN") || roleCodes.contains("ADMINISTRATOR");
        boolean isSystemAdmin = roleCodes.contains("SYSTEM_ADMIN") || roleCodes.contains("SUPER_ADMIN");
        
        // Convert to JSON
        String rolesJson = convertToJson(roleCodes);
        String permissionsJson = convertToJson(allPermissions);
        String resourcesJson = convertToJson(allResources);
        
        // Determine device type from user agent
        String deviceType = determineDeviceType(userAgent);
        
        // Create session metadata
        UserSessionMetadata sessionMetadata = UserSessionMetadata.builder()
            .user(user)
            .sessionToken(sessionToken)
            .rolesJson(rolesJson)
            .permissionsJson(permissionsJson)
            .resourcesJson(resourcesJson)
            .primaryRole(primaryRole)
            .displayName(user.getFirstName() + " " + user.getLastName())
            .email(user.getEmail())
            .isAdmin(isAdmin)
            .isSystemAdmin(isSystemAdmin)
            .permissionsCount(allPermissions.size())
            .rolesCount(roleCodes.size())
            .ipAddress(ipAddress)
            .userAgent(userAgent)
            .deviceType(deviceType)
            .loginSource("Manual")
            .expiresAt(LocalDateTime.now().plusHours(8)) // 8-hour session
            .active(true)
            .build();
        
        UserSessionMetadata saved = sessionRepository.save(sessionMetadata);
        log.info("Session metadata created successfully for user: {} with {} permissions", 
                 user.getUsername(), allPermissions.size());
        
        return saved;
    }

    /**
     * Get session metadata by token
     */
    @Transactional(readOnly = true)
    public Optional<UserSessionMetadata> getSessionMetadata(String sessionToken) {
        return sessionRepository.findBySessionTokenAndActive(sessionToken);
    }

    /**
     * Update last activity timestamp
     */
    public void updateLastActivity(String sessionToken) {
        sessionRepository.updateLastActivity(sessionToken, LocalDateTime.now());
    }

    /**
     * Extend session expiry
     */
    public void extendSession(String sessionToken, int hours) {
        sessionRepository.findBySessionTokenAndActive(sessionToken)
            .ifPresent(session -> {
                session.extendSession(hours);
                sessionRepository.save(session);
                log.debug("Extended session {} by {} hours", sessionToken, hours);
            });
    }

    /**
     * Invalidate specific session
     */
    public void invalidateSession(String sessionToken) {
        sessionRepository.invalidateSession(sessionToken);
        log.info("Session invalidated: {}", sessionToken);
    }

    /**
     * Invalidate all sessions for a user
     */
    public void invalidateAllUserSessions(Long userId) {
        int invalidated = sessionRepository.invalidateAllUserSessions(userId);
        log.info("Invalidated {} sessions for user ID: {}", invalidated, userId);
    }

    /**
     * Clean up expired sessions (scheduled task)
     */
    public void cleanupExpiredSessions() {
        int cleaned = sessionRepository.cleanupExpiredSessions(LocalDateTime.now());
        if (cleaned > 0) {
            log.info("Cleaned up {} expired sessions", cleaned);
        }
    }

    /**
     * Get user permissions from session metadata (fast lookup)
     */
    @Transactional(readOnly = true)
    public Set<String> getUserPermissions(String sessionToken) {
        return sessionRepository.findBySessionTokenAndActive(sessionToken)
            .map(session -> convertFromJson(session.getPermissionsJson(), Set.class))
            .orElse(Collections.emptySet());
    }

    /**
     * Get user roles from session metadata (fast lookup)
     */
    @Transactional(readOnly = true)
    public Set<String> getUserRoles(String sessionToken) {
        return sessionRepository.findBySessionTokenAndActive(sessionToken)
            .map(session -> convertFromJson(session.getRolesJson(), Set.class))
            .orElse(Collections.emptySet());
    }

    /**
     * Check if user has specific permission (fast lookup)
     */
    @Transactional(readOnly = true)
    public boolean hasPermission(String sessionToken, String permissionCode) {
        return sessionRepository.findBySessionTokenAndActive(sessionToken)
            .map(session -> {
                Set<String> permissions = convertFromJson(session.getPermissionsJson(), Set.class);
                return permissions.contains(permissionCode);
            })
            .orElse(false);
    }

    /**
     * Check if user has access to resource (fast lookup)
     */
    @Transactional(readOnly = true)
    public boolean hasResourceAccess(String sessionToken, String resource) {
        return sessionRepository.findBySessionTokenAndActive(sessionToken)
            .map(session -> {
                Set<String> resources = convertFromJson(session.getResourcesJson(), Set.class);
                return resources.contains(resource);
            })
            .orElse(false);
    }

    /**
     * Get active sessions for user (for monitoring)
     */
    @Transactional(readOnly = true)
    public List<UserSessionMetadata> getActiveUserSessions(Long userId) {
        return sessionRepository.findActiveSessionsByUserId(userId);
    }

    /**
     * Refresh session metadata when user roles change
     */
    public void refreshSessionMetadata(Long userId) {
        List<UserSessionMetadata> activeSessions = sessionRepository.findActiveSessionsByUserId(userId);
        
        for (UserSessionMetadata session : activeSessions) {
            // Recreate metadata with current roles/permissions
            User user = session.getUser();
            String sessionToken = session.getSessionToken();
            String ipAddress = session.getIpAddress();
            String userAgent = session.getUserAgent();
            
            // Invalidate old session
            invalidateSession(sessionToken);
            
            // Create new metadata with updated permissions
            createSessionMetadata(userId, sessionToken, ipAddress, userAgent);
        }
        
        log.info("Refreshed session metadata for user ID: {} ({} sessions)", userId, activeSessions.size());
    }

    /**
     * Get session statistics for monitoring
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getSessionStatistics() {
        List<Object[]> stats = sessionRepository.getSessionStatistics();
        Map<String, Object> result = new HashMap<>();
        
        if (!stats.isEmpty()) {
            Object[] row = stats.get(0);
            result.put("activeSessions", row[0]);
            result.put("averagePermissions", row[1]);
            result.put("lastActivity", row[2]);
        }
        
        return result;
    }

    /**
     * Convert object to JSON string
     */
    private String convertToJson(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            log.error("Error converting object to JSON", e);
            return "[]";
        }
    }

    /**
     * Convert JSON string to object
     */
    @SuppressWarnings("unchecked")
    private <T> T convertFromJson(String json, Class<T> type) {
        try {
            if (type == Set.class) {
                return (T) objectMapper.readValue(json, 
                    objectMapper.getTypeFactory().constructCollectionType(Set.class, String.class));
            }
            return objectMapper.readValue(json, type);
        } catch (JsonProcessingException e) {
            log.error("Error converting JSON to object", e);
            return (T) Collections.emptySet();
        }
    }

    /**
     * Determine device type from user agent
     */
    private String determineDeviceType(String userAgent) {
        if (userAgent == null) return "Unknown";
        
        String ua = userAgent.toLowerCase();
        if (ua.contains("mobile") || ua.contains("android") || ua.contains("iphone")) {
            return "Mobile";
        } else if (ua.contains("tablet") || ua.contains("ipad")) {
            return "Tablet";
        } else if (ua.contains("postman") || ua.contains("curl") || ua.contains("api")) {
            return "API";
        } else {
            return "Web";
        }
    }
}