package com.mislbd.spark.mapper;

import com.mislbd.spark.dto.BacklogTaskDto;
import com.mislbd.spark.entity.BacklogTask;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface BacklogTaskMapper {
    BacklogTaskMapper INSTANCE = Mappers.getMapper(BacklogTaskMapper.class);
    
    @Mapping(source = "productModuleId", target = "moduleId")
    @Mapping(source = "assignedto", target = "assigneeId") 
    @Mapping(source = "sprintid", target = "sprintId")
    @Mapping(target = "type", ignore = true)
    BacklogTaskDto toDto(BacklogTask backlogTask);
    
    @Mapping(source = "moduleId", target = "productModuleId")
    @Mapping(source = "assigneeId", target = "assignedto")
    BacklogTask toEntity(BacklogTaskDto backlogTaskDto);
}
