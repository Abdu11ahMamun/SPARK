package com.mislbd.spark.controller;

import com.mislbd.spark.dto.RoleDto;
import com.mislbd.spark.entity.RoleEntity;
import com.mislbd.spark.mapper.RoleMapper;
import com.mislbd.spark.service.RoleEntityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/roles-dynamic")
@CrossOrigin(origins = "*", allowCredentials = "false")
public class RoleEntityController {
    private final RoleEntityService service;
    private final RoleMapper mapper;

    public RoleEntityController(RoleEntityService service, RoleMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public List<RoleDto> all() { return service.findAll().stream().map(mapper::toDto).collect(Collectors.toList()); }

    @GetMapping("/{id}")
    public ResponseEntity<RoleDto> one(@PathVariable Long id) {
        return service.findById(id)
                .map(r -> ResponseEntity.ok(mapper.toDto(r)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<RoleDto> create(@RequestBody RoleDto dto) {
        if (dto.getName() == null || dto.getName().isBlank()) return ResponseEntity.badRequest().build();
        if (service.nameExists(dto.getName())) return ResponseEntity.status(409).build();
        RoleEntity saved = service.save(mapper.toEntity(dto));
        return ResponseEntity.ok(mapper.toDto(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoleDto> update(@PathVariable Long id, @RequestBody RoleDto dto) {
        return service.findById(id).map(existing -> {
            RoleEntity toUpdate = mapper.toEntity(dto);
            toUpdate.setId(id);
            if (toUpdate.getActive() == null) toUpdate.setActive(existing.getActive());
            RoleEntity saved = service.save(toUpdate);
            return ResponseEntity.ok(mapper.toDto(saved));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (service.findById(id).isEmpty()) return ResponseEntity.notFound().build();
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
