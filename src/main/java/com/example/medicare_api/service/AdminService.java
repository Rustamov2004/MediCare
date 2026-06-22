package com.example.medicare_api.service;

import com.example.medicare_api.enums.Role;
import com.example.medicare_api.payload.request.MedicalServiceRequest;
import com.example.medicare_api.payload.request.UserRequest;
import com.example.medicare_api.payload.responce.MedicalServiceResponse;
import com.example.medicare_api.payload.responce.StatsResponse;
import com.example.medicare_api.payload.responce.UserResponse;
import com.example.medicare_api.payload.responce.VisitResponse;

import java.time.LocalDate;
import java.util.List;

public interface AdminService {
    // Shifokor va Medsestralar CRUD
    UserResponse saveUser(UserRequest request);
    UserResponse updateUser(Long id, UserRequest request);
    void deleteUser(Long id);
    List<UserResponse> getUsersByRole(Role role);

    // Xizmatlar va Narxlar (Ko'rik/Muolaja)
    MedicalServiceResponse saveService(MedicalServiceRequest request);
    MedicalServiceResponse updateService(Long id, MedicalServiceRequest request);
    void deleteService(Long id);
    List<MedicalServiceResponse> getAllServices();

    // Statistika va Monitoring
    StatsResponse getDailyStats(); // Bugungi tushum va bemorlar soni
    com.example.medicare_api.payload.responce.FinanceSummaryResponse getFinanceSummary();
    List<VisitResponse> getPatientsByDateRange(LocalDate start, LocalDate end);
    List<VisitResponse> searchPatientsByName(String name);
    VisitResponse updateVisit(Long id, com.example.medicare_api.payload.request.PatientVisitRequest request);
    void deleteVisit(Long id);

    // Yakunlangan va Rad etilganlar ro'yxati
    List<VisitResponse> getCompletedVisits(LocalDate date);
    List<VisitResponse> getRejectedVisits(LocalDate date);
    List<VisitResponse> getProcedureHistory();

    // Moliya / Maosh va Jadval
    List<com.example.medicare_api.payload.responce.SalaryResponse> getSalaries(LocalDate start, LocalDate end);
    UserResponse updateUserSalary(Long id, com.example.medicare_api.payload.request.SalaryUpdateRequest request);
    UserResponse updateClinicSchedule(com.example.medicare_api.payload.request.WorkScheduleUpdateRequest request);
    UserResponse updateUserSchedule(Long id, com.example.medicare_api.payload.request.WorkScheduleUpdateRequest request);
    
    // Tranzaksiyalar
    List<com.example.medicare_api.payload.responce.TransactionResponse> getUserTransactions(Long userId);
    com.example.medicare_api.payload.responce.TransactionResponse addTransaction(com.example.medicare_api.payload.request.TransactionRequest request);

    // Kassa Smenasi (Shift)
    com.example.medicare_api.payload.responce.ShiftResponse getCurrentShiftStats();
    com.example.medicare_api.payload.responce.ShiftResponse closeCurrentShift(com.example.medicare_api.payload.request.CloseShiftRequest request, Long adminId);
    List<com.example.medicare_api.payload.responce.ShiftResponse> getShiftHistory();

    // Kichik Admin Sozlamalari
    UserResponse getMe();
    UserResponse updateClinicName(String clinicName);

    // Omborxona (Inventory)
    com.example.medicare_api.payload.responce.InventoryItemResponse saveInventoryItem(com.example.medicare_api.payload.request.InventoryItemRequest request);
    com.example.medicare_api.payload.responce.InventoryItemResponse updateInventoryItem(Long id, com.example.medicare_api.payload.request.InventoryItemRequest request);
    void deleteInventoryItem(Long id);
    List<com.example.medicare_api.payload.responce.InventoryItemResponse> getAllInventoryItems();
    List<com.example.medicare_api.payload.responce.InventoryMovementResponse> getInventoryItemHistory(Long itemId);

    // Omborxona Kategoriyalari
    com.example.medicare_api.payload.responce.InventoryCategoryResponse saveInventoryCategory(com.example.medicare_api.payload.request.InventoryCategoryRequest request);
    com.example.medicare_api.payload.responce.InventoryCategoryResponse updateInventoryCategory(Long id, com.example.medicare_api.payload.request.InventoryCategoryRequest request);
    void deleteInventoryCategory(Long id);
    List<com.example.medicare_api.payload.responce.InventoryCategoryResponse> getAllInventoryCategories();
}
