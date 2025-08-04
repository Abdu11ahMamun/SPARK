package com.mislbd.spark.dto;

import lombok.*;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamDto {
    private Integer id;
    private String teamName;
    private String description;
    private Instant createdAt;
    private Instant updatedAt;
    private Integer status;
    private Integer pOwner;
    private Integer sMaster;
}
