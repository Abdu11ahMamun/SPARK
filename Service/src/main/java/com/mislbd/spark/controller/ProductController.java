package com.mislbd.spark.controller;

import com.mislbd.spark.dto.ProductDto;
import com.mislbd.spark.entity.Product;
import com.mislbd.spark.entity.ProductModule;
import com.mislbd.spark.mapper.ProductMapper;
import com.mislbd.spark.service.ProductService;
import com.mislbd.spark.service.ProductModuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;
    private final ProductMapper productMapper;
    private final ProductModuleService productModuleService;

    @Autowired
    public ProductController(ProductService productService, ProductMapper productMapper, ProductModuleService productModuleService) {
        this.productService = productService;
        this.productMapper = productMapper;
        this.productModuleService = productModuleService;
    }

    @GetMapping
    public List<ProductDto> getAllProducts() {
        return productService.getAllProducts().stream().map(productMapper::toDto).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProductById(@PathVariable Integer id) {
        return productService.getProductById(id)
                .map(productMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ProductDto createProduct(@RequestBody ProductDto productDto) {
        Product product = productMapper.toEntity(productDto);
        return productMapper.toDto(productService.saveProduct(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDto> updateProduct(@PathVariable Integer id, @RequestBody ProductDto productDto) {
        return productService.getProductById(id)
                .map(existing -> {
                    productDto.setId(id);
                    Product updated = productService.saveProduct(productMapper.toEntity(productDto));
                    return ResponseEntity.ok(productMapper.toDto(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Integer id) {
        if (productService.getProductById(id).isPresent()) {
            productService.deleteProduct(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Product Module Management Endpoints
    
    @GetMapping("/modules")
    public ResponseEntity<List<ProductModule>> getAllModules() {
        List<ProductModule> modules = productModuleService.getAllProductModules();
        return ResponseEntity.ok(modules);
    }
    
    @GetMapping("/{productId}/modules")
    public ResponseEntity<List<ProductModule>> getProductModules(@PathVariable Integer productId) {
        // Verify product exists first
        if (productService.getProductById(productId).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        List<ProductModule> modules = productModuleService.getModulesByProductId(productId);
        return ResponseEntity.ok(modules);
    }

    @PostMapping("/{productId}/modules")
    public ResponseEntity<ProductModule> addProductModule(@PathVariable Integer productId, @RequestBody ProductModule module) {
        // Verify product exists first
        if (productService.getProductById(productId).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        // Set the product ID
        module.setProductId(productId);
        
        ProductModule savedModule = productModuleService.saveProductModule(module);
        return ResponseEntity.ok(savedModule);
    }

    @PutMapping("/{productId}/modules/{moduleId}")
    public ResponseEntity<ProductModule> updateProductModule(
            @PathVariable Integer productId,
            @PathVariable Integer moduleId,
            @RequestBody ProductModule module) {
        
        // Verify product exists
        if (productService.getProductById(productId).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        // Verify module exists and belongs to the product
        return productModuleService.getProductModuleById(moduleId)
                .filter(existingModule -> existingModule.getProductId().equals(productId))
                .map(existingModule -> {
                    module.setId(moduleId);
                    module.setProductId(productId);
                    ProductModule updatedModule = productModuleService.saveProductModule(module);
                    return ResponseEntity.ok(updatedModule);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{productId}/modules/{moduleId}")
    public ResponseEntity<Void> deleteProductModule(@PathVariable Integer productId, @PathVariable Integer moduleId) {
        // Verify product exists
        if (productService.getProductById(productId).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        // Verify module exists and belongs to the product
        Optional<ProductModule> moduleOpt = productModuleService.getProductModuleById(moduleId);
        if (moduleOpt.isEmpty() || !moduleOpt.get().getProductId().equals(productId)) {
            return ResponseEntity.notFound().build();
        }
        
        productModuleService.deleteProductModule(moduleId);
        return ResponseEntity.noContent().build();
    }
}
