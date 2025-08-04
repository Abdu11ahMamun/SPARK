package com.mislbd.spark.mapper;


import com.mislbd.spark.dto.UserDTO;
import com.mislbd.spark.entity.User;
import org.mapstruct.InheritInverseConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface UserMapper {

//    @Mapping(source = "team.id", target = "teamId")
//    @Mapping(source = "team.teamname", target = "teamName")
//    @Mapping(expression = "java(user.getFirstName() + ' ' + user.getLastName())", target = "fullName")
//    UserDTO toDto(User user);

    // Only map fields present in UserDTO, ignore the rest
    @InheritInverseConfiguration
    @Mapping(target = "firstName", ignore = true)
    @Mapping(target = "middleName", ignore = true)
    @Mapping(target = "lastName", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "activeStatus", ignore = true)
    @Mapping(target = "createdate", ignore = true)
    @Mapping(target = "updatedate", ignore = true)
    @Mapping(target = "memberships", ignore = true)
    User toEntity(UserDTO dto);
}

