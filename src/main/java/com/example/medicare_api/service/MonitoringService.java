package com.example.medicare_api.service;
import com.example.medicare_api.payload.responce.ApiResponse;
import com.example.medicare_api.payload.responce.MedicalRecordResponse;
import com.example.medicare_api.payload.responce.VisitResponse;
import java.util.List;
public interface MonitoringService {
    List<VisitResponse> getMonitoringQueue();
    MedicalRecordResponse getPatientMedicalRecord(Long visitId);
    ApiResponse completeProcedure(Long visitId);
    ApiResponse rejectProcedure(Long visitId);
}