package com.mislbd.spark.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDTO {

    private Long id;
    private String username;
    private String email;
    private String role;
    private String fullName;
    private String phone;
    private String employeeId;

    private Long teamId;
    private String teamName;
}
