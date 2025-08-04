package com.mislbd.spark.mapper;

import com.mislbd.spark.dto.AppConfigDto;
import com.mislbd.spark.entity.AppConfig;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface AppConfigMapper {
    AppConfigMapper INSTANCE = Mappers.getMapper(AppConfigMapper.class);
    AppConfigDto toDto(AppConfig appConfig);
    AppConfig toEntity(AppConfigDto appConfigDto);
}
