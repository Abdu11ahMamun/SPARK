package com.mislbd.spark.controller;

import com.mislbd.spark.service.PermissionSeedingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Permission Seeding Controller for initial data setup
 */
@RestController
@RequestMapping("/api/admin/seed")
@CrossOrigin(origins = "*", allowCredentials = "false")
@RequiredArgsConstructor
@Slf4j
public class PermissionSeedingController {

    private final PermissionSeedingService seedingService;

    /**
     * POST /api/admin/seed/permissions - Seed default permissions
     */
    @PostMapping("/permissions")
    public ResponseEntity<Map<String, Object>> seedPermissions(@RequestParam(defaultValue = "false") boolean force) {
        try {
            log.info("Starting permission seeding (force={})", force);
            Map<String, Object> result = seedingService.seedPermissions(force);
            
            if ((Boolean) result.get("success")) {
                log.info("Permission seeding completed successfully");
                return ResponseEntity.ok(result);
            } else {
                log.error("Permission seeding failed: {}", result.get("error"));
                return ResponseEntity.status(500).body(result);
            }
        } catch (Exception e) {
            log.error("Error during permission seeding", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * POST /api/admin/seed/role-permissions - Seed role-permission assignments
     */
    @PostMapping("/role-permissions")
    public ResponseEntity<Map<String, Object>> seedRolePermissions(@RequestParam(defaultValue = "false") boolean force) {
        try {
            log.info("Starting role-permission seeding (force={})", force);
            Map<String, Object> result = seedingService.seedRolePermissions(force);
            
            if ((Boolean) result.get("success")) {
                log.info("Role-permission seeding completed successfully");
                return ResponseEntity.ok(result);
            } else {
                log.error("Role-permission seeding failed: {}", result.get("error"));
                return ResponseEntity.status(500).body(result);
            }
        } catch (Exception e) {
            log.error("Error during role-permission seeding", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * POST /api/admin/seed/all - Complete seeding (permissions + role assignments)
     */
    @PostMapping("/all")
    public ResponseEntity<Map<String, Object>> seedAll(@RequestParam(defaultValue = "false") boolean force) {
        try {
            log.info("Starting complete seeding process (force={})", force);
            Map<String, Object> result = seedingService.seedAll(force);
            
            if ((Boolean) result.get("success")) {
                log.info("Complete seeding process completed successfully");
                return ResponseEntity.ok(result);
            } else {
                log.error("Complete seeding process failed");
                return ResponseEntity.status(500).body(result);
            }
        } catch (Exception e) {
            log.error("Error during complete seeding process", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * GET /api/admin/seed/status - Get seeding status information
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSeedingStatus() {
        try {
            // This could be expanded to show detailed seeding status
            Map<String, Object> status = Map.of(
                "message", "Seeding endpoints are available",
                "endpoints", Map.of(
                    "seedPermissions", "POST /api/admin/seed/permissions?force=false",
                    "seedRolePermissions", "POST /api/admin/seed/role-permissions?force=false", 
                    "seedAll", "POST /api/admin/seed/all?force=false"
                ),
                "note", "Use force=true to overwrite existing data"
            );
            
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            log.error("Error getting seeding status", e);
            return ResponseEntity.status(500).body(Map.of(
                "error", e.getMessage()
            ));
        }
    }
}