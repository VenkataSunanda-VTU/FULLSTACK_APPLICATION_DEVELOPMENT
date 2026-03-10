package com.example.productapi.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.productapi.model.Product;
import com.example.productapi.service.ProductService;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService service;

    // POST
    @PostMapping
    public Product addProduct(@RequestBody Product product) {
        return service.addProduct(product);
    }

    // GET ALL
    @GetMapping
    public List<Product> getAllProducts() {
        return service.getAllProducts();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        Product product = service.getProductById(id);
        return ResponseEntity.ok(product);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Long id,
                                 @RequestBody Product product) {
        return service.updateProduct(id, product);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable Long id) {
        service.deleteProduct(id);
        return "Product Deleted";
    }
}