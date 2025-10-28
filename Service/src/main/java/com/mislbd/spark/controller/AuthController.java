package com.mislbd.spark.controller;

import com.mislbd.spark.dto.LoginRequest;
import com.mislbd.spark.dto.LoginResponse;
import com.mislbd.spark.dto.SessionStatusDto;
import com.mislbd.spark.entity.User;
import com.mislbd.spark.entity.UserSessionMetadata;
import com.mislbd.spark.repository.UserRepository;
import com.mislbd.spark.service.UserSessionMetadataService;
import com.mislbd.spark.mapper.UserSessionMetadataMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Authentication Controller with Session Management
 * 
 * Handles user authentication and session lifecycle with proper timeout management.
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-27
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final UserSessionMetadataService sessionService;
    private final UserSessionMetadataMapper sessionMapper;
    private final PasswordEncoder passwordEncoder;
    
    // Session timeout configurations
    private static final int SESSION_TIMEOUT_HOURS = 8;
    private static final int INACTIVITY_TIMEOUT_MINUTES = 30;

    /**
     * Authenticate user and create session
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest, 
                                             HttpServletRequest request) {
        try {
            log.info("Login attempt for user: {}", loginRequest.getUsername());
            
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(), 
                    loginRequest.getPassword()
                )
            );
            
            // Get user details
            User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found after authentication"));
            
            // Generate session token
            String sessionToken = generateSessionToken();
            
            // Extract client info
            String ipAddress = getClientIpAddress(request);
            String userAgent = request.getHeader("User-Agent");
            
            // Create session metadata
            UserSessionMetadata sessionMetadata = sessionService.createSessionMetadata(
                user.getId(), sessionToken, ipAddress, userAgent);
            
            // Get permissions and roles for logging
            Set<String> permissions = sessionService.getUserPermissions(sessionToken);
            Set<String> roles = sessionService.getUserRoles(sessionToken);
            
            // DETAILED SESSION DEBUGGING LOGS
            System.out.println("=== LOGIN SUCCESS - DETAILED SESSION DEBUG ===");
            System.out.println("Username: " + user.getUsername());
            System.out.println("Email: " + user.getEmail());
            System.out.println("User ID: " + user.getId());
            System.out.println("Session Token: " + sessionToken);
            System.out.println("IP Address: " + ipAddress);
            System.out.println("User Agent: " + userAgent);
            System.out.println("Session Created At: " + sessionMetadata.getCreatedAt());
            System.out.println("Session Expires At: " + sessionMetadata.getExpiresAt());
            System.out.println("Session Last Activity: " + sessionMetadata.getLastActivityAt());
            System.out.println("Session Active: " + sessionMetadata.getActive());
            System.out.println("User Roles: " + roles);
            System.out.println("User Permissions: " + permissions);
            System.out.println("Role Count: " + roles.size());
            System.out.println("Permission Count: " + permissions.size());
            System.out.println("Session Metadata - Username Field: " + sessionMetadata.getUsername());
            System.out.println("Session Metadata - Email Field: " + sessionMetadata.getEmail());
            System.out.println("Session Metadata - Roles JSON: " + sessionMetadata.getRolesJson());
            System.out.println("Session Metadata - Permissions JSON: " + sessionMetadata.getPermissionsJson());
            System.out.println("============================================");
            
            // Convert to response DTO
            LoginResponse response = LoginResponse.builder()
                .sessionToken(sessionToken)
                .user(sessionMapper.toUserDto(sessionMetadata))
                .permissions(permissions)
                .roles(roles)
                .expiresAt(sessionMetadata.getExpiresAt())
                .message("Login successful")
                .build();
            
            log.info("Login successful for user: {} with session: {}", 
                     user.getUsername(), sessionToken.substring(0, 8) + "...");
            
            return ResponseEntity.ok(response);
            
        } catch (AuthenticationException e) {
            log.warn("Login failed for user: {} - {}", loginRequest.getUsername(), e.getMessage());
            return ResponseEntity.status(401)
                .body(LoginResponse.builder()
                    .message("Invalid credentials")
                    .build());
        } catch (Exception e) {
            log.error("Login error for user: {}", loginRequest.getUsername(), e);
            return ResponseEntity.status(500)
                .body(LoginResponse.builder()
                    .message("Login failed")
                    .build());
        }
    }

    /**
     * Logout and invalidate session
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        String sessionToken = extractSessionToken(request);
        if (sessionToken != null) {
            sessionService.invalidateSession(sessionToken);
            log.info("Session logged out: {}", sessionToken.substring(0, 8) + "...");
        }
        return ResponseEntity.ok().build();
    }

    /**
     * Validate current session
     */
    @GetMapping("/validate")
    public ResponseEntity<SessionStatusDto> validateSession(HttpServletRequest request) {
        String sessionToken = extractSessionToken(request);
        
        if (sessionToken == null) {
            return ResponseEntity.status(401)
                .body(SessionStatusDto.builder()
                    .valid(false)
                    .message("No session token provided")
                    .build());
        }
        
        Optional<UserSessionMetadata> sessionOpt = sessionService.getSessionMetadata(sessionToken);
        
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.status(401)
                .body(SessionStatusDto.builder()
                    .valid(false)
                    .message("Invalid session token")
                    .build());
        }
        
        UserSessionMetadata session = sessionOpt.get();
        
        // Check if session is expired
        if (!session.isValid()) {
            sessionService.invalidateSession(sessionToken);
            return ResponseEntity.status(401)
                .body(SessionStatusDto.builder()
                    .valid(false)
                    .message("Session expired")
                    .build());
        }
        
        // Update last activity
        sessionService.updateLastActivity(sessionToken);
        
        // Calculate time remaining
        LocalDateTime now = LocalDateTime.now();
        long minutesUntilExpiry = java.time.Duration.between(now, session.getExpiresAt()).toMinutes();
        long minutesSinceActivity = java.time.Duration.between(session.getLastActivityAt(), now).toMinutes();
        
        SessionStatusDto status = SessionStatusDto.builder()
            .valid(true)
            .username(session.getUsername())
            .displayName(session.getDisplayName())
            .primaryRole(session.getPrimaryRole())
            .minutesUntilExpiry(minutesUntilExpiry)
            .minutesSinceLastActivity(minutesSinceActivity)
            .isAdmin(session.getIsAdmin())
            .isSystemAdmin(session.getIsSystemAdmin())
            .message("Session valid")
            .build();
        
        return ResponseEntity.ok(status);
    }

    /**
     * Refresh session (extend expiry)
     */
    @PostMapping("/refresh")
    public ResponseEntity<SessionStatusDto> refreshSession(HttpServletRequest request) {
        String sessionToken = extractSessionToken(request);
        
        if (sessionToken == null) {
            return ResponseEntity.status(401).build();
        }
        
        Optional<UserSessionMetadata> sessionOpt = sessionService.getSessionMetadata(sessionToken);
        
        if (sessionOpt.isEmpty() || !sessionOpt.get().isValid()) {
            return ResponseEntity.status(401).build();
        }
        
        // Extend session by 4 hours if user is active
        sessionService.extendSession(sessionToken, 4);
        sessionService.updateLastActivity(sessionToken);
        
        log.info("Session refreshed: {}", sessionToken.substring(0, 8) + "...");
        
        return validateSession(request); // Return updated session status
    }

    // Helper methods

    private String generateSessionToken() {
        return UUID.randomUUID().toString() + "-" + System.currentTimeMillis();
    }

    private String extractSessionToken(HttpServletRequest request) {
        // Try Authorization header first (Bearer token)
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        
        // Fall back to X-Session-Token header
        String sessionHeader = request.getHeader("X-Session-Token");
        if (sessionHeader != null) {
            return sessionHeader;
        }
        
        // Fall back to query parameter
        return request.getParameter("sessionToken");
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}