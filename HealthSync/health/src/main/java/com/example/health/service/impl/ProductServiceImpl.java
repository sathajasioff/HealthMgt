package com.example.health.service.impl;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.health.model.Product;
import com.example.health.repository.ProductRepository;
import com.example.health.service.ProductService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository repo;

    @Override
    public Product create(Product p) {
        p.setId(null);
        p.setActive(p.getActive() == null ? Boolean.TRUE : p.getActive());
        p.setCreatedAt(Instant.now());
        p.setUpdatedAt(Instant.now());
        return repo.save(p);
    }

    @Override
    public Product update(String id, Product p) {
        Product existing = repo.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        if (p.getName() != null) existing.setName(p.getName());
        if (p.getDosageForm() != null) existing.setDosageForm(p.getDosageForm());
        if (p.getStrength() != null) existing.setStrength(p.getStrength());
        if (p.getPrice() != null) existing.setPrice(p.getPrice());
        if (p.getStockQty() != null) existing.setStockQty(p.getStockQty());
        if (p.getActive() != null) existing.setActive(p.getActive());
        if (p.getImage() != null && p.getImage().length > 0) existing.setImage(p.getImage());
        if (p.getImageContentType() != null) existing.setImageContentType(p.getImageContentType());
        existing.setUpdatedAt(Instant.now());
        return repo.save(existing);
    }

    @Override
    public Product findById(String id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public List<Product> listActiveByPharmacy(String pharmacyId) {
        return repo.findByPharmacyIdAndActiveTrue(pharmacyId);
    }

    @Override
    public List<Product> listByPharmacy(String pharmacyId) {
        return repo.findByPharmacyId(pharmacyId);
    }

    @Override
    public List<Product> listAllActive() {
        return repo.findByActiveTrue();
    }

    @Override
    public void delete(String id) {
        if (id == null) return;
        if (repo.existsById(id)) {
            repo.deleteById(id);
        }
    }
}
