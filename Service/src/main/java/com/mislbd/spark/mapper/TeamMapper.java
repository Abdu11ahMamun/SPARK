package com.mislbd.spark.mapper;

import com.mislbd.spark.dto.TeamDto;
import com.mislbd.spark.entity.Team;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface TeamMapper {
    TeamMapper INSTANCE = Mappers.getMapper(TeamMapper.class);
    TeamDto toDto(Team team);
    Team toEntity(TeamDto teamDto);
}
