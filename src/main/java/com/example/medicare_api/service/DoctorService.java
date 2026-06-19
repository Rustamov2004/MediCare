package com.example.medicare_api.service;

import com.example.medicare_api.payload.request.DiagnosisRequest;
import com.example.medicare_api.payload.responce.ApiResponse;
import com.example.medicare_api.payload.responce.VisitResponse;

import java.util.List;

public interface DoctorService {
    // Shifokorga biriktirilgan va kutayotgan bemorlar
    List<VisitResponse> getMyQueue(Long doctorId);

    // Tashxis va muolaja yozish
    ApiResponse submitDiagnosis(DiagnosisRequest request);

    // Bugungi tarix
    List<VisitResponse> getDoctorHistory(Long doctorId);

    // Shaxsiy kabinet (profil)
    com.example.medicare_api.payload.responce.UserResponse getDoctorProfile(Long doctorId);
}
