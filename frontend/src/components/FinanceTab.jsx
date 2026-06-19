import React, { useState, useEffect } from 'react';
import { AdminAPI, ProfileAPI } from '../api';
import { formatPrice, parsePrice } from '../utils';
import Chart from 'react-apexcharts';

export default function FinanceTab({ toast, activeTab, stats = {}, chartData = null, chartPeriod = 'daily', setChartPeriod }) {
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Inline tahrirlash state-lari
    const [editingStaffId, setEditingStaffId] = useState(null);
    const [editSalaryType, setEditSalaryType] = useState('DAILY');
    const [editSalaryAmount, setEditSalaryAmount] = useState('');
    
    // Oylik va maosh sahifasi uchun tablar va qidiruv
    const [xodimTab, setXodimTab] = useState('DOCTOR');
    const [searchStaff, setSearchStaff] = useState('');
    
    // Tranzaksiyalar state-lari
    const [showTransModal, setShowTransModal] = useState(false);
    const [selectedUserForTrans, setSelectedUserForTrans] = useState(null);
    const [transForm, setTransForm] = useState({ amount: '', type: 'PAYMENT', description: '' });
    const [userTransactions, setUserTransactions] = useState([]);
    const [loadingTrans, setLoadingTrans] = useState(false);
    
    // Maosh kengaytirilgan qator va Bonus modal state
    const [expandedMaoshUser, setExpandedMaoshUser] = useState(null);
    const [showBonusModal, setShowBonusModal] = useState(false);
    const [selectedUserForBonus, setSelectedUserForBonus] = useState(null);
    const [bonusForm, setBonusForm] = useState({ amount: '', type: 'BONUS', description: '' });
    
    // Ish jadvali state-lari
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [isEditingSchedule, setIsEditingSchedule] = useState(false);
    const [editWorkDates, setEditWorkDates] = useState([]);
    const [editRestDates, setEditRestDates] = useState([]);
    const [scheduleMode, setScheduleMode] = useState('WORK'); // WORK yoki REST
    
    // Kalendar uchun state
    const [calendarDate, setCalendarDate] = useState(new Date());

    const loadClinicSchedule = () => {
        ProfileAPI.getMe().then(res => {
            setEditWorkDates(res.workDates ? res.workDates.split(',') : []);
            setEditRestDates(res.restDates ? res.restDates.split(',') : []);
            setSelectedStaff({ fullName: "Klinika", userId: res.id });
        });
    };

    useEffect(() => {
        if (activeTab === 'jadval') {
            loadClinicSchedule();
        }
    }, [activeTab]);

    // Default oylik oynasi: joriy oyning boshi va oxiri (Maosh qidiruvi uchun)
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(firstDay);
    const [endDate, setEndDate] = useState(lastDay);

    const getDaysForCalendar = () => {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0);
        const days = [];
        let curr = new Date(start);
        while (curr <= end) {
            const yyyy = curr.getFullYear();
            const mm = String(curr.getMonth() + 1).padStart(2, '0');
            const dd = String(curr.getDate()).padStart(2, '0');
            days.push(`${yyyy}-${mm}-${dd}`);
            curr.setDate(curr.getDate() + 1);
        }
        return days;
    };
    const currentCalendarDays = getDaysForCalendar();

    const changeMonth = (offset) => {
        const newDate = new Date(calendarDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCalendarDate(newDate);
    };

    const handleToggleDate = (dateStr) => {
        if (!isEditingSchedule) return;
        
        const dayStr = String(new Date(dateStr).getDate());

        if (scheduleMode === 'WORK') {
            if (editRestDates.includes(dayStr)) return; // Bloklash
            
            if (editWorkDates.includes(dayStr)) {
                setEditWorkDates(editWorkDates.filter(d => d !== dayStr));
            } else {
                setEditWorkDates([...editWorkDates, dayStr]);
            }
        } else {
            if (editWorkDates.includes(dayStr)) return; // Bloklash

            if (editRestDates.includes(dayStr)) {
                setEditRestDates(editRestDates.filter(d => d !== dayStr));
            } else {
                setEditRestDates([...editRestDates, dayStr]);
            }
        }
    };

    const saveSchedule = async () => {
        try {
            await AdminAPI.updateClinicSchedule({ workDates: editWorkDates, restDates: editRestDates });
            toast("Klinika ish jadvali muvaffaqiyatli saqlandi!", "success");
            setIsEditingSchedule(false);
            loadClinicSchedule();
        } catch(e) {
            toast("Saqlashda xatolik yuz berdi", "error");
        }
    };

    const loadSalaries = () => {
        setLoading(true);
        AdminAPI.getSalaries(startDate, endDate)
            .then(res => {
                setSalaries(res || []);
                setLoading(false);
            })
            .catch(err => {
                toast("Moliya hisobotini yuklashda xatolik!", "error");
                setLoading(false);
            });
    };

    const saveSalary = async () => {
        if (!editSalaryAmount) return toast("Summani kiriting", "error");
        try {
            await AdminAPI.updateUserSalary(editingStaffId, {
                salaryType: editSalaryType,
                salaryAmount: parseFloat(editSalaryAmount)
            });
            toast("Maosh muvaffaqiyatli saqlandi!", "success");
            setEditingStaffId(null);
            loadSalaries();
        } catch(e) {
            toast("Saqlashda xatolik yuz berdi", "error");
        }
    };

    const openTransModal = (user) => {
        setSelectedUserForTrans(user);
        setTransForm({ amount: '', type: 'PAYMENT', description: '' });
        setShowTransModal(true);
        loadTransactions(user.userId);
    };

    const closeTransModal = () => {
        setShowTransModal(false);
        setSelectedUserForTrans(null);
    };

    const loadTransactions = async (userId) => {
        setLoadingTrans(true);
        try {
            const res = await AdminAPI.getUserTransactions(userId);
            setUserTransactions(res || []);
        } catch(e) {
            toast("Tranzaksiyalarni yuklashda xatolik", "error");
        }
        setLoadingTrans(false);
    };

    const saveTransaction = async (e) => {
        e.preventDefault();
        if (!transForm.amount || parseFloat(transForm.amount) <= 0) {
            return toast("Summani to'g'ri kiriting", "error");
        }
        try {
            await AdminAPI.addTransaction({
                userId: selectedUserForTrans.userId,
                amount: parseFloat(transForm.amount),
                type: transForm.type,
                description: transForm.description
            });
            toast("Tranzaksiya muvaffaqiyatli saqlandi!", "success");
            setTransForm({ amount: '', type: 'PAYMENT', description: '' });
            loadTransactions(selectedUserForTrans.userId);
            loadSalaries(); // Refresh balances
        } catch(err) {
            toast("Tranzaksiyani saqlashda xatolik", "error");
        }
    };

    const saveBonus = async (e) => {
        e.preventDefault();
        if (!bonusForm.amount || parseFloat(bonusForm.amount) <= 0) {
            return toast("Summani to'g'ri kiriting", "error");
        }
        try {
            await AdminAPI.addTransaction({
                userId: selectedUserForBonus.userId || selectedUserForBonus.id,
                amount: parseFloat(bonusForm.amount),
                type: bonusForm.type,
                description: bonusForm.description
            });
            toast("Muvaffaqiyatli saqlandi!", "success");
            setShowBonusModal(false);
            setBonusForm({ amount: '', type: 'BONUS', description: '' });
            loadSalaries();
        } catch(err) {
            toast("Saqlashda xatolik", "error");
        }
    };


    useEffect(() => {
        loadSalaries();
    }, [startDate, endDate, activeTab]);

    // Hisob-kitoblar
    const totalClinicRevenue = salaries.reduce((acc, curr) => acc + (curr.totalRevenue || 0), 0);
    const totalSalaries = salaries.reduce((acc, curr) => acc + (curr.calculatedSalary || 0), 0);
    const clinicProfit = totalClinicRevenue - totalSalaries;

    return (
        <div>

            {/* 0. XODIMLAR MAOSHI BELGILASH */}
            {activeTab === 'xodimlar' && (
                <div className="card">
                    <h3 style={{ marginTop: 0, marginBottom: 20 }}>Xodimlar Maoshini Belgilash</h3>
                    {loading ? <p>Yuklanmoqda...</p> : (
                        <div>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <button 
                                    className={`btn ${xodimTab === 'doctor' ? 'btn-primary' : 'btn-ghost'}`} 
                                    onClick={() => setXodimTab('doctor')}
                                >
                                    Shifokorlar ({staff.doctor.length})
                                </button>
                                <button 
                                    className={`btn ${xodimTab === 'medsestra' ? 'btn-primary' : 'btn-ghost'}`} 
                                    onClick={() => setXodimTab('medsestra')}
                                >
                                    Medsestralar ({staff.medsestra.length})
                                </button>
                                <button 
                                    className={`btn ${xodimTab === 'reception' ? 'btn-primary' : 'btn-ghost'}`} 
                                    onClick={() => setXodimTab('reception')}
                                >
                                    Qabulxona ({staff.reception.length})
                                </button>
                                
                                <div style={{ flex: 1, position: 'relative', maxWidth: '300px', marginLeft: 'auto' }}>
                                    <input 
                                        type="text" 
                                        placeholder="F.I.SH orqali qidiruv..." 
                                        value={searchStaff}
                                        onChange={(e) => setSearchStaff(e.target.value)}
                                        style={{ width: '100%', padding: '10px 14px', paddingLeft: '36px', borderRadius: 8, border: '1px solid var(--border)', outline: 'none' }}
                                    />
                                    <span style={{ position: 'absolute', left: 12, top: 10, color: 'var(--muted)' }}>🔍</span>
                                </div>
                            </div>

                            {staff[xodimTab].length === 0 ? (
                                <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px 0' }}>Xodimlar topilmadi.</p>
                            ) : (
                                <table>
                                    <thead>
                                        <tr>
                                            <th style={{ width: 40, textAlign: 'center' }}>T/r</th>
                                            <th style={{ width: '30%' }}>F.I.SH</th>
                                            <th>Mutaxassislik</th>
                                            <th>Maosh Turi</th>
                                            <th>Summa (so'm)</th>
                                            <th style={{ width: 150, textAlign: 'center' }}>Amallar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {staff[xodimTab]
                                            .filter(s => (s.fullName || '').toLowerCase().includes(searchStaff.toLowerCase()))
                                            .map((s, index) => (
                                            <tr key={s.id}>
                                                <td style={{ textAlign: 'center', color: 'var(--muted)', fontWeight: 600 }}>{index + 1}</td>
                                                <td><strong>{s.fullName}</strong></td>
                                                <td>{s.specialization || '—'}</td>
                                                <td>
                                                    {editingStaffId === s.id ? (
                                                        <select value={editSalaryType} onChange={e => setEditSalaryType(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', width: '100%' }}>
                                                            <option value="DAILY">Kunlik fiksa</option>
                                                            <option value="MONTHLY">Oylik fiksa</option>
                                                            <option value="PERCENTAGE">Foiz (%)</option>
                                                        </select>
                                                    ) : (
                                                        <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 13, background: s.salaryType === 'MONTHLY' ? '#e0e7ff' : s.salaryType === 'PERCENTAGE' ? '#fce7f3' : '#dcfce7', color: s.salaryType === 'MONTHLY' ? '#4338ca' : s.salaryType === 'PERCENTAGE' ? '#be185d' : '#166534', fontWeight: 600 }}>
                                                            {s.salaryType === 'MONTHLY' ? 'Oylik fiksa' : s.salaryType === 'PERCENTAGE' ? 'Foiz (%)' : 'Kunlik fiksa'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    {editingStaffId === s.id ? (
                                                        <input 
                                                            value={formatPrice(editSalaryAmount)} 
                                                            onChange={e => setEditSalaryAmount(parsePrice(e.target.value))} 
                                                            style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', width: 140 }}
                                                            placeholder="Summani kiriting"
                                                        />
                                                    ) : (
                                                        <span style={{ fontSize: 15, fontWeight: 600 }}>
                                                            {s.salaryType === 'PERCENTAGE' 
                                                                ? `${s.salaryAmount || 0} %` 
                                                                : `${(s.salaryAmount || 0).toLocaleString()} so'm`}
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    {editingStaffId === s.id ? (
                                                        <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
                                                            <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 13 }} onClick={saveSalary}>Saqlash</button>
                                                            <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 13, color: '#ef4444' }} onClick={() => setEditingStaffId(null)}>Bekor</button>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            className="btn btn-ghost" 
                                                            style={{ padding: '6px 14px', fontSize: 14, border: '1px solid var(--border)' }}
                                                            onClick={() => {
                                                                setEditingStaffId(s.id);
                                                                setEditSalaryType(s.salaryType || 'DAILY');
                                                                setEditSalaryAmount(s.salaryAmount || '');
                                                            }}
                                                        >
                                                            Tahrirlash
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* 1. KASSA */}
            {activeTab === 'kassa' && (
                <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
                    Kassa bo'limi bo'sh.
                </div>
            )}

            {/* 2. OYLIK VA MAOSH */}
            {activeTab === 'maosh' && (
                <div className="card">
                    <h3 style={{ marginTop: 0, marginBottom: 20 }}>Xodimlar Maoshi Tabeli</h3>
                    {loading ? <p>Yuklanmoqda...</p> : (
                        <>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <button 
                                    className={`btn ${xodimTab === 'DOCTOR' ? 'btn-primary' : 'btn-ghost'}`} 
                                    onClick={() => setXodimTab('DOCTOR')}
                                >
                                    Shifokorlar ({salaries.filter(s => s.role === 'DOCTOR').length})
                                </button>
                                <button 
                                    className={`btn ${xodimTab === 'MEDSESTRA' ? 'btn-primary' : 'btn-ghost'}`} 
                                    onClick={() => setXodimTab('MEDSESTRA')}
                                >
                                    Hamshiralar ({salaries.filter(s => s.role === 'MEDSESTRA').length})
                                </button>
                                <button 
                                    className={`btn ${xodimTab === 'RECEPTION' ? 'btn-primary' : 'btn-ghost'}`} 
                                    onClick={() => setXodimTab('RECEPTION')}
                                >
                                    Qabulxona ({salaries.filter(s => s.role === 'RECEPTION').length})
                                </button>
                                
                                <div style={{ flex: 1, position: 'relative', maxWidth: '300px', marginLeft: 'auto' }}>
                                    <input 
                                        type="text" 
                                        placeholder="F.I.SH orqali qidiruv..." 
                                        value={searchStaff}
                                        onChange={(e) => setSearchStaff(e.target.value)}
                                        style={{ width: '100%', padding: '10px 14px', paddingLeft: '36px', borderRadius: 8, border: '1px solid var(--border)', outline: 'none' }}
                                    />
                                    <span style={{ position: 'absolute', left: 12, top: 10, color: 'var(--muted)' }}>🔍</span>
                                </div>
                            </div>
                            
                            <div style={{ overflowX: 'auto' }}>
                                <table className="med-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: 60, textAlign: 'center' }}>T/r</th>
                                            <th>F.I.SH</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salaries
                                            .filter(s => s.role === xodimTab && (s.fullName || '').toLowerCase().includes(searchStaff.toLowerCase()))
                                            .map((s, idx) => {
                                                const isExpanded = expandedMaoshUser === s.userId;
                                                return (
                                                    <React.Fragment key={s.userId}>
                                                        <tr 
                                                            onClick={() => setExpandedMaoshUser(isExpanded ? null : s.userId)}
                                                            style={{ cursor: 'pointer', background: isExpanded ? '#f8fafc' : 'white' }}
                                                        >
                                                            <td style={{ textAlign: 'center', color: 'var(--muted)', fontWeight: 600 }}>{idx + 1}</td>
                                                            <td>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <strong>{s.fullName}</strong>
                                                                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                                                                        {isExpanded ? '▲ Yopish' : '▼ Batafsil'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        {isExpanded && (
                                                            <tr>
                                                                <td colSpan="2" style={{ padding: 0 }}>
                                                                    <div style={{ padding: '20px', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                                                                        <table className="med-table" style={{ background: 'white', borderRadius: 8, overflow: 'hidden' }}>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Lavozimi</th>
                                                                                    <th>Oylik miqdori</th>
                                                                                    <th>Bonuslar</th>
                                                                                    <th>Jarimalar</th>
                                                                                    <th>Jami</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>{s.role === 'DOCTOR' ? 'Shifokor' : s.role === 'MEDSESTRA' ? 'Hamshira' : 'Qabulxona'}</td>
                                                                                    <td style={{ fontWeight: 600 }}>
                                                                                        {s.salaryType === 'PERCENTAGE' ? `${s.salaryAmount || 0} %` : `${(s.calculatedSalary || 0).toLocaleString()} so'm`}
                                                                                    </td>
                                                                                    <td style={{ color: '#10b981', fontWeight: 600 }}>+{(s.totalBonus || 0).toLocaleString()} so'm</td>
                                                                                    <td style={{ color: '#ef4444', fontWeight: 600 }}>-{(s.totalPenalty || 0).toLocaleString()} so'm</td>
                                                                                    <td style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: 16 }}>
                                                                                        {((s.calculatedSalary || 0) + (s.totalBonus || 0) - (s.totalPenalty || 0)).toLocaleString()} so'm
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        {salaries.length === 0 && (
                                            <tr>
                                                <td colSpan="2" style={{ textAlign: 'center', padding: 20 }}>Ushbu davrda maosh oluvchi xodimlar yo'q.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* 3. KLINIKA ISH JADVALI */}
            {activeTab === 'jadval' && (
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    <div className="card" style={{ padding: 0, background: 'white', borderRadius: 16, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', padding: '20px 30px', color: 'white' }}>
                            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>🗓 Klinika Yagona Ish Jadvali</h2>
                            <p style={{ margin: '6px 0 0 0', opacity: 0.9, fontSize: 15 }}>Ushbu jadval klinika bo'yicha barcha xodimlar uchun umumiy amal qiladi.</p>
                        </div>

                        <div style={{ padding: 30 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, background: '#f8fafc', padding: '8px 16px', borderRadius: 12 }}>
                                <button style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }} onClick={() => changeMonth(-1)}>⬅️ Oldingi</button>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <input 
                                        type="date" 
                                        value={`${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(calendarDate.getDate()).padStart(2, '0')}`}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                setCalendarDate(new Date(e.target.value));
                                            }
                                        }}
                                        style={{
                                            border: '1px solid #cbd5e1',
                                            borderRadius: 8,
                                            padding: '6px 12px',
                                            fontWeight: 700, 
                                            fontSize: 16, 
                                            color: '#334155',
                                            cursor: 'pointer',
                                            fontFamily: 'inherit',
                                            outline: 'none',
                                            background: 'white',
                                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                                        }}
                                    />
                                </div>
                                <button style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }} onClick={() => changeMonth(1)}>Keyingi ➡️</button>
                            </div>

                            {isEditingSchedule && (
                                <div style={{ display: 'flex', gap: 12, marginBottom: 24, justifyContent: 'center' }}>
                                    <button 
                                        style={{ 
                                            padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                                            background: scheduleMode === 'WORK' ? 'linear-gradient(135deg, #10b981, #059669)' : '#f1f5f9', 
                                            color: scheduleMode === 'WORK' ? '#fff' : '#64748b',
                                            boxShadow: scheduleMode === 'WORK' ? '0 4px 6px -1px rgba(16, 185, 129, 0.3)' : 'none'
                                        }}
                                        onClick={() => setScheduleMode('WORK')}
                                    >
                                        🟢 Ish kuni qilib belgilash
                                    </button>
                                    <button 
                                        style={{ 
                                            padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                                            background: scheduleMode === 'REST' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : '#f1f5f9', 
                                            color: scheduleMode === 'REST' ? '#fff' : '#64748b',
                                            boxShadow: scheduleMode === 'REST' ? '0 4px 6px -1px rgba(239, 68, 68, 0.3)' : 'none'
                                        }}
                                        onClick={() => setScheduleMode('REST')}
                                    >
                                        🔴 Dam olish kuni qilib belgilash
                                    </button>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
                                {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map(d => (
                                    <div key={d} style={{ textAlign: 'center', fontWeight: 700, color: '#94a3b8', fontSize: 13, paddingBottom: 8 }}>{d}</div>
                                ))}
                                
                                {Array.from({ length: new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay() === 0 ? 6 : new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay() - 1 }).map((_, i) => (
                                    <div key={`empty-${i}`} />
                                ))}

                                {currentCalendarDays.map(dateStr => {
                                    const todayDate = new Date();
                                    const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
                                    const isToday = dateStr === todayStr;
                                    const dateObj = new Date(dateStr);
                                    const dayNum = dateObj.getDate();
                                    const dayStr = String(dayNum);
                                    const isWork = editWorkDates.includes(dayStr);
                                    const isRest = editRestDates.includes(dayStr);
                                    
                                    let bg = '#f8fafc';
                                    let color = '#475569';
                                    let border = '1px solid #e2e8f0';
                                    let cursor = isEditingSchedule ? 'pointer' : 'default';

                                    if (isWork) { 
                                        bg = 'linear-gradient(135deg, #dcfce7, #bbf7d0)'; 
                                        color = '#166534'; 
                                        border = '1px solid #86efac'; 
                                    } else if (isRest) { 
                                        bg = 'linear-gradient(135deg, #fee2e2, #fecaca)'; 
                                        color = '#991b1b'; 
                                        border = '1px solid #fca5a5'; 
                                    }

                                    if (isEditingSchedule && scheduleMode === 'WORK' && isRest) cursor = 'not-allowed';
                                    if (isEditingSchedule && scheduleMode === 'REST' && isWork) cursor = 'not-allowed';

                                    return (
                                        <div 
                                            key={dateStr}
                                            onClick={() => {
                                                if (isEditingSchedule) handleToggleDate(dateStr);
                                            }}
                                            style={{
                                                padding: '12px 5px',
                                                borderRadius: 10,
                                                fontSize: 16,
                                                textAlign: 'center',
                                                fontWeight: 600,
                                                cursor: cursor,
                                                background: bg,
                                                color: color,
                                                border: border,
                                                transition: 'all 0.2s',
                                                opacity: cursor === 'not-allowed' ? 0.4 : 1,
                                                transform: (isEditingSchedule && cursor !== 'not-allowed') ? 'scale(1)' : 'none',
                                                boxShadow: (isWork || isRest) ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                                position: 'relative'
                                            }}
                                            onMouseOver={e => {
                                                if (isEditingSchedule && cursor !== 'not-allowed') {
                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                                                }
                                            }}
                                            onMouseOut={e => {
                                                if (isEditingSchedule && cursor !== 'not-allowed') {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.boxShadow = (isWork || isRest) ? '0 2px 4px rgba(0,0,0,0.05)' : 'none';
                                                }
                                            }}
                                        >
                                            {dayNum}
                                            {isToday && <span style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', fontSize: 8, background: '#3b82f6', color: 'white', padding: '1px 4px', borderRadius: 4, fontWeight: 'bold' }}>BUGUN</span>}
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ marginTop: 30, display: 'flex', gap: 12, justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
                                {isEditingSchedule ? (
                                    <>
                                        <button style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: 600, cursor: 'pointer' }} onClick={() => {
                                            setIsEditingSchedule(false);
                                            loadClinicSchedule(); // Bekor qilinganda qayta yuklash
                                        }}>Bekor qilish</button>
                                        <button style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.4)' }} onClick={saveSchedule}>Saqlash</button>
                                    </>
                                ) : (
                                    <button style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.4)' }} onClick={() => setIsEditingSchedule(true)}>
                                        {(editWorkDates.length > 0 || editRestDates.length > 0) ? 'Jadvalni Tahrirlash' : 'Jadval Yaratish'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. BONUS VA JARIMA */}
            {activeTab === 'bonus' && (
                <div className="card">
                    <h3 style={{ marginTop: 0, marginBottom: 20 }}>Bonus va Jarima Belgilash</h3>
                    {loading ? <p>Yuklanmoqda...</p> : (
                        <>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <button className={`btn ${xodimTab === 'DOCTOR' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setXodimTab('DOCTOR')}>Shifokorlar ({salaries.filter(s => s.role === 'DOCTOR').length})</button>
                                <button className={`btn ${xodimTab === 'MEDSESTRA' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setXodimTab('MEDSESTRA')}>Hamshiralar ({salaries.filter(s => s.role === 'MEDSESTRA').length})</button>
                                <button className={`btn ${xodimTab === 'RECEPTION' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setXodimTab('RECEPTION')}>Qabulxona ({salaries.filter(s => s.role === 'RECEPTION').length})</button>
                                <div style={{ flex: 1, position: 'relative', maxWidth: '300px', marginLeft: 'auto' }}>
                                    <input type="text" placeholder="F.I.SH orqali qidiruv..." value={searchStaff} onChange={(e) => setSearchStaff(e.target.value)} style={{ width: '100%', padding: '10px 14px', paddingLeft: '36px', borderRadius: 8, border: '1px solid var(--border)', outline: 'none' }} />
                                    <span style={{ position: 'absolute', left: 12, top: 10, color: 'var(--muted)' }}>🔍</span>
                                </div>
                            </div>
                            
                            <div style={{ overflowX: 'auto' }}>
                                <table className="med-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: 60, textAlign: 'center' }}>T/r</th>
                                            <th>F.I.SH.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salaries
                                            .filter(s => s.role === xodimTab && (s.fullName || '').toLowerCase().includes(searchStaff.toLowerCase()))
                                            .map((s, idx) => (
                                                <tr 
                                                    key={s.userId} 
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => {
                                                        setSelectedUserForBonus(s);
                                                        setBonusForm({ amount: '', type: 'BONUS', description: '' });
                                                        setShowBonusModal(true);
                                                    }}
                                                >
                                                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--muted)', verticalAlign: 'middle' }}>
                                                        {idx + 1}
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <strong>{s.fullName}</strong>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        {salaries.length === 0 && (
                                            <tr>
                                                <td colSpan="2" style={{ textAlign: 'center', padding: 20 }}>Xodimlar topilmadi.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}
            {/* 4. HISOBOT */}
            {activeTab === 'hisobot' && (
                <div>
                    <h2 style={{ marginBottom: 20 }}>Moliyaviy Hisobotlar</h2>
                    
                    {/* STATISTIKA */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 15, marginBottom: 20 }}>
                        <div className="stat-card" style={{ padding: 15 }}>
                            <div className="stat-label" style={{ fontSize: 11 }}>Bugungi Jami Bemorlar</div>
                            <div className="stat-value" style={{ fontSize: 20 }}>{stats?.totalPatients ?? 0} ta</div>
                        </div>
                        
                        <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6', padding: 15 }}>
                            <div className="stat-label" style={{ fontSize: 11 }}>Shifokor Ko'rigi (Bemorlar)</div>
                            <div className="stat-value" style={{ fontSize: 20 }}>{stats?.checkupCount ?? 0} ta</div>
                        </div>
                        <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6', padding: 15 }}>
                            <div className="stat-label" style={{ fontSize: 11 }}>Shifokor Ko'rigi (Tushum)</div>
                            <div className="stat-value" style={{ color: '#3b82f6', fontSize: 20 }}>{(stats?.checkupIncome ?? 0).toLocaleString()} UZS</div>
                        </div>

                        <div className="stat-card" style={{ borderLeft: '4px solid #10b981', padding: 15 }}>
                            <div className="stat-label" style={{ fontSize: 11 }}>Muolaja (Bemorlar)</div>
                            <div className="stat-value" style={{ fontSize: 20 }}>{stats?.procedureCount ?? 0} ta</div>
                        </div>
                        <div className="stat-card" style={{ borderLeft: '4px solid #10b981', padding: 15 }}>
                            <div className="stat-label" style={{ fontSize: 11 }}>Muolaja (Tushum)</div>
                            <div className="stat-value" style={{ color: '#10b981', fontSize: 20 }}>{(stats?.procedureIncome ?? 0).toLocaleString()} UZS</div>
                        </div>
                    </div>
                    
                    {/* DIAGRAMMA */}
                    <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 30 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ margin: 0, color: 'var(--text)', fontSize: 18 }}>Tushumlar Diagrammasi</h3>
                            {setChartPeriod && (
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

                        <div style={{ width: '100%', height: 350, marginBottom: 30, display: 'block', justifyContent: 'center' }}>
                            {(() => {
                                if (!chartData || chartData.categories?.length === 0) return <div style={{textAlign: 'center', padding: 50, color: 'var(--muted)'}}>Ma'lumotlar hisoblanmoqda...</div>;

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

                        <div style={{ display: 'flex', gap: 15, justifyContent: 'flex-end', alignItems: 'center', marginTop: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface2)', padding: '6px 14px', borderRadius: 20 }}>
                                <span style={{ fontSize: 13, color: '#3b82f6', fontWeight: 700 }}>
                                    {chartPeriod === 'daily' ? 'Kunlik' : chartPeriod === 'weekly' ? 'Haftalik' : chartPeriod === 'monthly' ? 'Oylik' : 'Yillik'} Umumiy: {(stats?.dailyRevenue ?? 0).toLocaleString()} UZS
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#dcfce7', padding: '6px 14px', borderRadius: 20 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></div>
                                <span style={{ fontSize: 13, color: '#059669', fontWeight: 700 }}>Naqt: {(stats?.dailyRevenueCash ?? 0).toLocaleString()} UZS</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fef3c7', padding: '6px 14px', borderRadius: 20 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }}></div>
                                <span style={{ fontSize: 13, color: '#d97706', fontWeight: 700 }}>Karta: {(stats?.dailyRevenueCard ?? 0).toLocaleString()} UZS</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* 5. TRANZAKSIYALAR MODALI */}
            {showTransModal && selectedUserForTrans && (
                <div className="modal-overlay" onClick={closeTransModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
                        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                            <div>
                                <h3 style={{ margin: 0 }}>To'lov va Jarimalar</h3>
                                <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 13 }}>
                                    Xodim: <strong>{selectedUserForTrans.fullName}</strong>
                                </p>
                            </div>
                            <button onClick={closeTransModal} className="modal-close" style={{ fontSize: 24 }}>✕</button>
                        </div>
                        <div className="modal-body" style={{ padding: 24, maxHeight: '70vh', overflowY: 'auto' }}>
                            <form onSubmit={saveTransaction} style={{ background: '#f8fafc', padding: 20, borderRadius: 12, marginBottom: 24 }}>
                                <h4 style={{ margin: '0 0 16px', color: 'var(--text)' }}>Yangi Amaliyot</h4>
                                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Amaliyot turi</label>
                                        <select 
                                            value={transForm.type} 
                                            onChange={e => setTransForm({...transForm, type: e.target.value})}
                                            style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)' }}
                                        >
                                            <option value="PAYMENT">To'lov / Avans (Qoldiq kamayadi)</option>
                                            <option value="BONUS">Mukofot / Bonus (Qoldiq ko'payadi)</option>
                                            <option value="PENALTY">Jarima (Qoldiq kamayadi)</option>
                                        </select>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: 5, fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>Miqdor *</label>
                                        <input 
                                            required 
                                            value={formatPrice(transForm.amount)} 
                                            onChange={e => setTransForm({...transForm, amount: parsePrice(e.target.value)})} 
                                            className="form-input"
                                            style={{ width: '100%', padding: '10px 14px' }}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Izoh</label>
                                    <input 
                                        type="text" 
                                        value={transForm.description}
                                        onChange={e => setTransForm({...transForm, description: e.target.value})}
                                        style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)' }}
                                        placeholder="Nima maqsadda berilmoqda..."
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                                    Saqlash
                                </button>
                            </form>

                            <h4 style={{ margin: '0 0 16px', color: 'var(--text)' }}>Amaliyotlar Tarixi</h4>
                            {loadingTrans ? (
                                <p>Yuklanmoqda...</p>
                            ) : userTransactions.length === 0 ? (
                                <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 20 }}>Tarix bo'sh</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {userTransactions.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(t => (
                                        <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'white', border: '1px solid var(--border)', borderRadius: 8 }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                    <span style={{ 
                                                        padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                                                        background: t.type === 'PAYMENT' ? '#dbeafe' : t.type === 'BONUS' ? '#dcfce7' : '#fee2e2',
                                                        color: t.type === 'PAYMENT' ? '#1d4ed8' : t.type === 'BONUS' ? '#15803d' : '#b91c1c'
                                                    }}>
                                                        {t.type === 'PAYMENT' ? 'To\'lov' : t.type === 'BONUS' ? 'Bonus' : 'Jarima'}
                                                    </span>
                                                    <span style={{ color: 'var(--muted)', fontSize: 12 }}>
                                                        {new Date(t.createdAt).toLocaleString('ru-RU')}
                                                    </span>
                                                </div>
                                                <p style={{ margin: 0, fontSize: 14, color: 'var(--text)' }}>{t.description || 'Izohsiz'}</p>
                                            </div>
                                            <div style={{ fontWeight: 600, fontSize: 16, color: t.type === 'BONUS' ? '#10b981' : t.type === 'PAYMENT' ? '#3b82f6' : '#ef4444' }}>
                                                {t.type === 'BONUS' ? '+' : '-'}{t.amount.toLocaleString()} so'm
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 6. BONUS VA JARIMA MODALI */}
            {showBonusModal && selectedUserForBonus && (
                <div className="modal-overlay" onClick={() => setShowBonusModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
                        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                            <div>
                                <h3 style={{ margin: 0 }}>Bonus / Jarima</h3>
                                <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 13 }}>
                                    Xodim: <strong>{selectedUserForBonus.fullName}</strong>
                                </p>
                            </div>
                            <button onClick={() => setShowBonusModal(false)} className="modal-close" style={{ fontSize: 24 }}>✕</button>
                        </div>
                        <div className="modal-body" style={{ padding: 24 }}>
                            <form onSubmit={saveBonus}>
                                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Amaliyot turi</label>
                                        <select 
                                            value={bonusForm.type} 
                                            onChange={e => setBonusForm({...bonusForm, type: e.target.value})}
                                            style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)' }}
                                        >
                                            <option value="BONUS">Mukofot / Bonus (+)</option>
                                            <option value="PENALTY">Jarima (-)</option>
                                        </select>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Summa (so'm)</label>
                                        <input 
                                            required 
                                            value={formatPrice(bonusForm.amount)} 
                                            onChange={e => setBonusForm({...bonusForm, amount: parsePrice(e.target.value)})} 
                                            className="form-input"
                                            style={{ width: '100%', padding: '10px 14px' }}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div style={{ marginBottom: 24 }}>
                                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Izoh</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={bonusForm.description}
                                        onChange={e => setBonusForm({...bonusForm, description: e.target.value})}
                                        style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)' }}
                                        placeholder="Qaysi natija uchun / Nima sababdan"
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                                    Yaratish
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
