package com.mislbd.spark.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * Login Response DTO
 */
@Data
@Builder
public class LoginResponse {
    private String sessionToken;
    private UserSessionDto user;
    private Set<String> permissions;
    private Set<String> roles;
    private LocalDateTime expiresAt;
    private String message;
    
    @Data
    @Builder
    public static class UserSessionDto {
        private Long id;
        private String username;
        private String displayName;
        private String email;
        private String primaryRole;
        private Boolean isAdmin;
        private Boolean isSystemAdmin;
        private Integer permissionsCount;
        private Integer rolesCount;
    }
}