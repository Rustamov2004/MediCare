package com.example.medicare_api.service;

import com.example.medicare_api.payload.request.PatientVisitRequest;
import com.example.medicare_api.payload.responce.MedicalServiceResponse;
import com.example.medicare_api.payload.responce.UserResponse;
import com.example.medicare_api.payload.responce.VisitResponse;

import java.util.List;

public interface ReceptionService {
    // Yangi bemor va tashrifni saqlash
    VisitResponse registerPatientVisit(PatientVisitRequest request);

    // Qabulxonaga kerakli ma'lumotlar
    List<UserResponse> getAllAvailableDoctors();
    List<MedicalServiceResponse> getServicesByType(boolean isCheckup);

    // Doctor tanlanganda uning mutaxassisligiga mos CHECKUP xizmatlarini olish
    List<MedicalServiceResponse> getServicesByDoctor(Long doctorId);

    // To'lovi qilinmagan muolajalar
    List<VisitResponse> getUnpaidProcedures();
    void approvePayment(Long visitId);
    void rejectPayment(Long visitId);
}
