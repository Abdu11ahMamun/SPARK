package com.mislbd.spark.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDto {
    private Integer id;
    private String name;
    private String status;
    private String vision;
    private String version;
    private String currentRelease;
    private Integer productOwnerId;
    private Integer dependentProducts;
    private String client;
}
