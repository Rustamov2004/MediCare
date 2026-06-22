package com.example.medicare_api.service;
import com.example.medicare_api.payload.request.PatientVisitRequest;
import com.example.medicare_api.payload.responce.MedicalServiceResponse;
import com.example.medicare_api.payload.responce.UserResponse;
import com.example.medicare_api.payload.responce.VisitResponse;
import java.util.List;
public interface ReceptionService {
    VisitResponse registerPatientVisit(PatientVisitRequest request);
    List<UserResponse> getAllAvailableDoctors();
    List<MedicalServiceResponse> getServicesByType(boolean isCheckup);
    List<MedicalServiceResponse> getServicesByDoctor(Long doctorId);
    List<VisitResponse> getUnpaidProcedures();
    void approvePayment(Long visitId);
    void rejectPayment(Long visitId);
}