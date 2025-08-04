package com.mislbd.spark.service;

import com.mislbd.spark.entity.ProductModule;
import com.mislbd.spark.repository.ProductModuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductModuleService {
    private final ProductModuleRepository productModuleRepository;

    @Autowired
    public ProductModuleService(ProductModuleRepository productModuleRepository) {
        this.productModuleRepository = productModuleRepository;
    }

    public List<ProductModule> getAllProductModules() {
        return productModuleRepository.findAll();
    }

    public List<ProductModule> getModulesByProductId(Integer productId) {
        return productModuleRepository.findByProductId(productId);
    }

    public Optional<ProductModule> getProductModuleById(Integer id) {
        return productModuleRepository.findById(id);
    }

    public ProductModule saveProductModule(ProductModule productModule) {
        return productModuleRepository.save(productModule);
    }

    public void deleteProductModule(Integer id) {
        productModuleRepository.deleteById(id);
    }
}
