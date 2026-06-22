package com.example.medicare_api.service;
import com.example.medicare_api.payload.request.DiagnosisRequest;
import com.example.medicare_api.payload.responce.ApiResponse;
import com.example.medicare_api.payload.responce.VisitResponse;
import java.util.List;
public interface DoctorService {
    List<VisitResponse> getMyQueue(Long doctorId);
    ApiResponse submitDiagnosis(DiagnosisRequest request);
    List<VisitResponse> getDoctorHistory(Long doctorId);
    com.example.medicare_api.payload.responce.UserResponse getDoctorProfile(Long doctorId);
}