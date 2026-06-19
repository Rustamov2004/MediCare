package com.example.medicare_api.service.serviceImpl;

import com.example.medicare_api.entity.MedicalRecord;
import com.example.medicare_api.entity.MedicalService;
import com.example.medicare_api.entity.Visit;
import com.example.medicare_api.enums.VisitStatus;
import com.example.medicare_api.mapper.VisitMapper;
import com.example.medicare_api.payload.request.DiagnosisRequest;
import com.example.medicare_api.payload.responce.ApiResponse;
import com.example.medicare_api.payload.responce.VisitResponse;
import com.example.medicare_api.repository.MedicalRecordRepository;
import com.example.medicare_api.repository.MedicalServiceRepository;
import com.example.medicare_api.repository.VisitRepository;
import com.example.medicare_api.repository.UserRepository;
import com.example.medicare_api.repository.InventoryItemRepository;
import com.example.medicare_api.mapper.UserMapper;
import com.example.medicare_api.service.DoctorService;
import com.example.medicare_api.service.NotificationService;
import com.example.medicare_api.service.InventoryMovementService;
import com.example.medicare_api.entity.ServiceRecipeItem;
import com.example.medicare_api.entity.InventoryItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final VisitRepository visitRepository;
    private final MedicalRecordRepository recordRepository;
    private final MedicalServiceRepository medicalServiceRepository;
    private final UserRepository userRepository;
    private final VisitMapper mapper;
    private final UserMapper userMapper;
    private final com.example.medicare_api.security.SecurityUtils securityUtils;
    private final InventoryItemRepository inventoryItemRepository;
    private final NotificationService notificationService;
    private final InventoryMovementService movementService;

    @Override
    public List<VisitResponse> getMyQueue(Long doctorId) {

        List<Visit> visits = visitRepository.findAllByDoctorIdAndStatusAndService_Type(doctorId, VisitStatus.WAITING, com.example.medicare_api.enums.ServiceType.CHECKUP);

        return mapper.toResponseList(visits);
    }

    @Override
    public ApiResponse submitDiagnosis(DiagnosisRequest request) {

        Visit visit = visitRepository.findById(request.getVisitId())
                .orElseThrow(() -> new RuntimeException("Visit topilmadi"));

        // MedicalRecord to'g'ri to'ldirilishi
        MedicalRecord record = new MedicalRecord();
        record.setVisit(visit);
        record.setDiagnosis(request.getDiagnosis()); // request'dan oling!
        record.setTreatment(request.getProcedure()); // request'dan oling!
        record.setNeedsProcedure(request.isSendToMonitoring());
        record.setAdminId(securityUtils.getCurrentAdminId());
        recordRepository.save(record);

        // Status va Visit ma'lumotlarini yangilash
        visit.setDiagnosis(request.getDiagnosis());
        visit.setStatus(VisitStatus.COMPLETED); // Asosiy ko'rik tugadi
        
        // Auto-deduction of inventory items
        if (visit.getService() != null && visit.getService().getRecipes() != null) {
            for (ServiceRecipeItem recipe : visit.getService().getRecipes()) {
                InventoryItem item = recipe.getInventoryItem();
                if (item != null) {
                    item.setQuantity(item.getQuantity() - recipe.getQuantityRequired());
                    InventoryItem savedItem = inventoryItemRepository.save(item);
                    
                    String description = "Avtomatik hisobdan chiqarish. Bemor: " + visit.getPatient().getFullName() + " - " + visit.getService().getName();
                    movementService.logMovement(savedItem, "AUTO_DEDUCT", -recipe.getQuantityRequired(), description, securityUtils.getCurrentUser());
                    
                    if (savedItem.getQuantity() <= savedItem.getLowStockThreshold()) {
                        notificationService.sendLowStockNotification(savedItem);
                    }
                }
            }
        }
        
        visitRepository.save(visit);

        // Agar muolaja tayinlangan bo'lsa va muolaja xizmati tanlangan bo'lsa
        if (request.isSendToMonitoring() && request.getProcedureServiceId() != null) {
            MedicalService procedureService = medicalServiceRepository.findById(request.getProcedureServiceId())
                    .orElseThrow(() -> new RuntimeException("Xizmat topilmadi"));

            Visit procedureVisit = new Visit();
            procedureVisit.setPatient(visit.getPatient());
            procedureVisit.setDoctor(visit.getDoctor()); // Shifokor ma'lumoti saqlanadi, lekin ServiceType=PROCEDURE bo'lgani uchun uning navbatida ko'rinmaydi
            procedureVisit.setAdminId(visit.getAdminId());
            procedureVisit.setService(procedureService);
            procedureVisit.setPrice(procedureService.getPrice());
            procedureVisit.setStatus(VisitStatus.UNPAID); // Qabulxonada to'lov qilinmaguncha UNPAID bo'ladi
            procedureVisit.setProcedure(request.getProcedure());
            visitRepository.save(procedureVisit);

            MedicalRecord procRecord = new MedicalRecord();
            procRecord.setVisit(procedureVisit);
            procRecord.setTreatment(request.getProcedure());
            procRecord.setNeedsProcedure(true); // hamshiraga ko'rinishi uchun
            procRecord.setAdminId(securityUtils.getCurrentAdminId());
            recordRepository.save(procRecord);
        }

        return new ApiResponse("Tashxis va muolaja muvaffaqiyatli saqlandi", true);
    }

    @Override
    public List<VisitResponse> getDoctorHistory(Long doctorId) {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);
        List<Visit> visits = visitRepository.findAllByDoctorIdAndDiagnosisIsNotNullAndCreatedAtBetween(doctorId, start, end);
        return mapper.toResponseList(visits);
    }

    @Override
    public com.example.medicare_api.payload.responce.UserResponse getDoctorProfile(Long doctorId) {
        com.example.medicare_api.entity.User user = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor topilmadi"));
        return userMapper.toResponse(user);
    }

    // Bemor tibbiy tarixi (COMPLETED visitlar)
    public List<VisitResponse> getPatientHistory(Long patientId) {
        List<com.example.medicare_api.entity.Visit> visits =
                visitRepository.findAllByPatient_IdAndStatusOrderByCreatedAtDesc(
                        patientId, com.example.medicare_api.enums.VisitStatus.COMPLETED);
        return mapper.toResponseList(visits);
    }
}

