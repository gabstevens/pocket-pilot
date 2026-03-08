import React from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContainer: React.FC = () => {
  const { toasts, dispatch } = useTransactions();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.type === 'success' && <CheckCircle size={18} />}
          {toast.type === 'error' && <AlertCircle size={18} />}
          {toast.type === 'info' && <Info size={18} />}
          
          <span className="flex-1 text-sm font-medium">{toast.message}</span>
          
          <button 
            onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}
            className="toast-close"
            aria-label="Close toast"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
