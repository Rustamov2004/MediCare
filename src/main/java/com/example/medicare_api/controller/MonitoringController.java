package com.example.medicare_api.controller;
import com.example.medicare_api.payload.request.VitalsRequest;
import com.example.medicare_api.payload.responce.ApiResponse;
import com.example.medicare_api.payload.responce.MedicalRecordResponse;
import com.example.medicare_api.payload.responce.VisitResponse;
import com.example.medicare_api.service.serviceImpl.MonitoringServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/monitoring")
@CrossOrigin(origins = "http://localhost:5173")
public class MonitoringController {
    private final MonitoringServiceImpl service;
    @GetMapping("/queue")
    public ResponseEntity<List<VisitResponse>> getQueue() {
        return ResponseEntity.ok(service.getMonitoringQueue());
    }
    @GetMapping("/record/{visitId}")
    public ResponseEntity<MedicalRecordResponse> getRecord(@PathVariable("visitId") Long visitId) {
        return ResponseEntity.ok(service.getPatientMedicalRecord(visitId));
    }
    @PostMapping("/complete/{visitId}")
    public ResponseEntity<ApiResponse> complete(@PathVariable("visitId") Long visitId) {
        return ResponseEntity.ok(service.completeProcedure(visitId));
    }
    @PostMapping("/reject/{visitId}")
    public ResponseEntity<ApiResponse> reject(@PathVariable("visitId") Long visitId) {
        return ResponseEntity.ok(service.rejectProcedure(visitId));
    }
    @PutMapping("/vitals/{visitId}")
    public ResponseEntity<ApiResponse> saveVitals(@PathVariable("visitId") Long visitId,
                                                   @RequestBody VitalsRequest request) {
        return ResponseEntity.ok(service.saveVitals(visitId, request));
    }
}