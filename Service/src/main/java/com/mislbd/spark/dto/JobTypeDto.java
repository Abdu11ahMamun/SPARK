package com.mislbd.spark.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobTypeDto {
    private Integer id;
    private String type;
    private String description;
}
