package com.mislbd.spark.controller;

import com.mislbd.spark.dto.UserSessionMetadataDto;
import com.mislbd.spark.entity.UserSessionMetadata;
import com.mislbd.spark.mapper.UserSessionMetadataMapper;
import com.mislbd.spark.service.UserSessionMetadataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * REST Controller for User Session Metadata Management
 * 
 * Provides API endpoints for managing user session metadata that stores
 * RBAC information for fast authorization checking.
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-22
 */
@RestController
@RequestMapping("/api/session-metadata")
@RequiredArgsConstructor
@Slf4j
public class UserSessionMetadataController {

    private final UserSessionMetadataService sessionService;
    private final UserSessionMetadataMapper sessionMapper;

    /**
     * Get current user's session metadata
     * Used by frontend to get user's permissions and roles
     */
    @GetMapping("/current")
    public ResponseEntity<UserSessionMetadataDto> getCurrentSessionMetadata(HttpServletRequest request) {
        String sessionToken = extractSessionToken(request);
        
        return sessionService.getSessionMetadata(sessionToken)
            .map(sessionMapper::toAuthorizationDto)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get minimal session info (public endpoint)
     */
    @GetMapping("/info")
    public ResponseEntity<UserSessionMetadataDto> getSessionInfo(HttpServletRequest request) {
        String sessionToken = extractSessionToken(request);
        
        return sessionService.getSessionMetadata(sessionToken)
            .map(sessionMapper::toMinimalDto)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Check if user has specific permission
     */
    @GetMapping("/permissions/{permissionCode}")
    public ResponseEntity<Boolean> hasPermission(@PathVariable String permissionCode, 
                                               HttpServletRequest request) {
        String sessionToken = extractSessionToken(request);
        boolean hasPermission = sessionService.hasPermission(sessionToken, permissionCode);
        return ResponseEntity.ok(hasPermission);
    }

    /**
     * Get all user permissions
     */
    @GetMapping("/permissions")
    public ResponseEntity<Set<String>> getUserPermissions(HttpServletRequest request) {
        String sessionToken = extractSessionToken(request);
        Set<String> permissions = sessionService.getUserPermissions(sessionToken);
        return ResponseEntity.ok(permissions);
    }

    /**
     * Get all user roles
     */
    @GetMapping("/roles")
    public ResponseEntity<Set<String>> getUserRoles(HttpServletRequest request) {
        String sessionToken = extractSessionToken(request);
        Set<String> roles = sessionService.getUserRoles(sessionToken);
        return ResponseEntity.ok(roles);
    }

    /**
     * Check if user has access to specific resource
     */
    @GetMapping("/resources/{resource}/access")
    public ResponseEntity<Boolean> hasResourceAccess(@PathVariable String resource,
                                                   HttpServletRequest request) {
        String sessionToken = extractSessionToken(request);
        boolean hasAccess = sessionService.hasResourceAccess(sessionToken, resource);
        return ResponseEntity.ok(hasAccess);
    }

    /**
     * Update last activity (called by frontend periodically)
     */
    @PostMapping("/activity")
    public ResponseEntity<Void> updateActivity(HttpServletRequest request) {
        String sessionToken = extractSessionToken(request);
        sessionService.updateLastActivity(sessionToken);
        return ResponseEntity.ok().build();
    }

    /**
     * Extend current session
     */
    @PostMapping("/extend")
    public ResponseEntity<Void> extendSession(@RequestParam(defaultValue = "2") int hours,
                                            HttpServletRequest request) {
        String sessionToken = extractSessionToken(request);
        sessionService.extendSession(sessionToken, hours);
        log.info("Session extended by {} hours: {}", hours, sessionToken);
        return ResponseEntity.ok().build();
    }

    /**
     * Invalidate current session (logout)
     */
    @PostMapping("/invalidate")
    public ResponseEntity<Void> invalidateSession(HttpServletRequest request) {
        String sessionToken = extractSessionToken(request);
        sessionService.invalidateSession(sessionToken);
        return ResponseEntity.ok().build();
    }

    // Admin endpoints (require SYSTEM_ADMIN permission)

    /**
     * Get session metadata by session token (admin only)
     */
    @GetMapping("/{sessionToken}")
    @PreAuthorize("hasPermission(null, 'SYSTEM_ADMIN')")
    public ResponseEntity<UserSessionMetadataDto> getSessionMetadata(@PathVariable String sessionToken) {
        return sessionService.getSessionMetadata(sessionToken)
            .map(sessionMapper::toDto)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all active sessions for a user (admin only)
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasPermission(null, 'USER_MANAGE')")
    public ResponseEntity<List<UserSessionMetadataDto>> getUserSessions(@PathVariable Long userId) {
        List<UserSessionMetadata> sessions = sessionService.getActiveUserSessions(userId);
        List<UserSessionMetadataDto> sessionDtos = sessions.stream()
            .map(sessionMapper::toDto)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(sessionDtos);
    }

    /**
     * Invalidate all sessions for a user (admin only)
     */
    @PostMapping("/user/{userId}/invalidate-all")
    @PreAuthorize("hasPermission(null, 'USER_MANAGE')")
    public ResponseEntity<Void> invalidateAllUserSessions(@PathVariable Long userId) {
        sessionService.invalidateAllUserSessions(userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Refresh session metadata when roles change (admin only)
     */
    @PostMapping("/user/{userId}/refresh")
    @PreAuthorize("hasPermission(null, 'USER_MANAGE')")
    public ResponseEntity<Void> refreshUserSessionMetadata(@PathVariable Long userId) {
        sessionService.refreshSessionMetadata(userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Get session statistics (admin only)
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasPermission(null, 'SYSTEM_ADMIN')")
    public ResponseEntity<Map<String, Object>> getSessionStatistics() {
        Map<String, Object> stats = sessionService.getSessionStatistics();
        return ResponseEntity.ok(stats);
    }

    /**
     * Clean up expired sessions (admin only)
     */
    @PostMapping("/cleanup")
    @PreAuthorize("hasPermission(null, 'SYSTEM_ADMIN')")
    public ResponseEntity<Void> cleanupExpiredSessions() {
        sessionService.cleanupExpiredSessions();
        return ResponseEntity.ok().build();
    }

    /**
     * Extract session token from request
     * This could be from header, cookie, or parameter depending on your auth setup
     */
    private String extractSessionToken(HttpServletRequest request) {
        // Try Authorization header first
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        
        // Try session token header
        String sessionHeader = request.getHeader("X-Session-Token");
        if (sessionHeader != null) {
            return sessionHeader;
        }
        
        // Try session ID from session
        String sessionId = request.getSession(false) != null ? 
            request.getSession(false).getId() : null;
        
        if (sessionId != null) {
            return sessionId;
        }
        
        // Default fallback - in real implementation this should throw exception
        log.warn("No session token found in request");
        return "unknown";
    }
}