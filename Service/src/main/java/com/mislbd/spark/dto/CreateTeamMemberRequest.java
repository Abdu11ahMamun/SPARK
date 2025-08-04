package com.mislbd.spark.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTeamMemberRequest {
    private Integer userId;
    private String role;
}
