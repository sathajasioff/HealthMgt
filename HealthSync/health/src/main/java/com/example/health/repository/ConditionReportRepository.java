package com.example.health.repository;

import com.example.health.model.ConditionReport;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConditionReportRepository extends MongoRepository<ConditionReport, String> {
    List<ConditionReport> findByDispatchIdOrderByCreatedAtAsc(String dispatchId);
    List<ConditionReport> findByPatientIdOrderByCreatedAtDesc(String patientId);
}
