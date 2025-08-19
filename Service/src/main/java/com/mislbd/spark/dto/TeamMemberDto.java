package com.mislbd.spark.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamMemberDto {
    private Integer id;
    private Integer userId;
    private Integer teamId;
    private String userName;
    private String userEmail;
    private String role;
    private String joinedDate;
}
