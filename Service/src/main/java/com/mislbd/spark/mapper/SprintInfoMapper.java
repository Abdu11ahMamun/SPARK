package com.mislbd.spark.mapper;

import com.mislbd.spark.dto.SprintInfoDto;
import com.mislbd.spark.entity.SprintInfo;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.factory.Mappers;

import java.io.Reader;
import java.sql.Clob;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SprintInfoMapper {
    SprintInfoMapper INSTANCE = Mappers.getMapper(SprintInfoMapper.class);

    // Entity -> DTO
    @Mapping(target = "comments", source = "comments", qualifiedByName = "clobToString")
    @Mapping(target = "sprintOutcome", source = "sprintOutcome", qualifiedByName = "clobToString")
    @Mapping(target = "fromDate", source = "fromDate", qualifiedByName = "localDateToString")
    @Mapping(target = "toDate", source = "toDate", qualifiedByName = "localDateToString")
    @Mapping(target = "createTime", source = "createTime", qualifiedByName = "instantToIsoString")
    SprintInfoDto toDto(SprintInfo sprintInfo);

    // DTO -> Entity
    @Mapping(target = "comments", ignore = true) // handled separately if needed
    @Mapping(target = "sprintOutcome", ignore = true) // handled separately if needed
    @Mapping(target = "fromDate", source = "fromDate", qualifiedByName = "stringToLocalDate")
    @Mapping(target = "toDate", source = "toDate", qualifiedByName = "stringToLocalDate")
    @Mapping(target = "createTime", ignore = true) // set by auditing/onCreate
    SprintInfo toEntity(SprintInfoDto sprintInfoDto);

    // Helper mappers
    @Named("clobToString")
    default String clobToString(Clob clob) {
        if (clob == null) return null;
        try {
            long len = clob.length();
            if (len == 0) return "";
            return clob.getSubString(1, (int) len);
        } catch (Exception e) {
            // Fallback: best-effort conversion
            try {
                Reader r = clob.getCharacterStream();
                StringBuilder sb = new StringBuilder();
                char[] buf = new char[2048];
                int n;
                while ((n = r.read(buf)) > 0) {
                    sb.append(buf, 0, n);
                }
                return sb.toString();
            } catch (Exception ignore) {
                return null;
            }
        }
    }

    @Named("localDateToString")
    default String localDateToString(LocalDate date) {
        if (date == null) return null;
        return date.format(DateTimeFormatter.ISO_LOCAL_DATE);
    }

    @Named("instantToIsoString")
    default String instantToIsoString(Instant instant) {
        return instant != null ? instant.toString() : null;
    }

    @Named("stringToLocalDate")
    default LocalDate stringToLocalDate(String value) {
        if (value == null || value.isBlank()) return null;
        try { return LocalDate.parse(value, DateTimeFormatter.ISO_LOCAL_DATE); } catch (Exception ignored) {}
        try { return LocalDate.parse(value); } catch (Exception ignored) {}
        try { return LocalDate.parse(value, DateTimeFormatter.ofPattern("M/d/yyyy")); } catch (Exception ignored) {}
        try { return LocalDate.parse(value, DateTimeFormatter.ofPattern("MM/dd/yyyy")); } catch (Exception ignored) {}
        return null;
    }
}
