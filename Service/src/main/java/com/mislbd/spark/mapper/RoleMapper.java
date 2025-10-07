package com.mislbd.spark.mapper;

import com.mislbd.spark.dto.RoleDto;
import com.mislbd.spark.entity.RoleEntity;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    RoleDto toDto(RoleEntity entity);

    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    RoleEntity toEntity(RoleDto dto);
}
