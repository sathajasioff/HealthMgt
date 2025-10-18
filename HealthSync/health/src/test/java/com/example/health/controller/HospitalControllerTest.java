package com.example.health.controller;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;

import com.example.health.model.Facility;
import com.example.health.model.MedicalEquipment;
import com.example.health.model.Ward;
import com.example.health.service.FacilityService;
import com.example.health.service.MedicalEquipmentService;
import com.example.health.service.NurseService;
import com.example.health.service.SupportServiceService;
import com.example.health.service.WardService;

class HospitalControllerTest {

    private HospitalController controller;
    private WardService wardService;
    private NurseService nurseService;
    private FacilityService facilityService;
    private MedicalEquipmentService equipmentService;
    private SupportServiceService supportService;

    @BeforeEach
    void setUp() {
        wardService = Mockito.mock(WardService.class);
        nurseService = Mockito.mock(NurseService.class);
        facilityService = Mockito.mock(FacilityService.class);
        equipmentService = Mockito.mock(MedicalEquipmentService.class);
        supportService = Mockito.mock(SupportServiceService.class);

        controller = new HospitalController(wardService, nurseService, facilityService, equipmentService, supportService);
    }

    @Test
    void testListWardsAsAdmin() {
        Ward ward1 = new Ward("1", "Ward A", "Description", "Type", 10, 10, "Status", null);
        Ward ward2 = new Ward("2", "Ward B", "Description", "Type", 15, 15, "Status", null);
        Mockito.when(wardService.findAll()).thenReturn(Arrays.asList(ward1, ward2));

        ResponseEntity<List<Ward>> response = controller.listWards("ADMIN");

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertEquals("Ward A", response.getBody().get(0).getName());
    }

    @Test
    void testCreateWardAsAdmin() {
        Ward ward = new Ward(null, "Ward A", "Description", "Type", 10, 10, "Status", null);
        Ward savedWard = new Ward("1", "Ward A", "Description", "Type", 10, 10, "Status", null);
        Mockito.when(wardService.save(any(Ward.class))).thenReturn(savedWard);

        ResponseEntity<Ward> response = controller.createWard("ADMIN", ward);

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals("1", response.getBody().getId());
        assertEquals("Ward A", response.getBody().getName());
    }

    @Test
    void testUpdateWardAsAdmin() {
        Ward ward = new Ward("1", "Ward A", "Description", "Type", 10, 10, "Status", null);
        Mockito.when(wardService.update(eq("1"), any(Ward.class))).thenReturn(ward);

        ResponseEntity<Ward> response = controller.updateWard("ADMIN", "1", ward);

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals("1", response.getBody().getId());
        assertEquals("Ward A", response.getBody().getName());
    }

    @Test
    void testDeleteWardAsAdmin() {
        ResponseEntity<Void> response = controller.deleteWard("ADMIN", "1");

        Mockito.verify(wardService).delete("1");
        assertEquals(204, response.getStatusCodeValue());
        assertNull(response.getBody());
    }

    @Test
    void testListFacilitiesAsAdmin() {
        Facility facility1 = new Facility("1", "Facility A", "type", "location", "status", "description", null);
        Facility facility2 = new Facility("2", "Facility B", "type", "location", "status", "description", null);
        Mockito.when(facilityService.findAll()).thenReturn(Arrays.asList(facility1, facility2));

        ResponseEntity<List<Facility>> response = controller.listFacilities("ADMIN");

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertEquals("Facility A", response.getBody().get(0).getName());
    }

    @Test
    void testCreateFacilityAsAdmin() {
        Facility facility = new Facility(null, "Facility A", "type", "location", "status", "description", null);
        Facility savedFacility = new Facility("1", "Facility A", "type", "location", "status", "description", null);
        Mockito.when(facilityService.save(any(Facility.class))).thenReturn(savedFacility);

        ResponseEntity<Facility> response = controller.createFacility("ADMIN", facility);

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals("1", response.getBody().getId());
        assertEquals("Facility A", response.getBody().getName());
    }

    @Test
    void testUpdateFacilityAsAdmin() {
        Facility facility = new Facility("1", "Facility A", "type", "location", "status", "description", null);
        Mockito.when(facilityService.update(eq("1"), any(Facility.class))).thenReturn(facility);

        ResponseEntity<Facility> response = controller.updateFacility("ADMIN", "1", facility);

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals("1", response.getBody().getId());
        assertEquals("Facility A", response.getBody().getName());
    }

    @Test
    void testDeleteFacilityAsAdmin() {
        ResponseEntity<Void> response = controller.deleteFacility("ADMIN", "1");

        Mockito.verify(facilityService).delete("1");
        assertEquals(204, response.getStatusCodeValue());
        assertNull(response.getBody());
    }

    @Test
    void testListEquipmentAsAdmin() {
        MedicalEquipment equipment1 = new MedicalEquipment("1", "Equipment A", "Type", 1, 1, "Available", "Location", null, "Department", null);
        MedicalEquipment equipment2 = new MedicalEquipment("2", "Equipment B", "Type", 1, 1, "Available", "Location", null, "Department", null);
        Mockito.when(equipmentService.findAll()).thenReturn(Arrays.asList(equipment1, equipment2));

        ResponseEntity<List<MedicalEquipment>> response = controller.listEquipment("ADMIN");

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertEquals("Equipment A", response.getBody().get(0).getName());
    }

    @Test
    void testCreateEquipmentAsAdmin() {
        MedicalEquipment equipment = new MedicalEquipment(null, "Equipment A", "Type", 1, 1, "Available", "Location", null, "Department", null);
        MedicalEquipment savedEquipment = new MedicalEquipment("1", "Equipment A", "Type", 1, 1, "Available", "Location", null, "Department", null);
        Mockito.when(equipmentService.save(any(MedicalEquipment.class))).thenReturn(savedEquipment);

        ResponseEntity<MedicalEquipment> response = controller.createEquipment("ADMIN", equipment);

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals("1", response.getBody().getId());
        assertEquals("Equipment A", response.getBody().getName());
    }
}