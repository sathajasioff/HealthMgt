package com.example.health.service;

import com.example.health.model.ConditionReport;
import com.example.health.web.dto.ConditionReportCreateRequest;

import java.util.List;

public interface ConditionReportService {
    ConditionReport create(String dispatchId, String patientId, String paramedicId, ConditionReportCreateRequest req);
    List<ConditionReport> listByDispatch(String dispatchId, String requesterRole, String requesterId);
    List<ConditionReport> listByPatient(String patientId, String requesterRole, String requesterId);
}
