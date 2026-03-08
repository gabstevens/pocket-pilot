import React from 'react';
import { useTransactions } from '../hooks/useTransactions';

const Dialog: React.FC = () => {
  const { activeDialog, dispatch, t } = useTransactions();

  if (!activeDialog) return null;

  return (
    <div style={styles.overlay}>
      <div className="card" style={styles.content}>
        <h2 style={{ marginBottom: '12px' }}>{activeDialog.title}</h2>
        <p style={{ marginBottom: '24px', color: 'var(--text-muted)' }}>{activeDialog.message}</p>
        
        <div className="flex gap-md">
          <button 
            className="flex-1" 
            style={{ background: 'white' }}
            onClick={() => dispatch({ type: 'CLOSE_DIALOG' })}
          >
            {activeDialog.cancelText || t('common.cancel')}
          </button>
          <button 
            className="flex-1 btn-primary"
            onClick={() => {
              activeDialog.onConfirm();
            }}
          >
            {activeDialog.confirmText || t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px'
  },
  content: {
    width: '100%',
    maxWidth: '400px',
    background: 'white',
    padding: '24px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    border: 'none'
  }
};

export default Dialog;
