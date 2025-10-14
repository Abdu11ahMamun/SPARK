package com.mislbd.spark.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

/**
 * DTO for bulk permission operation responses
 * 
 * @author SPARK Team
 * @version 1.0
 * @since 2025-10-12
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkPermissionResponse {
    private String operation;
    private int successCount;
    private int errorCount;
    private List<Long> processedIds;
    private Map<Long, String> errors;
}