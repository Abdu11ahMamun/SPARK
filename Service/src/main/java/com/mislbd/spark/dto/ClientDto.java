package com.mislbd.spark.dto;

import lombok.*;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientDto {
    private Integer id;
    private String name;
    private String contactPerson;
    private String email;
    private String phone;
    private String status;
    private Instant createdDate;
}
