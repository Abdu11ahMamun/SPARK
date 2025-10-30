package com.mislbd.spark.controller;

import com.mislbd.spark.dto.ApiResponse;
import com.mislbd.spark.service.RBACService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Dashboard Controller - Accessible to Everyone
 * 
 * Provides dashboard access with professional authorization display.
 * This controller demonstrates how to show user access rights in a
 * clean, professional manner.
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-12
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class DashboardController {
    
    private final RBACService rbacService;
    
    /**
     * Get Dashboard - Accessible to All Authenticated Users
     * Shows professional authorization status and access rights
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return ResponseEntity.status(401)
                .body(ApiResponse.<Map<String, Object>>builder()
                    .success(false)
                    .message("Authentication required to access dashboard")
                    .build());
        }
        
        try {
            String username = auth.getName();
            
            // Get user authorities (roles and permissions)
            Set<String> authorities = auth.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .collect(Collectors.toSet());
                
            // Separate roles and permissions
            Set<String> roles = authorities.stream()
                .filter(auth2 -> auth2.startsWith("ROLE_"))
                .map(role -> role.substring(5)) // Remove "ROLE_" prefix
                .collect(Collectors.toSet());
                
            Set<String> permissions = authorities.stream()
                .filter(auth2 -> !auth2.startsWith("ROLE_"))
                .collect(Collectors.toSet());
            
            // Build professional dashboard response
            Map<String, Object> dashboardData = new LinkedHashMap<>();
            
            // User Information
            Map<String, Object> userInfo = new LinkedHashMap<>();
            userInfo.put("username", username);
            userInfo.put("authenticated", true);
            userInfo.put("accessLevel", roles.contains("ADMIN") ? "Administrator" : 
                                        roles.contains("MANAGER") ? "Manager" : 
                                        roles.contains("DEVELOPER") ? "Developer" : "User");
            
            // Access Rights Summary
            Map<String, Object> accessRights = new LinkedHashMap<>();
            accessRights.put("totalRoles", roles.size());
            accessRights.put("totalPermissions", permissions.size());
            accessRights.put("roles", roles);
            accessRights.put("permissions", permissions.stream().limit(10).collect(Collectors.toSet()));
            accessRights.put("hasAdminAccess", roles.contains("ADMIN"));
            accessRights.put("canManageUsers", authorities.contains("USER_MANAGEMENT") || roles.contains("ADMIN"));
            accessRights.put("canViewReports", authorities.contains("REPORTS_VIEW") || roles.contains("ADMIN") || roles.contains("MANAGER"));
            
            // Dashboard Stats (Mock data - replace with real stats)
            Map<String, Object> stats = new LinkedHashMap<>();
            stats.put("totalProjects", 12);
            stats.put("activeProjects", 8);
            stats.put("completedTasks", 156);
            stats.put("pendingTasks", 23);
            
            // System Status
            Map<String, Object> systemStatus = new LinkedHashMap<>();
            systemStatus.put("serverStatus", "Online");
            systemStatus.put("databaseStatus", "Connected");
            systemStatus.put("authenticationSystem", "Active");
            systemStatus.put("sessionValid", true);
            
            dashboardData.put("user", userInfo);
            dashboardData.put("accessRights", accessRights);
            dashboardData.put("statistics", stats);
            dashboardData.put("systemStatus", systemStatus);
            dashboardData.put("accessTime", java.time.LocalDateTime.now().toString());
            
            // Professional logging
            log.info("Dashboard accessed by user: {} with {} roles and {} permissions", 
                     username, roles.size(), permissions.size());
            
            return ResponseEntity.ok(
                ApiResponse.<Map<String, Object>>builder()
                    .success(true)
                    .message("Dashboard data retrieved successfully")
                    .data(dashboardData)
                    .build()
            );
            
        } catch (Exception e) {
            log.error("Error retrieving dashboard data: {}", e.getMessage());
            return ResponseEntity.status(500)
                .body(ApiResponse.<Map<String, Object>>builder()
                    .success(false)
                    .message("Error retrieving dashboard data: " + e.getMessage())
                    .build());
        }
    }
    
    /**
     * Get User Access Summary - Professional display of authorization status
     */
    @GetMapping("/access-summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAccessSummary() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return ResponseEntity.status(401)
                .body(ApiResponse.<Map<String, Object>>builder()
                    .success(false)
                    .message("Authentication required")
                    .build());
        }
        
        String username = auth.getName();
        Set<String> authorities = auth.getAuthorities().stream()
            .map(authority -> authority.getAuthority())
            .collect(Collectors.toSet());
            
        Set<String> roles = authorities.stream()
            .filter(auth2 -> auth2.startsWith("ROLE_"))
            .map(role -> role.substring(5))
            .collect(Collectors.toSet());
            
        Set<String> permissions = authorities.stream()
            .filter(auth2 -> !auth2.startsWith("ROLE_"))
            .collect(Collectors.toSet());
        
        Map<String, Object> accessSummary = new LinkedHashMap<>();
        accessSummary.put("username", username);
        accessSummary.put("sessionActive", true);
        accessSummary.put("authenticationStatus", "AUTHENTICATED");
        accessSummary.put("rolesAssigned", roles);
        accessSummary.put("permissionsGranted", permissions);
        accessSummary.put("accessLevel", roles.contains("ADMIN") ? "Full System Access" : 
                                        roles.contains("MANAGER") ? "Management Access" : 
                                        roles.contains("DEVELOPER") ? "Development Access" : "Basic User Access");
        accessSummary.put("lastActivity", java.time.LocalDateTime.now().toString());
        
        return ResponseEntity.ok(
            ApiResponse.<Map<String, Object>>builder()
                .success(true)
                .message("Access summary retrieved successfully")
                .data(accessSummary)
                .build()
        );
    }
}