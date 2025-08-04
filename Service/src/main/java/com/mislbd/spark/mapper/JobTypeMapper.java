package com.mislbd.spark.mapper;

import com.mislbd.spark.dto.JobTypeDto;
import com.mislbd.spark.entity.JobType;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface JobTypeMapper {
    JobTypeMapper INSTANCE = Mappers.getMapper(JobTypeMapper.class);
    JobTypeDto toDto(JobType jobType);
    JobType toEntity(JobTypeDto jobTypeDto);
}
