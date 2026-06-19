import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from "../components/ToastContext";
import Chart from "react-apexcharts";
import { formatPhone, formatPrice, parsePrice, isValidPhone } from '../utils';
import ProfileCabinet from '../components/ProfileCabinet';
import InventoryTab from '../components/InventoryTab';
import FinanceTab from '../components/FinanceTab';
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';

// ── XODIM QO'SHISH MODALI ──────────────────────────────────────────────────
const UserFormModal = ({ onClose, onSaved, roleDefault = 'DOCTOR', initialData = null }) => {
    const toast = useToast();
    const [form, setForm] = useState(
        initialData || { fullName: '', address: '', phone: '+998', specialization: '', salaryType: 'DAILY', salaryAmount: '', password: '', role: roleDefault }
    );
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState(null);
    const p = (f) => (e) => setForm(v => ({ ...v, [f]: e.target.value }));

    const save = async () => {
        const isMonitoring = form.role === 'MONITORING';
        if (!isMonitoring && !form.fullName) return toast('Majburiy maydonlarni to\'ldiring!', 'error');
        if (form.role === 'DOCTOR' && !form.specialization) return toast('Mutaxassislik kiritish majburiy!', 'error');
        setSaving(true);
        const submissionData = { ...form };
        
        if (isMonitoring && !submissionData.fullName) {
            submissionData.fullName = 'Monitoring xodimi';
        }

        if (submissionData.role === 'DOCTOR') {
            submissionData.specialization = String(submissionData.specialization || '').trim() || null;
        } else {
            submissionData.specialization = null;
        }

        try {
            if (initialData) {
                await AdminAPI.updateUser(initialData.id, submissionData);
                toast('Xodim ma\'lumotlari yangilandi!', 'success');
                onSaved();
                onClose();
            } else {
                const res = await AdminAPI.createUser(submissionData);
                toast('Xodim muvaffaqiyatli qo\'shildi!', 'success');
                setCreatedCredentials({ username: res.username, password: res.password });
                setShowPassword(true);
                onSaved();
            }
        } catch {
            toast('Xato yuz berdi!', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 style={{ margin: 0 }}>{initialData ? 'Xodimni Tahrirlash' : 'Yangi Xodim Qo\'shish'}</h3>
                    <button onClick={onClose} className="modal-close">✕</button>
                </div>
                <div className="modal-body">
                {createdCredentials ? (
                    <div style={{ padding: 20, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                        <h4 style={{ color: '#166534', marginBottom: 15 }}>✅ Muvaffaqiyatli yaratildi</h4>
                        <p style={{ marginBottom: 10 }}>Xodim uchun tizimga kirish ma'lumotlari (nusxalab oling):</p>
                        <div style={{ background: 'var(--surface)', padding: 15, borderRadius: 6, border: '1px dashed #4ade80' }}>
                            <p style={{ margin: '0 0 12px 0' }}><b>Login:</b> {createdCredentials.username}</p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '8px 12px', borderRadius: 6 }}>
                                <p style={{ margin: 0, fontFamily: 'monospace', fontSize: 16 }}>
                                    <b>Parol:</b> {showPassword ? createdCredentials.password : '••••••••'}
                                </p>
                                <button onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', marginTop: 20 }}>Yopish</button>
                    </div>
                ) : (
                    <div className="form-group">
                        <div>
                            <label>Lavozim (Rol) *</label>
                            <select value={form.role} onChange={p('role')} disabled={initialData != null}>
                                <option value="DOCTOR">Shifokor</option>
                                <option value="MEDSESTRA">Medsestra</option>
                                <option value="RECEPTION">Qabulxona</option>
                                <option value="MONITORING">Monitoring</option>
                            </select>
                        </div>
                    
                    {form.role !== 'MONITORING' && (
                        <div><label>F.I.SH *</label><input placeholder="Karimov Jasur Aliyevich" value={form.fullName} onChange={p('fullName')} /></div>
                    )}
                    
                    {initialData && (
                        <div>
                            <label>Parol (O'zgartirish uchun ixtiyoriy)</label>
                            <input type="text" placeholder="Faqat o'zgartirish uchun kiriting..." value={form.password} onChange={p('password')} />
                        </div>
                    )}
                    
                    {form.role !== 'RECEPTION' && form.role !== 'MONITORING' && (
                        <>
                            <div><label>Telefon raqami</label><input placeholder="+998" value={form.phone} onChange={(e) => setForm(v => ({...v, phone: formatPhone(e.target.value)}))} /></div>
                            <div><label>Yashash manzili</label><input placeholder="Toshkent shahar..." value={form.address} onChange={p('address')} /></div>
                        </>
                    )}

                    {form.role === 'DOCTOR' && (
                        <div>
                            <label>Mutaxassislik *</label>
                            <input placeholder="Kardiolog, Nevrolog..." value={form.specialization} onChange={p('specialization')} />
                        </div>
                    )}
                    
                    {(form.role === 'DOCTOR' || form.role === 'MEDSESTRA') && (
                        <>
                            <div>
                                <label>Maosh Turi</label>
                                <select value={form.salaryType || 'DAILY'} onChange={p('salaryType')}>
                                    <option value="DAILY">Kunlik maosh</option>
                                    <option value="MONTHLY">Oylik maosh</option>
                                </select>
                            </div>
                            <div>
                                <label>Maosh Summasi (so'm)</label>
                                <input 
                                    placeholder="Masalan: 80 000" 
                                    value={formatPrice(form.salaryAmount)} 
                                    onChange={e => setForm(v => ({ ...v, salaryAmount: parsePrice(e.target.value) }))} 
                                />
                            </div>
                        </>
                    )}
                    <button className="btn btn-primary" onClick={save} disabled={saving}>
                        {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                    </button>
                </div>
                )}
                </div>
            </div>
        </div>
    );
};

// ── XIZMAT VA NARX QO'SHISH MODALI ─────────────────────────────────────────
const ServiceFormModal = ({ onClose, onSaved, initialData, services = [] }) => {
    const toast = useToast();
    const [form, setForm] = useState(initialData ? {
        name: initialData.name,
        price: initialData.price,
        isCheckup: initialData.isCheckup,
        specialization: initialData.specialization || '',
        doctorId: initialData.doctorId || '',
        recipes: initialData.recipes || []
    } : { name: '', price: '', isCheckup: true, specialization: '', doctorId: '', recipes: [] });
    const [saving, setSaving] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [inventoryItems, setInventoryItems] = useState([]);
    
    useEffect(() => {
        ReceptionAPI.getDoctors().then(res => setDoctors(res || [])).catch(console.error);
        AdminAPI.getInventory().then(res => setInventoryItems(res || [])).catch(console.error);
    }, []);

    const p = (f) => (e) => setForm(v => ({ ...v, [f]: e.target.value }));

    // isCheckup o'zgarganda specialization va doctorId ni tozalaymiz
    const handleTypeChange = (e) => {
        const isCheckup = e.target.value === 'true';
        setForm(v => ({ ...v, isCheckup, specialization: isCheckup ? v.specialization : '', doctorId: isCheckup ? v.doctorId : '' }));
    };

    const handleDoctorChange = (e) => {
        const docId = e.target.value;
        const selectedDoc = doctors.find(d => d.id === Number(docId));
        setForm(v => ({ 
            ...v, 
            doctorId: docId, 
            specialization: selectedDoc ? selectedDoc.specialization || '' : '',
            name: selectedDoc ? `${selectedDoc.fullName} ko'rigi` : v.name // Avtomatik nom
        }));
    };

    const isCheckupBool = form.isCheckup === 'true' || form.isCheckup === true;
    
    // Validatsiya holatlari
    const doctorHasPriceWarning = isCheckupBool && form.doctorId && 
        services.some(s => s.isCheckup && s.doctorId === Number(form.doctorId) && s.id !== initialData?.id);
        
    const procedureNameWarning = !isCheckupBool && form.name.trim() && 
        services.some(s => !s.isCheckup && s.name.toLowerCase().trim() === form.name.toLowerCase().trim() && s.id !== initialData?.id);

    const isButtonDisabled = saving || doctorHasPriceWarning || procedureNameWarning;

    const save = async () => {
        if (!form.name || !form.price) return toast('Barcha maydonlarni to\'ldiring!', 'error');
        if (isCheckupBool && !form.doctorId)
            return toast('Shifokor ko\'rigi uchun shifokorni tanlash shart!', 'error');
        if (doctorHasPriceWarning) return toast('Bu shifokor uchun avval narx yaratilgan!', 'error');
        if (procedureNameWarning) return toast('Bunday nomli muolaja allaqachon mavjud!', 'error');
            
        setSaving(true);
        try {
            const data = {
                name: form.name,
                price: Number(String(form.price).replace(/\D/g, '')),
                isCheckup: isCheckupBool,
                type: isCheckupBool ? 'CHECKUP' : 'PROCEDURE',
                specialization: isCheckupBool ? form.specialization.trim() : null,
                doctorId: isCheckupBool && form.doctorId ? Number(form.doctorId) : null,
                recipes: form.recipes
            };
            if (initialData) {
                await AdminAPI.updateService(initialData.id, data);
                toast('Xizmat va narx yangilandi!');
            } else {
                await AdminAPI.createService(data);
                toast('Xizmat va narx saqlandi!');
            }
            onSaved();
            onClose();
        } catch(err) {
            toast('Xizmatni saqlashda xato yuz berdi! Balki bu shifokorda narx bordir.', 'error');
        } finally {
            setSaving(false);
        }
    };


    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 style={{ margin: 0 }}>Yangi Xizmat & Narx</h3>
                    <button onClick={onClose} className="modal-close">✕</button>
                </div>
                <div className="modal-body">
                <div className="form-group">
                    <div>
                        <label>Xizmat Turi</label>
                        <select value={String(form.isCheckup)} onChange={handleTypeChange}>
                            <option value="true">🩺 Shifokor Ko'rigi (CHECKUP)</option>
                            <option value="false">💉 Muolaja (PROCEDURE)</option>
                        </select>
                    </div>

                    {isCheckupBool && (
                        <div>
                            <label>Shifokorni tanlang *</label>
                            <select value={form.doctorId} onChange={handleDoctorChange}>
                                <option value="">— Shifokorni tanlang —</option>
                                {doctors.map(d => (
                                    <option key={d.id} value={d.id}>
                                        {d.fullName} {d.specialization ? `(${d.specialization})` : ''}
                                    </option>
                                ))}
                            </select>
                            {doctorHasPriceWarning && (
                                <div style={{ color: '#dc2626', fontSize: 13, marginTop: 5, fontWeight: 500 }}>
                                    ⚠️ Bu shifokor uchun avval narx yaratilgan!
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label>Xizmat/Muolaja nomi *</label>
                        <input placeholder="Shifokor ko'rigi, Fizioterapiya, Ukol..." value={form.name} onChange={p('name')} readOnly={isCheckupBool && form.doctorId !== ''} style={{ background: isCheckupBool && form.doctorId !== '' ? 'var(--surface2)' : 'var(--surface)', borderColor: procedureNameWarning ? '#dc2626' : undefined }} />
                        {procedureNameWarning && (
                            <div style={{ color: '#dc2626', fontSize: 13, marginTop: 5, fontWeight: 500 }}>
                                ⚠️ Bunday nomli muolaja allaqachon mavjud!
                            </div>
                        )}
                    </div>

                    <div><label>Belgilangan Narxi (so'm) *</label><input type="text" placeholder="50 000" value={form.price} onChange={(e) => setForm(v => ({...v, price: formatPrice(e.target.value)}))} /></div>

                    {/* Mutaxassislik — faqat CHECKUP uchun */}
                    {isCheckupBool && (
                        <div>
                            <label>Mutaxassislik</label>
                            <input
                                placeholder="Shifokor tanlanganda avto to'ldiriladi"
                                value={form.specialization}
                                readOnly
                                style={{ background: 'var(--surface2)' }}
                            />
                        </div>
                    )}

                    {/* Kerakli tovarlar (Retsept) */}
                    {!isCheckupBool && (
                        <div style={{ marginTop: 15, padding: 15, background: 'rgba(59,130,246,0.05)', borderRadius: 8, border: '1px solid rgba(59,130,246,0.1)' }}>
                            <label style={{ color: '#2563eb', marginBottom: 10, display: 'block' }}>Avtomatik hisobdan chiqarish (Retsept)</label>
                            {form.recipes.map((r, i) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 40px', gap: 10, marginBottom: 10 }}>
                                    <select 
                                        value={r.inventoryItemId} 
                                        onChange={(e) => {
                                            const newRecipes = [...form.recipes];
                                            newRecipes[i].inventoryItemId = e.target.value;
                                            setForm(v => ({...v, recipes: newRecipes}));
                                        }}
                                    >
                                        <option value="">Tovar tanlang</option>
                                        {inventoryItems.map(item => (
                                            <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>
                                        ))}
                                    </select>
                                    <input 
                                        type="number" 
                                        placeholder="Miqdor" 
                                        value={r.quantityRequired}
                                        onChange={(e) => {
                                            const newRecipes = [...form.recipes];
                                            newRecipes[i].quantityRequired = e.target.value;
                                            setForm(v => ({...v, recipes: newRecipes}));
                                        }}
                                    />
                                    <button 
                                        className="btn btn-danger" 
                                        style={{ padding: '0 10px' }}
                                        onClick={() => {
                                            const newRecipes = form.recipes.filter((_, idx) => idx !== i);
                                            setForm(v => ({...v, recipes: newRecipes}));
                                        }}
                                    >✕</button>
                                </div>
                            ))}
                            <button 
                                type="button" 
                                className="btn" 
                                style={{ background: '#fff', border: '1px dashed #2563eb', color: '#2563eb', width: '100%' }}
                                onClick={() => setForm(v => ({...v, recipes: [...v.recipes, { inventoryItemId: '', quantityRequired: '' }]}))}
                            >
                                + Tovar qo'shish
                            </button>
                        </div>
                    )}

                    <button className="btn btn-primary" onClick={save} disabled={isButtonDisabled}>
                        {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                    </button>
                </div>
                </div>
            </div>
        </div>
    );
};



// ── ASOSIY PANEL ───────────────────────────────────────────────────────────
const TABS = [
    { key: 'stats',     label: 'Statistika',   icon: '📊' },
    { key: 'doctors',   label: 'Xodimlar',     icon: '🧑‍⚕️' },
    { key: 'patients',  label: 'Bemorlar',     icon: '🧑‍🦽' },
    { key: 'muolaja',   label: 'Muolaja',      icon: '💉' },
    { key: 'services',  label: 'Xizmatlar',    icon: '💲' },
];


import { AdminAPI, ReceptionAPI } from '../api';

// ── BEMOR TAHRIRLASH MODALI ───────────────────────────────────────────────
const PatientFormModal = ({ onClose, onSaved, initialData }) => {
    const toast = useToast();
    const [form, setForm] = useState({
        fullName: initialData?.patientName || '',
        address: initialData?.patientAddress || '',
        phone: initialData?.patientPhone || '',
        age: initialData?.patientAge || '',
        reason: initialData?.reason || '',
        doctorId: initialData?.doctorId || '',
        serviceId: initialData?.serviceId || ''
    });
    const [saving, setSaving] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [services, setServices] = useState([]);

    const p = (f) => (e) => setForm(v => ({ ...v, [f]: e.target.value }));

    useEffect(() => {
        ReceptionAPI.getDoctors().then(setDoctors).catch(console.error);
        AdminAPI.getAllServices().then(setServices).catch(console.error);
    }, []);

    const save = async () => {
        if (!form.fullName || !form.serviceId) return toast('Bemor ismi va xizmat turini kiriting!', 'error');
        if (form.phone && !isValidPhone(form.phone)) return toast("Telefon raqamini to'liq kiriting (+998 va 9 ta raqam)", "error");
        setSaving(true);
        try {
            await AdminAPI.updatePatient(initialData.id, {
                fullName: form.fullName,
                address: form.address,
                phone: form.phone,
                age: Number(form.age) || null,
                reason: form.reason,
                doctorId: form.doctorId ? Number(form.doctorId) : null,
                serviceId: Number(form.serviceId)
            });
            toast('Bemor ma\'lumotlari yangilandi!');
            onSaved();
            onClose();
        } catch {
            toast('Xato yuz berdi!', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 style={{ margin: 0 }}>Bemorni Tahrirlash</h3>
                    <button onClick={onClose} className="modal-close">✕</button>
                </div>
                <div className="modal-body">
                <div className="form-group">
                    <div><label>F.I.SH *</label><input placeholder="Bemor Ismi" value={form.fullName} onChange={p('fullName')} /></div>
                    <div><label>Telefon</label><input placeholder="+998" value={form.phone} onChange={(e) => setForm(v => ({...v, phone: formatPhone(e.target.value)}))} /></div>
                    <div><label>Yosh</label><input type="text" inputMode="numeric" placeholder="Yosh" value={form.age} onChange={(e) => setForm(v => ({...v, age: e.target.value.replace(/\D/g, '').slice(0, 3)}))} /></div>
                    <div><label>Manzil</label><input placeholder="Manzil" value={form.address} onChange={p('address')} /></div>
                    
                    <div>
                        <label>Shifokor</label>
                        <select value={form.doctorId} onChange={p('doctorId')}>
                            <option value="">Shifokor tanlanmagan</option>
                            {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName} ({d.specialization})</option>)}
                        </select>
                    </div>
                    <div>
                        <label>Xizmat/Muolaja *</label>
                        <select value={form.serviceId} onChange={p('serviceId')}>
                            <option value="">Xizmatni tanlang</option>
                            {services.map(s => <option key={s.id} value={s.id}>{s.name} - {s.price} so'm</option>)}
                        </select>
                    </div>

                    <button className="btn btn-primary" onClick={save} disabled={saving}>
                        {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                    </button>
                </div>
                </div>
            </div>
        </div>
    );
};

// ── BEMOR BATAFSIL MA'LUMOT MODALI ──────────────────────────────────────────
const PatientDetailModal = ({ patient, onClose }) => {
    if (!patient) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 style={{ margin: 0 }}>Bemor Ma'lumotlari</h3>
                    <button onClick={onClose} className="modal-close">✕</button>
                </div>
                <div className="modal-body">
                <div style={{ lineHeight: '1.6' }}>
                    <p><strong>F.I.SH:</strong> {patient.patientName}</p>
                    <p><strong>Telefon:</strong> {patient.patientPhone || '—'}</p>
                    <p><strong>Manzil:</strong> {patient.patientAddress || '—'}</p>
                    <p><strong>Yosh:</strong> {patient.patientAge || '—'}</p>
                    <p><strong>Kelish sababi:</strong> {patient.reason || '—'}</p>
                    <hr style={{ margin: '15px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
                    <p><strong>Xizmat:</strong> {patient.serviceName}</p>
                    <p><strong>Shifokor:</strong> {patient.doctorName}</p>
                    <p><strong>Holat:</strong> {patient.status}</p>
                    <p><strong>Sana:</strong> {new Date(patient.time).toLocaleString()}</p>
                    <hr style={{ margin: '15px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
                    <p><strong>Tashxis:</strong> {patient.diagnosis || '—'}</p>
                    <p><strong>Muolaja:</strong> {patient.procedure || '—'}</p>
                </div>
                </div>
            </div>
        </div>
    );
};

const Admin = () => {
    const toast = useToast();
    const { tab = 'stats' } = useParams();
    const [employeeTab, setEmployeeTab] = useState('doctors');
    const [serviceTab, setServiceTab] = useState('checkup');
    const [stats, setStats] = useState({});
    const [doctors, setDoctors] = useState([]);
    const [nurses, setNurses] = useState([]);
    const [receptions, setReceptions] = useState([]);
    const [monitorings, setMonitorings] = useState([]);
    const [services, setServices] = useState([]);
const [patients, setPatients] = useState([]);
    const [muolaja, setMuolaja] = useState([]);
    const [loading, setLoading] = useState(false);

    const [showUserModal, setShowUserModal] = useState(false);
    const [userModalRole, setUserModalRole] = useState('DOCTOR');
    const [editUserData, setEditUserData] = useState(null);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [editServiceData, setEditServiceData] = useState(null);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [editPatientData, setEditPatientData] = useState(null);

    const [patientFilter, setPatientFilter] = useState({ mode: 'all', date: '', search: '' });
    const [muolajaFilter, setMuolajaFilter] = useState({ mode: 'all', status: 'COMPLETED', date: '' });
    const [patientDetail, setPatientDetail] = useState(null);
    const [visiblePasswords, setVisiblePasswords] = useState({});
    
    // Klinika Sozlamalari uchun holat
    const [isEditingClinic, setIsEditingClinic] = useState(false);

    // Qidiruv holatlari
    const [chartPeriod, setChartPeriod] = useState('weekly');
    const [chartData, setChartData] = useState({ categories: [], cashData: [], cardData: [], totalData: [], totalCash: 0, totalCard: 0, totalIncome: 0 });
    const [searchStaff, setSearchStaff] = useState('');
    const [searchServices, setSearchServices] = useState('');

    // Kassa (Z-Report) states
    const [shiftStats, setShiftStats] = useState(null);
    const [shiftHistory, setShiftHistory] = useState([]);
    const [showShiftModal, setShowShiftModal] = useState(false);
    const [shiftForm, setShiftForm] = useState({ actualCash: '', actualCard: '', comment: '' });
    const [closingShift, setClosingShift] = useState(false);

    useEffect(() => {
        const fetchChartData = async () => {
            if (tab !== 'stats' && tab !== 'moliya-kassa') return;
            const now = new Date();
            let start, end;
            
            if (chartPeriod === 'daily') {
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
            } else if (chartPeriod === 'weekly') {
                const day = now.getDay() || 7; 
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
                end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - day), 23, 59, 59);
            } else if (chartPeriod === 'monthly') {
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            } else if (chartPeriod === 'yearly') {
                start = new Date(now.getFullYear(), 0, 1);
                end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
            }

            const fStart = start.toISOString().split('T')[0];
            const fEnd = end.toISOString().split('T')[0];

            try {
                const visits = await AdminAPI.getPatientsByDate(fStart, fEnd);
                
                let categories = [];
                let cashData = [];
                let cardData = [];
                let totalCash = 0;
                let totalCard = 0;

                if (chartPeriod === 'daily') {
                    categories = ['Ertalab (08-12)', 'Tush (12-16)', 'Kechki (16-20)'];
                    cashData = [0, 0, 0];
                    cardData = [0, 0, 0];
                    visits.forEach(v => {
                        if (v.status === 'REJECTED' || v.status === 'UNPAID') return;
                        const hour = new Date(v.time).getHours();
                        let idx = -1;
                        if (hour >= 8 && hour < 12) idx = 0;
                        else if (hour >= 12 && hour < 16) idx = 1;
                        else if (hour >= 16 && hour < 20) idx = 2;
                        
                        if (idx !== -1) {
                            const price = v.price || 0;
                            if (v.paymentType === 'CASH') cashData[idx] += price;
                            else if (v.paymentType === 'CARD') cardData[idx] += price;
                        }
                    });
                } else if (chartPeriod === 'weekly') {
                    categories = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'];
                    cashData = [0, 0, 0, 0, 0, 0, 0];
                    cardData = [0, 0, 0, 0, 0, 0, 0];
                    visits.forEach(v => {
                        if (v.status === 'REJECTED' || v.status === 'UNPAID') return;
                        let d = new Date(v.time).getDay();
                        let idx = d === 0 ? 6 : d - 1; 
                        const price = v.price || 0;
                        if (v.paymentType === 'CASH') cashData[idx] += price;
                        else if (v.paymentType === 'CARD') cardData[idx] += price;
                    });
                } else if (chartPeriod === 'monthly') {
                    categories = ['1-hafta', '2-hafta', '3-hafta', '4-hafta'];
                    cashData = [0, 0, 0, 0];
                    cardData = [0, 0, 0, 0];
                    visits.forEach(v => {
                        if (v.status === 'REJECTED' || v.status === 'UNPAID') return;
                        const date = new Date(v.time).getDate();
                        let idx = Math.floor((date - 1) / 7);
                        if (idx > 3) idx = 3;
                        const price = v.price || 0;
                        if (v.paymentType === 'CASH') cashData[idx] += price;
                        else if (v.paymentType === 'CARD') cardData[idx] += price;
                    });
                } else if (chartPeriod === 'yearly') {
                    categories = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
                    cashData = Array(12).fill(0);
                    cardData = Array(12).fill(0);
                    visits.forEach(v => {
                        if (v.status === 'REJECTED' || v.status === 'UNPAID') return;
                        const idx = new Date(v.time).getMonth();
                        const price = v.price || 0;
                        if (v.paymentType === 'CASH') cashData[idx] += price;
                        else if (v.paymentType === 'CARD') cardData[idx] += price;
                    });
                }

                cashData.forEach(c => totalCash += c);
                cardData.forEach(c => totalCard += c);
                const totalData = cashData.map((v, i) => v + cardData[i]);
                
                setChartData({ categories, cashData, cardData, totalData, totalCash, totalCard, totalIncome: totalCash + totalCard });
            } catch (err) {
                console.error("Error loading chart data", err);
            }
        };
        fetchChartData();
    }, [chartPeriod, tab]);

    // Kassa ma'lumotlarini yuklash
    const fetchShiftData = useCallback(async () => {
        if (tab !== 'moliya-kassa') return;
        try {
            const current = await AdminAPI.getCurrentShift();
            setShiftStats(current);
            const history = await AdminAPI.getShiftHistory();
            setShiftHistory(history || []);
        } catch (e) {
            console.error("Shift data error", e);
        }
    }, [tab]);

    useEffect(() => {
        fetchShiftData();
    }, [fetchShiftData]);

    const handleCloseShift = async () => {
        if (!shiftForm.actualCash) return toast("Haqiqiy naqd pul summasini kiriting!", "error");
        if (!shiftForm.actualCard) return toast("Haqiqiy karta summasini kiriting (0 bo'lsa 0 kiriting)!", "error");
        
        const expectedTotal = (shiftStats?.expectedCash || 0) + (shiftStats?.cardAmount || 0);
        const actualTotal = Number(shiftForm.actualCash) + Number(shiftForm.actualCard);
        const diff = actualTotal - expectedTotal;

        if (diff !== 0 && !shiftForm.comment) return toast("Kassada farq mavjud! Iltimos, izoh kiriting.", "error");

        if (!window.confirm("Rostdan ham kassani yopmoqchimisiz? Ushbu amalni ortga qaytarib bo'lmaydi!")) return;

        setClosingShift(true);
        try {
            await AdminAPI.closeShift({ 
                actualCash: Number(shiftForm.actualCash), 
                actualCard: Number(shiftForm.actualCard),
                comment: shiftForm.comment 
            });
            toast("Kassa muvaffaqiyatli yopildi!", "success");
            setShowShiftModal(false);
            setShiftForm({ actualCash: '', actualCard: '', comment: '' });
            fetchShiftData(); // Refresh data
        } catch (e) {
            toast("Xatolik yuz berdi!", "error");
        } finally {
            setClosingShift(false);
        }
    };

    // Settings state
    const [meInfo, setMeInfo] = useState(null);
    const [settingsError, setSettingsError] = useState('');
    const [clinicNameInput, setClinicNameInput] = useState('');
    const [savingSettings, setSavingSettings] = useState(false);

    const togglePassword = (id) => {
        setVisiblePasswords(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const loadServices = useCallback(async () => {
        try {
            const res = await AdminAPI.getAllServices();
            setServices(res || []);
        } catch {
            toast("Xizmatlarni yuklashda xato!", 'error');
        }
    }, [toast]);

    const handleDeleteService = async (id) => {
        if (!window.confirm("Rostdan ham ushbu xizmatni o'chirmoqchimisiz?")) return;
        try {
            await AdminAPI.deleteService(id);
            toast("Xizmat o'chirildi!");
            loadServices();
        } catch {
            toast("O'chirishda xatolik yuz berdi!", "error");
        }
    };

    const loadTab = useCallback(async () => {
        setLoading(true);
        try {
            if (tab === 'stats') {
                const res = await AdminAPI.getStats();
                setStats(res || {});
            } else if (tab === 'doctors') {
                const docRes = await AdminAPI.getUsersByRole('DOCTOR');
                setDoctors(docRes || []);
                const nurseRes = await AdminAPI.getUsersByRole('MEDSESTRA');
                setNurses(nurseRes || []);
                const recRes = await AdminAPI.getUsersByRole('RECEPTION');
                setReceptions(recRes || []);
                const monRes = await AdminAPI.getUsersByRole('MONITORING');
                setMonitorings(monRes || []);
            } else if (tab === 'services') {
                loadServices();
            } else if (tab === 'omborxona') {
                setLoading(false); // InventoryTab o'zi yuklaydi
            } else if (tab === 'patients') {
                const today = new Date().toISOString().split('T')[0];
                const res = await AdminAPI.getPatientsByDate('2000-01-01', today);
                setPatients(res || []);
            } else if (tab === 'muolaja') {
                const res = await AdminAPI.getProcedureHistory();
                setMuolaja(res || []);
            } else if (tab === 'settings') {
                try {
                    const res = await AdminAPI.getMe();
                    setMeInfo(res);
                    setClinicNameInput(res.clinicName || '');
                    setSettingsError('');
                } catch (err) {
                    setSettingsError("Ma'lumotni yuklab bo'lmadi. Iltimos, IDE orqali backend'ni 'Restart' qilib yuboring.");
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [tab, loadServices]);

    useEffect(() => { loadTab(); }, [loadTab]);

    const filterPatients = () => {
        let list = [...patients];
        const today = new Date().toISOString().split('T')[0];
        if (patientFilter.mode === 'today') list = list.filter(v => (v.time && v.time.startsWith(today)));
        if (patientFilter.mode === 'date' && patientFilter.date) list = list.filter(v => (v.time && v.time.startsWith(patientFilter.date)));
        if (patientFilter.search) list = list.filter(v => v.patientName?.toLowerCase().includes(patientFilter.search.toLowerCase()));
        return list;
    };

    const filterMuolaja = () => {
        let list = muolaja.filter(v => muolajaFilter.status === 'all' || v.status === muolajaFilter.status);
        const today = new Date().toISOString().split('T')[0];
        if (muolajaFilter.mode === 'today') list = list.filter(v => (v.dateTime && v.dateTime.startsWith(today)));
        if (muolajaFilter.mode === 'date' && muolajaFilter.date) list = list.filter(v => (v.dateTime && v.dateTime.startsWith(muolajaFilter.date)));
        if (muolajaFilter.search) list = list.filter(v => v.patientName?.toLowerCase().includes(muolajaFilter.search.toLowerCase()));
        return list;
    };

    const openAddUser = (role) => { setEditUserData(null); setUserModalRole(role); setShowUserModal(true); };
    const openEditUser = (user) => { setEditUserData(user); setShowUserModal(true); };
    const handleDeleteUser = async (id) => {
        if (!window.confirm("Rostdan ham ushbu xodimni o'chirmoqchimisiz?")) return;
        try {
            await AdminAPI.deleteUser(id);
            toast("Xodim o'chirildi!");
            loadTab();
        } catch {
            toast("O'chirishda xatolik yuz berdi!", 'error');
        }
    };

    const openEditPatient = (patient) => { setEditPatientData(patient); setShowPatientModal(true); };
    const handleDeletePatient = async (id) => {
        if (!window.confirm("Rostdan ham ushbu bemorni ro'yxatdan o'chirmoqchimisiz?")) return;
        try {
            await AdminAPI.deletePatient(id);
            toast("Bemor o'chirildi!");
            loadTab();
        } catch {
            toast("O'chirishda xatolik yuz berdi!", 'error');
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
            {/* MAIN CONTENT */}
            <main style={{ flex: 1, padding: '30px' }}>
                <div className="page-header" style={{ marginBottom: 24, display: tab === 'settings' ? 'none' : 'flex' }}>
                    <h1>
                        {tab?.startsWith('moliya-') 
                            ? (tab === 'moliya-kassa' ? '💰 Kassa' : tab === 'moliya-maosh' ? '📅 Oylik va maosh' : tab === 'moliya-bonus' ? '🎁 Bonus va Jarima' : tab === 'moliya-jadval' ? '🗓 Ish Jadvali' : '📈 Hisobot')
                            : TABS?.find(t => t.key === tab)?.label}
                    </h1>
                </div>

                {loading && <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 40 }}>Ma'lumotlar yuklanmoqda...</p>}

                {/* STATISTIKA VA KASSA */}
                {(tab === 'stats' || tab === 'moliya-kassa') && !loading && (
                    <>
                        {tab === 'moliya-kassa' && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                                <button className="btn btn-primary" onClick={() => setShowShiftModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f43f5e', border: 'none' }}>
                                    🔒 Kassani Yopish
                                </button>
                            </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 15 }}>
                            <div className="stat-card" style={{ padding: 15 }}>
                                <div className="stat-label" style={{ fontSize: 11 }}>Bugungi Jami Bemorlar</div>
                                <div className="stat-value" style={{ fontSize: 20 }}>{stats.totalPatients ?? 0} ta</div>
                            </div>
                            
                            <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6', padding: 15 }}>
                                <div className="stat-label" style={{ fontSize: 11 }}>Shifokor Ko'rigi (Bemorlar)</div>
                                <div className="stat-value" style={{ fontSize: 20 }}>{stats.checkupCount ?? 0} ta</div>
                            </div>
                            <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6', padding: 15 }}>
                                <div className="stat-label" style={{ fontSize: 11 }}>Shifokor Ko'rigi (Tushum)</div>
                                <div className="stat-value" style={{ color: '#3b82f6', fontSize: 20 }}>{(stats.checkupIncome ?? 0).toLocaleString()} UZS</div>
                            </div>

                            <div className="stat-card" style={{ borderLeft: '4px solid #10b981', padding: 15 }}>
                                <div className="stat-label" style={{ fontSize: 11 }}>Muolaja (Bemorlar)</div>
                                <div className="stat-value" style={{ fontSize: 20 }}>{stats.procedureCount ?? 0} ta</div>
                            </div>
                            <div className="stat-card" style={{ borderLeft: '4px solid #10b981', padding: 15 }}>
                                <div className="stat-label" style={{ fontSize: 11 }}>Muolaja (Tushum)</div>
                                <div className="stat-value" style={{ color: '#10b981', fontSize: 20 }}>{(stats.procedureIncome ?? 0).toLocaleString()} UZS</div>
                            </div>
                        </div>
                        
                        <div className="card" style={{ marginTop: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 30 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <h3 style={{ margin: 0, color: 'var(--text)', fontSize: 18 }}>Tushumlar Diagrammasi</h3>
                                {tab === 'stats' && (
                                    <select
                                        value={chartPeriod}
                                        onChange={(e) => setChartPeriod(e.target.value)}
                                        style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', outline: 'none', background: '#f8fafc', cursor: 'pointer', fontWeight: 600, color: '#475569' }}
                                    >
                                        <option value="daily">Kunlik</option>
                                        <option value="weekly">Haftalik</option>
                                        <option value="monthly">Oylik</option>
                                        <option value="yearly">Yillik</option>
                                    </select>
                                )}
                            </div>

                            <div style={{ width: '100%', height: 350, marginBottom: 30, display: tab === 'moliya-kassa' ? 'flex' : 'block', justifyContent: 'center' }}>
                                {(() => {
                                    if (tab === 'moliya-kassa') {
                                        if (!shiftStats) return <div style={{textAlign: 'center', padding: 50, color: 'var(--muted)'}}>Ma'lumotlar hisoblanmoqda...</div>;
                                        
                                        const cash = shiftStats.expectedCash || 0;
                                        const card = shiftStats.cardAmount || 0;
                                        const total = cash + card;

                                        const options = {
                                            chart: { type: 'donut' },
                                            labels: ['Naqd Pul', 'Karta Orqali'],
                                            colors: ['#10b981', '#f59e0b'],
                                            plotOptions: {
                                                pie: {
                                                    donut: {
                                                        size: '65%',
                                                        labels: {
                                                            show: true,
                                                            name: { show: true },
                                                            value: { show: true, formatter: (val) => val.toLocaleString() + " UZS" },
                                                            total: {
                                                                show: true,
                                                                label: 'Umumiy Tushum',
                                                                formatter: () => total.toLocaleString() + " UZS",
                                                                color: '#3b82f6',
                                                                fontSize: '18px',
                                                                fontWeight: 700
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                            dataLabels: { enabled: false },
                                            legend: { position: 'bottom' },
                                            tooltip: { y: { formatter: (val) => val.toLocaleString() + " UZS" } }
                                        };

                                        return <Chart options={options} series={[cash, card]} type="donut" height={350} width={400} />;
                                    }

                                    // For tab === 'stats'
                                    if (!chartData || chartData.categories.length === 0) return <div style={{textAlign: 'center', padding: 50, color: 'var(--muted)'}}>Ma'lumotlar hisoblanmoqda...</div>;

                                    const options = {
                                        chart: { type: 'bar', height: 350, toolbar: { show: false }, stacked: false },
                                        plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 } },
                                        dataLabels: { enabled: false },
                                        stroke: { show: true, width: 2, colors: ['transparent'] },
                                        xaxis: { categories: chartData.categories },
                                        yaxis: { title: { text: 'UZS' }, labels: { formatter: (val) => (val/1000) + 'k' } },
                                        fill: { opacity: 1 },
                                        colors: ['#10b981', '#3b82f6', '#f59e0b'],
                                        legend: { position: 'top', horizontalAlign: 'right' },
                                        tooltip: { y: { formatter: (val) => Math.round(val).toLocaleString() + " UZS" } }
                                    };

                                    const series = [
                                        { name: 'Naqt Pul', data: chartData.cashData },
                                        { name: 'Umumiy Tushum', data: chartData.totalData },
                                        { name: 'Karta Orqali', data: chartData.cardData }
                                    ];

                                    return <Chart options={options} series={series} type="bar" height={350} width="100%" />;
                                })()}
                            </div>

                            {tab === 'stats' && (
                                <div style={{ display: 'flex', gap: 15, justifyContent: 'flex-end', alignItems: 'center', marginTop: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface2)', padding: '6px 14px', borderRadius: 20 }}>
                                        <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
                                            {chartPeriod === 'daily' ? 'Kunlik' : chartPeriod === 'weekly' ? 'Haftalik' : chartPeriod === 'monthly' ? 'Oylik' : 'Yillik'} Umumiy:
                                        </span>
                                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>
                                            {(chartData.totalIncome || 0).toLocaleString()} UZS
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#ecfdf5', padding: '6px 14px', borderRadius: 20 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></div>
                                        <span style={{ fontSize: 12, color: '#047857', fontWeight: 600 }}>Naqt:</span>
                                        <span style={{ fontSize: 14, fontWeight: 700, color: '#047857' }}>
                                            {(chartData.totalCash || 0).toLocaleString()} UZS
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface)beb', padding: '6px 14px', borderRadius: 20 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }}></div>
                                        <span style={{ fontSize: 12, color: '#b45309', fontWeight: 600 }}>Karta:</span>
                                        <span style={{ fontSize: 14, fontWeight: 700, color: '#b45309' }}>
                                            {(chartData.totalCard || 0).toLocaleString()} UZS
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* KASSA SMENASI TARIXI */}
                        {tab === 'moliya-kassa' && (
                            <div className="card" style={{ marginTop: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 30 }}>
                                <h3 style={{ margin: 0, color: 'var(--text)', fontSize: 18, marginBottom: 20 }}>Kassa Tarixi (Z-Report)</h3>
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Smena Ochilgan</th>
                                                <th>Smena Yopilgan</th>
                                                <th>Dastur Hisobi (Naqd/Karta)</th>
                                                <th>Haqiqiy Kiritilgan (Naqd/Karta)</th>
                                                <th>Umumiy Farq</th>
                                                <th>Izoh</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {shiftHistory.map((h, idx) => (
                                                <tr key={idx}>
                                                    <td>{new Date(h.openedAt).toLocaleString('uz-UZ')}</td>
                                                    <td>{new Date(h.closedAt).toLocaleString('uz-UZ')}</td>
                                                    <td style={{ fontWeight: 600, color: '#475569' }}>
                                                        <span style={{color: '#10b981'}}>{(h.expectedCash || 0).toLocaleString()}</span> / <span style={{color: '#f59e0b'}}>{(h.cardAmount || 0).toLocaleString()}</span>
                                                    </td>
                                                    <td style={{ fontWeight: 600, color: '#475569' }}>
                                                        <span style={{color: '#10b981'}}>{(h.actualCash || 0).toLocaleString()}</span> / <span style={{color: '#f59e0b'}}>{(h.actualCard || 0).toLocaleString()}</span>
                                                    </td>
                                                    <td style={{ fontWeight: 600, color: h.differenceAmount < 0 ? '#ef4444' : h.differenceAmount > 0 ? '#10b981' : '#64748b' }}>
                                                        {h.differenceAmount > 0 ? '+' : ''}{(h.differenceAmount || 0).toLocaleString()} UZS
                                                    </td>
                                                    <td>{h.comment || '-'}</td>
                                                </tr>
                                            ))}
                                            {shiftHistory.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--muted)', padding: 20 }}>
                                                        Hali hech qanday kassa yopilmagan.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* SHIFOKORLAR YUKLAMASI JADVALI */}

                    </>
                )}

                {/* SHIFOKORLAR VA MEDSESTRALAR */}
                {tab === 'doctors' && !loading && (
                    <div className="card">
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <button 
                                className={`btn ${employeeTab === 'doctors' ? 'btn-primary' : 'btn-ghost'}`} 
                                onClick={() => setEmployeeTab('doctors')}
                            >
                                Shifokorlar ({doctors.length})
                            </button>
                            <button 
                                className={`btn ${employeeTab === 'nurses' ? 'btn-primary' : 'btn-ghost'}`} 
                                onClick={() => setEmployeeTab('nurses')}
                            >
                                Medsestralar ({nurses.length})
                            </button>
                            <button 
                                className={`btn ${employeeTab === 'reception' ? 'btn-primary' : 'btn-ghost'}`} 
                                onClick={() => setEmployeeTab('reception')}
                            >
                                Qabulxona ({receptions.length})
                            </button>
                            <button 
                                className={`btn ${employeeTab === 'monitoring' ? 'btn-primary' : 'btn-ghost'}`} 
                                onClick={() => setEmployeeTab('monitoring')}
                            >
                                Monitoring ({monitorings.length})
                            </button>
                            
                            <div style={{ flex: 1, position: 'relative', maxWidth: '300px', marginLeft: 'auto' }}>
                                <input 
                                    type="text" 
                                    placeholder="Ism yoki familiya orqali qidiruv..." 
                                    value={searchStaff}
                                    onChange={(e) => setSearchStaff(e.target.value)}
                                    style={{ width: '100%', padding: '10px 14px', paddingLeft: '36px', borderRadius: 8, border: '1px solid var(--border)', outline: 'none' }}
                                />
                                <span style={{ position: 'absolute', left: 12, top: 10, color: 'var(--muted)' }}>🔍</span>
                            </div>

                            <button onClick={() => openAddUser(employeeTab === 'doctors' ? 'DOCTOR' : 'MEDSESTRA')} className="btn" style={{ background: '#10b981', color: 'var(--surface)', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)' }}>
                                <span style={{ fontSize: 18 }}>+</span> Yangi Xodim Yaratish
                            </button>
                        </div>

                        {employeeTab === 'doctors' && (
                            <>
                                <table>
                                    <thead><tr><th style={{ width: 40, textAlign: 'center' }}>T/r</th><th>F.I.SH</th><th>Mutaxassislik</th><th>Telefon</th><th>Login</th><th>Parol</th><th style={{width:'100px', textAlign:'center'}}>Amallar</th></tr></thead>
                                    <tbody>{doctors.filter(u => (u.fullName || '').toLowerCase().includes(searchStaff.toLowerCase())).map((u, idx) => <tr key={u.id}>
                                        <td style={{ textAlign: 'center', color: 'var(--muted)', fontWeight: 600 }}>{idx + 1}</td>
                                        <td><strong>{u.fullName}</strong></td>
                                        <td>{u.specialization || '—'}</td>
                                        <td>{u.phone || '—'}</td>
                                        <td><b>{u.username}</b></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span style={{ fontFamily: 'monospace' }}>
                                                    {visiblePasswords[u.id] ? (u.password || 'Mavjud emas') : '••••••••'}
                                                </span>
                                                <button onClick={() => togglePassword(u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }} title="Parolni ko'rish/yashirish">
                                                    {visiblePasswords[u.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </td>
                                        <td style={{textAlign:'center'}}>
                                            <button className="btn btn-ghost" style={{padding:'4px 8px'}} onClick={() => openEditUser(u)}><Pencil size={18}/></button>
                                            <button className="btn btn-ghost" style={{padding:'4px 8px', color:'red'}} onClick={() => handleDeleteUser(u.id)}><Trash2 size={18}/></button>
                                        </td>
                                    </tr>)}</tbody>
                                </table>
                            </>
                        )}

                        {employeeTab === 'nurses' && (
                            <>
                                <table>
                                    <thead><tr><th style={{ width: 40, textAlign: 'center' }}>T/r</th><th>F.I.SH</th><th>Mutaxassislik</th><th>Telefon</th><th>Login</th><th>Parol</th><th style={{width:'100px', textAlign:'center'}}>Amallar</th></tr></thead>
                                    <tbody>{nurses.filter(u => (u.fullName || '').toLowerCase().includes(searchStaff.toLowerCase())).map((u, idx) => <tr key={u.id}>
                                        <td style={{ textAlign: 'center', color: 'var(--muted)', fontWeight: 600 }}>{idx + 1}</td>
                                        <td><strong>{u.fullName}</strong></td>
                                        <td>{u.specialization || '—'}</td>
                                        <td>{u.phone || '—'}</td>
                                        <td><b>{u.username}</b></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span style={{ fontFamily: 'monospace' }}>
                                                    {visiblePasswords[u.id] ? (u.password || 'Mavjud emas') : '••••••••'}
                                                </span>
                                                <button onClick={() => togglePassword(u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }} title="Parolni ko'rish/yashirish">
                                                    {visiblePasswords[u.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </td>
                                        <td style={{textAlign:'center'}}>
                                            <button className="btn btn-ghost" style={{padding:'4px 8px'}} onClick={() => openEditUser(u)}><Pencil size={18}/></button>
                                            <button className="btn btn-ghost" style={{padding:'4px 8px', color:'red'}} onClick={() => handleDeleteUser(u.id)}><Trash2 size={18}/></button>
                                        </td>
                                    </tr>)}</tbody>
                                </table>
                            </>
                        )}

                        {employeeTab === 'reception' && (
                            <>
                                <table>
                                    <thead><tr><th style={{ width: 40, textAlign: 'center' }}>T/r</th><th>F.I.SH</th><th>Login</th><th>Parol</th><th style={{width:'100px', textAlign:'center'}}>Amallar</th></tr></thead>
                                    <tbody>{receptions.filter(u => (u.fullName || '').toLowerCase().includes(searchStaff.toLowerCase())).map((u, idx) => <tr key={u.id}>
                                        <td style={{ textAlign: 'center', color: 'var(--muted)', fontWeight: 600 }}>{idx + 1}</td>
                                        <td><strong>{u.fullName}</strong></td>
                                        <td><b>{u.username}</b></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span style={{ fontFamily: 'monospace' }}>
                                                    {visiblePasswords[u.id] ? (u.password || 'Mavjud emas') : '••••••••'}
                                                </span>
                                                <button onClick={() => togglePassword(u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }} title="Parolni ko'rish/yashirish">
                                                    {visiblePasswords[u.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </td>
                                        <td style={{textAlign:'center'}}>
                                            <button className="btn btn-ghost" style={{padding:'4px 8px'}} onClick={() => openEditUser(u)}><Pencil size={18}/></button>
                                            <button className="btn btn-ghost" style={{padding:'4px 8px', color:'red'}} onClick={() => handleDeleteUser(u.id)}><Trash2 size={18}/></button>
                                        </td>
                                    </tr>)}</tbody>
                                </table>
                            </>
                        )}

                        {employeeTab === 'monitoring' && (
                            <>
                                <table>
                                    <thead><tr><th style={{ width: 40, textAlign: 'center' }}>T/r</th><th>F.I.SH</th><th>Login</th><th>Parol</th><th style={{width:'100px', textAlign:'center'}}>Amallar</th></tr></thead>
                                    <tbody>{monitorings.filter(u => (u.fullName || '').toLowerCase().includes(searchStaff.toLowerCase())).map((u, idx) => <tr key={u.id}>
                                        <td style={{ textAlign: 'center', color: 'var(--muted)', fontWeight: 600 }}>{idx + 1}</td>
                                        <td><strong>{u.fullName}</strong></td>
                                        <td><b>{u.username}</b></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span style={{ fontFamily: 'monospace' }}>
                                                    {visiblePasswords[u.id] ? (u.password || 'Mavjud emas') : '••••••••'}
                                                </span>
                                                <button onClick={() => togglePassword(u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }} title="Parolni ko'rish/yashirish">
                                                    {visiblePasswords[u.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </td>
                                        <td style={{textAlign:'center'}}>
                                            <button className="btn btn-ghost" style={{padding:'4px 8px'}} onClick={() => openEditUser(u)}><Pencil size={18}/></button>
                                            <button className="btn btn-ghost" style={{padding:'4px 8px', color:'red'}} onClick={() => handleDeleteUser(u.id)}><Trash2 size={18}/></button>
                                        </td>
                                    </tr>)}</tbody>
                                </table>
                            </>
                        )}
                    </div>
                )}

                {/* BEMORLAR */}
                {tab === 'patients' && !loading && (
                    <div className="card">
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <button className={`btn ${patientFilter.mode === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPatientFilter({...patientFilter, mode: 'all'})}>Barchasi</button>
                            <button className={`btn ${patientFilter.mode === 'today' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPatientFilter({...patientFilter, mode: 'today'})}>Bugungi</button>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <button className={`btn ${patientFilter.mode === 'date' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPatientFilter({...patientFilter, mode: 'date'})}>Muddat:</button>
                                {patientFilter.mode === 'date' && (
                                    <input type="date" value={patientFilter.date} onChange={e => setPatientFilter({...patientFilter, date: e.target.value})} style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '6px' }} />
                                )}
                            </div>

                            <div style={{ position: 'relative', width: '250px', marginLeft: 'auto' }}>
                                <input type="text" placeholder="Ism yoki familiya orqali qidiruv..." value={patientFilter.search} onChange={e => setPatientFilter({...patientFilter, search: e.target.value})} style={{ width: '100%', padding: '8px 12px', paddingLeft: '32px', border: '1px solid var(--border)', borderRadius: '6px' }} />
                                <span style={{ position: 'absolute', left: 10, top: 8, color: 'var(--muted)', fontSize: 14 }}>🔍</span>
                            </div>
                        </div>

                        <table>
                            <thead><tr><th style={{ width: 40, textAlign: 'center' }}>T/r</th><th>F.I.SH</th><th>Xizmat</th><th>Shifokor</th><th>Sana</th><th style={{width:'100px', textAlign:'center'}}>Amallar</th></tr></thead>
                            <tbody>{filterPatients().map((v, i) => <tr key={v.id}>
                                <td style={{ textAlign: 'center', color: 'var(--muted)', fontWeight: 600 }}>{i + 1}</td>
                                <td>
                                    <strong style={{cursor: 'pointer', color: 'var(--primary)'}} onClick={() => setPatientDetail(v)}>{v.patientName}</strong>
                                </td>
                                <td>{v.serviceName}</td>
                                <td>{v.doctorName}</td>
                                <td>{v.time ? v.time.split('T')[0] : '—'}</td>
                                <td style={{textAlign:'center'}}>
                                    <button className="btn btn-ghost" style={{padding:'4px 8px'}} onClick={() => openEditPatient(v)}><Pencil size={18}/></button>
                                    <button className="btn btn-ghost" style={{padding:'4px 8px', color:'red'}} onClick={() => handleDeletePatient(v.id)}><Trash2 size={18}/></button>
                                </td>
                            </tr>)}</tbody>
                        </table>
                    </div>
                )}

                {/* MUOLAJA */}
                {tab === 'muolaja' && !loading && (
                    <div className="card">
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                            <button className={`btn ${muolajaFilter.status === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMuolajaFilter({...muolajaFilter, status: 'all'})}>Barchasi</button>
                            <button className={`btn ${muolajaFilter.status === 'COMPLETED' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMuolajaFilter({...muolajaFilter, status: 'COMPLETED'})}>Yakunlangan</button>
                            <button className={`btn ${muolajaFilter.status === 'REJECTED' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMuolajaFilter({...muolajaFilter, status: 'REJECTED'})}>Rad Qilingan</button>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <button className={`btn ${muolajaFilter.mode === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMuolajaFilter({...muolajaFilter, mode: 'all'})}>Barchasi</button>
                            <button className={`btn ${muolajaFilter.mode === 'today' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMuolajaFilter({...muolajaFilter, mode: 'today'})}>Bugungi</button>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <button className={`btn ${muolajaFilter.mode === 'date' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMuolajaFilter({...muolajaFilter, mode: 'date'})}>Muddat:</button>
                                {muolajaFilter.mode === 'date' && (
                                    <input type="date" value={muolajaFilter.date} onChange={e => setMuolajaFilter({...muolajaFilter, date: e.target.value})} style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '6px' }} />
                                )}
                            </div>

                            <div style={{ position: 'relative', width: '250px', marginLeft: 'auto' }}>
                                <input type="text" placeholder="Ism yoki familiya orqali qidiruv..." value={muolajaFilter.search} onChange={e => setMuolajaFilter({...muolajaFilter, search: e.target.value})} style={{ width: '100%', padding: '8px 12px', paddingLeft: '32px', border: '1px solid var(--border)', borderRadius: '6px' }} />
                                <span style={{ position: 'absolute', left: 10, top: 8, color: 'var(--muted)', fontSize: 14 }}>🔍</span>
                            </div>
                        </div>

                        <table>
                            <thead><tr><th style={{ width: 40, textAlign: 'center' }}>T/r</th><th>F.I.SH</th><th>Muolaja (Xizmat)</th><th>Shifokor</th><th>Status</th><th>Vaqt</th></tr></thead>
                            <tbody>{filterMuolaja().map((v, i) => <tr key={v.id}>
                                <td style={{ textAlign: 'center', color: 'var(--muted)', fontWeight: 600 }}>{i + 1}</td>
                                <td><strong style={{cursor: 'pointer', color: 'var(--primary)'}} onClick={() => setPatientDetail(v)}>{v.patientName}</strong></td>
                                <td>{v.serviceTitle || v.serviceName || 'Muolaja'}</td>
                                <td>{v.doctorName && v.doctorName !== 'Biriktirilmagan' ? v.doctorName : '—'}</td>
                                <td>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: 20,
                                        fontSize: 12,
                                        fontWeight: 600,
                                        background: v.status === 'COMPLETED' ? '#dcfce7' : '#fee2e2',
                                        color: v.status === 'COMPLETED' ? '#166534' : '#991b1b'
                                    }}>
                                        {v.status === 'COMPLETED' ? '✓ Yakunlangan' : '✕ Rad etilgan'}
                                    </span>
                                </td>
                                <td>{v.dateTime ? new Date(v.dateTime).toLocaleString('uz-UZ', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}</td>
                            </tr>)}</tbody>
                        </table>
                    </div>
                )}

                {/* OMBORXONA */}
                {tab === 'omborxona' && <InventoryTab toast={toast} />}

                {/* MOLIYA VA MAOSH (KASSA tashqari) */}
                {tab?.startsWith('moliya-') && tab !== 'moliya-kassa' && <FinanceTab 
                    toast={toast} 
                    activeTab={tab.replace('moliya-', '')} 
                    stats={stats} 
                    chartData={chartData} 
                    chartPeriod={chartPeriod} 
                    setChartPeriod={setChartPeriod} 
                />}

                {/* XIZMATLAR */}
                {tab === 'services' && !loading && (
                    <div className="card">
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: '20px' }}>
                            <button 
                                className={`btn ${serviceTab === 'checkup' ? 'btn-primary' : 'btn-ghost'}`} 
                                onClick={() => setServiceTab('checkup')}
                            >
                                🩺 Ko'rik ({services.filter(s => s.isCheckup).length})
                            </button>
                            <button 
                                className={`btn ${serviceTab === 'procedure' ? 'btn-primary' : 'btn-ghost'}`} 
                                onClick={() => setServiceTab('procedure')}
                            >
                                💉 Muolaja ({services.filter(s => !s.isCheckup).length})
                            </button>
                            
                            <div style={{ flex: 1, position: 'relative', maxWidth: '300px', marginLeft: 'auto' }}>
                                <input 
                                    type="text" 
                                    placeholder="Xizmat nomi orqali qidiruv..." 
                                    value={searchServices} 
                                    onChange={e => setSearchServices(e.target.value)} 
                                    style={{ width: '100%', padding: '10px 14px', paddingLeft: '36px', borderRadius: 8, border: '1px solid var(--border)', outline: 'none' }} 
                                />
                                <span style={{ position: 'absolute', left: 12, top: 10, color: 'var(--muted)', fontSize: 14 }}>🔍</span>
                            </div>
                            
                            <button onClick={() => { setEditServiceData(null); setShowServiceModal(true); }} className="btn" style={{ background: '#10b981', color: 'var(--surface)', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)' }}>
                                <span style={{ fontSize: 18 }}>+</span> Yangi Xizmat Yaratish
                            </button>
                        </div>
                        
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: 40, textAlign: 'center' }}>T/r</th>
                                    <th>Nomi</th>
                                    <th>Turi</th>
                                    {serviceTab === 'checkup' && <th>Mutaxassislik</th>}
                                    <th>Narxi</th>
                                    <th style={{width: 100, textAlign: 'center'}}>Amallar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services
                                    .filter(s => serviceTab === 'checkup' ? s.isCheckup : !s.isCheckup)
                                    .filter(s => (s.name || '').toLowerCase().includes(searchServices.toLowerCase()))
                                    .map((s, idx) => (
                                    <tr key={s.id}>
                                        <td style={{ textAlign: 'center', color: 'var(--muted)', fontWeight: 600 }}>{idx + 1}</td>
                                        <td><strong>{s.name}</strong></td>
                                        <td>
                                            <span style={{
                                                padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                                                background: s.isCheckup ? 'rgba(37,99,235,0.1)' : 'rgba(124,58,237,0.1)',
                                                color: s.isCheckup ? '#2563eb' : '#7c3aed',
                                            }}>
                                                {s.isCheckup ? "🩺 Ko'rik" : '💉 Muolaja'}
                                            </span>
                                        </td>
                                        {serviceTab === 'checkup' && (
                                            <td>{s.specialization || <span style={{ color: 'var(--muted)', fontSize: 12 }}>—</span>}</td>
                                        )}
                                        <td>{s.price?.toLocaleString()} so'm</td>
                                        <td style={{textAlign: 'center'}}>
                                            <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
                                                <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => { setEditServiceData(s); setShowServiceModal(true); }}><Pencil size={18}/></button>
                                                <button className="btn btn-ghost" style={{ padding: '4px 8px', color:'red' }} onClick={() => handleDeleteService(s.id)}><Trash2 size={18}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {services.filter(s => serviceTab === 'checkup' ? s.isCheckup : !s.isCheckup).length === 0 && (
                                    <tr>
                                        <td colSpan={serviceTab === 'checkup' ? 5 : 4} style={{ textAlign: 'center', padding: '30px' }}>
                                            Hech qanday xizmat topilmadi
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* SHAXSIY KABINET VA SOZLAMALAR */}
                {tab === 'settings' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <ProfileCabinet />

                        {!loading && !settingsError && meInfo && (
                            <div style={{ maxWidth: 900, margin: '0 0 40px -28px', width: '100%' }}>
                                <div style={{ background: 'var(--surface)', padding: '24px 30px', borderRadius: 16, border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                                    <h3 style={{ color: 'var(--text)', margin: '0 0 16px 0', fontSize: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        🏥 Klinika Sozlamalari
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>Klinika Nomi:</label>
                                            <input 
                                                type="text" 
                                                placeholder={isEditingClinic ? "Masalan: Shifo Nur klinikasi" : "Klinika nomi"} 
                                                value={clinicNameInput} 
                                                disabled={!isEditingClinic}
                                                onChange={e => setClinicNameInput(e.target.value)}
                                                style={{ width: '100%', padding: '10px 12px 10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', fontSize: 14, transition: 'all 0.2s', backgroundColor: isEditingClinic ? '#fff' : '#f8fafc', cursor: isEditingClinic ? 'text' : 'not-allowed', opacity: isEditingClinic ? 1 : 0.8 }} 
                                                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                            />
                                            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>* Ushbu nom tizim bo'ylab "MediCare" o'rniga ko'rsatiladi.</p>
                                        </div>
                                        {!isEditingClinic ? (
                                            <button 
                                                onClick={() => setIsEditingClinic(true)}
                                                style={{
                                                    background: 'var(--surface2)', color: 'var(--text)', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                                    marginTop: 24, transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <Pencil size={16} color="var(--primary)" /> Tahrirlash
                                            </button>
                                        ) : (
                                            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                                                <button 
                                                    onClick={() => {
                                                        setIsEditingClinic(false);
                                                        setClinicNameInput(meInfo?.clinicName || '');
                                                    }}
                                                    disabled={savingSettings}
                                                    style={{
                                                        background: '#fef2f2', color: '#ef4444', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, border: '1px solid #fca5a5', cursor: savingSettings ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                                        opacity: savingSettings ? 0.7 : 1, transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    Bekor qilish
                                                </button>
                                                <button 
                                                    onClick={async () => {
                                                        setSavingSettings(true);
                                                        try {
                                                            const res = await AdminAPI.updateClinicName(clinicNameInput);
                                                            toast("Klinika nomi muvaffaqiyatli saqlandi!", "success");
                                                            setMeInfo(res);
                                                            setIsEditingClinic(false);
                                                            setTimeout(() => window.location.reload(), 1000);
                                                        } catch(e) {
                                                            toast("Saqlashda xatolik yuz berdi!", "error");
                                                        } finally {
                                                            setSavingSettings(false);
                                                        }
                                                    }}
                                                    disabled={savingSettings}
                                                    style={{
                                                        background: 'linear-gradient(to right, #3b82f6, #2563eb)', color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                                        opacity: savingSettings ? 0.8 : 1, boxShadow: '0 2px 10px rgba(59, 130, 246, 0.3)', transition: 'all 0.3s ease'
                                                    }}
                                                >
                                                    {savingSettings ? 'Saqlanmoqda...' : '💾 Saqlash'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {showUserModal && <UserFormModal roleDefault={userModalRole} initialData={editUserData} onClose={() => setShowUserModal(false)} onSaved={loadTab} />}
            {showServiceModal && <ServiceFormModal initialData={editServiceData} services={services} onClose={() => setShowServiceModal(false)} onSaved={loadServices} />}
            {showPatientModal && <PatientFormModal initialData={editPatientData} onClose={() => setShowPatientModal(false)} onSaved={loadTab} />}
            {patientDetail && <PatientDetailModal patient={patientDetail} onClose={() => setPatientDetail(null)} />}

            {/* KASSA YOPISH MODALI */}
            {showShiftModal && shiftStats && (
                <div className="modal-overlay" onClick={() => setShowShiftModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
                        <div className="modal-header">
                            <h3 style={{ margin: 0, color: '#e11d48' }}>Kassani Yopish</h3>
                            <button onClick={() => setShowShiftModal(false)} className="modal-close">✕</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ background: '#f1f5f9', padding: 15, borderRadius: 8, marginBottom: 15 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <span style={{ color: '#475569' }}>Dastur bo'yicha kutilayotgan naqd pul:</span>
                                    <strong style={{ fontSize: 16 }}>{(shiftStats.expectedCash || 0).toLocaleString()} UZS</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#475569' }}>Karta / Click tushumlari (Ma'lumot uchun):</span>
                                    <strong>{(shiftStats.cardAmount || 0).toLocaleString()} UZS</strong>
                                </div>
                            </div>

                            <div className="form-group">
                                <div>
                                    <label style={{ color: '#0f172a', fontWeight: 600 }}>Kassadagi haqiqiy NAQD pul (UZS) *</label>
                                    <input 
                                        placeholder="Sanagan naqd pulingizni kiriting..." 
                                        value={formatPrice(shiftForm.actualCash)} 
                                        onChange={(e) => setShiftForm(v => ({...v, actualCash: parsePrice(e.target.value)}))} 
                                        style={{ fontSize: 16, padding: '12px', border: '2px solid #10b981', marginBottom: 10 }}
                                    />
                                </div>
                                
                                <div>
                                    <label style={{ color: '#0f172a', fontWeight: 600 }}>Kassadagi haqiqiy KARTA / Terminal puli (UZS) *</label>
                                    <input 
                                        placeholder="Terminaldagi pul miqdorini kiriting..." 
                                        value={formatPrice(shiftForm.actualCard)} 
                                        onChange={(e) => setShiftForm(v => ({...v, actualCard: parsePrice(e.target.value)}))} 
                                        style={{ fontSize: 16, padding: '12px', border: '2px solid #f59e0b' }}
                                    />
                                </div>

                                {(shiftForm.actualCash !== '' && shiftForm.actualCard !== '') && (() => {
                                    const expectedTotal = (shiftStats.expectedCash || 0) + (shiftStats.cardAmount || 0);
                                    const actualTotal = Number(shiftForm.actualCash) + Number(shiftForm.actualCard);
                                    const diff = actualTotal - expectedTotal;
                                    
                                    return (
                                        <div style={{ 
                                            padding: 12, 
                                            borderRadius: 8, 
                                            background: diff < 0 ? '#fef2f2' : diff > 0 ? '#f0fdf4' : '#f8fafc',
                                            color: diff < 0 ? '#ef4444' : diff > 0 ? '#10b981' : '#64748b',
                                            fontWeight: 600,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginTop: 10
                                        }}>
                                            <span>Umumiy Farq:</span>
                                            <span>
                                                {diff > 0 ? '+' : ''}
                                                {diff.toLocaleString()} UZS
                                            </span>
                                        </div>
                                    );
                                })()}

                                <div>
                                    <label>Izoh { (() => {
                                        const expectedTotal = (shiftStats.expectedCash || 0) + (shiftStats.cardAmount || 0);
                                        const actualTotal = Number(shiftForm.actualCash || 0) + Number(shiftForm.actualCard || 0);
                                        const diff = actualTotal - expectedTotal;
                                        return diff !== 0 ? <span style={{color: 'red'}}>* (Kamomad yoki ortiqcha pul uchun izoh yozish majburiy)</span> : '';
                                    })() }</label>
                                    <textarea 
                                        placeholder="Kassa farqi haqida izoh yozing..." 
                                        value={shiftForm.comment} 
                                        onChange={(e) => setShiftForm(v => ({...v, comment: e.target.value}))}
                                        style={{ minHeight: 80 }}
                                    />
                                </div>
                                <button className="btn btn-primary" onClick={handleCloseShift} disabled={closingShift} style={{ background: '#e11d48', border: 'none', width: '100%', marginTop: 10 }}>
                                    {closingShift ? 'Yopilmoqda...' : 'Tasdiqlash va Kassani Yopish'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
