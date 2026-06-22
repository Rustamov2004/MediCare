package com.example.medicare_api.service.serviceImpl;
import com.example.medicare_api.entity.MedicalService;
import com.example.medicare_api.entity.User;
import com.example.medicare_api.entity.Visit;
import com.example.medicare_api.enums.ServiceType;
import com.example.medicare_api.enums.VisitStatus;
import com.example.medicare_api.mapper.MedicalServiceMapper;
import com.example.medicare_api.mapper.UserMapper;
import com.example.medicare_api.mapper.VisitMapper;
import com.example.medicare_api.payload.request.MedicalServiceRequest;
import com.example.medicare_api.payload.request.RecipeItemRequest;
import com.example.medicare_api.payload.request.SalaryUpdateRequest;
import com.example.medicare_api.payload.request.UserRequest;
import com.example.medicare_api.payload.responce.MedicalServiceResponse;
import com.example.medicare_api.payload.responce.StatsResponse;
import com.example.medicare_api.payload.responce.UserResponse;
import com.example.medicare_api.payload.responce.VisitResponse;
import com.example.medicare_api.repository.MedicalServiceRepository;
import com.example.medicare_api.repository.UserRepository;
import com.example.medicare_api.repository.VisitRepository;
import com.example.medicare_api.repository.InventoryMovementRepository;
import com.example.medicare_api.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.medicare_api.enums.Role;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {
      private final UserRepository userRepository;
      private final MedicalServiceRepository medicalServiceRepository;
      private final VisitRepository visitRepository;
      private final UserMapper userMapper;
      private final MedicalServiceMapper medicalServiceMapper;
      private final VisitMapper visitMapper;
      private final com.example.medicare_api.repository.PatientRepository patientRepository;
      private final com.example.medicare_api.security.SecurityUtils securityUtils;
      private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
      private final com.example.medicare_api.repository.InventoryItemRepository inventoryItemRepository;
      private final com.example.medicare_api.repository.InventoryCategoryRepository inventoryCategoryRepository;
      private final com.example.medicare_api.mapper.InventoryMapper inventoryMapper;
      private final com.example.medicare_api.repository.NotificationRepository notificationRepository;
      private final com.example.medicare_api.repository.TransactionRepository transactionRepository;
      private final com.example.medicare_api.repository.CashShiftRepository cashShiftRepository;
      private final com.example.medicare_api.repository.ServiceRecipeItemRepository serviceRecipeItemRepository;
      private final com.example.medicare_api.service.InventoryMovementService movementService;
      private final InventoryMovementRepository movementRepository;
    @Override
    public UserResponse saveUser(UserRequest request) {
        String baseUsername = request.getFullName().toLowerCase().trim().replaceAll("\\s+", "_");
        String username = baseUsername;
        int counter = 1;
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + "_" + counter;
            counter++;
        }
        String rawPassword = java.util.UUID.randomUUID().toString().substring(0, 6);
        User entity = userMapper.toEntity(request);
        entity.setAdminId(securityUtils.getCurrentAdminId());
        entity.setUsername(username);
        entity.setPassword(passwordEncoder.encode(rawPassword));
        entity.setPlainPassword(rawPassword);
        User savedUser = userRepository.save(entity);
        UserResponse response = userMapper.toResponse(savedUser);
        response.setPassword(rawPassword); 
        return response;
    }
    @Override
    public UserResponse updateUser(Long id, UserRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User topilmadi"));
        user.setFullName(request.getFullName());
        user.setAddress(request.getAddress());
        user.setPhone(request.getPhone());
        user.setSpecialization(request.getSpecialization());
        user.setSalaryType(request.getSalaryType());
        user.setSalaryAmount(request.getSalaryAmount());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setPlainPassword(request.getPassword());
        }
        User updatedUser = userRepository.save(user);
        return userMapper.toResponse(updatedUser);
    }
    @Override
    public void deleteUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User topilmadi"));
        userRepository.delete(user);
    }
    @Override
    public List<UserResponse> getUsersByRole(Role role) {
        Long adminId = securityUtils.getCurrentAdminId();
        List<User> allByRole = adminId == null 
            ? userRepository.findAllByRole(role) 
            : userRepository.findAllByRoleAndAdminId(role, adminId);
        return userMapper.toResponseList(allByRole);
    }
    @Override
    public MedicalServiceResponse saveService(MedicalServiceRequest request) {
        Long adminId = securityUtils.getCurrentAdminId();
        if (request.isCheckup() && request.getDoctorId() != null) {
            if (medicalServiceRepository.existsByAdminIdAndDoctorId(adminId, request.getDoctorId())) {
                throw new RuntimeException("Bu shifokor uchun narx allaqachon belgilangan!");
            }
        }
        MedicalService service = new MedicalService();
        service.setName(request.getName());
        service.setType(request.getType());
        service.setPrice(request.getPrice());
        service.setCheckup(request.isCheckup());
        service.setSpecialization(request.isCheckup() ? request.getSpecialization() : null);
        service.setDoctorId(request.isCheckup() ? request.getDoctorId() : null);
        service.setAdminId(adminId);
        MedicalService save = medicalServiceRepository.save(service);
        if (request.getRecipes() != null) {
            for (RecipeItemRequest reqItem : request.getRecipes()) {
                com.example.medicare_api.entity.InventoryItem invItem = inventoryItemRepository.findById(reqItem.getInventoryItemId()).orElse(null);
                if (invItem != null) {
                    com.example.medicare_api.entity.ServiceRecipeItem recipeItem = new com.example.medicare_api.entity.ServiceRecipeItem();
                    recipeItem.setService(save);
                    recipeItem.setInventoryItem(invItem);
                    recipeItem.setQuantityRequired(reqItem.getQuantityRequired());
                    save.getRecipes().add(recipeItem);
                }
            }
            save = medicalServiceRepository.save(save);
        }
        return medicalServiceMapper.toResponse(save);
    }
    @Override
    public MedicalServiceResponse updateService(Long id, MedicalServiceRequest request) {
        MedicalService service = medicalServiceRepository.findById(id).orElseThrow(() -> new RuntimeException("Medical service topilmadi"));
        service.setName(request.getName());
        service.setType(request.getType());
        service.setPrice(request.getPrice());
        service.setCheckup(request.isCheckup());
        service.setSpecialization(request.isCheckup() ? request.getSpecialization() : null);
        service.setDoctorId(request.isCheckup() ? request.getDoctorId() : null);
        service.getRecipes().clear();
        if (request.getRecipes() != null) {
            for (RecipeItemRequest reqItem : request.getRecipes()) {
                com.example.medicare_api.entity.InventoryItem invItem = inventoryItemRepository.findById(reqItem.getInventoryItemId()).orElse(null);
                if (invItem != null) {
                    com.example.medicare_api.entity.ServiceRecipeItem recipeItem = new com.example.medicare_api.entity.ServiceRecipeItem();
                    recipeItem.setService(service);
                    recipeItem.setInventoryItem(invItem);
                    recipeItem.setQuantityRequired(reqItem.getQuantityRequired());
                    service.getRecipes().add(recipeItem);
                }
            }
        }
        MedicalService save = medicalServiceRepository.save(service);
        return medicalServiceMapper.toResponse(save);
    }
    @Override
    public void deleteService(Long id) {
        try {
            medicalServiceRepository.deleteById(id);
            medicalServiceRepository.flush(); 
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new RuntimeException("Bu xizmatga (yoki narxga) oldin bemorlar biriktirilganligi (tarixi borligi) sababli uni o'chirib bo'lmaydi! Agar narx yoki nomni o'zgartirmoqchi bo'lsangiz, o'chirish o'rniga uni TAHRIRLANG!");
        }
    }
    @Override
    public List<MedicalServiceResponse> getAllServices() {
        Long adminId = securityUtils.getCurrentAdminId();
        List<MedicalService> services = adminId == null 
            ? medicalServiceRepository.findAll() 
            : medicalServiceRepository.findAllByAdminId(adminId);
        return medicalServiceMapper.toResponseList(services);
    }
    @Override
    public StatsResponse getDailyStats() {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.atTime(LocalTime.MAX);
        Long adminId = securityUtils.getCurrentAdminId();
        List<Visit> visits = adminId == null 
            ? visitRepository.findAllByCreatedAtBetween(start, end)
            : visitRepository.findAllByAdminIdAndCreatedAtBetween(adminId, start, end);
        visits = visits.stream()
            .filter(v -> v.getStatus() != com.example.medicare_api.enums.VisitStatus.REJECTED && v.getStatus() != com.example.medicare_api.enums.VisitStatus.UNPAID)
            .collect(java.util.stream.Collectors.toList());
        long count = visits.size();
        double sum = visits.stream().filter(v -> v.getPrice() != null).mapToDouble(Visit::getPrice).sum();
        double sumCash = visits.stream()
            .filter(v -> v.getPrice() != null && v.getPaymentType() == com.example.medicare_api.enums.PaymentType.CASH)
            .mapToDouble(Visit::getPrice).sum();
        double sumCard = visits.stream()
            .filter(v -> v.getPrice() != null && v.getPaymentType() == com.example.medicare_api.enums.PaymentType.CARD)
            .mapToDouble(Visit::getPrice).sum();
        long checkupCount = visits.stream().filter(v -> v.getService() != null && v.getService().getType() == ServiceType.CHECKUP).count();
        long procedureCount = visits.stream().filter(visit -> visit.getService() != null && visit.getService().getType() == ServiceType.PROCEDURE).count();
        double checkupSum = visits.stream().filter(visit -> visit.getService() != null && visit.getService().getType() == ServiceType.CHECKUP && visit.getPrice() != null)
                .mapToDouble(Visit::getPrice).sum();
        double procedureSum = visits.stream().filter(visit -> visit.getService() != null && visit.getService().getType() == ServiceType.PROCEDURE && visit.getPrice() != null)
                .mapToDouble(Visit::getPrice).sum();
        return StatsResponse.builder()
                .checkupCount(checkupCount)
                .checkupIncome(checkupSum)
                .totalIncome(sum)
                .dailyRevenue(sum)
                .dailyRevenueCash(sumCash)
                .dailyRevenueCard(sumCard)
                .todayPatients(count)
                .totalPatients(count)
                .procedureCount(procedureCount)
                .procedureIncome(procedureSum)
                .build();
    }
    @Override
    public com.example.medicare_api.payload.responce.FinanceSummaryResponse getFinanceSummary() {
        Long adminId = securityUtils.getCurrentAdminId();
        LocalDate now = LocalDate.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfMonth = now.withDayOfMonth(now.lengthOfMonth()).atTime(LocalTime.MAX);
        LocalDateTime startOfYear = now.withDayOfYear(1).atStartOfDay();
        LocalDateTime endOfYear = now.withDayOfYear(now.lengthOfYear()).atTime(LocalTime.MAX);
        List<Visit> monthlyVisits = adminId == null 
            ? visitRepository.findAllByCreatedAtBetween(startOfMonth, endOfMonth)
            : visitRepository.findAllByAdminIdAndCreatedAtBetween(adminId, startOfMonth, endOfMonth);
        List<Visit> yearlyVisits = adminId == null 
            ? visitRepository.findAllByCreatedAtBetween(startOfYear, endOfYear)
            : visitRepository.findAllByAdminIdAndCreatedAtBetween(adminId, startOfYear, endOfYear);
        double monthlyIncome = monthlyVisits.stream()
            .filter(v -> v.getStatus() != com.example.medicare_api.enums.VisitStatus.REJECTED && v.getStatus() != com.example.medicare_api.enums.VisitStatus.UNPAID)
            .filter(v -> v.getPrice() != null)
            .mapToDouble(Visit::getPrice)
            .sum();
        double yearlyIncome = yearlyVisits.stream()
            .filter(v -> v.getStatus() != com.example.medicare_api.enums.VisitStatus.REJECTED && v.getStatus() != com.example.medicare_api.enums.VisitStatus.UNPAID)
            .filter(v -> v.getPrice() != null)
            .mapToDouble(Visit::getPrice)
            .sum();
        List<User> activeEmployees = adminId == null 
            ? userRepository.findAllByActiveTrue()
            : userRepository.findAllByAdminIdAndActiveTrue(adminId);
        double totalSalaries = 0.0;
        for (User u : activeEmployees) {
            if (u.getSalaryAmount() != null) {
                if ("MONTHLY".equals(u.getSalaryType())) {
                    totalSalaries += u.getSalaryAmount();
                } else if ("DAILY".equals(u.getSalaryType())) {
                    totalSalaries += u.getSalaryAmount() * 30;
                } else if ("PERCENTAGE".equals(u.getSalaryType())) {
                    double percentage = u.getSalaryAmount();
                    double empMonthlyIncome = monthlyVisits.stream()
                        .filter(v -> v.getPrice() != null && v.getDoctor() != null && u.getId().equals(v.getDoctor().getId()))
                        .mapToDouble(Visit::getPrice)
                        .sum();
                    totalSalaries += empMonthlyIncome * (percentage / 100.0);
                }
            }
        }
        double netProfit = monthlyIncome - totalSalaries;
        return com.example.medicare_api.payload.responce.FinanceSummaryResponse.builder()
            .monthlyIncome(monthlyIncome)
            .yearlyIncome(yearlyIncome)
            .totalSalaries(totalSalaries)
            .netProfit(netProfit)
            .build();
    }
    @Override
    public List<VisitResponse> getPatientsByDateRange(LocalDate start, LocalDate end) {
        LocalDateTime today = start.atStartOfDay();
        LocalDateTime localDateTime = end.atTime(LocalTime.MAX);
        Long adminId = securityUtils.getCurrentAdminId();
        List<Visit> visits = adminId == null 
            ? visitRepository.findAllByCreatedAtBetween(today, localDateTime)
            : visitRepository.findAllByAdminIdAndCreatedAtBetween(adminId, today, localDateTime);
        return visitMapper.toResponseList(visits);
    }
    @Override
    public List<VisitResponse> searchPatientsByName(String name) {
        Long adminId = securityUtils.getCurrentAdminId();
        List<Visit> visits = adminId == null 
            ? visitRepository.searchByPatientName(name)
            : visitRepository.searchByPatientNameAndAdminId(adminId, name);
        return visitMapper.toResponseList(visits);
    }
    @Override
    public List<VisitResponse> getCompletedVisits(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);
        Long adminId = securityUtils.getCurrentAdminId();
        List<Visit> visits = adminId == null 
            ? visitRepository.findAllByStatusAndCreatedAtBetween(VisitStatus.COMPLETED, start, end)
            : visitRepository.findAllByAdminIdAndStatus(adminId, VisitStatus.COMPLETED);
        if (adminId != null) {
            visits = visits.stream().filter(v -> !v.getCreatedAt().isBefore(start) && !v.getCreatedAt().isAfter(end)).toList();
        }
        return visitMapper.toResponseList(visits);
    }
    @Override
    public List<VisitResponse> getRejectedVisits(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);
        Long adminId = securityUtils.getCurrentAdminId();
        List<Visit> visits = adminId == null 
            ? visitRepository.findAllByStatusAndCreatedAtBetween(VisitStatus.REJECTED, start, end)
            : visitRepository.findAllByAdminIdAndStatus(adminId, VisitStatus.REJECTED);
        if (adminId != null) {
            visits = visits.stream().filter(v -> !v.getCreatedAt().isBefore(start) && !v.getCreatedAt().isAfter(end)).toList();
        }
        return visitMapper.toResponseList(visits);
    }
    @Override
    public List<VisitResponse> getProcedureHistory() {
        Long adminId = securityUtils.getCurrentAdminId();
        List<Visit> history = adminId == null
                ? visitRepository.findProcedureHistory()
                : visitRepository.findProcedureHistoryByAdminId(adminId);
        return visitMapper.toResponseList(history);
    }
    @Override
    public VisitResponse updateVisit(Long id, com.example.medicare_api.payload.request.PatientVisitRequest request) {
        Visit visit = visitRepository.findById(id).orElseThrow(() -> new RuntimeException("Visit topilmadi"));
        com.example.medicare_api.entity.Patient patient = visit.getPatient();
        if (patient != null) {
            patient.setFullName(request.getFullName());
            patient.setPhone(request.getPhone());
            patient.setAddress(request.getAddress());
            patient.setAge(request.getAge());
            patientRepository.save(patient);
        }
        if (request.getDoctorId() != null) {
            User doctor = userRepository.findById(request.getDoctorId()).orElseThrow(() -> new RuntimeException("Shifokor topilmadi"));
            visit.setDoctor(doctor);
        }
        if (request.getServiceId() != null) {
            MedicalService service = medicalServiceRepository.findById(request.getServiceId()).orElseThrow(() -> new RuntimeException("Xizmat topilmadi"));
            visit.setService(service);
            visit.setPrice(service.getPrice());
        }
        visit.setReason(request.getReason());
        Visit saved = visitRepository.save(visit);
        return visitMapper.toResponse(saved);
    }
    @Override
    public void deleteVisit(Long id) {
        Visit visit = visitRepository.findById(id).orElseThrow(() -> new RuntimeException("Visit topilmadi"));
        visitRepository.delete(visit);
    }
    @Override
    public UserResponse getMe() {
        Long adminId = securityUtils.getCurrentAdminId();
        User admin = userRepository.findById(adminId).orElseThrow(() -> new RuntimeException("Admin topilmadi"));
        UserResponse response = userMapper.toResponse(admin);
        response.setPassword(admin.getPlainPassword());
        response.setClinicName(admin.getClinicName());
        return response;
    }
    @Override
    public UserResponse updateClinicName(String clinicName) {
        Long adminId = securityUtils.getCurrentAdminId();
        User admin = userRepository.findById(adminId).orElseThrow(() -> new RuntimeException("Admin topilmadi"));
        admin.setClinicName(clinicName);
        User saved = userRepository.save(admin);
        UserResponse response = userMapper.toResponse(saved);
        response.setClinicName(saved.getClinicName());
        return response;
    }
    @Override
    public List<com.example.medicare_api.payload.responce.SalaryResponse> getSalaries(LocalDate start, LocalDate end) {
        Long adminId = securityUtils.getCurrentAdminId();
        LocalDateTime startOfDay = start.atStartOfDay();
        LocalDateTime endOfDay = end.atTime(LocalTime.MAX);
        List<Visit> visits = visitRepository.findAllByCreatedAtBetween(startOfDay, endOfDay)
                .stream()
                .filter(v -> v.getStatus() == VisitStatus.COMPLETED && 
                             v.getDoctor() != null && 
                             adminId.equals(v.getDoctor().getAdminId()))
                .collect(java.util.stream.Collectors.toList());
        java.util.Map<User, List<Visit>> visitsByDoctor = visits.stream()
                .filter(v -> v.getDoctor() != null)
                .collect(java.util.stream.Collectors.groupingBy(Visit::getDoctor));
        List<User> employees = userRepository.findAllByAdminId(adminId).stream()
                .filter(u -> u.getRole() == Role.DOCTOR || u.getRole() == Role.MEDSESTRA || u.getRole() == Role.RECEPTION)
                .collect(java.util.stream.Collectors.toList());
        List<com.example.medicare_api.entity.Transaction> allTransactions = transactionRepository.findAllByAdminId(adminId);
        User admin = userRepository.findById(adminId).orElse(null);
        java.util.Set<Integer> workDayNumbers = new java.util.HashSet<>();
        if (admin != null && admin.getWorkDates() != null && !admin.getWorkDates().isBlank()) {
            for (String d : admin.getWorkDates().split(",")) {
                try { workDayNumbers.add(Integer.parseInt(d.trim())); } catch (NumberFormatException ignored) {}
            }
        }
        List<com.example.medicare_api.payload.responce.SalaryResponse> finalSalaries = new java.util.ArrayList<>();
        for(User emp : employees) {
            List<Visit> empVisits = visitsByDoctor.getOrDefault(emp, new java.util.ArrayList<>());
            double totalRevenue = empVisits.stream().mapToDouble(v -> v.getPrice() != null ? v.getPrice() : 0.0).sum();
            String type = emp.getSalaryType();
            double amount = emp.getSalaryAmount() != null ? emp.getSalaryAmount() : 0.0;
            double calculatedSalary = 0.0;
            if ("DAILY".equalsIgnoreCase(type)) {
                long workedDays;
                if (!workDayNumbers.isEmpty()) {
                    workedDays = start.datesUntil(end.plusDays(1))
                        .filter(d -> workDayNumbers.contains(d.getDayOfMonth()))
                        .count();
                } else {
                    workedDays = java.time.temporal.ChronoUnit.DAYS.between(start, end) + 1;
                }
                calculatedSalary = workedDays * amount;
            } else if ("MONTHLY".equalsIgnoreCase(type)) {
                long totalWorkDaysInMonth;
                if (!workDayNumbers.isEmpty()) {
                    LocalDate firstOfMonth = start.withDayOfMonth(1);
                    LocalDate lastOfMonth = start.withDayOfMonth(start.lengthOfMonth());
                    totalWorkDaysInMonth = firstOfMonth.datesUntil(lastOfMonth.plusDays(1))
                        .filter(d -> workDayNumbers.contains(d.getDayOfMonth()))
                        .count();
                    long workedDays = start.datesUntil(end.plusDays(1))
                        .filter(d -> workDayNumbers.contains(d.getDayOfMonth()))
                        .count();
                    calculatedSalary = totalWorkDaysInMonth > 0 ? (amount / totalWorkDaysInMonth) * workedDays : 0;
                } else {
                    long days = java.time.temporal.ChronoUnit.DAYS.between(start, end) + 1;
                    int lengthOfMonth = start.lengthOfMonth();
                    calculatedSalary = (amount / lengthOfMonth) * days;
                }
            } else if ("PERCENTAGE".equalsIgnoreCase(type)) {
                calculatedSalary = totalRevenue * (amount / 100.0);
            }
            List<com.example.medicare_api.entity.Transaction> empTrans = allTransactions.stream()
                .filter(t -> t.getUser().getId().equals(emp.getId()))
                .toList();
            double totalPaid = empTrans.stream().filter(t -> t.getType() == com.example.medicare_api.enums.TransactionType.PAYMENT).mapToDouble(t -> t.getAmount()).sum();
            double totalBonus = empTrans.stream().filter(t -> t.getType() == com.example.medicare_api.enums.TransactionType.BONUS).mapToDouble(t -> t.getAmount()).sum();
            double totalPenalty = empTrans.stream().filter(t -> t.getType() == com.example.medicare_api.enums.TransactionType.PENALTY).mapToDouble(t -> t.getAmount()).sum();
            double balance = calculatedSalary + totalBonus - totalPenalty - totalPaid;
            finalSalaries.add(com.example.medicare_api.payload.responce.SalaryResponse.builder()
                .userId(emp.getId())
                .fullName(emp.getFullName())
                .role(emp.getRole().name())
                .salaryType(type)
                .salaryAmount(amount)
                .totalVisits(empVisits.size())
                .totalRevenue(totalRevenue)
                .calculatedSalary(calculatedSalary)
                .totalBonus(totalBonus)
                .totalPenalty(totalPenalty)
                .totalPaid(totalPaid)
                .balance(balance)
                .workDates(emp.getWorkDates())
                .restDates(emp.getRestDates())
                .build());
        }
        return finalSalaries;
    }
    @Override
    public UserResponse updateUserSalary(Long id, com.example.medicare_api.payload.request.SalaryUpdateRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User topilmadi"));
        Long adminId = securityUtils.getCurrentAdminId();
        if (adminId != null && !adminId.equals(user.getAdminId())) {
            throw new RuntimeException("Sizga tegishli bo'lmagan xodim!");
        }
        user.setSalaryType(request.getSalaryType());
        user.setSalaryAmount(request.getSalaryAmount());
        User saved = userRepository.save(user);
        return userMapper.toResponse(saved);
    }
    @Override
    public UserResponse updateUserSchedule(Long id, com.example.medicare_api.payload.request.WorkScheduleUpdateRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User topilmadi"));
        Long adminId = securityUtils.getCurrentAdminId();
        if (adminId != null && !adminId.equals(user.getAdminId())) {
            throw new RuntimeException("Sizga tegishli bo'lmagan xodim!");
        }
        String workDatesStr = request.getWorkDates() != null ? 
            String.join(",", request.getWorkDates()) : "";
        String restDatesStr = request.getRestDates() != null ? 
            String.join(",", request.getRestDates()) : "";
        user.setWorkDates(workDatesStr);
        user.setRestDates(restDatesStr);
        User saved = userRepository.save(user);
        notificationRepository.save(com.example.medicare_api.entity.Notification.builder()
                .user(saved)
                .message("Admin ish jadvalingizni yangiladi. Jadvalingizni tekshiring.")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build());
        return userMapper.toResponse(saved);
    }
    @Override
    public UserResponse updateClinicSchedule(com.example.medicare_api.payload.request.WorkScheduleUpdateRequest request) {
        Long adminId = securityUtils.getCurrentAdminId();
        User admin = userRepository.findById(adminId).orElseThrow(() -> new RuntimeException("Klinika topilmadi"));
        String workDatesStr = request.getWorkDates() != null ? 
            String.join(",", request.getWorkDates()) : "";
        String restDatesStr = request.getRestDates() != null ? 
            String.join(",", request.getRestDates()) : "";
        admin.setWorkDates(workDatesStr);
        admin.setRestDates(restDatesStr);
        User saved = userRepository.save(admin);
        return userMapper.toResponse(saved);
    }
    @Override
    public List<com.example.medicare_api.payload.responce.TransactionResponse> getUserTransactions(Long userId) {
        Long adminId = securityUtils.getCurrentAdminId();
        List<com.example.medicare_api.entity.Transaction> list = transactionRepository.findAllByAdminIdAndUserId(adminId, userId);
        return list.stream().map(t -> com.example.medicare_api.payload.responce.TransactionResponse.builder()
                .id(t.getId())
                .userId(t.getUser().getId())
                .amount(t.getAmount())
                .type(t.getType())
                .description(t.getDescription())
                .createdAt(t.getCreatedAt())
                .build()).collect(java.util.stream.Collectors.toList());
    }
    @Override
    public com.example.medicare_api.payload.responce.TransactionResponse addTransaction(com.example.medicare_api.payload.request.TransactionRequest request) {
        Long adminId = securityUtils.getCurrentAdminId();
        User user = userRepository.findById(request.getUserId()).orElseThrow(() -> new RuntimeException("Xodim topilmadi"));
        if (adminId != null && !adminId.equals(user.getAdminId())) {
            throw new RuntimeException("Sizga tegishli bo'lmagan xodim!");
        }
        com.example.medicare_api.entity.Transaction t = com.example.medicare_api.entity.Transaction.builder()
                .user(user)
                .adminId(adminId)
                .amount(request.getAmount())
                .type(request.getType())
                .description(request.getDescription())
                .build();
        t = transactionRepository.save(t);
        String message = "";
        if (request.getType() == com.example.medicare_api.enums.TransactionType.BONUS) {
            message = String.format("Sizga %s so'm miqdorida bonus yozildi. Izoh: %s", request.getAmount(), request.getDescription());
        } else if (request.getType() == com.example.medicare_api.enums.TransactionType.PENALTY) {
            message = String.format("Sizga %s so'm miqdorida jarima yozildi. Izoh: %s", request.getAmount(), request.getDescription());
        }
        if (!message.isEmpty()) {
            notificationRepository.save(com.example.medicare_api.entity.Notification.builder()
                .user(user)
                .message(message)
                .isRead(false)
                .createdAt(java.time.LocalDateTime.now())
                .build());
        }
        return com.example.medicare_api.payload.responce.TransactionResponse.builder()
                .id(t.getId())
                .userId(t.getUser().getId())
                .amount(t.getAmount())
                .type(t.getType())
                .description(t.getDescription())
                .createdAt(t.getCreatedAt())
                .build();
    }
    @Override
    public com.example.medicare_api.payload.responce.InventoryItemResponse saveInventoryItem(com.example.medicare_api.payload.request.InventoryItemRequest request) {
        Long adminId = securityUtils.getCurrentAdminId();
        com.example.medicare_api.entity.InventoryCategory category = null;
        if (request.getCategoryId() != null) {
            category = inventoryCategoryRepository.findById(request.getCategoryId()).orElse(null);
        }
        com.example.medicare_api.entity.InventoryItem item = inventoryMapper.toEntity(request, category, adminId);
        com.example.medicare_api.entity.InventoryItem saved = inventoryItemRepository.save(item);
        movementService.logMovement(saved, "ADD", saved.getQuantity(), "Yangi tovar omborga qo'shildi", securityUtils.getCurrentUser());
        return inventoryMapper.toResponse(saved);
    }
    @Override
    public com.example.medicare_api.payload.responce.InventoryItemResponse updateInventoryItem(Long id, com.example.medicare_api.payload.request.InventoryItemRequest request) {
        Long adminId = securityUtils.getCurrentAdminId();
        com.example.medicare_api.entity.InventoryItem item = inventoryItemRepository.findById(id).orElseThrow(() -> new RuntimeException("Item not found"));
        if (!item.getAdminId().equals(adminId)) throw new RuntimeException("Unauthorized");
        int oldQuantity = item.getQuantity();
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setQuantity(request.getQuantity());
        item.setUnit(request.getUnit());
        item.setLowStockThreshold(request.getLowStockThreshold());
        if (request.getCategoryId() != null) {
            com.example.medicare_api.entity.InventoryCategory category = inventoryCategoryRepository.findById(request.getCategoryId()).orElse(null);
            item.setCategory(category);
        } else {
            item.setCategory(null);
        }
        int diff = request.getQuantity() - oldQuantity;
        com.example.medicare_api.entity.InventoryItem saved = inventoryItemRepository.save(item);
        if (diff != 0) {
            movementService.logMovement(saved, "UPDATE", diff, "Omborchi tomonidan qoldiq o'zgartirildi", securityUtils.getCurrentUser());
        }
        return inventoryMapper.toResponse(saved);
    }
    @Override
    public void deleteInventoryItem(Long id) {
        Long adminId = securityUtils.getCurrentAdminId();
        com.example.medicare_api.entity.InventoryItem item = inventoryItemRepository.findById(id).orElseThrow(() -> new RuntimeException("Item not found"));
        if (!item.getAdminId().equals(adminId)) throw new RuntimeException("Unauthorized");
        inventoryItemRepository.delete(item);
    }
    @Override
    public List<com.example.medicare_api.payload.responce.InventoryItemResponse> getAllInventoryItems() {
        Long adminId = securityUtils.getCurrentAdminId();
        return inventoryMapper.toResponseList(inventoryItemRepository.findAllByAdminId(adminId));
    }
    @Override
    public List<com.example.medicare_api.payload.responce.InventoryMovementResponse> getInventoryItemHistory(Long itemId) {
        Long adminId = securityUtils.getCurrentAdminId();
        com.example.medicare_api.entity.InventoryItem item = inventoryItemRepository.findById(itemId).orElseThrow(() -> new RuntimeException("Item not found"));
        if (!java.util.Objects.equals(item.getAdminId(), adminId)) throw new RuntimeException("Unauthorized");
        return movementRepository.findByInventoryItemIdOrderByCreatedAtDesc(itemId).stream().map(m -> 
            com.example.medicare_api.payload.responce.InventoryMovementResponse.builder()
                .id(m.getId())
                .inventoryItemId(m.getInventoryItem().getId())
                .type(m.getType())
                .quantityChanged(m.getQuantityChanged())
                .balanceAfter(m.getBalanceAfter())
                .description(m.getDescription())
                .performedBy(m.getPerformedBy() != null ? m.getPerformedBy().getFullName() : "Tizim")
                .createdAt(m.getCreatedAt())
                .build()
        ).toList();
    }
    @Override
    public com.example.medicare_api.payload.responce.InventoryCategoryResponse saveInventoryCategory(com.example.medicare_api.payload.request.InventoryCategoryRequest request) {
        Long adminId = securityUtils.getCurrentAdminId();
        com.example.medicare_api.entity.InventoryCategory category = com.example.medicare_api.entity.InventoryCategory.builder()
                .name(request.getName())
                .adminId(adminId)
                .build();
        category = inventoryCategoryRepository.save(category);
        return com.example.medicare_api.payload.responce.InventoryCategoryResponse.builder().id(category.getId()).name(category.getName()).build();
    }
    @Override
    public com.example.medicare_api.payload.responce.InventoryCategoryResponse updateInventoryCategory(Long id, com.example.medicare_api.payload.request.InventoryCategoryRequest request) {
        Long adminId = securityUtils.getCurrentAdminId();
        com.example.medicare_api.entity.InventoryCategory category = inventoryCategoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
        if (!category.getAdminId().equals(adminId)) throw new RuntimeException("Unauthorized");
        category.setName(request.getName());
        category = inventoryCategoryRepository.save(category);
        return com.example.medicare_api.payload.responce.InventoryCategoryResponse.builder().id(category.getId()).name(category.getName()).build();
    }
    @Override
    public void deleteInventoryCategory(Long id) {
        Long adminId = securityUtils.getCurrentAdminId();
        com.example.medicare_api.entity.InventoryCategory category = inventoryCategoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
        if (!category.getAdminId().equals(adminId)) throw new RuntimeException("Unauthorized");
        List<com.example.medicare_api.entity.InventoryItem> items = inventoryItemRepository.findAllByAdminId(adminId);
        for(com.example.medicare_api.entity.InventoryItem item : items) {
            if(item.getCategory() != null && item.getCategory().getId().equals(id)) {
                item.setCategory(null);
                inventoryItemRepository.save(item);
            }
        }
        inventoryCategoryRepository.delete(category);
    }
    @Override
    public List<com.example.medicare_api.payload.responce.InventoryCategoryResponse> getAllInventoryCategories() {
        Long adminId = securityUtils.getCurrentAdminId();
        return inventoryCategoryRepository.findAllByAdminId(adminId).stream()
                .map(c -> com.example.medicare_api.payload.responce.InventoryCategoryResponse.builder().id(c.getId()).name(c.getName()).build())
                .collect(java.util.stream.Collectors.toList());
    }
    public List<com.example.medicare_api.payload.responce.DoctorStatsResponse> getDoctorStats() {
        Long adminId = securityUtils.getCurrentAdminId();
        List<User> doctors = adminId == null
                ? userRepository.findAllByRole(com.example.medicare_api.enums.Role.DOCTOR)
                : userRepository.findAllByRoleAndAdminId(com.example.medicare_api.enums.Role.DOCTOR, adminId);
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDateTime start = today.atStartOfDay();
        java.time.LocalDateTime end = today.atTime(java.time.LocalTime.MAX);
        List<com.example.medicare_api.payload.responce.DoctorStatsResponse> result = new java.util.ArrayList<>();
        for (User doctor : doctors) {
            List<com.example.medicare_api.entity.Visit> todayVisits =
                    visitRepository.findByDoctorIdAndCompletedToday(doctor.getId(), start, end);
            List<com.example.medicare_api.entity.Visit> allVisits =
                    visitRepository.findAllByDoctorIdAndStatus(doctor.getId(), VisitStatus.COMPLETED);
            double totalRevenue = todayVisits.stream()
                    .mapToDouble(v -> v.getPrice() != null ? v.getPrice() : 0.0).sum();
            String type = doctor.getSalaryType();
            double amount = doctor.getSalaryAmount() != null ? doctor.getSalaryAmount() : 0.0;
            double calculatedSalary = 0.0;
            if ("DAILY".equalsIgnoreCase(type)) {
                calculatedSalary = amount; 
            } else if ("MONTHLY".equalsIgnoreCase(type)) {
                int lengthOfMonth = today.lengthOfMonth();
                calculatedSalary = amount / lengthOfMonth; 
            }
            result.add(com.example.medicare_api.payload.responce.DoctorStatsResponse.builder()
                    .doctorId(doctor.getId())
                    .doctorName(doctor.getFullName())
                    .specialization(doctor.getSpecialization())
                    .todayPatients(todayVisits.size())
                    .totalPatients(allVisits.size())
                    .totalRevenue(totalRevenue)
                    .calculatedSalary(calculatedSalary)
                    .salaryType(type)
                    .salaryAmount(amount)
                    .build());
        }
        return result;
    }
    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public com.example.medicare_api.payload.responce.ShiftResponse getCurrentShiftStats() {
        com.example.medicare_api.entity.CashShift openShift = cashShiftRepository.findFirstByStatusOrderByOpenedAtDesc(com.example.medicare_api.entity.CashShift.ShiftStatus.OPEN)
                .orElse(null);
        LocalDateTime startTime;
        if (openShift != null) {
            startTime = openShift.getOpenedAt();
        } else {
            com.example.medicare_api.entity.CashShift lastClosed = cashShiftRepository.findFirstByStatusOrderByOpenedAtDesc(com.example.medicare_api.entity.CashShift.ShiftStatus.CLOSED)
                    .orElse(null);
            startTime = (lastClosed != null && lastClosed.getClosedAt().toLocalDate().isEqual(LocalDate.now())) 
                            ? lastClosed.getClosedAt() 
                            : LocalDate.now().atStartOfDay();
        }
        Long adminId = securityUtils.getCurrentAdminId();
        List<Visit> visits = adminId == null 
            ? visitRepository.findAllByCreatedAtBetween(startTime, LocalDateTime.now())
            : visitRepository.findAllByAdminIdAndCreatedAtBetween(adminId, startTime, LocalDateTime.now());
        visits = visits.stream()
            .filter(v -> v.getStatus() != com.example.medicare_api.enums.VisitStatus.REJECTED && v.getStatus() != com.example.medicare_api.enums.VisitStatus.UNPAID)
            .collect(java.util.stream.Collectors.toList());
        double expectedCash = visits.stream()
            .filter(v -> v.getPrice() != null && v.getPaymentType() == com.example.medicare_api.enums.PaymentType.CASH)
            .mapToDouble(Visit::getPrice).sum();
        double cardAmount = visits.stream()
            .filter(v -> v.getPrice() != null && v.getPaymentType() == com.example.medicare_api.enums.PaymentType.CARD)
            .mapToDouble(Visit::getPrice).sum();
        if (openShift == null) {
            return com.example.medicare_api.payload.responce.ShiftResponse.builder()
                    .expectedCash(expectedCash)
                    .cardAmount(cardAmount)
                    .openedAt(startTime)
                    .status("OPEN")
                    .build();
        }
        return com.example.medicare_api.payload.responce.ShiftResponse.fromEntity(openShift);
    }
    @Override
    @org.springframework.transaction.annotation.Transactional
    public com.example.medicare_api.payload.responce.ShiftResponse closeCurrentShift(com.example.medicare_api.payload.request.CloseShiftRequest request, Long adminId) {
        com.example.medicare_api.payload.responce.ShiftResponse currentStats = getCurrentShiftStats();
        com.example.medicare_api.entity.CashShift shiftToClose = cashShiftRepository.findFirstByStatusOrderByOpenedAtDesc(com.example.medicare_api.entity.CashShift.ShiftStatus.OPEN)
                .orElse(com.example.medicare_api.entity.CashShift.builder()
                        .openedAt(currentStats.getOpenedAt())
                        .status(com.example.medicare_api.entity.CashShift.ShiftStatus.OPEN)
                        .build());
        shiftToClose.setExpectedCash(currentStats.getExpectedCash());
        shiftToClose.setCardAmount(currentStats.getCardAmount());
        shiftToClose.setActualCash(request.getActualCash());
        shiftToClose.setActualCard(request.getActualCard());
        double expectedTotal = currentStats.getExpectedCash() + currentStats.getCardAmount();
        double actualTotal = request.getActualCash() + request.getActualCard();
        shiftToClose.setDifferenceAmount(actualTotal - expectedTotal);
        shiftToClose.setComment(request.getComment());
        shiftToClose.setClosedAt(LocalDateTime.now());
        shiftToClose.setStatus(com.example.medicare_api.entity.CashShift.ShiftStatus.CLOSED);
        if (adminId != null) {
            User admin = userRepository.findById(adminId).orElse(null);
            shiftToClose.setClosedBy(admin);
        }
        cashShiftRepository.save(shiftToClose);
        com.example.medicare_api.entity.CashShift newShift = com.example.medicare_api.entity.CashShift.builder()
                .openedAt(LocalDateTime.now())
                .status(com.example.medicare_api.entity.CashShift.ShiftStatus.OPEN)
                .build();
        cashShiftRepository.save(newShift);
        return com.example.medicare_api.payload.responce.ShiftResponse.fromEntity(shiftToClose);
    }
    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<com.example.medicare_api.payload.responce.ShiftResponse> getShiftHistory() {
        return cashShiftRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "openedAt"))
                .stream()
                .filter(s -> s.getStatus() == com.example.medicare_api.entity.CashShift.ShiftStatus.CLOSED)
                .map(com.example.medicare_api.payload.responce.ShiftResponse::fromEntity)
                .collect(java.util.stream.Collectors.toList());
    }
}