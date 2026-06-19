import React, { useState, useEffect, useCallback } from 'react';
import { MonitoringAPI } from '../api';

// URL: /monitoring?display=true => TV mode
// URL: /monitoring            => admin boshqaruv mode (har doim)
const Monitoring = () => {
    const [queue, setQueue] = useState([]);
    const [time, setTime] = useState(new Date());
    const [currentDate, setCurrentDate] = useState(new Date());

    // URL query param orqali TV rejimini aniqlaymiz
    const isDisplay = new URLSearchParams(window.location.search).get('display') === 'true';

    const loadQueue = useCallback(async () => {
        try {
            const res = await MonitoringAPI.getQueue();
            setQueue(res || []);
        } catch {
            setQueue([]);
        }
    }, []);

    useEffect(() => {
        loadQueue();
        const t = setInterval(loadQueue, 5000);
        return () => clearInterval(t);
    }, [loadQueue]);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setTime(now);
            setCurrentDate(now);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // ── TV DISPLAY REJIMI ─────────────────────────────────────────────────────
    if (isDisplay) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                fontFamily: 'system-ui, sans-serif'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '28px 48px',
                    background: 'rgba(255,255,255,0.04)',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div>
                        <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
                            💉 Muolaja Navbati
                        </div>
                        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                            {currentDate.toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                    <div style={{
                        fontSize: 64,
                        fontWeight: 900,
                        color: '#38bdf8',
                        fontFamily: 'JetBrains Mono, monospace',
                        letterSpacing: 4,
                        textShadow: '0 0 30px rgba(56,189,248,0.5)'
                    }}>
                        {time.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                </div>

                {/* Queue List */}
                <div style={{ flex: 1, padding: '40px 48px' }}>
                    {queue.length === 0 ? (
                        <div style={{ textAlign: 'center', paddingTop: 120, color: 'rgba(255,255,255,0.3)' }}>
                            <div style={{ fontSize: 80, marginBottom: 20 }}>✅</div>
                            <div style={{ fontSize: 32, fontWeight: 700 }}>Navbat bo'sh</div>
                            <div style={{ fontSize: 18, marginTop: 10 }}>Hozirda muolaja kutayotgan bemorlar yo'q</div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', gap: 24 }}>
                            {queue.map((v, index) => (
                                <div key={v.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 28,
                                    background: index === 0
                                        ? 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(99,102,241,0.2))'
                                        : 'rgba(255,255,255,0.05)',
                                    padding: '28px 36px',
                                    borderRadius: 20,
                                    border: index === 0
                                        ? '2px solid rgba(56,189,248,0.5)'
                                        : '1px solid rgba(255,255,255,0.08)',
                                    backdropFilter: 'blur(10px)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    animation: index === 0 ? 'none' : 'none'
                                }}>
                                    {/* Queue number */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        background: index === 0
                                            ? 'linear-gradient(135deg, #38bdf8, #6366f1)'
                                            : 'rgba(255,255,255,0.1)',
                                        color: '#fff',
                                        fontSize: 36,
                                        fontWeight: 900,
                                        boxShadow: index === 0 ? '0 8px 24px rgba(56,189,248,0.4)' : 'none'
                                    }}>
                                        {index + 1}
                                    </div>

                                    {/* Patient name */}
                                    <div style={{ flex: 1 }}>
                                        <h2 style={{
                                            margin: 0,
                                            color: '#fff',
                                            fontSize: index === 0 ? 32 : 26,
                                            fontWeight: 800,
                                            letterSpacing: '-0.3px'
                                        }}>
                                            {v.patientName}
                                        </h2>
                                        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
                                            {v.serviceTitle || v.serviceName}
                                        </div>
                                    </div>

                                    {/* "Navbatda" badge */}
                                    {index === 0 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: 16,
                                            right: 20,
                                            padding: '5px 14px',
                                            background: 'linear-gradient(90deg, #38bdf8, #6366f1)',
                                            borderRadius: 20,
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: '#fff',
                                            letterSpacing: 0.5
                                        }}>
                                            ▶ Navbatda
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 48px',
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.2)',
                    fontSize: 13,
                    borderTop: '1px solid rgba(255,255,255,0.05)'
                }}>
                    Sahifa har 5 soniyada yangilanadi • MediCare
                </div>
            </div>
        );
    }

    // ── ODDIY (ADMIN/HAMSHIRA) REJIMI ─────────────────────────────────────────
    return (
        <div style={{ padding: 24, minHeight: '100vh', background: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, background: 'var(--surface)', padding: '20px 32px', borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h1 style={{ margin: 0, fontSize: 28, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    🖥️ Muolaja Navbati
                    <a
                        href={`${window.location.pathname}?display=true`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            fontSize: 14,
                            padding: '5px 12px',
                            background: 'rgba(37,99,235,0.1)',
                            color: '#2563eb',
                            borderRadius: 8,
                            textDecoration: 'none',
                            fontWeight: 600
                        }}
                    >
                        📺 TV rejimi
                    </a>
                </h1>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', fontFamily: 'monospace', background: 'var(--surface2)', padding: '10px 24px', borderRadius: 12 }}>
                    {time.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
            </div>

            {queue.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, background: 'var(--surface)', borderRadius: 16, color: 'var(--muted)', fontSize: 20 }}>
                    Hozirda muolaja uchun kutayotgan bemorlar yo'q
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 20 }}>
                    {queue.map((v, index) => (
                        <div key={v.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 20,
                            background: 'var(--surface)',
                            padding: '24px 32px',
                            borderRadius: 16,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                            border: '1px solid var(--border)'
                        }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                minWidth: 60, height: 60, borderRadius: '50%',
                                background: 'var(--primary)', color: 'var(--surface)', fontSize: 28, fontWeight: 800
                            }}>
                                {index + 1}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h2 style={{ margin: 0, color: 'var(--text)', fontSize: 24, fontWeight: 700 }}>
                                    {v.patientName}
                                </h2>
                                <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>
                                    {v.serviceTitle || v.serviceName}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Monitoring;