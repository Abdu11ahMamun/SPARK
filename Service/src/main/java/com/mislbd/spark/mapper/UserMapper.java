package com.mislbd.spark.mapper;


import com.mislbd.spark.dto.UserDTO;
import com.mislbd.spark.entity.User;
import org.mapstruct.InheritInverseConfiguration;
import org.mapstruct.Mapper;
import org.springframework.web.bind.annotation.Mapping;


@Mapper(componentModel = "spring")
public interface UserMapper {

//    @Mapping(source = "team.id", target = "teamId")
//    @Mapping(source = "team.teamname", target = "teamName")
//    @Mapping(expression = "java(user.getFirstName() + ' ' + user.getLastName())", target = "fullName")
//    UserDTO toDto(User user);

    @InheritInverseConfiguration
    User toEntity(UserDTO dto);
}

