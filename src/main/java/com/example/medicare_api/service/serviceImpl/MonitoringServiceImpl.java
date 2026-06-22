package com.example.medicare_api.service.serviceImpl;
import com.example.medicare_api.entity.MedicalRecord;
import com.example.medicare_api.entity.Visit;
import com.example.medicare_api.enums.VisitStatus;
import com.example.medicare_api.mapper.MedicalRecordMapper;
import com.example.medicare_api.mapper.VisitMapper;
import com.example.medicare_api.payload.request.VitalsRequest;
import com.example.medicare_api.payload.responce.ApiResponse;
import com.example.medicare_api.payload.responce.MedicalRecordResponse;
import com.example.medicare_api.payload.responce.VisitResponse;
import com.example.medicare_api.repository.MedicalRecordRepository;
import com.example.medicare_api.repository.VisitRepository;
import com.example.medicare_api.repository.InventoryItemRepository;
import com.example.medicare_api.service.MonitoringService;
import com.example.medicare_api.service.NotificationService;
import com.example.medicare_api.service.InventoryMovementService;
import com.example.medicare_api.entity.ServiceRecipeItem;
import com.example.medicare_api.entity.InventoryItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
@RequiredArgsConstructor
public class MonitoringServiceImpl implements MonitoringService {
    private final VisitRepository visitRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final VisitMapper visitMapper;
    private final MedicalRecordMapper medicalRecordMapper;
    private final com.example.medicare_api.security.SecurityUtils securityUtils;
    private final InventoryItemRepository inventoryItemRepository;
    private final NotificationService notificationService;
    private final InventoryMovementService movementService;
    @Override
    public List<VisitResponse> getMonitoringQueue() {
        Long adminId = securityUtils.getCurrentAdminId();
        List<Visit> queue = adminId == null
            ? visitRepository.findActiveQueue()
            : visitRepository.findActiveQueueByAdminId(adminId);
        return visitMapper.toResponseList(queue);
    }
    @Override
    public MedicalRecordResponse getPatientMedicalRecord(Long visitId) {
        MedicalRecord record = medicalRecordRepository.findByVisitId(visitId)
                .orElseThrow(() -> new RuntimeException("Ushbu bemor uchun shifokor ko'rsatmasi topilmadi"));
        return medicalRecordMapper.toResponse(record);
    }
    @Override
    public ApiResponse completeProcedure(Long visitId) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new RuntimeException("Visit topilmadi"));
        visit.setStatus(VisitStatus.COMPLETED);
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
        return new ApiResponse("Muolaja muvaffaqiyatli yakunlandi", true);
    }
    @Override
    public ApiResponse rejectProcedure(Long visitId) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new RuntimeException("Visit topilmadi"));
        visit.setStatus(VisitStatus.REJECTED);
        visitRepository.save(visit);
        return new ApiResponse("Muolaja rad etildi", true);
    }
    public ApiResponse saveVitals(Long visitId, VitalsRequest request) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new RuntimeException("Visit topilmadi"));
        visit.setBloodPressure(request.getBloodPressure());
        visit.setTemperature(request.getTemperature());
        visit.setWeight(request.getWeight());
        visitRepository.save(visit);
        return new ApiResponse("Vital ko'rsatkichlar saqlandi", true);
    }
}