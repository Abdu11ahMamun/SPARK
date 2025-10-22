package com.mislbd.spark.mapper;

import com.mislbd.spark.dto.PermissionDto;
import com.mislbd.spark.entity.Permission;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    PermissionDto toDto(Permission entity);

    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Permission toEntity(PermissionDto dto);
}