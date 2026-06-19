// Backend API manzili (O'zingizning portingizga moslang, masalan: 8080 yoki 5000)
const BASE_URL = 'http://localhost:8080/api';

// JSON formatida ma'lumot almashish uchun yordamchi funksiya
// Buni api.js ichidagi eski request funksiyasi o'rniga qo'ying:
const request = async (url, options = {}) => {
    // Headerlarni xavfsiz birlashtiramiz
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const isGet = !options.method || options.method === 'GET';
    const finalUrl = isGet 
        ? `${BASE_URL}${url}${url.includes('?') ? '&' : '?'}t=${new Date().getTime()}`
        : `${BASE_URL}${url}`;

    const response = await fetch(finalUrl, {
        cache: 'no-store',
        ...options,
        headers: headers // Mana shu yerda aniq uzatilishini ta'minlaymiz
    });

    if (!response.ok) {
        let errMsg = `Xatolik yuz berdi: ${response.status}`;
        try {
            const errJson = await response.json();
            if (errJson.message) errMsg = errJson.message;
        } catch (e) {
            // ignore
        }
        throw new Error(errMsg);
    }

    if (response.status === 204) return null;
    return response.json();
};

export const AuthAPI = {
    login: (credentials) => request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    })
};

// 1. ADMIN APIS (Admin.jsx uchun)
export const AdminAPI = {
    // Statistika ma'lumotlarini olish (Mos keldi: GET /api/admin/stats)
    getStats: () => request('/admin/stats'),

    // Rol bo'yicha xodimlarni olish (Mos keldi: GET /api/admin/users?role=DOCTOR)
    getUsersByRole: (role) => request(`/admin/users?role=${role}`),

    // Barcha xizmatlar va narxlarni olish (Mos keldi: GET /api/admin/allServices)
    getAllServices: () => request('/admin/allServices'),

    // Berilgan muddat oralig'idagi bemorlar tarixini olish (TUZATILDI)
    // Backend '/admin/patients-by-date' kutyapti, parametrlarini esa 'start' va 'end' deb kutyapti
    getPatientsByDate: (startDate, endDate) => request(`/admin/patients-by-date?start=${startDate}&end=${endDate}`),

    // Yakunlangan va rad etilgan muolajalar tarixi
    getProcedureHistory: () => request('/admin/procedure-history'),

    // Yangi xodim qo'shish (Mos keldi: POST /api/admin/create)
    createUser: (userData) => request('/admin/create', {
        method: 'POST',
        body: JSON.stringify(userData)
    }),

    // Xodimni yangilash
    updateUser: (id, userData) => request(`/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
    }),

    // Xodimni o'chirish
    deleteUser: (id) => request(`/admin/users/${id}`, {
        method: 'DELETE'
    }),

    // Xodim maoshini yangilash
    updateUserSalary: (id, salaryData) => request(`/admin/users/${id}/salary`, {
        method: 'PUT',
        body: JSON.stringify(salaryData)
    }),

    // Xodim ish jadvalini yangilash
    updateUserSchedule: (id, scheduleData) => request(`/admin/users/${id}/schedule`, {
        method: 'PUT',
        body: JSON.stringify(scheduleData)
    }),

    // Klinika yagona jadvalini yangilash
    updateClinicSchedule: (scheduleData) => request(`/admin/clinic-schedule`, {
        method: 'PUT',
        body: JSON.stringify(scheduleData)
    }),

    // Bemorni yangilash
    updatePatient: (id, patientData) => request(`/admin/visits/${id}`, {
        method: 'PUT',
        body: JSON.stringify(patientData)
    }),

    // Bemorni o'chirish
    deletePatient: (id) => request(`/admin/visits/${id}`, {
        method: 'DELETE'
    }),

    // Omborxona (Inventory)
    getInventory: () => request('/admin/inventory'),
    createInventoryItem: (data) => request('/admin/inventory', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    updateInventoryItem: (id, data) => request(`/admin/inventory/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    deleteInventoryItem: (id) => request(`/admin/inventory/${id}`, {
        method: 'DELETE'
    }),
    getInventoryHistory: (id) => request(`/admin/inventory/history/${id}`),

    // Omborxona Kategoriyalari
    getInventoryCategories: () => request('/admin/inventory/category'),
    createInventoryCategory: (data) => request('/admin/inventory/category', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    updateInventoryCategory: (id, data) => request(`/admin/inventory/category/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    deleteInventoryCategory: (id) => request(`/admin/inventory/category/${id}`, {
        method: 'DELETE'
    }),

    getUserTransactions: (userId) => request(`/admin/transactions/${userId}`),
    addTransaction: (data) => request('/admin/transactions', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // Moliya (Salaries)
    getSalaries: (start, end) => request(`/admin/salaries?start=${start}&end=${end}`),

    // Yangi xizmat/narx qo'shish (Mos keldi: POST /api/admin/services)
    createService: (serviceData) => request('/admin/services', {
        method: 'POST',
        body: JSON.stringify(serviceData)
    }),

    // Xizmatni tahrirlash
    updateService: (id, serviceData) => request(`/admin/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(serviceData)
    }),

    // Xizmatni o'chirish
    deleteService: (id) => request(`/admin/services/${id}`, {
        method: 'DELETE'
    }),

    // Kichik Admin Sozlamalari
    getMe: () => request('/admin/me'),

    updateClinicName: (clinicName) => request('/admin/clinic-name', {
        method: 'PUT',
        body: JSON.stringify({ clinicName })
    }),

    // Shifokorlar yuklamasi statistikasi
    getDoctorStats: () => request('/admin/doctor-stats'),

    // Kassa Smenasi (Z-Report)
    getCurrentShift: () => request('/admin/shift/current'),
    closeShift: (data) => request('/admin/shift/close', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    getShiftHistory: () => request('/admin/shift/history')
};

// 2. DOCTOR APIS (Doctor.jsx uchun)
export const DoctorAPI = {
    // Shifokorga tegishli navbatni olish
    getQueue: (doctorId) => request(`/doctor/queue/${doctorId}`),

    // Tashxis qo'yish va yakunlash (muolajaga yuborish checkboxi bilan)
    submitDiagnosis: (diagnosisData) => request('/doctor/submit-diagnosis', {
        method: 'POST',
        body: JSON.stringify(diagnosisData)
    }),

    // Bugungi tarix
    getHistory: (doctorId) => request(`/doctor/history/${doctorId}`),

    // Profil ma'lumotlari
    getProfile: (doctorId) => request(`/doctor/profile/${doctorId}`),

    // Bemor tibbiy tarixi
    getPatientHistory: (patientId) => request(`/doctor/patient-history/${patientId}`)
};

// 3. MONITORING APIS (Monitoring.jsx uchun)
export const MonitoringAPI = {
    // Muolaja xonasidagi (Medsestra) navbatni olish
    getQueue: () => request('/monitoring/queue'),

    // Muolajani yakunlash (bemor statusini COMPLETED qilish)
    complete: (visitId) => request(`/monitoring/complete/${visitId}`, {
        method: 'POST'
    }),

    // Bemorning tashxisi va buyurilgan muolajasini modalda ko'rish uchun tafsilotlar
    getRecord: (visitId) => request(`/monitoring/record/${visitId}`),

    // Muolajani rad etish (bemor statusini REJECTED qilish)
    reject: (visitId) => request(`/monitoring/reject/${visitId}`, {
        method: 'POST'
    }),

    // Hamshira vital ko'rsatkichlarni saqlash
    saveVitals: (visitId, data) => request(`/monitoring/vitals/${visitId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    })
};

// 4. RECEPTION APIS (Reception.jsx uchun)
export const ReceptionAPI = {
    // Faol shifokorlar ro'yxatini olish (Select uchun)
    getDoctors: () => request('/reception/doctors'),

    // Shifokor ko'rigi yoki Muolaja turlariga qarab xizmatlarni olish
    getServices: (isCheckup) => request(`/reception/services?isCheckup=${isCheckup}`),

    // Shifokor tanlanganda uning mutaxassisligiga mos xizmatlarni olish
    getServicesByDoctor: (doctorId) => request(`/reception/services/by-doctor/${doctorId}`),

    // To'lanmagan muolajalarni olish
    getUnpaidProcedures: () => request('/reception/unpaid'),

    // Muolaja to'lovini tasdiqlash
    approvePayment: (visitId) => request(`/reception/approve-payment/${visitId}`, { method: 'POST' }),

    // Muolaja to'lovini bekor qilish
    rejectPayment: (visitId) => request(`/reception/reject-payment/${visitId}`, { method: 'POST' }),

    // Yangi bemorni navbatga ro'yxatga olish (To'lov kartasi bilan)
    register: (patientData) => request('/reception/register', {
        method: 'POST',
        body: JSON.stringify(patientData)
    }),

    // Bemor qidirish (ism yoki telefon)
    searchPatient: (q) => request(`/reception/search-patient?q=${encodeURIComponent(q)}`),

    // Shifokor navbatidagi kutish vaqtini olish
    getWaitTime: (doctorId) => request(`/reception/wait-time/${doctorId}`)
};

// 5. SUPER ADMIN APIS
export const SuperAdminAPI = {
    getAdmins: () => request('/super-admin/admins'),
    createAdmin: (adminData) => request('/super-admin/admins', {
        method: 'POST',
        body: JSON.stringify(adminData)
    }),
    updateAdmin: (id, adminData) => request(`/super-admin/admins/${id}`, {
        method: 'PUT',
        body: JSON.stringify(adminData)
    }),
    deleteAdmin: (id) => request(`/super-admin/admins/${id}`, {
        method: 'DELETE'
    })
};

// ── PROFILE ─────────────────────────────────────────────────────────
export const ProfileAPI = {
    getMe: () => request('/profile/me'),
    updateProfile: (data) => request('/profile/update', {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    updatePassword: (data) => request('/profile/password', {
        method: 'PUT',
        body: JSON.stringify(data)
    })
};

// ── NOTIFICATIONS ─────────────────────────────────────────────────────
export const NotificationAPI = {
    getNotifications: () => request('/notifications'),
    markAsRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' })
};