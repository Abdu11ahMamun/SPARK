package com.mislbd.spark.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Session Status DTO
 */
@Data
@Builder
public class SessionStatusDto {
    private Boolean valid;
    private String username;
    private String displayName;
    private String primaryRole;
    private Long minutesUntilExpiry;
    private Long minutesSinceLastActivity;
    private Boolean isAdmin;
    private Boolean isSystemAdmin;
    private String message;
}