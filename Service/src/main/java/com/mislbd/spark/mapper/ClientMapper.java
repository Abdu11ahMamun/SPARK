package com.mislbd.spark.mapper;

import com.mislbd.spark.dto.ClientDto;
import com.mislbd.spark.entity.Client;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface ClientMapper {
    ClientMapper INSTANCE = Mappers.getMapper(ClientMapper.class);

    ClientDto toDto(Client client);
    Client toEntity(ClientDto clientDto);
}
