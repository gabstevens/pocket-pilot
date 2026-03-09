import React, { useState, useId } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import CategoryIcon from './CategoryIcon';
import { X } from 'lucide-react';
import { CATEGORY_COLORS } from '../constants';
import type { Category } from '../types';

const AVAILABLE_ICONS = [
  'Coffee', 'Bus', 'Wallet', 'Building', 'Gamepad2', 'Stethoscope', 
  'Tag', 'Lightbulb', 'CircleEllipsis', 'Utensils', 'Car', 'Banknote', 
  'Home', 'Film', 'HeartPulse', 'ShoppingBag', 'Zap', 'Gift', 
  'Globe', 'Smartphone', 'Book', 'Music', 'Plane', 'Dumbbell', 'Briefcase', 'CreditCard'
];

interface AddCategoryModalProps {
  initialData?: Category;
  onClose: () => void;
  onSuccess: (categoryName: string) => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ initialData, onClose, onSuccess }) => {
  const { dispatch, t } = useTransactions();
  const id = useId();
  const [newCategory, setNewCategory] = useState(initialData?.name || '');
  const [selectedIcon, setSelectedIcon] = useState(initialData?.icon || 'Tag');
  const [selectedColor, setSelectedColor] = useState(initialData?.color || 'blue');

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      if (initialData) {
        dispatch({
          type: 'UPDATE_CATEGORY',
          payload: {
            oldName: initialData.name,
            category: { name: newCategory.trim(), icon: selectedIcon, color: selectedColor }
          }
        });
      } else {
        dispatch({ 
          type: 'ADD_CATEGORY', 
          payload: { name: newCategory.trim(), icon: selectedIcon, color: selectedColor } 
        });
      }
      onSuccess(newCategory.trim());
      onClose();
    }
  };

  return (
    <div className="dialog-overlay z-50">
      <div className="card dialog-content max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-md">
          <h2>{initialData ? t('history.editTitle') : t('add.addCategory')}</h2>
          <button type="button" onClick={onClose} className="btn-ghost p-sm" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="form-group mb-md">
          <label htmlFor={`${id}-name`}>{t('add.categoryName')}</label>
          <input 
            id={`${id}-name`}
            type="text" 
            placeholder={t('add.categoryName')} 
            value={newCategory} 
            onChange={(e) => setNewCategory(e.target.value)}
            autoFocus
            className="btn-full"
          />
        </div>

        <div className="form-group mb-md">
          <label>{t('add.color')}</label>
          <div className="grid grid-cols-5 gap-sm pt-xs">
            {Object.keys(CATEGORY_COLORS).map((colorName) => (
              <button
                key={colorName}
                type="button"
                onClick={() => setSelectedColor(colorName)}
                aria-label={`Select ${colorName} color`}
                className={`w-full aspect-square border-2 ${selectedColor === colorName ? 'border-black shadow-md' : 'border-transparent'}`}
                style={{ backgroundColor: CATEGORY_COLORS[colorName] }}
              />
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Icon</label>
          <div className="icon-grid border-color">
            {AVAILABLE_ICONS.map((iconName) => (
              <button 
                key={iconName}
                type="button"
                onClick={() => setSelectedIcon(iconName)}
                aria-label={`Select ${iconName} icon`}
                className={`category-btn ${selectedIcon === iconName ? 'category-btn-active' : 'bg-white border-none'}`}
              >
                <CategoryIcon name={iconName} size={20} categoryColor={selectedIcon === iconName ? undefined : selectedColor} />
              </button>
            ))}
          </div>
        </div>

        <button 
          type="button" 
          className="btn-primary btn-full p-md mt-md justify-center" 
          onClick={handleAddCategory} 
        >
          {t('add.addCategory')}
        </button>
      </div>
    </div>
  );
};

export default AddCategoryModal;
