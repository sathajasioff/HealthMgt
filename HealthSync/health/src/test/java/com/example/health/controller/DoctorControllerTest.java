package com.example.health.controller;

import com.example.health.model.Doctor;
import com.example.health.service.DoctorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DoctorController.class)
class DoctorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DoctorService doctorService;

    private Doctor mockDoctor;

    @BeforeEach
    void setUp() {
        mockDoctor = new Doctor();
        mockDoctor.setId("doctor123");
        mockDoctor.setName("Dr. John Doe");
    }

    @Test
    void testUpdateDoctorImage() throws Exception {
        MockMultipartFile imagePart = new MockMultipartFile(
                "image", "doctor.jpg", "image/jpeg", "image-content".getBytes()
        );

        Mockito.when(doctorService.updateDoctorImage(eq("doctor123"), any()))
                .thenReturn(mockDoctor);

        mockMvc.perform(multipart("/api/doctors/doctor123/image")
                        .file(imagePart)
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        }))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("doctor123"))
                .andExpect(jsonPath("$.name").value("Dr. John Doe"));
    }
}