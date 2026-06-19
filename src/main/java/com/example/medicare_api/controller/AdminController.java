package com.example.medicare_api.controller;

import com.example.medicare_api.enums.Role;
import com.example.medicare_api.payload.request.MedicalServiceRequest;
import com.example.medicare_api.payload.request.UserRequest;
import com.example.medicare_api.payload.responce.MedicalServiceResponse;
import com.example.medicare_api.payload.responce.StatsResponse;
import com.example.medicare_api.payload.responce.UserResponse;
import com.example.medicare_api.payload.responce.VisitResponse;
import com.example.medicare_api.service.serviceImpl.AdminServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final AdminServiceImpl adminService;

    // 1. Yangi xodim qo'shish -> POST /api/admin/create
    @PostMapping("/create")
    public ResponseEntity<UserResponse> createUser(@RequestBody UserRequest request) {
        return ResponseEntity.ok(adminService.saveUser(request));
    }

    // 2. Rol bo'yicha xodimlarni olish -> GET /api/admin/users?role=DOCTOR
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getUserRoles(@RequestParam Role role) {
        return ResponseEntity.ok(adminService.getUsersByRole(role));
    }

    // 2.1. Xodimni tahrirlash -> PUT /api/admin/users/{id}
    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @RequestBody UserRequest request) {
        return ResponseEntity.ok(adminService.updateUser(id, request));
    }

    // 2.2. Xodimni o'chirish -> DELETE /api/admin/users/{id}
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // 2.3. Xodim maoshini tahrirlash -> PUT /api/admin/users/{id}/salary
    @PutMapping("/users/{id}/salary")
    public ResponseEntity<UserResponse> updateUserSalary(@PathVariable Long id, @RequestBody com.example.medicare_api.payload.request.SalaryUpdateRequest request) {
        return ResponseEntity.ok(adminService.updateUserSalary(id, request));
    }

    // 3. Yangi xizmat/narx qo'shish -> POST /api/admin/services
    @PostMapping("/services")
    public ResponseEntity<MedicalServiceResponse> createPrice(@RequestBody MedicalServiceRequest request){
        return ResponseEntity.ok(adminService.saveService(request));
    }

    // 3.1. Xizmatni tahrirlash -> PUT /api/admin/services/{id}
    @PutMapping("/services/{id}")
    public ResponseEntity<MedicalServiceResponse> updateService(@PathVariable Long id, @RequestBody MedicalServiceRequest request){
        return ResponseEntity.ok(adminService.updateService(id, request));
    }

    // 3.2. Xizmatni o'chirish -> DELETE /api/admin/services/{id}
    @DeleteMapping("/services/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id){
        adminService.deleteService(id);
        return ResponseEntity.noContent().build();
    }

    // 4. Barcha xizmatlar ro'yxati -> GET /api/admin/allServices
    @GetMapping("/allServices")
    public ResponseEntity<List<MedicalServiceResponse>> getAllServices(){
        return ResponseEntity.ok(adminService.getAllServices());
    }

    // 5. Statistika -> GET /api/admin/stats
    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> allStats(){
        return ResponseEntity.ok(adminService.getDailyStats());
    }

    // 6. Sana bo'yicha bemorlar -> GET /api/admin/patients-by-date?start=YYYY-MM-DD&end=YYYY-MM-DD
    @GetMapping("/patients-by-date")
    public ResponseEntity<List<VisitResponse>> patientsByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end){
        return ResponseEntity.ok(adminService.getPatientsByDateRange(start, end));
    }

    // 6.1. Bemorni (Visit) tahrirlash -> PUT /api/admin/visits/{id}
    @PutMapping("/visits/{id}")
    public ResponseEntity<VisitResponse> updateVisit(@PathVariable Long id, @RequestBody com.example.medicare_api.payload.request.PatientVisitRequest request) {
        return ResponseEntity.ok(adminService.updateVisit(id, request));
    }

    // 6.2. Bemorni (Visit) o'chirish -> DELETE /api/admin/visits/{id}
    @DeleteMapping("/visits/{id}")
    public ResponseEntity<Void> deleteVisit(@PathVariable("id") Long id) {
        adminService.deleteVisit(id);
        return ResponseEntity.noContent().build();
    }

    // 6.3. Muolaja tarixi -> GET /api/admin/procedure-history
    @GetMapping("/procedure-history")
    public ResponseEntity<List<VisitResponse>> getProcedureHistory() {
        return ResponseEntity.ok(adminService.getProcedureHistory());
    }

    // 7. Kichik Admin Sozlamalari
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe() {
        return ResponseEntity.ok(adminService.getMe());
    }

    @PutMapping("/clinic-name")
    public ResponseEntity<UserResponse> updateClinicName(@RequestBody com.example.medicare_api.payload.request.UserRequest request) {
        return ResponseEntity.ok(adminService.updateClinicName(request.getClinicName()));
    }

    // 8. Omborxona (Inventory)
    @GetMapping("/inventory")
    public ResponseEntity<List<com.example.medicare_api.payload.responce.InventoryItemResponse>> getAllInventory() {
        return ResponseEntity.ok(adminService.getAllInventoryItems());
    }

    @PostMapping("/inventory")
    public ResponseEntity<com.example.medicare_api.payload.responce.InventoryItemResponse> createInventory(@RequestBody com.example.medicare_api.payload.request.InventoryItemRequest request) {
        return ResponseEntity.ok(adminService.saveInventoryItem(request));
    }

    @PutMapping("/inventory/{id}")
    public ResponseEntity<com.example.medicare_api.payload.responce.InventoryItemResponse> updateInventory(@PathVariable Long id, @RequestBody com.example.medicare_api.payload.request.InventoryItemRequest request) {
        return ResponseEntity.ok(adminService.updateInventoryItem(id, request));
    }

    @DeleteMapping("/inventory/{id}")
    public ResponseEntity<Void> deleteInventory(@PathVariable Long id) {
        adminService.deleteInventoryItem(id);
        return ResponseEntity.noContent().build();
    }

    // 9. Moliya va Kassa
    @GetMapping("/salaries")
    public ResponseEntity<List<com.example.medicare_api.payload.responce.SalaryResponse>> getSalaries(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(adminService.getSalaries(start, end));
    }

    @PutMapping("/users/{id}/schedule")
    public ResponseEntity<UserResponse> updateUserSchedule(@PathVariable Long id, @RequestBody com.example.medicare_api.payload.request.WorkScheduleUpdateRequest request) {
        return ResponseEntity.ok(adminService.updateUserSchedule(id, request));
    }

    @PutMapping("/clinic-schedule")
    public ResponseEntity<UserResponse> updateClinicSchedule(@RequestBody com.example.medicare_api.payload.request.WorkScheduleUpdateRequest request) {
        return ResponseEntity.ok(adminService.updateClinicSchedule(request));
    }

    // 10. Shifokor yuklamasi statistikasi
    @GetMapping("/doctor-stats")
    public ResponseEntity<List<com.example.medicare_api.payload.responce.DoctorStatsResponse>> getDoctorStats() {
        return ResponseEntity.ok(adminService.getDoctorStats());
    }

    // 11. Tranzaksiyalar (To'lov, Jarima, Bonus)
    @GetMapping("/transactions/{userId}")
    public ResponseEntity<List<com.example.medicare_api.payload.responce.TransactionResponse>> getUserTransactions(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.getUserTransactions(userId));
    }

    @PostMapping("/transactions")
    public ResponseEntity<com.example.medicare_api.payload.responce.TransactionResponse> addTransaction(@RequestBody com.example.medicare_api.payload.request.TransactionRequest request) {
        return ResponseEntity.ok(adminService.addTransaction(request));
    }

    // 12. Kassa Smenasi (Z-Report)
    @GetMapping("/shift/current")
    public ResponseEntity<com.example.medicare_api.payload.responce.ShiftResponse> getCurrentShiftStats() {
        return ResponseEntity.ok(adminService.getCurrentShiftStats());
    }

    @PostMapping("/shift/close")
    public ResponseEntity<com.example.medicare_api.payload.responce.ShiftResponse> closeCurrentShift(@RequestBody com.example.medicare_api.payload.request.CloseShiftRequest request) {
        // As a simple workaround we'll fetch adminId from security context in the service or just pass null if not strict
        // But the service has `Long adminId` parameter, so let's get it:
        Long adminId = null;
        try {
            adminId = ((com.example.medicare_api.entity.User) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getId();
        } catch(Exception e) {}
        
        return ResponseEntity.ok(adminService.closeCurrentShift(request, adminId));
    }

    @GetMapping("/shift/history")
    public ResponseEntity<List<com.example.medicare_api.payload.responce.ShiftResponse>> getShiftHistory() {
        return ResponseEntity.ok(adminService.getShiftHistory());
    }

    // 13. Omborxona Kategoriyalari
    @PostMapping("/inventory/category")
    public ResponseEntity<com.example.medicare_api.payload.responce.InventoryCategoryResponse> createCategory(
            @RequestBody com.example.medicare_api.payload.request.InventoryCategoryRequest request) {
        return ResponseEntity.ok(adminService.saveInventoryCategory(request));
    }

    @GetMapping("/inventory/category")
    public ResponseEntity<List<com.example.medicare_api.payload.responce.InventoryCategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(adminService.getAllInventoryCategories());
    }

    @PutMapping("/inventory/category/{id}")
    public ResponseEntity<com.example.medicare_api.payload.responce.InventoryCategoryResponse> updateCategory(
            @PathVariable Long id,
            @RequestBody com.example.medicare_api.payload.request.InventoryCategoryRequest request) {
        return ResponseEntity.ok(adminService.updateInventoryCategory(id, request));
    }

    @DeleteMapping("/inventory/category/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        adminService.deleteInventoryCategory(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/inventory/history/{id}")
    public ResponseEntity<List<com.example.medicare_api.payload.responce.InventoryMovementResponse>> getInventoryHistory(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getInventoryItemHistory(id));
    }
}
