package com.mislbd.spark.mapper;

import com.mislbd.spark.dto.ProductDto;
import com.mislbd.spark.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    ProductMapper INSTANCE = Mappers.getMapper(ProductMapper.class);

    @Mapping(target = "vision", expression = "java(product.getVision() != null ? product.getVision().toString() : null)")
    ProductDto toDto(Product product);

    @Mapping(target = "vision", ignore = true) // handle CLOB separately
    Product toEntity(ProductDto productDto);
}
