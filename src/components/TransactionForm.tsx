import React, { useState, useMemo, useEffect, useRef, useId } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import type { Transaction, TransactionType } from '../types';
import CategoryIcon from './CategoryIcon';
import AddCategoryModal from './AddCategoryModal';
import { Plus, Minus } from 'lucide-react';
import { COMMON_CURRENCIES } from '../constants';

const getCurrentLocalISO = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
};

interface TransactionFormProps {
  initialData?: Partial<Transaction>;
  onSubmit?: (data: Partial<Transaction>) => void;
  readOnly?: boolean;
  submitLabel?: string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  initialData, 
  onSubmit, 
  readOnly = false,
  submitLabel 
}) => {
  const { transactions, categories, lastCurrency, draftTransaction, dispatch, t } = useTransactions();
  const amountRef = useRef<HTMLInputElement>(null);
  const idPrefix = useId();
  
  const isNewTransaction = !initialData;
  const sourceData = isNewTransaction ? draftTransaction : initialData;

  const [amount, setAmount] = useState(sourceData?.amount?.toString() || '');
  const [currency, setCurrency] = useState(sourceData?.currency || lastCurrency);
  const [type, setType] = useState<TransactionType>(sourceData?.type || 'expense');
  const [category, setCategory] = useState(sourceData?.category || 'Food');
  const [date, setDate] = useState(sourceData?.date || getCurrentLocalISO());
  const [note, setNote] = useState(sourceData?.note || '');
  
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAmountChange = (val: string) => {
    let cleaned = val.replace(',', '.');
    cleaned = cleaned.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    setAmount(cleaned);
    
    if (isNewTransaction) {
      dispatch({ type: 'SET_DRAFT_TRANSACTION', payload: { amount: cleaned === '' ? undefined : parseFloat(cleaned) } });
    }
  };

  const handleTypeToggle = () => {
    const newType = type === 'expense' ? 'income' : 'expense';
    setType(newType);
    if (isNewTransaction) {
      dispatch({ type: 'SET_DRAFT_TRANSACTION', payload: { type: newType } });
    }
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    if (isNewTransaction) {
      dispatch({ type: 'SET_DRAFT_TRANSACTION', payload: { category: newCat } });
    }
  };

  const handleCurrencyChange = (newCurr: string) => {
    setCurrency(newCurr);
    if (isNewTransaction) {
      dispatch({ type: 'SET_DRAFT_TRANSACTION', payload: { currency: newCurr } });
    }
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    if (isNewTransaction) {
      dispatch({ type: 'SET_DRAFT_TRANSACTION', payload: { date: newDate } });
    }
  };

  const handleNoteChange = (newNote: string) => {
    setNote(newNote);
    if (isNewTransaction) {
      dispatch({ type: 'SET_DRAFT_TRANSACTION', payload: { note: newNote } });
    }
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
    dispatch({ type: 'SET_DRAFT_TRANSACTION', payload: { amount: undefined, note: '', date: getCurrentLocalISO() } });
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

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-none" style={{ width: '100%' }}>
        <div className="form-group">
          <label htmlFor={`${idPrefix}-amount`}>{t('add.amount')}</label>
          <div className="flex items-center" style={{ borderBottom: '2px solid #333' }}>
            <button 
              type="button"
              disabled={readOnly}
              onClick={handleTypeToggle}
              title={type === 'expense' ? t('add.expense') : t('add.income')}
              style={{
                width: isCondensed ? '36px' : '44px',
                height: isCondensed ? '36px' : '44px',
                padding: 0,
                border: 'none',
                background: type === 'expense' ? 'var(--error-color)' : 'var(--success-color)',
                color: 'white',
                borderRadius: '4px',
                flexShrink: 0,
                marginRight: '8px',
                marginBottom: '2px'
              }}
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
              style={{ 
                fontSize: isCondensed ? '1.5rem' : '2rem', 
                fontWeight: 700, 
                border: 'none', 
                borderRadius: 0, 
                padding: '4px 0',
                color: 'var(--text-color)',
                background: 'transparent',
                flex: 1,
                minWidth: 0
              }}
            />
            <select 
              id={`${idPrefix}-currency`}
              aria-label="Currency"
              value={currency} 
              disabled={readOnly}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              style={{ 
                width: 'auto', 
                border: 'none', 
                fontSize: isCondensed ? '0.9rem' : '1rem', 
                fontWeight: 700, 
                padding: '4px 8px', 
                background: 'var(--accent-color)', 
                borderRadius: 'var(--radius-sm)',
                marginLeft: '8px',
                flexShrink: 0
              }}
            >
              {COMMON_CURRENCIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: isCondensed ? '4px' : 'var(--spacing-md)' }}>
          <label htmlFor={`${idPrefix}-category`}>{t('add.category')} ({category})</label>
          <div className="flex flex-col gap-sm">
            {!readOnly && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {topCategories.map(cat => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => handleCategoryChange(cat.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: isCondensed ? '10px 4px' : '14px 4px',
                      background: category === cat.name ? 'var(--text-color)' : 'white',
                      color: category === cat.name ? 'white' : 'var(--text-color)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <CategoryIcon name={cat.icon} size={isCondensed ? 18 : 20} />
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-sm">
              <select 
                id={`${idPrefix}-category`}
                value={category} 
                disabled={readOnly}
                onChange={(e) => handleCategoryChange(e.target.value)} 
                style={{ flex: 1, padding: isCondensed ? '8px' : '10px' }}
              >
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              {!readOnly && (
                <button 
                  type="button" 
                  onClick={() => setShowAddCategory(true)}
                  style={{ width: isCondensed ? '40px' : '44px', padding: 0 }}
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
            onChange={(e) => handleDateChange(e.target.value)}
            style={{ padding: isCondensed ? '8px' : '10px' }}
          />
        </div>

        <div className="form-group">
          <label htmlFor={`${idPrefix}-note`}>{t('add.note')}</label>
          <textarea 
            id={`${idPrefix}-note`}
            rows={readOnly ? 3 : (isCondensed ? 1 : 2)} 
            value={note} 
            readOnly={readOnly}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder={t('add.notePlaceholder')}
            style={{ padding: isCondensed ? '8px' : '10px' }}
          />
        </div>

        {!readOnly && (
          <button 
            type="submit" 
            disabled={!isValid}
            className="btn-primary"
            style={{ 
              padding: isCondensed ? '12px' : '16px', 
              borderRadius: 'var(--radius-md)', 
              fontSize: '1rem', 
              marginTop: isCondensed ? '0' : 'var(--spacing-sm)',
              opacity: isValid ? 1 : 0.5,
              cursor: isValid ? 'pointer' : 'default'
            }}
          >
            {submitLabel || t('add.submit')}
          </button>
        )}
      </form>

      {showAddCategory && (
        <AddCategoryModal 
          onClose={() => setShowAddCategory(false)} 
          onSuccess={(name) => handleCategoryChange(name)} 
        />
      )}
    </>
  );
};

export default TransactionForm;
