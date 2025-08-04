package com.mislbd.spark.mapper;

import com.mislbd.spark.dto.ProductModuleDto;
import com.mislbd.spark.entity.ProductModule;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface ProductModuleMapper {
    ProductModuleMapper INSTANCE = Mappers.getMapper(ProductModuleMapper.class);
    ProductModuleDto toDto(ProductModule productModule);
    ProductModule toEntity(ProductModuleDto productModuleDto);
}
