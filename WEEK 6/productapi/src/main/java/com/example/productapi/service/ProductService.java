package com.example.productapi.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.productapi.model.Product;
import com.example.productapi.repository.ProductRepository;

@Service
public class ProductService {

    @Autowired
    private ProductRepository repository;

    public Product addProduct(Product product) {
        return repository.save(product);
    }

    public List<Product> getAllProducts() {
        return repository.findAll();
    }

    public Product getProductById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Product updateProduct(Long id, Product product) {
        product.setId(id);
        return repository.save(product);
    }

    public void deleteProduct(Long id) {
        repository.deleteById(id);
    }
}