package com.example.health.controller;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;

import com.example.health.model.Pharmacy;
import com.example.health.service.PharmacyService;

class PharmacyControllerTest {

    private PharmacyController controller;
    private PharmacyService pharmacyService;

    @BeforeEach
    void setUp() {
        pharmacyService = Mockito.mock(PharmacyService.class);
        controller = new PharmacyController(pharmacyService);
    }

    @Test
    void testGetAllPharmacies() {
        Pharmacy pharmacy1 = new Pharmacy();
        pharmacy1.setId("1");
        pharmacy1.setName("Pharmacy A");
        pharmacy1.setAddress("Address A");
        
        Pharmacy pharmacy2 = new Pharmacy();
        pharmacy2.setId("2");
        pharmacy2.setName("Pharmacy B");
        pharmacy2.setAddress("Address B");
        Mockito.when(pharmacyService.findAll()).thenReturn(Arrays.asList(pharmacy1, pharmacy2));

        ResponseEntity<List<Pharmacy>> response = controller.all();

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        Pharmacy pharmacy = new Pharmacy();
        pharmacy.setId("1");
        pharmacy.setName("Pharmacy A");
        pharmacy.setAddress("Address A");
        Mockito.when(pharmacyService.findByUserId("user123")).thenReturn(List.of(pharmacy));
        assertEquals("Pharmacy B", response.getBody().get(1).getName());
    }

    @Test
    void testGetPharmaciesByUser() {
        Pharmacy pharmacy = new Pharmacy();
        pharmacy.setId("1");
        pharmacy.setName("Pharmacy A");
        pharmacy.setAddress("Address A");
        Mockito.when(pharmacyService.findByUserId("user123")).thenReturn(List.of(pharmacy));

        ResponseEntity<List<Pharmacy>> response = controller.byUser("user123");

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals("Pharmacy A", response.getBody().get(0).getName());
    }

    @Test
    void testCreatePharmacy() {
        Pharmacy pharmacy = new Pharmacy();
        pharmacy.setName("Pharmacy A");
        pharmacy.setAddress("Address A");
        
        Pharmacy savedPharmacy = new Pharmacy();
        savedPharmacy.setId("1");
        savedPharmacy.setName("Pharmacy A");
        savedPharmacy.setAddress("Address A");
        Mockito.when(pharmacyService.save(any(Pharmacy.class))).thenReturn(savedPharmacy);

        ResponseEntity<Pharmacy> response = controller.create(pharmacy);

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals("1", response.getBody().getId());
        assertEquals("Pharmacy A", response.getBody().getName());
    }
}