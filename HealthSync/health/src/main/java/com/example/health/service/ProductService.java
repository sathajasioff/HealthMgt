package com.example.health.service;

import java.util.List;

import com.example.health.model.Product;

public interface ProductService {
    Product create(Product p);
    Product update(String id, Product p);
    Product findById(String id);
    List<Product> listActiveByPharmacy(String pharmacyId);
    List<Product> listByPharmacy(String pharmacyId);
    List<Product> listAllActive();
    void delete(String id);
}
