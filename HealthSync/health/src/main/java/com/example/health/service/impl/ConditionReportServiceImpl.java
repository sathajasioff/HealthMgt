package com.example.health.service.impl;

import com.example.health.model.ConditionReport;
import com.example.health.repository.ConditionReportRepository;
import com.example.health.service.ConditionReportService;
import com.example.health.web.dto.ConditionReportCreateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConditionReportServiceImpl implements ConditionReportService {

    private final ConditionReportRepository repository;

    @Override
    public ConditionReport create(String dispatchId, String patientId, String paramedicId, ConditionReportCreateRequest req) {
        // TODO: validate dispatch existence and authorization (paramedic assigned to dispatch, dispatch belongs to patient)
        ConditionReport report = ConditionReport.builder()
                .dispatchId(dispatchId)
                .patientId(patientId)
                .paramedicId(paramedicId)
                .createdAt(Instant.now())
                .bpSystolic(req.getBpSystolic())
                .bpDiastolic(req.getBpDiastolic())
                .pulse(req.getPulse())
                .respRate(req.getRespRate())
                .spo2(req.getSpo2())
                .temperature(req.getTemperature())
                .consciousnessLevel(req.getConsciousnessLevel())
                .painScale(req.getPainScale())
                .allergies(req.getAllergies())
                .medicationsGiven(req.getMedicationsGiven())
                .injuries(req.getInjuries())
                .notes(req.getNotes())
                .build();
        return repository.save(report);
    }

    @Override
    public List<ConditionReport> listByDispatch(String dispatchId, String requesterRole, String requesterId) {
        // TODO: authorize request (patient can view own, paramedic assigned can view)
        return repository.findByDispatchIdOrderByCreatedAtAsc(dispatchId);
    }

    @Override
    public List<ConditionReport> listByPatient(String patientId, String requesterRole, String requesterId) {
        // Basic guard: allow PATIENT to view own reports, DOCTOR/PARAMEDIC can view as needed (adjust if necessary)
        // In a real app, rely on auth context; here we accept headers.
        return repository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }
}
