package com.mislbd.spark.entity;

import jakarta.persistence.*;
import lombok.*;
import java.sql.Blob;
import java.time.Instant;
import com.mislbd.spark.repository.schema.SchemaConstant;

@Entity
@Table(name = SchemaConstant.MITS_DOCUMENTS_TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MitsDocuments {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Integer mits;

    @Column(length = 1000)
    private String description;

    @Lob
    private Blob document;

    @Column(name = "file_name", length = 200)
    private String fileName;

    @Column(length = 200)
    private String mimetype;

    @Column(name = "createdat")
    private Instant createdAt;

    @Column(name = "updatedat")
    private Instant updatedAt;
}
