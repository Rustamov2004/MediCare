package com.example.medicare_api.controller;

import com.example.medicare_api.payload.request.PatientVisitRequest;
import com.example.medicare_api.payload.responce.MedicalServiceResponse; // SHU KERAK
import com.example.medicare_api.payload.responce.UserResponse;
import com.example.medicare_api.payload.responce.VisitResponse;
import com.example.medicare_api.service.serviceImpl.ReceptionServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List; // SHU IMPORT SHART!

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reception")
@CrossOrigin(origins = "http://localhost:5173")
public class ReceptionController {

    private final ReceptionServiceImpl service;

    // 1. Bitta bemorni saqlash (Bu to'g'ri, chunki bitta natija qaytadi)
    @PostMapping("/register")
    public ResponseEntity<VisitResponse> registerVisit(@RequestBody PatientVisitRequest request){
        return ResponseEntity.ok(service.registerPatientVisit(request));
    }

    // 2. SHIFOKORLAR RO'YXATI (List qaytarishi shart!)
    @GetMapping("/doctors")
    public ResponseEntity<List<UserResponse>> allDoctors(){ // List<UserResponse> qildik
        return ResponseEntity.ok(service.getAllAvailableDoctors()); // Castingni o'chirdik
    }

    // 3. XIZMATLAR RO'YXATI (List qaytarishi shart!)
    @GetMapping("/services")
    public ResponseEntity<List<MedicalServiceResponse>> getServices(@RequestParam boolean isCheckup){ // List qildik
        return ResponseEntity.ok(service.getServicesByType(isCheckup)); // Castingni o'chirdik
    }

    // 4. DOCTOR TANLANGANDA UNING MUTAXASSISLIGIGA MOS CHECKUP XIZMATLAR
    @GetMapping("/services/by-doctor/{doctorId}")
    public ResponseEntity<List<MedicalServiceResponse>> getServicesByDoctor(@PathVariable("doctorId") Long doctorId) {
        return ResponseEntity.ok(service.getServicesByDoctor(doctorId));
    }

    // 5. To'lanmagan muolajalarni olish
    @GetMapping("/unpaid")
    public ResponseEntity<List<VisitResponse>> getUnpaidProcedures() {
        return ResponseEntity.ok(service.getUnpaidProcedures());
    }

    // 6. Muolaja to'lovini tasdiqlash
    @PostMapping("/approve-payment/{visitId}")
    public ResponseEntity<Void> approvePayment(@PathVariable("visitId") Long visitId) {
        service.approvePayment(visitId);
        return ResponseEntity.ok().build();
    }

    // 7. Muolaja to'lovini bekor qilish
    @PostMapping("/reject-payment/{visitId}")
    public ResponseEntity<Void> rejectPayment(@PathVariable("visitId") Long visitId) {
        service.rejectPayment(visitId);
        return ResponseEntity.ok().build();
    }

    // 8. Bemor qidirish — ism yoki telefon bo'yicha
    @GetMapping("/search-patient")
    public ResponseEntity<List<com.example.medicare_api.entity.Patient>> searchPatient(@RequestParam String q) {
        return ResponseEntity.ok(service.searchPatients(q));
    }

    // 9. Shifokor navbatidagi kutish vaqtini hisoblash (daqiqada)
    @GetMapping("/wait-time/{doctorId}")
    public ResponseEntity<java.util.Map<String, Integer>> getWaitTime(@PathVariable Long doctorId) {
        int minutes = service.getWaitTime(doctorId);
        return ResponseEntity.ok(java.util.Map.of("waitMinutes", minutes));
    }
}
