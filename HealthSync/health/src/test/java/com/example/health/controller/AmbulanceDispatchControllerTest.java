package com.example.health.controller;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;

import com.example.health.model.AmbulanceDispatch;
import com.example.health.service.AmbulanceDispatchService;

class AmbulanceDispatchControllerTest {

    private AmbulanceDispatchController controller;
    private AmbulanceDispatchService service;

    @BeforeEach
    void setUp() {
        service = Mockito.mock(AmbulanceDispatchService.class);
        controller = new AmbulanceDispatchController(service);
    }

    @Test
    void testListAsParamedic() {
        // Correctly mock the AmbulanceDispatch object
        AmbulanceDispatch dispatch = AmbulanceDispatch.builder()
                .id("1")
                .paramedicId("paramedic1")
                .status("Dispatched")
                .pickupLocation("Location A")
                .dropoffLocation("Location B")
                .requestedAt(Instant.now())
                .build();

        Mockito.when(service.findByParamedic("paramedic1")).thenReturn(List.of(dispatch));

        ResponseEntity<List<AmbulanceDispatch>> response = controller.list("PARAMEDIC", "paramedic1");

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals("paramedic1", response.getBody().get(0).getParamedicId()); // Ensure paramedicId is correct
    }

    @Test
    void testCreateDispatchAsAdmin() {
        // Correctly mock the AmbulanceDispatch object
        AmbulanceDispatch dispatch = AmbulanceDispatch.builder()
                .paramedicId("paramedic1")
                .pickupLocation("Location A")
                .dropoffLocation("Location B")
                .status("Requested")
                .requestedAt(Instant.now())
                .build();

        AmbulanceDispatch savedDispatch = AmbulanceDispatch.builder()
                .id("1")
                .paramedicId("paramedic1")
                .pickupLocation("Location A")
                .dropoffLocation("Location B")
                .status("Requested")
                .requestedAt(Instant.now())
                .build();

        Mockito.when(service.save(any(AmbulanceDispatch.class))).thenReturn(savedDispatch);

        ResponseEntity<AmbulanceDispatch> response = controller.create(dispatch, "ADMIN", null);

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals("1", response.getBody().getId());
        assertEquals("paramedic1", response.getBody().getParamedicId()); // Ensure paramedicId is correct
        assertEquals("Requested", response.getBody().getStatus());
    }
}