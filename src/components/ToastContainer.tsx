import React from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContainer: React.FC = () => {
  const { toasts, dispatch } = useTransactions();

  if (toasts.length === 0) return null;

  return (
    <div style={styles.container}>
      {toasts.map(toast => (
        <div key={toast.id} style={{ ...styles.toast, ...styles[toast.type] }}>
          {toast.type === 'success' && <CheckCircle size={18} />}
          {toast.type === 'error' && <AlertCircle size={18} />}
          {toast.type === 'info' && <Info size={18} />}
          
          <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>{toast.message}</span>
          
          <button 
            onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}
            style={styles.closeBtn}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    top: '20px',
    left: '20px',
    right: '20px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    pointerEvents: 'none'
  },
  toast: {
    pointerEvents: 'auto',
    padding: '12px 16px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    color: 'white',
    animation: 'slideIn 0.3s ease-out'
  },
  success: {
    background: '#2e7d32',
  },
  error: {
    background: '#d32f2f',
  },
  info: {
    background: '#1a1a1a',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.7)',
    padding: '4px',
    cursor: 'pointer'
  }
};

export default ToastContainer;
