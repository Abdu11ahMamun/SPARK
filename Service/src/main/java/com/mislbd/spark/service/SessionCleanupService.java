package com.mislbd.spark.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * Session Cleanup Scheduler
 * 
 * Automatically cleans up expired sessions to maintain database performance
 * and enforce proper session lifecycle management.
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-27
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SessionCleanupService {

    private final UserSessionMetadataService sessionService;

    /**
     * Clean up expired sessions every 10 minutes
     */
    @Scheduled(fixedRate = 600000) // 10 minutes
    public void cleanupExpiredSessions() {
        try {
            log.debug("Starting scheduled session cleanup...");
            sessionService.cleanupExpiredSessions();
        } catch (Exception e) {
            log.error("Error during scheduled session cleanup", e);
        }
    }

    /**
     * Clean up inactive sessions every 30 minutes
     */
    @Scheduled(fixedRate = 1800000) // 30 minutes
    public void cleanupInactiveSessions() {
        try {
            log.debug("Starting scheduled inactive session cleanup...");
            sessionService.cleanupInactiveSessions(30); // 30 minutes of inactivity
        } catch (Exception e) {
            // Check if this is a column missing error and handle gracefully
            if (e.getMessage() != null && e.getMessage().contains("LAST_ACTIVITY_AT") && 
                e.getMessage().contains("invalid identifier")) {
                log.warn("Session cleanup skipped - database column 'last_activity_at' not found. " +
                        "This will be resolved after database schema update.");
                return;
            }
            log.error("Error during inactive session cleanup", e);
        }
    }
}