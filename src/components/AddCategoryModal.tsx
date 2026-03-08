import React, { useState, useId } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import CategoryIcon from './CategoryIcon';

const AVAILABLE_ICONS = [
  'Coffee', 'Bus', 'Wallet', 'Building', 'Gamepad2', 'Stethoscope', 
  'Tag', 'Lightbulb', 'CircleEllipsis', 'Utensils', 'Car', 'Banknote', 
  'Home', 'Film', 'HeartPulse', 'ShoppingBag', 'Zap', 'Gift', 
  'Globe', 'Smartphone', 'Book', 'Music', 'Plane', 'Dumbbell', 'Briefcase', 'CreditCard'
];

interface AddCategoryModalProps {
  onClose: () => void;
  onSuccess: (categoryName: string) => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ onClose, onSuccess }) => {
  const { dispatch, t } = useTransactions();
  const id = useId();
  const [newCategory, setNewCategory] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('MoreHorizontal');

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      dispatch({ 
        type: 'ADD_CATEGORY', 
        payload: { name: newCategory.trim(), icon: selectedIcon } 
      });
      onSuccess(newCategory.trim());
      onClose();
    }
  };

  return (
    <div style={styles.overlay}>
      <div className="card" style={styles.content}>
        <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
          <h2>{t('add.addCategory')}</h2>
          <button type="button" onClick={onClose} style={{ border: 'none', background: 'none', padding: '8px' }} aria-label="Close">X</button>
        </div>

        <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
          <label htmlFor={`${id}-name`}>{t('add.categoryName')}</label>
          <input 
            id={`${id}-name`}
            type="text" 
            placeholder={t('add.categoryName')} 
            value={newCategory} 
            onChange={(e) => setNewCategory(e.target.value)}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label>Icon</label>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))', 
            gap: '8px',
            maxHeight: '200px',
            overflowY: 'auto',
            padding: '4px',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)'
          }}>
            {AVAILABLE_ICONS.map((iconName) => (
              <button 
                key={iconName}
                type="button"
                onClick={() => setSelectedIcon(iconName)}
                aria-label={`Select ${iconName} icon`}
                style={{ 
                  padding: '10px 4px', 
                  background: selectedIcon === iconName ? 'var(--text-color)' : 'transparent',
                  color: selectedIcon === iconName ? 'white' : 'black',
                  border: '1px solid transparent',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <CategoryIcon name={iconName} size={20} />
              </button>
            ))}
          </div>
        </div>

        <button 
          type="button" 
          className="btn-primary" 
          onClick={handleAddCategory} 
          style={{ width: '100%', padding: '14px', marginTop: 'var(--spacing-md)' }}
        >
          {t('add.addCategory')}
        </button>
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
    zIndex: 2500,
    padding: '20px'
  },
  content: {
    width: '100%',
    maxWidth: '400px',
    background: 'white',
    padding: '24px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    border: 'none',
    maxHeight: '90vh',
    overflowY: 'auto'
  }
};

export default AddCategoryModal;
