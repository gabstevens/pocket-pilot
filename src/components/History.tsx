import React, { useState, useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import type { Transaction } from '../types';
import { X, Trash2, Edit2, Calendar, FileText } from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { useSearchParams } from 'react-router-dom';
import DateRangePicker from './DateRangePicker';
import TransactionForm from './TransactionForm';

const History: React.FC = () => {
  const { transactions, categories, dispatch, t, addToast, confirm, language } = useTransactions();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(searchParams.get('start') || firstDay);
  const [endDate, setEndDate] = useState(searchParams.get('end') || lastDay);
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const updateFilters = (start: string, end: string, category: string) => {
    setStartDate(start);
    setEndDate(end);
    setCategoryFilter(category);
    const params: Record<string, string> = { start, end };
    if (category !== 'all') params.category = category;
    setSearchParams(params);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const dateOnly = t.date.split('T')[0];
      const matchesDate = dateOnly >= startDate && dateOnly <= endDate;
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
      return matchesDate && matchesCategory;
    });
  }, [transactions, startDate, endDate, categoryFilter]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filteredTransactions.forEach(t => {
      const date = t.date.split('T')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(t);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredTransactions]);

  const handleDelete = async (transaction: Transaction) => {
    const confirmedResult = await confirm({
      title: t('history.editTitle'),
      message: `${t('history.deleteConfirm')} (${transaction.type === 'expense' ? '-' : '+'}${transaction.amount} ${transaction.currency})`
    });

    if (confirmedResult) {
      dispatch({ type: 'DELETE_TRANSACTION', payload: transaction.id });
      addToast(`${t('common.deleted')}`, 'info');
      setSelectedTransaction(null);
    }
  };

  const handleUpdate = (data: Partial<Transaction>) => {
    if (selectedTransaction) {
      const updated = { ...selectedTransaction, ...data };
      dispatch({ type: 'UPDATE_TRANSACTION', payload: updated as Transaction });
      addToast(`${t('common.updated')}`, 'success');
      setSelectedTransaction(updated as Transaction);
      setIsEditing(false);
    }
  };

  const getCategoryIcon = (catName: string) => {
    return categories.find(c => c.name === catName)?.icon;
  };

  const formatDateTime = (isoString: string) => {
    const [date, time] = isoString.split('T');
    return `${date} ${time || ''}`;
  };

  const formatHeaderDate = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return 'TODAY';
    
    return new Intl.DateTimeFormat(language, { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'short' 
    }).format(new Date(dateStr)).toUpperCase();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
      {/* Sticky Header & Filters - Outside the scrollable container */}
      <div style={{ padding: 'var(--spacing-sm)', background: '#fafafa', borderBottom: '1px solid var(--border-color)', zIndex: 10 }}>
        <h1>{t('history.title')}</h1>

        <div className="flex flex-col gap-none">
          <DateRangePicker 
            startDate={startDate} 
            endDate={endDate} 
            onChange={(s, e) => updateFilters(s, e, categoryFilter)} 
          />
          
          <div className="form-group" style={{ marginTop: '-8px', marginBottom: 0 }}>
            <label htmlFor="history-category-filter">{t('history.category')}</label>
            <select 
              id="history-category-filter"
              value={categoryFilter} 
              onChange={(e) => updateFilters(startDate, endDate, e.target.value)}
              className="input-minimal"
              style={{ fontWeight: 600 }}
            >
              <option value="all">{t('history.allCategories')}</option>
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area - Using standard container class */}
      <main className="container" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="flex flex-col gap-none">
          {groupedTransactions.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', marginTop: 'var(--spacing-md)' }}>
              {t('history.noTransactions')}
            </div>
          ) : (
            groupedTransactions.map(([date, items], index) => (
              <div key={date} style={{ marginTop: index === 0 ? 'var(--spacing-md)' : '24px' }}>
                <h3 style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px', fontWeight: 800, letterSpacing: '0.05em' }}>
                  {formatHeaderDate(date)}
                </h3>
                <div className="flex flex-col gap-sm">
                  {items.map(t => (
                    <div 
                      key={t.id} 
                      className="card flex flex-col gap-xs" 
                      style={{ padding: '12px 16px', margin: 0, border: 'none', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedTransaction(t);
                        setIsEditing(false);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-md">
                          <CategoryIcon name={getCategoryIcon(t.category)} size={18} style={{ opacity: 0.8 }} />
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>{t.category}</span>
                        </div>
                        <span className={t.type === 'income' ? 'text-success' : 'text-error'} style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                          {t.type === 'income' ? '+' : '-'}{t.amount.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex justify-end" style={{ marginTop: '-4px' }}>
                        <span style={{ fontSize: '0.65rem', opacity: 0.5, fontWeight: 800 }}>{t.currency}</span>
                      </div>

                      {t.note && (
                        <div style={{ marginTop: '4px', borderTop: '1px solid #f0f0f0', paddingTop: '4px' }}>
                          <span className="text-muted" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                            {t.note}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Unified Detail/Edit Modal */}
      {selectedTransaction && (
        <div style={modalStyles.overlay}>
          <div className="container" style={modalStyles.content}>
            <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, opacity: 0.5 }}>{isEditing ? 'EDITING' : 'DETAILS'}</span>
              <button 
                onClick={() => {
                  setSelectedTransaction(null);
                  setIsEditing(false);
                }} 
                style={{ border: 'none', background: 'none', padding: '8px' }}
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>
            
            <div style={{ flex: 1 }}>
              {!isEditing ? (
                <div className="flex flex-col gap-xl">
                  {/* Visual Header */}
                  <div className="flex flex-col items-center gap-sm">
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--border-color)' }}>
                      <CategoryIcon name={getCategoryIcon(selectedTransaction.category)} size={32} />
                    </div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }} className={selectedTransaction.type === 'income' ? 'text-success' : 'text-error'}>
                      {selectedTransaction.type === 'income' ? '+' : '-'}{selectedTransaction.amount.toFixed(2)}
                      <span style={{ fontSize: '1rem', marginLeft: '4px', opacity: 0.5 }}>{selectedTransaction.currency}</span>
                    </h2>
                    <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{selectedTransaction.category}</span>
                  </div>

                  {/* Detail List */}
                  <div className="flex flex-col gap-md">
                    <div className="flex items-center gap-md">
                      <Calendar size={18} className="text-muted" />
                      <div className="flex flex-col">
                        <label style={{ margin: 0 }}>Date & Time</label>
                        <span style={{ fontWeight: 600 }}>{formatDateTime(selectedTransaction.date)}</span>
                      </div>
                    </div>
                    
                    {selectedTransaction.note && (
                      <div className="flex items-start gap-md">
                        <FileText size={18} className="text-muted" style={{ marginTop: '4px' }} />
                        <div className="flex flex-col">
                          <label style={{ margin: 0 }}>Note</label>
                          <span style={{ fontWeight: 500, lineHeight: 1.4 }}>{selectedTransaction.note}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <TransactionForm 
                  initialData={selectedTransaction} 
                  onSubmit={handleUpdate}
                  submitLabel={t('history.update')}
                />
              )}
            </div>

            {/* Actions fixed to bottom of container */}
            <div className="flex gap-md" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
              {!isEditing ? (
                <>
                  <button className="flex-1 btn-primary" onClick={() => setIsEditing(true)} style={{ padding: '16px' }}>
                    <Edit2 size={18} /> {t('history.editTitle')}
                  </button>
                  <button 
                    className="flex-1" 
                    onClick={() => handleDelete(selectedTransaction)}
                    style={{ padding: '16px', border: '1px solid var(--error-color)', color: 'var(--error-color)', background: 'white' }}
                  >
                    <Trash2 size={18} /> DELETE
                  </button>
                </>
              ) : (
                <button 
                  className="flex-1" 
                  onClick={() => setIsEditing(false)}
                  style={{ padding: '16px', background: 'white', border: '1px solid #999' }}
                >
                  {t('common.cancel')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const modalStyles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 200,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  content: {
    width: '100%',
    height: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
  }
};

export default History;
