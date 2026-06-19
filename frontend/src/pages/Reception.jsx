import React, { useState, useEffect, useCallback } from 'react';
import { ReceptionAPI, AdminAPI } from '../api';
import { useToast } from "../components/ToastContext";
import { formatPhone, isValidPhone, formatPrice } from '../utils';
import { useParams } from 'react-router-dom';
import ProfileCabinet from '../components/ProfileCabinet';

const Reception = () => {
    const toast = useToast();
    const { tab: mainTab = 'main' } = useParams();

    // ── HOLAT ──────────────────────────────────────────────────────────────────
    const [tab, setTab] = useState('doctor_queue');
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [procedureServices, setProcedureServices] = useState([]); // Muolaja xizmatlari
    const [doctorServices, setDoctorServices] = useState([]);       // Tanlangan doctorga mos xizmatlar
    const [loadingServices, setLoadingServices] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [todayPatients, setTodayPatients] = useState([]);
    const [successMsg, setSuccessMsg] = useState('');
    const [isPaid, setIsPaid] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [unpaidProcedures, setUnpaidProcedures] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    // Patient search
    const [patientSearchQ, setPatientSearchQ] = useState('');
    const [patientSearchResults, setPatientSearchResults] = useState([]);
    const [searchingPatient, setSearchingPatient] = useState(false);

    // Wait time
    const [waitTime, setWaitTime] = useState(null);

    // Kvitansiya
    const [receiptData, setReceiptData] = useState(null);

    // Forma holati
    const [visitType, setVisitType] = useState('CHECKUP'); // 'CHECKUP' | 'PROCEDURE'
    const [form, setForm] = useState({
        fullName: '', address: '', age: '', phone: '+998', reason: '',
        doctorId: '', serviceId: '', paymentType: 'CASH'
    });

    const p = (f) => (e) => setForm(v => ({ ...v, [f]: e.target.value }));

    // ── Ma'lumotlarni yuklash ──────────────────────────────────────────────────
    const loadData = useCallback(async () => {
        try {
            const [drs, pSvs] = await Promise.all([
                ReceptionAPI.getDoctors(),
                ReceptionAPI.getServices(false),  // isCheckup=false → PROCEDURE xizmatlar
            ]);
            setDoctors(drs || []);
            setProcedureServices(pSvs || []);
        } catch { }
    }, []);

    const loadTodayPatients = useCallback(async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const res = await AdminAPI.getPatientsByDate(today, today);
            setTodayPatients(res || []);
        } catch {
            setTodayPatients([]);
        }
    }, []);

    const loadUnpaidProcedures = useCallback(async () => {
        try {
            const res = await ReceptionAPI.getUnpaidProcedures();
            setUnpaidProcedures(res || []);
        } catch { }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    useEffect(() => {
        loadTodayPatients();
        loadUnpaidProcedures();
        const t = setInterval(() => {
            loadTodayPatients();
            loadUnpaidProcedures();
        }, 8000);
        
        const handleUpdate = () => {
            loadTodayPatients();
            loadUnpaidProcedures();
        };
        window.addEventListener('reception-update', handleUpdate);
        
        return () => {
            clearInterval(t);
            window.removeEventListener('reception-update', handleUpdate);
        };
    }, [loadTodayPatients, loadUnpaidProcedures]);

    // ── Doctor tanlanganida mos xizmatlarni yuklash ──────────────────────────
    useEffect(() => {
        if (visitType === 'CHECKUP' && form.doctorId) {
            setLoadingServices(true);
            setDoctorServices([]);
            setForm(v => ({ ...v, serviceId: '' }));
            ReceptionAPI.getServicesByDoctor(Number(form.doctorId))
                .then(res => {
                    setDoctorServices(res || []);
                    if (res && res.length > 0) {
                        // Avtomatik birinchi xizmatni tanlab qo'yish
                        setForm(v => ({ ...v, serviceId: res[0].id }));
                    }
                })
                .catch(() => toast('Xizmatlarni yuklashda xato!', 'error'))
                .finally(() => setLoadingServices(false));
        } else if (visitType === 'CHECKUP' && !form.doctorId) {
            setDoctorServices([]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.doctorId, visitType]);

    // Tur o'zgarganda serviceId va doctorId ni tozalaymiz
    const handleTypeChange = (newType) => {
        setVisitType(newType);
        setDoctorServices([]);
        setForm(v => ({ ...v, serviceId: '', doctorId: '' }));
        setIsPaid(false);
    };

    // Doctor o'zgarganda (select orqali)
    const handleDoctorChange = (e) => {
        setForm(v => ({ ...v, doctorId: e.target.value, serviceId: '' }));
        setIsPaid(false);
        setWaitTime(null);
        if (e.target.value) {
            ReceptionAPI.getWaitTime(Number(e.target.value))
                .then(res => setWaitTime(res.waitMinutes))
                .catch(() => {});
        }
    };

    // Bemor qidirish
    const handlePatientSearch = async (q) => {
        setPatientSearchQ(q);
        if (q.trim().length < 2) { setPatientSearchResults([]); return; }
        setSearchingPatient(true);
        try {
            const res = await ReceptionAPI.searchPatient(q);
            setPatientSearchResults(res || []);
        } catch {
            setPatientSearchResults([]);
        } finally {
            setSearchingPatient(false);
        }
    };

    // ── Ro'yxatdan o'tkazish ──────────────────────────────────────────────────
    const handleRegister = async () => {
        if (!form.fullName.trim()) return toast('Bemor F.I.SH majburiy!', 'error');
        if (form.phone && !isValidPhone(form.phone)) return toast("Telefon raqamini to'liq kiriting (+998 va 9 ta raqam)", "error");
        if (visitType === 'CHECKUP' && !form.doctorId)
            return toast('Shifokorni tanlang!', 'error');
        if (!form.serviceId)
            return toast('Xizmat turini tanlang!', 'error');
        if (!isPaid)
            return toast('To\'lovni tasdiqlang!', 'error');

        setSubmitting(true);
        try {
            const savedVisit = await ReceptionAPI.register({
                fullName:  form.fullName,
                address:   form.address,
                age:       Number(form.age) || null,
                phone:     form.phone,
                reason:    form.reason,
                serviceId: Number(form.serviceId),
                doctorId:  visitType === 'CHECKUP' ? Number(form.doctorId) : null,
                isCheckup: visitType === 'CHECKUP',
                paymentType: form.paymentType
            });

            const target = visitType === 'CHECKUP' ? 'Shifokor kabineti' : 'Monitoring oynasi';
            toast("Bemor muvaffaqiyatli ro'yxatdan o'tkazildi!");

            // Kvitansiya ma'lumotlarini saqlash
            setReceiptData({
                visitId: savedVisit?.id,
                patientName: form.fullName,
                phone: form.phone,
                serviceName: selectedService?.name || '',
                price: selectedService?.price || 0,
                doctorName: selectedDoctor?.fullName || null,
                paymentType: form.paymentType,
                target,
                time: new Date()
            });

            // Formani tozalaymiz
            setDoctorServices([]);
            setForm({ fullName: '', address: '', age: '', phone: '+998', reason: '', doctorId: '', serviceId: '', paymentType: 'CASH' });
            setIsPaid(false);
            setWaitTime(null);
            setShowRegisterModal(false);
            loadTodayPatients();
        } catch {
            toast('Xato yuz berdi! Qayta urinib ko\'ring.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bemor navbatini bekor qilmoqchimisiz?")) return;
        try {
            await AdminAPI.deletePatient(id);
            toast("Navbat bekor qilindi!");
            loadTodayPatients();
        } catch {
            toast("O'chirishda xatolik!", 'error');
        }
    };

    // ── To'lov bildirishnomalari (Approve/Reject) ─────────────────────────────
    const handleApprovePayment = async (id) => {
        try {
            await ReceptionAPI.approvePayment(id);
            toast("To'lov qabul qilindi va bemor muolaja navbatiga tushdi!", "success");
            loadUnpaidProcedures();
            loadTodayPatients();
            setShowNotifications(false);
        } catch {
            toast("Xatolik yuz berdi!", "error");
        }
    };

    const handleRejectPayment = async (id) => {
        if (!window.confirm("Bemor muolajani rad etdimi? Ushbu to'lov bekor qilinadi.")) return;
        try {
            await ReceptionAPI.rejectPayment(id);
            toast("Muolaja bekor qilindi!", "info");
            loadUnpaidProcedures();
            loadTodayPatients();
        } catch {
            toast("Xatolik yuz berdi!", "error");
        }
    };

    // Navbat filtrlash — backend'da status = 'WAITING'
    const doctorQueue = todayPatients.filter(v => v.status === 'WAITING' && v.doctorId != null && (v.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()));
    const procedureQueue = todayPatients.filter(v => v.status === 'WAITING' && v.doctorId == null && (v.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()));

    // Tanlangan xizmatlar ro'yxati (visit turiga qarab)
    const services = visitType === 'CHECKUP' ? doctorServices : procedureServices;
    const selectedService = services.find(s => s.id === Number(form.serviceId)) || null;
    const selectedDoctor  = doctors.find(d => d.id === Number(form.doctorId)) || null;

    return (
        <div>
            <div className="page-header" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Qabulxona</h1>
            </div>

            {mainTab === 'main' && (
                <>
                <div className="card">
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <button
                            className={`btn ${tab === 'doctor_queue' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setTab('doctor_queue')}
                        >
                            🩺 Shifokor Ko'rigi ({doctorQueue.length})
                        </button>
                        <button
                            className={`btn ${tab === 'procedure_queue' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setTab('procedure_queue')}
                        >
                            💉 Muolaja ({procedureQueue.length})
                        </button>
                        <button
                            className={`btn ${tab === 'patient_search' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setTab('patient_search')}
                        >
                            🔍 Bemor Qidirish
                        </button>
                        <button className="btn btn-ghost" onClick={loadTodayPatients} style={{ fontSize: 13 }}>↻ Yangilash</button>
                    
                    <div style={{ flex: 1, position: 'relative', maxWidth: '300px', marginLeft: 'auto' }}>
                        <input 
                            type="text" 
                            placeholder="Ism yoki familiya orqali qidiruv..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '10px 14px', paddingLeft: '36px', borderRadius: 8, border: '1px solid var(--border)', outline: 'none' }}
                        />
                        <span style={{ position: 'absolute', left: 12, top: 10, color: 'var(--muted)' }}>🔍</span>
                    </div>

                    <button className="btn" onClick={() => setShowRegisterModal(true)} style={{ background: '#10b981', color: 'var(--surface)', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)' }}>
                        <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Yangi Bemor Ro'yxatdan O'tkazish
                    </button>
                </div>

                {/* ── SHIFOKOR NAVBATLARI ── */}
                {tab === 'doctor_queue' && (
                    <>
                        {doctorQueue.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
                                <div style={{ fontSize: 40, marginBottom: 10 }}>🩺</div>
                                <p>Navbatda bemor yo'q</p>
                            </div>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: 40, textAlign: 'center' }}>T/r</th>
                                        <th>F.I.SH</th>
                                        <th>Shifokor</th>
                                        <th>Xizmat</th>
                                        <th>Sabab</th>
                                        <th style={{ width: 100, textAlign: 'center' }}>Amallar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {doctorQueue.map((v, i) => (
                                        <tr key={v.id}>
                                            <td>
                                                <div style={{
                                                    width: 28, height: 28, borderRadius: '50%',
                                                    background: 'rgba(37,99,235,0.1)',
                                                    color: '#2563eb', fontWeight: 700, fontSize: 13,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>{i + 1}</div>
                                            </td>
                                            <td><strong>{v.patientName}</strong></td>
                                            <td>{v.doctorName}</td>
                                            <td>{v.serviceName}</td>
                                            <td style={{ color: 'var(--muted)', fontSize: 13 }}>{v.reason || '—'}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    className="btn btn-ghost"
                                                    style={{ color: 'red', padding: '4px 10px', fontSize: 13 }}
                                                    onClick={() => handleDelete(v.id)}
                                                >
                                                    ✕ Bekor
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}

                {/* ── MUOLAJA NAVBATLARI ── */}
                {tab === 'procedure_queue' && (
                    <>
                        {procedureQueue.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
                                <div style={{ fontSize: 40, marginBottom: 10 }}>💉</div>
                                <p>Navbatda bemor yo'q</p>
                            </div>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: 40, textAlign: 'center' }}>T/r</th>
                                        <th>F.I.SH</th>
                                        <th>Xizmat</th>
                                        <th>Sabab</th>
                                        <th style={{ width: 100, textAlign: 'center' }}>Amallar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {procedureQueue.map((v, i) => (
                                        <tr key={v.id}>
                                            <td>
                                                <div style={{
                                                    width: 28, height: 28, borderRadius: '50%',
                                                    background: 'rgba(124,58,237,0.1)',
                                                    color: '#7c3aed', fontWeight: 700, fontSize: 13,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>{i + 1}</div>
                                            </td>
                                            <td><strong>{v.patientName}</strong></td>
                                            <td>{v.serviceName}</td>
                                            <td style={{ color: 'var(--muted)', fontSize: 13 }}>{v.reason || '—'}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    className="btn btn-ghost"
                                                    style={{ color: 'red', padding: '4px 10px', fontSize: 13 }}
                                                    onClick={() => handleDelete(v.id)}
                                                >
                                                    ✕ Bekor
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}

                {/* ── BEMOR QIDIRISH ── */}
                {tab === 'patient_search' && (
                    <div style={{ padding: '10px 0' }}>
                        <div style={{ position: 'relative', marginBottom: 16 }}>
                            <input
                                type="text"
                                placeholder="Ism yoki telefon raqam orqali qidiring..."
                                value={patientSearchQ}
                                onChange={e => handlePatientSearch(e.target.value)}
                                style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 15 }}
                            />
                            <span style={{ position: 'absolute', left: 14, top: 13, fontSize: 16 }}>🔍</span>
                            {searchingPatient && <span style={{ position: 'absolute', right: 14, top: 14, fontSize: 12, color: 'var(--muted)' }}>Qidirilyapti...</span>}
                        </div>

                        {patientSearchResults.length > 0 ? (
                            <div style={{ display: 'grid', gap: 10 }}>
                                {patientSearchResults.map(p => (
                                    <div key={p.id} style={{ padding: '14px 16px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--surface)', display: 'flex', gap: 16, alignItems: 'center' }}>
                                        <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🧑</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: 15 }}>{p.fullName}</div>
                                            <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 13, color: 'var(--muted)', flexWrap: 'wrap' }}>
                                                {p.phone && <span>📞 {p.phone}</span>}
                                                {p.age && <span>👤 {p.age} yosh</span>}
                                                {p.address && <span>📍 {p.address}</span>}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setForm(v => ({ ...v, fullName: p.fullName, phone: p.phone || '+998', age: p.age || '', address: p.address || '' }));
                                                setShowRegisterModal(true);
                                                setTab('doctor_queue');
                                            }}
                                            style={{ padding: '8px 14px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                                        >
                                            + Navbat
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : patientSearchQ.length >= 2 && !searchingPatient ? (
                            <div style={{ textAlign: 'center', padding: 30, color: 'var(--muted)' }}>
                                <p style={{ fontSize: 32 }}>🔎</p>
                                <p>Bemor topilmadi — yangi bemor sifatida ro'yxatga olish mumkin</p>
                            </div>
                        ) : patientSearchQ.length < 2 ? (
                            <div style={{ textAlign: 'center', padding: 30, color: 'var(--muted)' }}>
                                <p style={{ fontSize: 32 }}>🔍</p>
                                <p>Kamida 2 ta harf kiriting</p>
                            </div>
                        ) : null}
                    </div>
                )}
                </div>
                </>
            )}

            {/* RO'YXATGA OLISH MODALI */}
            {showRegisterModal && (
                <div className="modal-overlay" onClick={() => setShowRegisterModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 900, width: '90%' }}>
                        <div className="modal-header">
                            <h3 style={{ margin: 0 }}>Yangi Bemor Ro'yxatdan O'tkazish</h3>
                            <button onClick={() => setShowRegisterModal(false)} className="modal-close">✕</button>
                        </div>
                        <div className="modal-body">
                        <div className="grid-2">
                            <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--border)' }}>
                                <h3 style={{ marginBottom: 20, color: 'var(--primary)' }}>Bemor Ma'lumotlari</h3>
                                <div className="form-group">
                                    {/* F.I.SH */}
                                    <div>
                                        <label>F.I.SH *</label>
                                        <input placeholder="Aliyev Vohid Baxtiyorovich" value={form.fullName} onChange={p('fullName')} />
                                    </div>

                                    {/* Telefon + Yosh */}
                                    <div className="grid-2" style={{ gap: 10 }}>
                                        <div>
                                            <label>Telefon</label>
                                            <input placeholder="+998" value={form.phone} onChange={(e) => setForm(v => ({...v, phone: formatPhone(e.target.value)}))} />
                                        </div>
                                        <div>
                                            <label>Yoshi</label>
                                            <input type="text" inputMode="numeric" placeholder="28" value={form.age} onChange={(e) => setForm(v => ({...v, age: e.target.value.replace(/\D/g, '').slice(0, 3)}))} />
                                        </div>
                                    </div>

                                    {/* Manzil */}
                                    <div>
                                        <label>Yashash manzili</label>
                                        <input placeholder="Toshkent, Chilonzor..." value={form.address} onChange={p('address')} />
                                    </div>

                                    {/* Kelish sababi */}
                                    <div>
                                        <label>Kelish sababi</label>
                                        <input placeholder="Shikoyatlar, og'riq joyi..." value={form.reason} onChange={p('reason')} />
                                    </div>

                                    {/* ── KELISH MAQSADI (asosiy tanlov) ── */}
                                    <div>
                                        <label>Kelish maqsadi *</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 }}>
                                            <button
                                                type="button"
                                                onClick={() => handleTypeChange('CHECKUP')}
                                                style={{
                                                    padding: '14px',
                                                    border: `2px solid ${visitType === 'CHECKUP' ? '#2563eb' : 'var(--border)'}`,
                                                    borderRadius: 10,
                                                    background: visitType === 'CHECKUP' ? 'rgba(37,99,235,0.08)' : 'var(--surface2)',
                                                    color: visitType === 'CHECKUP' ? '#2563eb' : 'var(--muted)',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                🩺 Shifokor Ko'rigi
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleTypeChange('PROCEDURE')}
                                                style={{
                                                    padding: '14px',
                                                    border: `2px solid ${visitType === 'PROCEDURE' ? '#7c3aed' : 'var(--border)'}`,
                                                    borderRadius: 10,
                                                    background: visitType === 'PROCEDURE' ? 'rgba(124,58,237,0.08)' : 'var(--surface2)',
                                                    color: visitType === 'PROCEDURE' ? '#7c3aed' : 'var(--muted)',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                💉 Faqat Muolaja
                                            </button>
                                        </div>
                                    </div>

                                    {/* ── SHIFOKOR TANLASH (faqat CHECKUP da) ── */}
                                    {visitType === 'CHECKUP' && (
                                        <div>
                                            <label>Shifokor tanlang *</label>
                                            <select value={form.doctorId} onChange={handleDoctorChange}>
                                                <option value="">— Shifokorni tanlang —</option>
                                                {doctors.map(d => (
                                                    <option key={d.id} value={d.id}>
                                                        {d.fullName} {d.specialization ? `(${d.specialization})` : '(Mutaxassisligi kiritilmagan)'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* ── XIZMAT TANLASH (Faqat PROCEDURE uchun) ── */}
                                    {visitType === 'PROCEDURE' && (
                                        <div>
                                            <label>Muolaja turi *</label>
                                            <select value={form.serviceId} onChange={(e) => { p('serviceId')(e); setIsPaid(false); }}>
                                                <option value="">— Muolaja turini tanlang —</option>
                                                {procedureServices.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* CHECKUP: doctor tanlangan, xizmatlar yuklanmoqda */}
                                    {visitType === 'CHECKUP' && form.doctorId && loadingServices && (
                                        <div style={{ padding: '10px 14px', color: '#6b7280', fontSize: 13 }}>
                                            ⏳ Xizmat yuklanmoqda...
                                        </div>
                                    )}

                                    {/* CHECKUP: doctor tanlangan, lekin xizmat topilmadi */}
                                    {visitType === 'CHECKUP' && form.doctorId && !loadingServices && doctorServices.length === 0 && (
                                        <div style={{
                                            padding: '10px 14px',
                                            borderRadius: 8,
                                            background: 'rgba(239,68,68,0.05)',
                                            border: '1px dashed rgba(239,68,68,0.3)',
                                            color: '#dc2626',
                                            fontSize: 13,
                                            marginTop: 4,
                                        }}>
                                            ⚠️ Bu shifokor uchun xizmat topilmadi. Avval Admin panelida ushbu mutaxassislik uchun xizmat/narx qo'shing.
                                        </div>
                                    )}

                                    {/* Muvaffaqiyat xabari */}
                                    {successMsg && (
                                        <div style={{
                                            background: '#f0fdf4', border: '1px solid #86efac',
                                            borderRadius: 8, padding: '12px 16px',
                                            color: '#16a34a', fontSize: 14, fontWeight: 500
                                        }}>
                                            {successMsg}
                                        </div>
                                    )}

                                    {selectedService && (
                                        <div style={{ 
                                            marginTop: 10, 
                                            padding: '16px', 
                                            background: '#f8fafc', 
                                            borderRadius: 12, 
                                            border: '1px solid var(--border)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 16
                                        }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 10, fontWeight: 600 }}>To'lov turi *</label>
                                                <div style={{ display: 'flex', gap: 20 }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: form.paymentType === 'CASH' ? 'var(--surface)' : 'transparent', padding: '8px 12px', borderRadius: 8, border: form.paymentType === 'CASH' ? '1px solid var(--border)' : '1px solid transparent', transition: 'all 0.2s' }}>
                                                        <input 
                                                            type="radio" 
                                                            name="paymentType" 
                                                            value="CASH"
                                                            checked={form.paymentType === 'CASH'}
                                                            onChange={(e) => setForm({...form, paymentType: e.target.value})}
                                                            style={{ accentColor: 'var(--primary)', transform: 'scale(1.2)' }}
                                                        />
                                                        <span style={{ fontWeight: form.paymentType === 'CASH' ? 600 : 400 }}>💵 Naqt pul</span>
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: form.paymentType === 'CARD' ? 'var(--surface)' : 'transparent', padding: '8px 12px', borderRadius: 8, border: form.paymentType === 'CARD' ? '1px solid var(--border)' : '1px solid transparent', transition: 'all 0.2s' }}>
                                                        <input 
                                                            type="radio" 
                                                            name="paymentType" 
                                                            value="CARD"
                                                            checked={form.paymentType === 'CARD'}
                                                            onChange={(e) => setForm({...form, paymentType: e.target.value})}
                                                            style={{ accentColor: 'var(--primary)', transform: 'scale(1.2)' }}
                                                        />
                                                        <span style={{ fontWeight: form.paymentType === 'CARD' ? 600 : 400 }}>💳 Karta orqali</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: 12,
                                                background: isPaid ? 'rgba(16, 185, 129, 0.1)' : 'var(--surface)',
                                                padding: '14px',
                                                borderRadius: 10,
                                                border: isPaid ? '2px solid #10b981' : '1px solid var(--border)',
                                                transition: 'all 0.3s',
                                                cursor: 'pointer'
                                            }} onClick={() => setIsPaid(!isPaid)}>
                                                <input 
                                                    type="checkbox" 
                                                    id="paymentConfirm" 
                                                    checked={isPaid} 
                                                    onChange={(e) => setIsPaid(e.target.checked)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    style={{ width: 22, height: 22, cursor: 'pointer', accentColor: '#10b981' }}
                                                />
                                                <label htmlFor="paymentConfirm" onClick={(e) => e.stopPropagation()} style={{ cursor: 'pointer', margin: 0, color: isPaid ? '#10b981' : '#334155', fontWeight: isPaid ? 700 : 500, fontSize: 15 }}>
                                                    To'lov qabul qilindi (Tasdiqlash)
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        className="btn btn-primary"
                                        onClick={handleRegister}
                                        disabled={submitting || !selectedService || !isPaid}
                                        style={{ 
                                            padding: '13px', 
                                            fontSize: 15, 
                                            fontWeight: 600,
                                            opacity: (!selectedService || !isPaid) ? 0.6 : 1
                                        }}
                                    >
                                        {submitting ? 'Saqlanmoqda...' : '✓ Navbatga Qo\'shish'}
                                    </button>
                                </div>
                            </div>

                            {/* To'lov kartasi */}
                            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, boxShadow: 'none', border: '1px solid var(--border)' }}>
                                <div style={{
                                    width: 80, height: 80, borderRadius: '50%',
                                    background: visitType === 'CHECKUP' ? 'rgba(37,99,235,0.1)' : 'rgba(124,58,237,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 36, marginBottom: 16
                                }}>
                                    {visitType === 'CHECKUP' ? '🩺' : '💉'}
                                </div>
                                <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 8 }}>
                                    {visitType === 'CHECKUP' ? 'Shifokor Ko\'rigi' : 'Muolaja'} narxi:
                                </p>
                                <div style={{
                                    fontSize: 48, fontWeight: 800,
                                    color: visitType === 'CHECKUP' ? '#2563eb' : '#7c3aed',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    margin: '8px 0'
                                }}>
                                    {(selectedService?.price ?? 0).toLocaleString()}
                                </div>
                                <span style={{ color: 'var(--muted)', fontSize: 16 }}>so'm</span>

                                {selectedService && (
                                    <div style={{
                                        marginTop: 16, padding: '8px 16px',
                                        background: 'var(--surface2)', borderRadius: 8,
                                        fontSize: 13, color: 'var(--muted)'
                                    }}>
                                        Tanlangan: <strong>{selectedService.name}</strong>
                                    </div>
                                )}

                                {visitType === 'CHECKUP' && selectedDoctor && (
                                    <div style={{ marginTop: 8, fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
                                        Shifokor: <strong>{selectedDoctor.fullName}</strong>
                                        {selectedDoctor.specialization && (
                                            <span style={{
                                                marginLeft: 6,
                                                background: 'rgba(37,99,235,0.1)',
                                                color: '#2563eb',
                                                padding: '2px 8px',
                                                borderRadius: 12,
                                                fontSize: 12,
                                                fontWeight: 600,
                                            }}>
                                                {selectedDoctor.specialization}
                                            </span>
                                        )}
                                        {waitTime !== null && (
                                            <div style={{ marginTop: 10, padding: '8px 16px', background: waitTime > 30 ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)', borderRadius: 10, border: `1px solid ${waitTime > 30 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
                                                <span style={{ fontSize: 13, fontWeight: 700, color: waitTime > 30 ? '#dc2626' : '#059669' }}>
                                                    ⏱️ Taxminiy kutish: ~{waitTime} daqiqa
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Yo'nalish strelkasi */}
                                <div style={{ marginTop: 24, textAlign: 'center' }}>
                                    <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Qo'shilgach yo'naltiriladi:</div>
                                    <div style={{
                                        padding: '6px 14px',
                                        borderRadius: 20,
                                        background: visitType === 'CHECKUP' ? 'rgba(37,99,235,0.1)' : 'rgba(124,58,237,0.1)',
                                        color: visitType === 'CHECKUP' ? '#2563eb' : '#7c3aed',
                                        fontWeight: 600, fontSize: 13
                                    }}>
                                        {visitType === 'CHECKUP' ? '🩺 Shifokor Kabinetiga' : '💉 Monitoring Oynasiga'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            )}

            {mainTab === 'profile' && <ProfileCabinet />}

            {/* KVITANSIYA MODALI */}
            {receiptData && (
                <div onClick={() => setReceiptData(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div id="receipt-modal" onClick={e => e.stopPropagation()} style={{ background: '#fff', padding: 32, borderRadius: 16, width: 380, boxShadow: '0 20px 50px rgba(0,0,0,0.2)', fontFamily: 'monospace' }}>
                        {/* Kvitansiya sarlavhasi */}
                        <div style={{ textAlign: 'center', borderBottom: '2px dashed #ccc', paddingBottom: 16, marginBottom: 16 }}>
                            <div style={{ fontSize: 28 }}>🏥</div>
                            <h2 style={{ margin: '8px 0 4px', fontSize: 20, color: '#1e293b' }}>MediCare</h2>
                            <div style={{ fontSize: 12, color: '#64748b' }}>
                                {receiptData.time.toLocaleString('uz-UZ')}
                            </div>
                        </div>

                        {/* Bemor ma'lumotlari */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16, fontSize: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748b' }}>Bemor:</span>
                                <strong style={{ color: '#1e293b', textAlign: 'right', maxWidth: '60%' }}>{receiptData.patientName}</strong>
                            </div>
                            {receiptData.phone && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b' }}>Telefon:</span>
                                    <span>{receiptData.phone}</span>
                                </div>
                            )}
                            {receiptData.doctorName && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b' }}>Shifokor:</span>
                                    <span style={{ textAlign: 'right', maxWidth: '60%' }}>{receiptData.doctorName}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748b' }}>Xizmat:</span>
                                <span style={{ textAlign: 'right', maxWidth: '60%' }}>{receiptData.serviceName}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748b' }}>To'lov turi:</span>
                                <span>{receiptData.paymentType === 'CASH' ? '💵 Naqt pul' : '💳 Karta'}</span>
                            </div>
                        </div>

                        {/* Narx */}
                        <div style={{ borderTop: '2px dashed #ccc', borderBottom: '2px dashed #ccc', padding: '14px 0', margin: '0 0 20px', textAlign: 'center' }}>
                            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>To'langan summa</div>
                            <div style={{ fontSize: 36, fontWeight: 900, color: '#059669', letterSpacing: 1 }}>
                                {formatPrice(receiptData.price)}
                                <span style={{ fontSize: 16, fontWeight: 400, marginLeft: 6 }}>so'm</span>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: 16, color: '#64748b', fontSize: 12 }}>
                            Yo'nalish: <strong style={{ color: '#2563eb' }}>{receiptData.target}</strong>
                        </div>

                        {/* Tugmalar */}
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                onClick={() => {
                                    const printContent = document.getElementById('receipt-modal').innerHTML;
                                    const win = window.open('', '_blank', 'width=400,height=600');
                                    win.document.write(`<html><head><title>Kvitansiya</title><style>body{font-family:monospace;padding:20px}button{display:none}</style></head><body>${printContent}</body></html>`);
                                    win.document.close();
                                    win.print();
                                }}
                                style={{ flex: 1, padding: '11px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}
                            >
                                🖨️ Chop etish
                            </button>
                            <button
                                onClick={() => setReceiptData(null)}
                                style={{ flex: 1, padding: '11px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                            >
                                ✕ Yopish
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reception;