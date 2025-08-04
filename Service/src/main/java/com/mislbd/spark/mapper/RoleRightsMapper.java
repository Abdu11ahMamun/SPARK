package com.mislbd.spark.mapper;

import com.mislbd.spark.dto.RoleRightsDto;
import com.mislbd.spark.entity.RoleRights;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface RoleRightsMapper {
    RoleRightsMapper INSTANCE = Mappers.getMapper(RoleRightsMapper.class);
    RoleRightsDto toDto(RoleRights roleRights);
    RoleRights toEntity(RoleRightsDto roleRightsDto);
}
