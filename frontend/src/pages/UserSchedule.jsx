import React, { useState, useEffect } from 'react';
import { ProfileAPI } from '../api';

export default function UserSchedule() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [calendarDate, setCalendarDate] = useState(new Date());

    useEffect(() => {
        ProfileAPI.getMe()
            .then(res => {
                setUser(res);
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
            });
    }, []);

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

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Yuklanmoqda...</div>;
    if (!user) return <div style={{ padding: 40, textAlign: 'center' }}>Foydalanuvchi ma'lumotlari topilmadi</div>;

    const workDatesArr = user.workDates ? user.workDates.split(',') : [];
    const restDatesArr = user.restDates ? user.restDates.split(',') : [];

    return (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '16px' }}>
            <div className="card" style={{ 
                padding: 0, 
                background: 'white',
                borderRadius: 16,
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }}>
                <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', padding: '16px 24px', color: 'white' }}>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>🗓 Mening Ish Jadvalim</h2>
                    <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: 14 }}>Sizning oylik ish va dam olish kunlaringiz jadvali</p>
                </div>
                
                <div style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, background: '#f8fafc', padding: '10px 16px', borderRadius: 12 }}>
                        <button style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontWeight: 600, fontSize: 13, color: '#475569', transition: 'all 0.2s' }} onClick={() => changeMonth(-1)} onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.background = 'white'}>⬅️ Oldingi</button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                                    padding: '6px 10px',
                                    fontWeight: 700, 
                                    fontSize: 14, 
                                    color: '#334155',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    outline: 'none',
                                    background: 'white',
                                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                                }}
                            />
                        </div>
                        <button style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontWeight: 600, fontSize: 13, color: '#475569', transition: 'all 0.2s' }} onClick={() => changeMonth(1)} onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.background = 'white'}>Keyingi ➡️</button>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 16, marginBottom: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: '6px 12px', borderRadius: 20 }}>
                            <span style={{ width: 12, height: 12, background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '50%', boxShadow: '0 2px 4px rgba(16,185,129,0.4)' }}></span>
                            <span style={{ fontWeight: 600, color: '#475569', fontSize: 13 }}>Ish kuni</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: '6px 12px', borderRadius: 20 }}>
                            <span style={{ width: 12, height: 12, background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderRadius: '50%', boxShadow: '0 2px 4px rgba(239,68,68,0.4)' }}></span>
                            <span style={{ fontWeight: 600, color: '#475569', fontSize: 13 }}>Dam olish kuni</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: '6px 12px', borderRadius: 20 }}>
                            <span style={{ width: 12, height: 12, background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '50%' }}></span>
                            <span style={{ fontWeight: 600, color: '#475569', fontSize: 13 }}>Belgilanmagan</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
                        {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map(d => (
                            <div key={d} style={{ textAlign: 'center', fontWeight: 700, color: '#94a3b8', fontSize: 12, paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>{d}</div>
                        ))}
                        
                        {Array.from({ length: new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay() === 0 ? 6 : new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay() - 1 }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}

                        {currentCalendarDays.map(dateStr => {
                            const dateObj = new Date(dateStr);
                            const dayNum = dateObj.getDate();
                            const dayStr = String(dayNum);
                            const isWork = workDatesArr.includes(dayStr);
                            const isRest = restDatesArr.includes(dayStr);
                            const todayDate = new Date();
                            const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
                            const isToday = dateStr === todayStr;
                            
                            let bg = '#f8fafc';
                            let color = '#475569';
                            let border = '1px solid #e2e8f0';

                            if (isWork) { 
                                bg = 'linear-gradient(135deg, #dcfce7, #bbf7d0)'; 
                                color = '#166534'; 
                                border = '1px solid #86efac';
                            } else if (isRest) { 
                                bg = 'linear-gradient(135deg, #fee2e2, #fecaca)'; 
                                color = '#991b1b'; 
                                border = '1px solid #fca5a5';
                            }

                            return (
                                <div 
                                    key={dateStr}
                                    title={dateStr}
                                    style={{
                                        padding: '10px 4px',
                                        borderRadius: 10,
                                        fontSize: 15,
                                        textAlign: 'center',
                                        fontWeight: isToday ? 700 : 600,
                                        background: bg,
                                        color: color,
                                        border: border,
                                        boxShadow: isToday ? '0 0 0 2px rgba(59, 130, 246, 0.4)' : (isWork || isRest) ? '0 2px 4px rgba(0,0,0,0.03)' : 'none',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minHeight: 60,
                                        position: 'relative',
                                        transition: 'transform 0.2s',
                                        cursor: 'default'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    {dayNum}
                                    {isToday && <span style={{ position: 'absolute', bottom: 4, fontSize: 8, background: '#3b82f6', color: 'white', padding: '1px 6px', borderRadius: 8, fontWeight: 'bold', letterSpacing: 0.5 }}>BUGUN</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
