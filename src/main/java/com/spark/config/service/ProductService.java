package com.spark.config.service;

import com.spark.entities.Product;
import com.spark.dto.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public Page<Product> getProducts(Pageable pageable) {
        return productRepository.findAll(pageable);
    }
    public void saveProduct(Product product) {
        productRepository.save(product);
    }
    // Other methods related to products (e.g., addProduct, editProduct, deleteProduct) can go here
}
