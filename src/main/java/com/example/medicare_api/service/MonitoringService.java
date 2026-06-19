package com.example.medicare_api.service;

import com.example.medicare_api.payload.responce.ApiResponse;
import com.example.medicare_api.payload.responce.MedicalRecordResponse;
import com.example.medicare_api.payload.responce.VisitResponse;

import java.util.List;

public interface MonitoringService {
    // 1. Monitoring navbatini ko'rish
    List<VisitResponse> getMonitoringQueue();

    // 2. Bemor ismiga bosilganda tashxis va muolajani ko'rish
    MedicalRecordResponse getPatientMedicalRecord(Long visitId);

    // 3. Muolaja yakunlandi (Navbatdan o'chadi)
    ApiResponse completeProcedure(Long visitId);

    // 4. Bemor kelmadi yoki rad etildi (Navbatdan o'chadi)
    ApiResponse rejectProcedure(Long visitId);
}
