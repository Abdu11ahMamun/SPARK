package com.mislbd.spark.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppConfigDto {
    private Integer id;
    private String configName;
    private Integer status;
    private String value;
}
