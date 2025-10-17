package com.example.health.controller;

import com.example.health.model.ConditionReport;
import com.example.health.service.ConditionReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/condition-reports")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
public class ConditionReportQueryController {

    private final ConditionReportService service;

    @GetMapping
    public ResponseEntity<List<ConditionReport>> listByPatient(
            @RequestParam("patientId") String patientId,
            @RequestHeader(value = "X-User-Role", required = false) String roleHeader,
            @RequestHeader(value = "X-Role", required = false) String roleHeaderAlt,
            @RequestHeader(value = "X-User-Id", required = false) String requesterId
    ) {
        String role = roleHeader != null ? roleHeader : roleHeaderAlt;
        List<ConditionReport> items = service.listByPatient(patientId, role, requesterId);
        return ResponseEntity.ok(items);
    }
}
