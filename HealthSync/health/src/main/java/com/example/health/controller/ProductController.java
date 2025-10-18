package com.example.health.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.example.health.model.Product;
import com.example.health.service.ProductService;
import com.example.health.service.PharmacyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final PharmacyService pharmacyService;

    @PostMapping
    public ResponseEntity<Product> create(@RequestBody Product p) {
        return ResponseEntity.ok(productService.create(p));
    }

    @PostMapping("/pharmacy/{pharmacyId}")
    public ResponseEntity<Product> createForPharmacy(@PathVariable String pharmacyId, @RequestBody Product p) {
        // Ensure pharmacy exists and set reference server-side
        pharmacyService.findById(pharmacyId).orElseThrow(() -> new RuntimeException("Pharmacy not found"));
        p.setPharmacyId(pharmacyId);
        return ResponseEntity.ok(productService.create(p));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable String id, @RequestBody Product p) {
        return ResponseEntity.ok(productService.update(id, p));
    }

    @PutMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> uploadImage(@PathVariable String id, @RequestParam("file") MultipartFile file) throws Exception {
        Product p = productService.findById(id);
        if (p == null) return ResponseEntity.notFound().build();
        p.setImage(file.getBytes());
        p.setImageContentType(file.getContentType());
        return ResponseEntity.ok(productService.update(id, p));
    }

    @GetMapping(value = "/{id}/image")
    public ResponseEntity<byte[]> getImage(@PathVariable String id) {
        Product p = productService.findById(id);
        if (p == null || p.getImage() == null) return ResponseEntity.notFound().build();
        MediaType ct;
        try { ct = MediaType.parseMediaType(p.getImageContentType()); } catch (Exception e) { ct = MediaType.IMAGE_JPEG; }
        return ResponseEntity.ok().contentType(ct).body(p.getImage());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/pharmacy/{pharmacyId}")
    public ResponseEntity<List<Product>> byPharmacy(@PathVariable String pharmacyId) {
        return ResponseEntity.ok(productService.listByPharmacy(pharmacyId));
    }

    @GetMapping("/pharmacy/{pharmacyId}/active")
    public ResponseEntity<List<Product>> activeByPharmacy(@PathVariable String pharmacyId) {
        return ResponseEntity.ok(productService.listActiveByPharmacy(pharmacyId));
    }

    @GetMapping("/active")
    public ResponseEntity<List<Product>> allActive() {
        return ResponseEntity.ok(productService.listAllActive());
    }
}
