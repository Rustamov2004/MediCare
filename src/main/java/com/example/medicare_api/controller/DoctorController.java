package com.example.medicare_api.controller;

import com.example.medicare_api.payload.request.DiagnosisRequest;
import com.example.medicare_api.payload.responce.ApiResponse;
import com.example.medicare_api.payload.responce.VisitResponse;
import com.example.medicare_api.service.serviceImpl.DoctorServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/doctor")
@CrossOrigin(origins = "http://localhost:5173")
public class DoctorController {

    private final DoctorServiceImpl service;

    @GetMapping("/queue/{doctorId}")
    public ResponseEntity<List<VisitResponse>> getMyQueue(@PathVariable Long doctorId){
        return ResponseEntity.ok(service.getMyQueue(doctorId));
    }

    @PostMapping("/submit-diagnosis")
    public ResponseEntity<ApiResponse> submitDiagnos(@RequestBody DiagnosisRequest request){
        return ResponseEntity.ok(service.submitDiagnosis(request));
    }

    @GetMapping("/history/{doctorId}")
    public ResponseEntity<List<VisitResponse>> getDoctorHistory(@PathVariable Long doctorId){
        return ResponseEntity.ok(service.getDoctorHistory(doctorId));
    }

    @GetMapping("/profile/{doctorId}")
    public ResponseEntity<com.example.medicare_api.payload.responce.UserResponse> getDoctorProfile(@PathVariable Long doctorId){
        return ResponseEntity.ok(service.getDoctorProfile(doctorId));
    }

    // Bemor tibbiy tarixi
    @GetMapping("/patient-history/{patientId}")
    public ResponseEntity<List<VisitResponse>> getPatientHistory(@PathVariable Long patientId){
        return ResponseEntity.ok(service.getPatientHistory(patientId));
    }

}
