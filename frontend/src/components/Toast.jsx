import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

let toastId = 0;
let globalDispatch = null;

export function showToast(message, type = 'success') {
  if (globalDispatch) globalDispatch({ id: ++toastId, message, type });
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  useEffect(() => {
    globalDispatch = (toast) => {
      setToasts(prev => [...prev, toast]);
      timers.current[toast.id] = setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
        delete timers.current[toast.id];
      }, 4000);
    };
    return () => {
      globalDispatch = null;
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, []);

  const dismiss = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  };

  if (!toasts.length) return null;

  const icons = {
    success: <CheckCircle2 size={16} />,
    error: <AlertCircle size={16} />,
    info: <Info size={16} />
  };

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast-item toast-${toast.type}`}>
          <span className="toast-icon">{icons[toast.type] || icons.info}</span>
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button className="toast-close" onClick={() => dismiss(toast.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
