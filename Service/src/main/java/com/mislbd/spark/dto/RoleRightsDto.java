package com.mislbd.spark.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleRightsDto {
    private Integer id;
    private String roleName;
    private String pageList;
    private Integer status;
}
