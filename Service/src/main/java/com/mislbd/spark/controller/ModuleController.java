package com.mislbd.spark.controller;

import com.mislbd.spark.dto.ProductModuleDto;
import com.mislbd.spark.entity.ProductModule;
import com.mislbd.spark.mapper.ProductModuleMapper;
import com.mislbd.spark.service.ProductModuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/modules")
@CrossOrigin(origins = "*", allowCredentials = "false")
public class ModuleController {
    private final ProductModuleService productModuleService;
    private final ProductModuleMapper productModuleMapper;

    @Autowired
    public ModuleController(ProductModuleService productModuleService, ProductModuleMapper productModuleMapper) {
        this.productModuleService = productModuleService;
        this.productModuleMapper = productModuleMapper;
    }

    @GetMapping
    public List<ProductModuleDto> getAllModules() {
        return productModuleService.getAllProductModules().stream()
                .map(productModuleMapper::toDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductModuleDto> getModuleById(@PathVariable Integer id) {
        return productModuleService.getProductModuleById(id)
                .map(productModuleMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ProductModuleDto createModule(@RequestBody ProductModuleDto moduleDto) {
        ProductModule productModule = productModuleMapper.toEntity(moduleDto);
        ProductModule savedModule = productModuleService.saveProductModule(productModule);
        return productModuleMapper.toDto(savedModule);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductModuleDto> updateModule(@PathVariable Integer id, @RequestBody ProductModuleDto moduleDto) {
        return productModuleService.getProductModuleById(id)
                .map(existing -> {
                    moduleDto.setId(id);
                    ProductModule updated = productModuleService.saveProductModule(productModuleMapper.toEntity(moduleDto));
                    return ResponseEntity.ok(productModuleMapper.toDto(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteModule(@PathVariable Integer id) {
        if (productModuleService.getProductModuleById(id).isPresent()) {
            productModuleService.deleteProductModule(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
