package com.mislbd.spark.mapper;

import com.mislbd.spark.dto.SprintDto;
import com.mislbd.spark.entity.Sprint;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface SprintMapper {
    SprintMapper INSTANCE = Mappers.getMapper(SprintMapper.class);
    
    SprintDto toDto(Sprint sprint);
    
    Sprint toEntity(SprintDto sprintDto);
}
