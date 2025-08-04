package com.mislbd.spark.dto;

import lombok.*;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MitsDocumentsDto {
    private Integer id;
    private Integer mits;
    private String description;
    private byte[] document;
    private String fileName;
    private String mimetype;
    private Instant createdAt;
    private Instant updatedAt;
}
