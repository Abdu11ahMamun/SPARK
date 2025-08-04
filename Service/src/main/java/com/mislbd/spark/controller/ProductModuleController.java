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
@RequestMapping("/api/product-modules")
public class ProductModuleController {
    private final ProductModuleService productModuleService;
    private final ProductModuleMapper productModuleMapper;

    @Autowired
    public ProductModuleController(ProductModuleService productModuleService, ProductModuleMapper productModuleMapper) {
        this.productModuleService = productModuleService;
        this.productModuleMapper = productModuleMapper;
    }

    @GetMapping
    public List<ProductModuleDto> getAllProductModules() {
        return productModuleService.getAllProductModules().stream().map(productModuleMapper::toDto).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductModuleDto> getProductModuleById(@PathVariable Integer id) {
        return productModuleService.getProductModuleById(id)
                .map(productModuleMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ProductModuleDto createProductModule(@RequestBody ProductModuleDto productModuleDto) {
        ProductModule productModule = productModuleMapper.toEntity(productModuleDto);
        return productModuleMapper.toDto(productModuleService.saveProductModule(productModule));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductModuleDto> updateProductModule(@PathVariable Integer id, @RequestBody ProductModuleDto productModuleDto) {
        return productModuleService.getProductModuleById(id)
                .map(existing -> {
                    productModuleDto.setId(id);
                    ProductModule updated = productModuleService.saveProductModule(productModuleMapper.toEntity(productModuleDto));
                    return ResponseEntity.ok(productModuleMapper.toDto(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductModule(@PathVariable Integer id) {
        if (productModuleService.getProductModuleById(id).isPresent()) {
            productModuleService.deleteProductModule(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
