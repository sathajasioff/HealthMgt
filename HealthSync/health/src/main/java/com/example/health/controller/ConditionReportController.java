package com.example.health.controller;

import com.example.health.model.ConditionReport;
import com.example.health.service.ConditionReportService;
import com.example.health.web.dto.ConditionReportCreateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ambulance/dispatches/{dispatchId}/condition-reports")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
public class ConditionReportController {

    private final ConditionReportService service;

    @PostMapping
    public ResponseEntity<ConditionReport> create(
            @PathVariable String dispatchId,
            @RequestHeader(value = "X-User-Role", required = false) String roleHeader,
            @RequestHeader(value = "X-Role", required = false) String roleHeaderAlt,
            @RequestHeader(value = "X-User-Id", required = false) String requesterId,
            @RequestBody ConditionReportCreateRequest req
    ) {
        String role = roleHeader != null ? roleHeader : roleHeaderAlt;
        // In your app you likely resolve role/userId from auth. Using headers here for simplicity.
        // Validate required fields
        String patientId = req.getPatientId();
        String paramedicId = requesterId;
        ConditionReport created = service.create(dispatchId, patientId, paramedicId, req);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<ConditionReport>> list(
            @PathVariable String dispatchId,
            @RequestHeader(value = "X-User-Role", required = false) String roleHeader,
            @RequestHeader(value = "X-Role", required = false) String roleHeaderAlt,
            @RequestHeader(value = "X-User-Id", required = false) String requesterId
    ) {
        String role = roleHeader != null ? roleHeader : roleHeaderAlt;
        List<ConditionReport> items = service.listByDispatch(dispatchId, role, requesterId);
        return ResponseEntity.ok(items);
    }
}
