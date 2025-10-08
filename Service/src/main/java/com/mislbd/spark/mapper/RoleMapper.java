package com.mislbd.spark.mapper;

import com.mislbd.spark.dto.RoleDto;
import com.mislbd.spark.entity.Role;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    RoleDto toDto(Role entity);

    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Role toEntity(RoleDto dto);
}
