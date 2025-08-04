package com.mislbd.spark.mapper;

import com.mislbd.spark.dto.SprintInfoDto;
import com.mislbd.spark.entity.SprintInfo;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface SprintInfoMapper {
    SprintInfoMapper INSTANCE = Mappers.getMapper(SprintInfoMapper.class);

    @Mapping(target = "comments", expression = "java(sprintInfo.getComments() != null ? sprintInfo.getComments().toString() : null)")
    @Mapping(target = "sprintOutcome", expression = "java(sprintInfo.getSprintOutcome() != null ? sprintInfo.getSprintOutcome().toString() : null)")
    @Mapping(target = "fromDate", expression = "java(sprintInfo.getFromDate() != null ? sprintInfo.getFromDate().toString() : null)")
    @Mapping(target = "toDate", expression = "java(sprintInfo.getToDate() != null ? sprintInfo.getToDate().toString() : null)")
    @Mapping(target = "createTime", expression = "java(sprintInfo.getCreateTime() != null ? sprintInfo.getCreateTime().toString() : null)")
    SprintInfoDto toDto(SprintInfo sprintInfo);

    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "sprintOutcome", ignore = true)
    @Mapping(target = "fromDate", ignore = true)
    @Mapping(target = "toDate", ignore = true)
    @Mapping(target = "createTime", ignore = true)
    SprintInfo toEntity(SprintInfoDto sprintInfoDto);
}
