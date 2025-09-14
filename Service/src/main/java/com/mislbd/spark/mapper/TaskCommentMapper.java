package com.mislbd.spark.mapper;

import com.mislbd.spark.dto.TaskCommentDto;
import com.mislbd.spark.entity.TaskComment;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface TaskCommentMapper {
    TaskCommentMapper INSTANCE = Mappers.getMapper(TaskCommentMapper.class);
    TaskCommentDto toDto(TaskComment entity);
    TaskComment toEntity(TaskCommentDto dto);
}
