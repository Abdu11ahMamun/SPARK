package com.mislbd.spark.mapper;

import com.mislbd.spark.dto.MitsDocumentsDto;
import com.mislbd.spark.entity.MitsDocuments;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface MitsDocumentsMapper {
    MitsDocumentsMapper INSTANCE = Mappers.getMapper(MitsDocumentsMapper.class);

    @Mapping(target = "document", ignore = true) // handle BLOB separately
    MitsDocumentsDto toDto(MitsDocuments mitsDocuments);

    @Mapping(target = "document", ignore = true) // handle BLOB separately
    MitsDocuments toEntity(MitsDocumentsDto mitsDocumentsDto);
}
