package com.mislbd.spark.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductModuleDto {
    private Integer id;
    private String name;
    private Integer productId;
    private String release;
    private String moduleStatus;
    private Integer moduleOwnerId;
    private Integer client;
}
