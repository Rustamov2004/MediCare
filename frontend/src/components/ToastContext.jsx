import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const show = useCallback((msg, type = 'success') => {
        const id = Date.now();
        setToasts(t => [...t, { id, msg, type }]);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
    }, []);

    return (
        <ToastContext.Provider value={show}>
            {children}
            <div className="toast-container">
                {toasts.map(t => (
                    <div key={t.id} className={`toast toast-${t.type}`}>{t.msg}</div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
