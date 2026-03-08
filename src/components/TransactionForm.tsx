import React, { useState, useMemo, useEffect, useRef, useId } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import type { Transaction, TransactionType } from '../types';
import CategoryIcon from './CategoryIcon';
import AddCategoryModal from './AddCategoryModal';
import { Plus, Minus } from 'lucide-react';
import { COMMON_CURRENCIES, CATEGORY_COLORS } from '../constants';

const getCurrentLocalISO = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
};

interface TransactionFormProps {
  initialData?: Partial<Transaction>;
  onSubmit?: (data: Partial<Transaction>) => void;
  onCancel?: () => void;
  readOnly?: boolean;
  submitLabel?: string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel,
  readOnly = false,
  submitLabel 
}) => {
  const { transactions, categories, lastCurrency, draftTransaction, dispatch, t } = useTransactions();
  const amountRef = useRef<HTMLInputElement>(null);
  const idPrefix = useId();
  
  const isNewTransaction = !initialData;

  const [amount, setAmount] = useState(() => (initialData?.amount || draftTransaction?.amount)?.toString() || '');
  const [currency, setCurrency] = useState(() => initialData?.currency || draftTransaction?.currency || lastCurrency);
  const [type, setType] = useState<TransactionType>(() => initialData?.type || draftTransaction?.type || 'expense');
  const [category, setCategory] = useState(() => initialData?.category || draftTransaction?.category || 'Food');
  const [date, setDate] = useState(() => initialData?.date || draftTransaction?.date || getCurrentLocalISO());
  const [note, setNote] = useState(() => initialData?.note || draftTransaction?.note || '');
  
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isNewTransaction) {
      dispatch({ 
        type: 'SET_DRAFT_TRANSACTION', 
        payload: { 
          amount: amount === '' ? undefined : parseFloat(amount),
          currency,
          type,
          category,
          date,
          note
        } 
      });
    }
  }, [amount, currency, type, category, date, note, isNewTransaction, dispatch]);

  const handleAmountChange = (val: string) => {
    let cleaned = val.replace(',', '.');
    cleaned = cleaned.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    setAmount(cleaned);
  };

  const isCondensed = windowHeight < 700;
  const categoryRows = windowHeight < 600 ? 1 : windowHeight < 800 ? 2 : 3;
  const categoriesToShow = categoryRows * 4;

  const topCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    transactions.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    
    return [...categories]
      .sort((a, b) => (counts[b.name] || 0) - (counts[a.name] || 0))
      .slice(0, categoriesToShow);
  }, [transactions, categories, categoriesToShow]);

  const isValid = amount !== '' && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;

  const resetForm = () => {
    setAmount('');
    setNote('');
    setDate(getCurrentLocalISO());
    setTimeout(() => amountRef.current?.focus(), 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly || !onSubmit || !isValid) return;

    onSubmit({
      amount: parseFloat(amount),
      currency,
      type,
      category,
      date,
      note
    });

    if (isNewTransaction) {
      resetForm();
    }
  };

  const getCategoryColor = (name: string) => {
    return categories.find(c => c.name === name)?.color;
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-none btn-full">
        <div className="form-group">
          <label htmlFor={`${idPrefix}-amount`}>{t('add.amount')}</label>
          <div className="flex items-center border-bottom-strong">
            <button 
              type="button"
              disabled={readOnly}
              onClick={() => setType(type === 'expense' ? 'income' : 'expense')}
              title={type === 'expense' ? t('add.expense') : t('add.income')}
              className={`btn-type-toggle justify-center mr-sm mb-xs ${isCondensed ? 'btn-type-toggle-condensed' : ''} ${type === 'expense' ? 'bg-expense' : 'bg-income'}`}
            >
              {type === 'expense' ? <Minus size={isCondensed ? 18 : 22} strokeWidth={3} /> : <Plus size={isCondensed ? 18 : 22} strokeWidth={3} />}
            </button>
            <input 
              id={`${idPrefix}-amount`}
              ref={amountRef}
              type="text" 
              inputMode="decimal"
              placeholder="0.00" 
              value={amount} 
              onChange={(e) => handleAmountChange(e.target.value)}
              required
              readOnly={readOnly}
              autoFocus={!readOnly}
              className={`input-amount ${isCondensed ? 'input-amount-condensed' : ''}`}
            />
            <select 
              id={`${idPrefix}-currency`}
              aria-label="Currency"
              value={currency} 
              disabled={readOnly}
              onChange={(e) => setCurrency(e.target.value)}
              className="input-currency-select"
            >
              {COMMON_CURRENCIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={`form-group ${isCondensed ? 'mt-xs' : 'mt-md'}`}>
          <label htmlFor={`${idPrefix}-category`}>{t('add.category')} ({category})</label>
          <div className="flex flex-col gap-sm">
            {!readOnly && (
              <div className="category-grid">
                {topCategories.map(cat => {
                  const isActive = category === cat.name;
                  const catColor = cat.color ? CATEGORY_COLORS[cat.color] : 'var(--text-color)';
                  
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setCategory(cat.name)}
                      aria-label={cat.name}
                      className={`category-btn ${isCondensed ? 'category-btn-condensed' : ''}`}
                      style={{
                        backgroundColor: isActive ? catColor : 'white',
                        borderColor: isActive ? catColor : 'var(--border-color)',
                        color: isActive ? 'white' : 'inherit'
                      }}
                    >
                      <CategoryIcon 
                        name={cat.icon} 
                        size={isCondensed ? 18 : 20} 
                        categoryColor={isActive ? undefined : cat.color}
                        color={isActive ? 'white' : undefined}
                      />
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex gap-sm items-stretch">
              <select 
                id={`${idPrefix}-category`}
                value={category} 
                disabled={readOnly}
                onChange={(e) => setCategory(e.target.value)} 
                className={`flex-1 p-${isCondensed ? 'sm' : 'md'}`}
              >
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {!readOnly && (
                <button 
                  type="button" 
                  onClick={() => setShowAddCategory(true)}
                  className={`p-0 justify-center ${isCondensed ? 'w-12' : 'w-14'}`}
                  aria-label="Add new category"
                >
                  +
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor={`${idPrefix}-date`}>{t('add.date')}</label>
          <input 
            id={`${idPrefix}-date`}
            type="datetime-local" 
            value={date} 
            readOnly={readOnly}
            onChange={(e) => setDate(e.target.value)}
            className={`p-${isCondensed ? 'sm' : 'md'}`}
          />
        </div>

        <div className="form-group">
          <label htmlFor={`${idPrefix}-note`}>{t('add.note')}</label>
          <textarea 
            id={`${idPrefix}-note`}
            rows={readOnly ? 3 : (isCondensed ? 1 : 2)} 
            value={note} 
            readOnly={readOnly}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('add.notePlaceholder')}
            className={`p-${isCondensed ? 'sm' : 'md'}`}
          />
        </div>

        {!readOnly && (
          <div className="flex gap-md mt-sm">
            {onCancel && (
              <button 
                type="button" 
                className={`flex-1 bg-white justify-center ${isCondensed ? 'p-sm' : 'p-md'}`}
                onClick={onCancel}
              >
                {t('common.cancel')}
              </button>
            )}
            <button 
              type="submit" 
              className={`btn-primary flex-1 justify-center ${isCondensed ? 'p-sm' : 'p-md'}`}
              disabled={!isValid}
              style={{ 
                opacity: isValid ? 1 : 0.5,
                cursor: isValid ? 'pointer' : 'default'
              }}
            >
              {submitLabel || t('add.submit')}
            </button>
          </div>
        )}
      </form>

      {showAddCategory && (
        <AddCategoryModal 
          onClose={() => setShowAddCategory(false)} 
          onSuccess={(name) => setCategory(name)} 
        />
      )}
    </>
  );
};

export default TransactionForm;
