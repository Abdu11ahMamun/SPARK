package com.mislbd.spark.mapper;

import com.mislbd.spark.dto.TaskTypeDto;
import com.mislbd.spark.entity.TaskTypeEntity;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface TaskTypeEntityMapper {
    TaskTypeDto toDto(TaskTypeEntity entity);

    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    TaskTypeEntity toEntity(TaskTypeDto dto);
}
