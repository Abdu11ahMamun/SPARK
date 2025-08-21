package com.mislbd.spark.mapper;

import com.mislbd.spark.dto.BacklogTaskDto;
import com.mislbd.spark.entity.BacklogTask;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface BacklogTaskMapper {
    BacklogTaskMapper INSTANCE = Mappers.getMapper(BacklogTaskMapper.class);
    BacklogTaskDto toDto(BacklogTask backlogTask);
    BacklogTask toEntity(BacklogTaskDto backlogTaskDto);
}
