package com.mislbd.spark.dto;

import lombok.Data;

@Data
public class TaskTypeDto {
    private Long id;
    private String name;
    private String description;
    private Boolean active;
}
