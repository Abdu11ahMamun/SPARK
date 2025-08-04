package com.mislbd.spark.mapper;

import com.mislbd.spark.dto.SprintUserInfoDto;
import com.mislbd.spark.entity.SprintUserInfo;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface SprintUserInfoMapper {
    SprintUserInfoMapper INSTANCE = Mappers.getMapper(SprintUserInfoMapper.class);

    @Mapping(target = "createTime", expression = "java(sprintUserInfo.getCreateTime() != null ? sprintUserInfo.getCreateTime().toString() : null)")
    SprintUserInfoDto toDto(SprintUserInfo sprintUserInfo);

    @Mapping(target = "createTime", ignore = true)
    SprintUserInfo toEntity(SprintUserInfoDto sprintUserInfoDto);
}
