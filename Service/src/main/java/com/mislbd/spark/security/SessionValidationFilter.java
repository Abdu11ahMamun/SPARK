package com.mislbd.spark.security;

import com.mislbd.spark.entity.UserSessionMetadata;
import com.mislbd.spark.service.UserSessionMetadataService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Session Validation Filter
 * 
 * Validates session tokens on each request and sets up Spring Security context
 * based on session metadata for fast authorization checking.
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-27
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SessionValidationFilter extends OncePerRequestFilter {

    private final UserSessionMetadataService sessionService;
    private final ObjectMapper objectMapper;

    // Paths that don't require session validation
    private static final Set<String> EXCLUDED_PATHS = Set.of(
        "/api/auth/login",
        "/api/auth/validate", 
        "/v3/api-docs",
        "/swagger-ui",
        "/webjars"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response,
                                  FilterChain filterChain) throws ServletException, IOException {
        
        String requestPath = request.getRequestURI();
        
        // Skip session validation for excluded paths
        if (isExcludedPath(requestPath)) {
            filterChain.doFilter(request, response);
            return;
        }

        String sessionToken = extractSessionToken(request);
        
        if (sessionToken == null) {
            log.debug("No session token provided for: {}", requestPath);
            sendUnauthorizedResponse(response, "No session token provided");
            return;
        }

        // Validate session
        Optional<UserSessionMetadata> sessionOpt = sessionService.getSessionMetadata(sessionToken);
        
        if (sessionOpt.isEmpty()) {
            log.warn("Invalid session token for: {}", requestPath);
            sendUnauthorizedResponse(response, "Invalid session token");
            return;
        }

        UserSessionMetadata session = sessionOpt.get();
        
        // DETAILED SESSION VALIDATION DEBUG LOGS
        System.out.println("=== SESSION VALIDATION DEBUG ===");
        System.out.println("Request Path: " + requestPath);
        System.out.println("Session Token: " + sessionToken);
        System.out.println("Session Found: " + (session != null));
        System.out.println("Session Username: " + session.getUsername());
        System.out.println("Session Email: " + session.getEmail());
        System.out.println("Session User ID: " + session.getUserId());
        System.out.println("Session Active: " + session.getActive());
        System.out.println("Session Valid: " + session.isValid());
        System.out.println("Session Created At: " + session.getCreatedAt());
        System.out.println("Session Expires At: " + session.getExpiresAt());
        System.out.println("Session Last Activity: " + session.getLastActivityAt());
        System.out.println("Session Primary Role: " + session.getPrimaryRole());
        System.out.println("Session Roles JSON: " + session.getRolesJson());
        System.out.println("Session Permissions JSON: " + session.getPermissionsJson());
        System.out.println("Current Time: " + java.time.LocalDateTime.now());
        System.out.println("================================");
        
        // Check if session is expired
        if (!session.isValid()) {
            sessionService.invalidateSession(sessionToken);
            log.warn("Expired session for user: {} on path: {}", session.getUsername(), requestPath);
            System.out.println("SESSION EXPIRED - SENDING UNAUTHORIZED RESPONSE");
            sendUnauthorizedResponse(response, "Session expired");
            return;
        }

        // Update last activity (async to avoid blocking)
        try {
            sessionService.updateLastActivity(sessionToken);
        } catch (Exception e) {
            log.warn("Failed to update last activity for session: {}", sessionToken, e);
        }

        // Set up Spring Security context
        setupSecurityContext(session);
        
        // Add session info to request attributes for controllers
        request.setAttribute("sessionToken", sessionToken);
        request.setAttribute("userSession", session);
        request.setAttribute("userId", session.getUserId());
        request.setAttribute("username", session.getUsername());

        log.debug("Session validated for user: {} on path: {}", session.getUsername(), requestPath);
        
        filterChain.doFilter(request, response);
    }

    private boolean isExcludedPath(String path) {
        return EXCLUDED_PATHS.stream().anyMatch(path::startsWith);
    }

    private String extractSessionToken(HttpServletRequest request) {
        // Try Authorization header first (Bearer token)
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        
        // Try Basic Auth header and extract username for session lookup
        if (authHeader != null && authHeader.startsWith("Basic ")) {
            // For backward compatibility with existing Basic Auth clients
            return null; // Let Spring Security handle Basic Auth
        }
        
        // Fall back to X-Session-Token header
        String sessionHeader = request.getHeader("X-Session-Token");
        if (sessionHeader != null) {
            return sessionHeader;
        }
        
        // Fall back to query parameter
        return request.getParameter("sessionToken");
    }

    private void setupSecurityContext(UserSessionMetadata session) {
        // Create authorities from user roles and permissions
        List<SimpleGrantedAuthority> authorities = Collections.emptyList();
        
        if (session.getPrimaryRole() != null) {
            authorities = List.of(new SimpleGrantedAuthority("ROLE_" + session.getPrimaryRole()));
        }

        // DETAILED SECURITY CONTEXT DEBUG LOGS
        System.out.println("=== SECURITY CONTEXT SETUP DEBUG ===");
        System.out.println("Session Primary Role: " + session.getPrimaryRole());
        System.out.println("Authorities Created: " + authorities);
        System.out.println("Authority Count: " + authorities.size());
        if (!authorities.isEmpty()) {
            authorities.forEach(auth -> System.out.println("Authority: " + auth.getAuthority()));
        }
        System.out.println("Username for Auth Token: " + session.getUsername());
        System.out.println("=====================================");

        // Create authentication token
        UsernamePasswordAuthenticationToken authToken = 
            new UsernamePasswordAuthenticationToken(
                session.getUsername(),
                null, // No password needed for session-based auth
                authorities
            );
        
        // Add session metadata to authentication details
        authToken.setDetails(session);
        
        SecurityContextHolder.getContext().setAuthentication(authToken);
        
        // Verify authentication was set
        System.out.println("=== AUTHENTICATION SET VERIFICATION ===");
        System.out.println("Authentication Principal: " + SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        System.out.println("Authentication Authorities: " + SecurityContextHolder.getContext().getAuthentication().getAuthorities());
        System.out.println("Authentication Authenticated: " + SecurityContextHolder.getContext().getAuthentication().isAuthenticated());
        System.out.println("========================================");
    }

    private void sendUnauthorizedResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        
        String jsonResponse = String.format(
            "{\"error\":\"Unauthorized\",\"message\":\"%s\",\"timestamp\":\"%s\"}",
            message,
            java.time.LocalDateTime.now()
        );
        
        response.getWriter().write(jsonResponse);
    }
}