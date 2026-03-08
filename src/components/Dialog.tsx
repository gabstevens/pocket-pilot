import React from 'react';
import { useTransactions } from '../hooks/useTransactions';

const Dialog: React.FC = () => {
  const { activeDialog, dispatch, t } = useTransactions();

  if (!activeDialog) return null;

  return (
    <div className="dialog-overlay">
      <div className="card dialog-content">
        <h2 className="mb-sm">{activeDialog.title}</h2>
        <p className="mb-lg text-muted">{activeDialog.message}</p>
        
        <div className="flex gap-md">
          <button 
            className="flex-1 bg-white justify-center" 
            onClick={() => dispatch({ type: 'CLOSE_DIALOG' })}
          >
            {activeDialog.cancelText || t('common.cancel')}
          </button>
          <button 
            className="flex-1 btn-primary justify-center"
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

export default Dialog;
