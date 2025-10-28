package com.mislbd.spark.mapper;

import com.mislbd.spark.dto.UserSessionMetadataDto;
import com.mislbd.spark.dto.LoginResponse;
import com.mislbd.spark.entity.UserSessionMetadata;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Set;

/**
 * Mapper for UserSessionMetadata Entity and DTO
 * 
 * Handles conversion between internal entity representation and
 * external DTO representation with proper JSON parsing.
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-22
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class UserSessionMetadataMapper {

    private final ObjectMapper objectMapper;

    /**
     * Convert entity to DTO
     */
    public UserSessionMetadataDto toDto(UserSessionMetadata entity) {
        if (entity == null) return null;

        return UserSessionMetadataDto.builder()
            .id(entity.getId())
            .sessionToken(entity.getSessionToken())
            .userId(entity.getUserId())
            .username(entity.getUsername())
            .displayName(entity.getDisplayName())
            .email(entity.getEmail())
            .primaryRole(entity.getPrimaryRole())
            .roles(parseJsonToSet(entity.getRolesJson()))
            .permissions(parseJsonToSet(entity.getPermissionsJson()))
            .resources(parseJsonToSet(entity.getResourcesJson()))
            .isAdmin(entity.getIsAdmin())
            .isSystemAdmin(entity.getIsSystemAdmin())
            .permissionsCount(entity.getPermissionsCount())
            .rolesCount(entity.getRolesCount())
            .createdAt(entity.getCreatedAt())
            .lastActivityAt(entity.getLastActivityAt())
            .expiresAt(entity.getExpiresAt())
            .active(entity.getActive())
            .ipAddress(entity.getIpAddress())
            .deviceType(entity.getDeviceType())
            .loginSource(entity.getLoginSource())
            .build();
    }

    /**
     * Convert DTO to entity (for updates)
     * Note: Some fields like JSON strings are not updated from DTO
     */
    public UserSessionMetadata toEntity(UserSessionMetadataDto dto) {
        if (dto == null) return null;

        return UserSessionMetadata.builder()
            .id(dto.getId())
            .sessionToken(dto.getSessionToken())
            .displayName(dto.getDisplayName())
            .email(dto.getEmail())
            .primaryRole(dto.getPrimaryRole())
            .isAdmin(dto.getIsAdmin())
            .isSystemAdmin(dto.getIsSystemAdmin())
            .permissionsCount(dto.getPermissionsCount())
            .rolesCount(dto.getRolesCount())
            .createdAt(dto.getCreatedAt())
            .lastActivityAt(dto.getLastActivityAt())
            .expiresAt(dto.getExpiresAt())
            .active(dto.getActive())
            .ipAddress(dto.getIpAddress())
            .deviceType(dto.getDeviceType())
            .loginSource(dto.getLoginSource())
            // Note: User entity and JSON fields need to be set separately
            .build();
    }

    /**
     * Create minimal session info DTO (for public APIs)
     */
    public UserSessionMetadataDto toMinimalDto(UserSessionMetadata entity) {
        if (entity == null) return null;

        return UserSessionMetadataDto.builder()
            .sessionToken(entity.getSessionToken())
            .userId(entity.getUserId())
            .username(entity.getUsername())
            .displayName(entity.getDisplayName())
            .email(entity.getEmail())
            .primaryRole(entity.getPrimaryRole())
            .isAdmin(entity.getIsAdmin())
            .isSystemAdmin(entity.getIsSystemAdmin())
            .createdAt(entity.getCreatedAt())
            .lastActivityAt(entity.getLastActivityAt())
            .expiresAt(entity.getExpiresAt())
            .active(entity.getActive())
            .deviceType(entity.getDeviceType())
            // Exclude sensitive information like permissions, IP, user agent
            .build();
    }

    /**
     * Create session info with permissions (for authorization)
     */
    public UserSessionMetadataDto toAuthorizationDto(UserSessionMetadata entity) {
        if (entity == null) return null;

        return UserSessionMetadataDto.builder()
            .sessionToken(entity.getSessionToken())
            .userId(entity.getUserId())
            .username(entity.getUsername())
            .displayName(entity.getDisplayName())
            .primaryRole(entity.getPrimaryRole())
            .roles(parseJsonToSet(entity.getRolesJson()))
            .permissions(parseJsonToSet(entity.getPermissionsJson()))
            .resources(parseJsonToSet(entity.getResourcesJson()))
            .isAdmin(entity.getIsAdmin())
            .isSystemAdmin(entity.getIsSystemAdmin())
            .permissionsCount(entity.getPermissionsCount())
            .rolesCount(entity.getRolesCount())
            .expiresAt(entity.getExpiresAt())
            .active(entity.getActive())
            .build();
    }

    /**
     * Parse JSON string to Set of strings
     */
    @SuppressWarnings("unchecked")
    private Set<String> parseJsonToSet(String json) {
        if (json == null || json.trim().isEmpty()) {
            return Collections.emptySet();
        }
        
        try {
            return objectMapper.readValue(json, 
                objectMapper.getTypeFactory().constructCollectionType(Set.class, String.class));
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse JSON to Set: {}", json, e);
            return Collections.emptySet();
        }
    }

    /**
     * Convert entity to UserSessionDto for login response
     */
    public LoginResponse.UserSessionDto toUserDto(UserSessionMetadata entity) {
        if (entity == null) return null;

        return LoginResponse.UserSessionDto.builder()
            .id(entity.getId())
            .username(entity.getUsername())
            .displayName(entity.getDisplayName())
            .email(entity.getEmail())
            .primaryRole(entity.getPrimaryRole())
            .isAdmin(entity.getIsAdmin())
            .isSystemAdmin(entity.getIsSystemAdmin())
            .permissionsCount(entity.getPermissionsCount())
            .rolesCount(entity.getRolesCount())
            .build();
    }

    /**
     * Convert Set to JSON string
     */
    private String setToJson(Set<String> set) {
        if (set == null || set.isEmpty()) {
            return "[]";
        }
        
        try {
            return objectMapper.writeValueAsString(set);
        } catch (JsonProcessingException e) {
            log.warn("Failed to convert Set to JSON: {}", set, e);
            return "[]";
        }
    }
}