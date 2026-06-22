package com.example.medicare_api.controller;
import com.example.medicare_api.payload.request.PatientVisitRequest;
import com.example.medicare_api.payload.responce.MedicalServiceResponse; 
import com.example.medicare_api.payload.responce.UserResponse;
import com.example.medicare_api.payload.responce.VisitResponse;
import com.example.medicare_api.service.serviceImpl.ReceptionServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List; 
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reception")
@CrossOrigin(origins = "http://localhost:5173")
public class ReceptionController {
    private final ReceptionServiceImpl service;
    @PostMapping("/register")
    public ResponseEntity<VisitResponse> registerVisit(@RequestBody PatientVisitRequest request){
        return ResponseEntity.ok(service.registerPatientVisit(request));
    }
    @GetMapping("/doctors")
    public ResponseEntity<List<UserResponse>> allDoctors(){ 
        return ResponseEntity.ok(service.getAllAvailableDoctors()); 
    }
    @GetMapping("/services")
    public ResponseEntity<List<MedicalServiceResponse>> getServices(@RequestParam boolean isCheckup){ 
        return ResponseEntity.ok(service.getServicesByType(isCheckup)); 
    }
    @GetMapping("/services/by-doctor/{doctorId}")
    public ResponseEntity<List<MedicalServiceResponse>> getServicesByDoctor(@PathVariable("doctorId") Long doctorId) {
        return ResponseEntity.ok(service.getServicesByDoctor(doctorId));
    }
    @GetMapping("/unpaid")
    public ResponseEntity<List<VisitResponse>> getUnpaidProcedures() {
        return ResponseEntity.ok(service.getUnpaidProcedures());
    }
    @PostMapping("/approve-payment/{visitId}")
    public ResponseEntity<Void> approvePayment(@PathVariable("visitId") Long visitId) {
        service.approvePayment(visitId);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/reject-payment/{visitId}")
    public ResponseEntity<Void> rejectPayment(@PathVariable("visitId") Long visitId) {
        service.rejectPayment(visitId);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/search-patient")
    public ResponseEntity<List<com.example.medicare_api.entity.Patient>> searchPatient(@RequestParam String q) {
        return ResponseEntity.ok(service.searchPatients(q));
    }
    @GetMapping("/wait-time/{doctorId}")
    public ResponseEntity<java.util.Map<String, Integer>> getWaitTime(@PathVariable Long doctorId) {
        int minutes = service.getWaitTime(doctorId);
        return ResponseEntity.ok(java.util.Map.of("waitMinutes", minutes));
    }
}