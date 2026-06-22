package com.example.medicare_api.service.serviceImpl;
import com.example.medicare_api.entity.MedicalService;
import com.example.medicare_api.entity.Patient;
import com.example.medicare_api.entity.User;
import com.example.medicare_api.entity.Visit;
import com.example.medicare_api.enums.Role;
import com.example.medicare_api.enums.ServiceType;
import com.example.medicare_api.enums.VisitStatus;
import com.example.medicare_api.mapper.MedicalServiceMapper;
import com.example.medicare_api.mapper.UserMapper;
import com.example.medicare_api.mapper.VisitMapper;
import com.example.medicare_api.payload.request.PatientVisitRequest;
import com.example.medicare_api.payload.responce.MedicalServiceResponse;
import com.example.medicare_api.payload.responce.UserResponse;
import com.example.medicare_api.payload.responce.VisitResponse;
import com.example.medicare_api.repository.MedicalServiceRepository;
import com.example.medicare_api.repository.PatientRepository;
import com.example.medicare_api.repository.UserRepository;
import com.example.medicare_api.repository.VisitRepository;
import com.example.medicare_api.service.ReceptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
@Service
@RequiredArgsConstructor
public class ReceptionServiceImpl implements ReceptionService {
    private final UserRepository userRepository;
    private final VisitRepository visitRepository;
    private final MedicalServiceRepository medicalServiceRepository;
    private final PatientRepository patientRepository;
    private final UserMapper userMapper;
    private final VisitMapper visitMapper;
    private final MedicalServiceMapper medicalServiceMapper;
    private final com.example.medicare_api.security.SecurityUtils securityUtils;
    @Override
    public VisitResponse registerPatientVisit(PatientVisitRequest request) {
        Optional<Patient> byPhone = patientRepository.findByPhone(request.getPhone());
        Patient patient;
        if (byPhone.isPresent()) {
            patient = byPhone.get();
        } else {
            patient = new Patient();
            patient.setFullName(request.getFullName());
            patient.setPhone(request.getPhone());
            patient.setAge(request.getAge());
            patient.setAddress(request.getAddress());
            patient.setAdminId(securityUtils.getCurrentAdminId());
            patient = patientRepository.save(patient);
        }
        MedicalService service = medicalServiceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new RuntimeException("Xizmat topilmadi"));
        User doctor = null;
        if (request.getDoctorId() != null) {
            doctor = userRepository.findById(request.getDoctorId())
                    .orElseThrow(() -> new RuntimeException("Doctor topilmadi"));
        }
        Visit visit = new Visit();
        visit.setPatient(patient);
        visit.setService(service);
        visit.setStatus(VisitStatus.WAITING);
        visit.setPrice(service.getPrice());
        visit.setDoctor(doctor); 
        visit.setAdminId(securityUtils.getCurrentAdminId());
        if (request.getPaymentType() != null) {
            try {
                visit.setPaymentType(com.example.medicare_api.enums.PaymentType.valueOf(request.getPaymentType().toUpperCase()));
            } catch (Exception e) {
                visit.setPaymentType(com.example.medicare_api.enums.PaymentType.CASH);
            }
        } else {
            visit.setPaymentType(com.example.medicare_api.enums.PaymentType.CASH);
        }
        Visit save = visitRepository.save(visit);
        return visitMapper.toResponse(save);
    }
    @Override
    public List<UserResponse> getAllAvailableDoctors() {
        Long adminId = securityUtils.getCurrentAdminId();
        List<User> allByRole = adminId == null 
            ? userRepository.findAllByRole(Role.DOCTOR)
            : userRepository.findAllByRoleAndAdminId(Role.DOCTOR, adminId);
        return userMapper.toResponseList(allByRole);
    }
    @Override
    public List<MedicalServiceResponse> getServicesByType(boolean isCheckup) {
        ServiceType type = isCheckup ? ServiceType.CHECKUP : ServiceType.PROCEDURE;
        Long adminId = securityUtils.getCurrentAdminId();
        List<MedicalService> allByType = adminId == null
            ? medicalServiceRepository.findAllByType(type)
            : medicalServiceRepository.findAllByAdminIdAndType(adminId, type);
        System.out.println(allByType);
        return medicalServiceMapper.toResponseList(allByType);
    }
    @Override
    public List<MedicalServiceResponse> getServicesByDoctor(Long doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Shifokor topilmadi: id=" + doctorId));
        String specialization = doctor.getSpecialization();
        List<MedicalService> services = medicalServiceRepository
                .findAllByTypeAndDoctorId(ServiceType.CHECKUP, doctorId);
        if (services == null || services.isEmpty()) {
            if (specialization != null && !specialization.isBlank()) {
                Long adminId = securityUtils.getCurrentAdminId();
                services = adminId == null 
                    ? medicalServiceRepository.findAllByTypeAndSpecialization(ServiceType.CHECKUP, specialization)
                    : medicalServiceRepository.findAllByAdminIdAndTypeAndSpecialization(adminId, ServiceType.CHECKUP, specialization);
            } else {
                 Long adminId = securityUtils.getCurrentAdminId();
                 return medicalServiceMapper.toResponseList(
                        adminId == null 
                        ? medicalServiceRepository.findAllByType(ServiceType.CHECKUP)
                        : medicalServiceRepository.findAllByAdminIdAndType(adminId, ServiceType.CHECKUP)
                 );
            }
        }
        return medicalServiceMapper.toResponseList(services);
    }
    @Override
    public List<VisitResponse> getUnpaidProcedures() {
        Long adminId = securityUtils.getCurrentAdminId();
        List<Visit> unpaidVisits = adminId == null
                ? visitRepository.findAllByStatus(VisitStatus.UNPAID)
                : visitRepository.findAllByAdminIdAndStatus(adminId, VisitStatus.UNPAID);
        return visitMapper.toResponseList(unpaidVisits);
    }
    @Override
    public void approvePayment(Long visitId) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new RuntimeException("Visit topilmadi"));
        if (visit.getStatus() == VisitStatus.UNPAID) {
            visit.setStatus(VisitStatus.WAITING);
            visitRepository.save(visit);
        }
    }
    @Override
    public void rejectPayment(Long visitId) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new RuntimeException("Visit topilmadi"));
        if (visit.getStatus() == VisitStatus.UNPAID) {
            visit.setStatus(VisitStatus.REJECTED);
            visitRepository.save(visit);
        }
    }
    public List<com.example.medicare_api.entity.Patient> searchPatients(String q) {
        Long adminId = securityUtils.getCurrentAdminId();
        if (adminId == null) {
            return patientRepository.searchByNameOrPhoneNoAdmin(q);
        }
        return patientRepository.searchByNameOrPhone(adminId, q);
    }
    public int getWaitTime(Long doctorId) {
        long waitingCount = visitRepository.countByDoctorIdAndStatus(doctorId, VisitStatus.WAITING);
        return (int) (waitingCount * 10);
    }
}