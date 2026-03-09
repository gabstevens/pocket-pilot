import React, { useState, useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { Search, X, Calendar, FileText, Trash2, Edit2 } from 'lucide-react';
import DateRangePicker from './DateRangePicker';
import CategoryIcon from './CategoryIcon';
import TransactionForm from './TransactionForm';
import { CATEGORY_COLORS } from '../constants';

const History: React.FC = () => {
  const { transactions, categories, dispatch, t, confirm, addToast } = useTransactions();
  
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const dateOnly = t.date.split('T')[0];
        const matchesDate = dateOnly >= startDate && dateOnly <= endDate;
        const matchesSearch = (t.note || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                             t.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
        return matchesDate && matchesSearch && matchesCategory;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, startDate, endDate, searchTerm, selectedCategory]);

  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: typeof transactions } = {};
    filteredTransactions.forEach(t => {
      const date = t.date.split('T')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(t);
    });
    return groups;
  }, [filteredTransactions]);

  const selectedTransaction = useMemo(() => 
    transactions.find(t => t.id === selectedTransactionId),
    [transactions, selectedTransactionId]
  );

  const handleDelete = async () => {
    if (!selectedTransactionId) return;
    
    const result = await confirm({
      title: t('common.confirm'),
      message: t('history.deleteConfirm')
    });

    if (result) {
      dispatch({ type: 'DELETE_TRANSACTION', payload: selectedTransactionId });
      setSelectedTransactionId(null);
      addToast(t('common.deleted'), 'success');
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getCategoryIcon = (categoryName: string) => {
    const cat = categories.find(c => c.name === categoryName);
    return cat ? cat.icon : 'Tag';
  };

  const getCategoryColor = (categoryName: string) => {
    const cat = categories.find(c => c.name === categoryName);
    return cat ? cat.color : undefined;
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <header className="p-sm bg-header flex-shrink-0">
        <h1>{t('history.title')}</h1>
        
        <div className="flex flex-col gap-sm">
          <DateRangePicker 
            startDate={startDate} 
            endDate={endDate} 
            onChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
            }} 
          />

          <div className="flex gap-sm">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-sm top-1/2 -translate-y-1/2 text-muted" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="btn-full p-sm pl-xl text-sm"
              />
            </div>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-sm text-sm font-semibold"
            >
              <option value="all">{t('history.allCategories')}</option>
              {categories.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="container flex-1 overflow-y-auto">
        {Object.keys(groupedTransactions).length === 0 ? (
          <div className="card text-center p-xl text-muted">
            {t('history.noTransactions')}
          </div>
        ) : (
          Object.entries(groupedTransactions).map(([date, ts], index) => (
            <div key={date} className={index === 0 ? '' : 'mt-lg'}>
              <h3 className="text-xs opacity-50 mb-sm border-bottom pb-xs font-black tracking-wide uppercase">
                {new Date(date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </h3>
              <div className="flex flex-col gap-sm">
                {ts.map(t => (
                  <button 
                    key={t.id} 
                    onClick={() => setSelectedTransactionId(t.id)}
                    className="card p-sm m-0 border-none flex flex-col items-start shadow-sm w-full text-left"
                    style={{ textAlign: 'left' }}
                  >
                    <div className="flex items-center gap-sm w-full">
                      <div 
                        className="flex-shrink-0 w-9 h-9 flex items-center justify-center border-1"
                        style={{ 
                          backgroundColor: getCategoryColor(t.category) ? `${CATEGORY_COLORS[getCategoryColor(t.category)!]}15` : 'transparent',
                          borderColor: getCategoryColor(t.category) ? CATEGORY_COLORS[getCategoryColor(t.category)!] : 'var(--border-color)'
                        }}
                      >
                        <CategoryIcon 
                          name={getCategoryIcon(t.category)} 
                          size={18} 
                          className="opacity-80" 
                          categoryColor={getCategoryColor(t.category)}
                        />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <span className="font-bold text-sm uppercase truncate block">
                          {t.category}
                        </span>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0 ml-sm">
                        <span className={`${t.type === 'income' ? 'text-success' : 'text-error'} font-black text-md`}>
                          {t.type === 'income' ? '+' : '-'}{t.amount.toFixed(2)}
                        </span>
                        <span className="text-xs opacity-50 font-black leading-none uppercase">
                          {t.currency}
                        </span>
                      </div>
                    </div>
                    
                    {t.note && (
                      <div className="w-full text-left mt-xs pt-xs border-top">
                        <p className="text-muted text-xs m-0 truncate w-full lh-md">
                          {t.note}
                        </p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </main>

      {/* Transaction Details/Edit Drawer/Modal */}
      {selectedTransactionId && selectedTransaction && (
        <div className="modal-overlay fixed inset-0 bg-opacity-50 z-200 flex items-end">
          <div className="bg-white w-full max-h-[95dvh] overflow-y-auto p-md flex flex-col slide-up shadow-lg pb-xl">
            <div className="flex justify-between items-center mb-lg">
              <span className="text-xs font-black opacity-50">{isEditing ? 'EDITING' : 'DETAILS'}</span>
              <button 
                onClick={() => {
                  setSelectedTransactionId(null);
                  setIsEditing(false);
                }}
                className="btn-ghost p-sm"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            {!isEditing ? (
              <div className="flex flex-col gap-lg">
                <div className="flex flex-col items-center gap-md">
                  <div 
                    className="w-16 h-16 flex items-center justify-center border-2"
                    style={{ 
                      backgroundColor: getCategoryColor(selectedTransaction.category) ? `${CATEGORY_COLORS[getCategoryColor(selectedTransaction.category)!]}15` : 'var(--accent-color)',
                      borderColor: getCategoryColor(selectedTransaction.category) ? CATEGORY_COLORS[getCategoryColor(selectedTransaction.category)!] : 'var(--border-color)'
                    }}
                  >
                    <CategoryIcon 
                      name={getCategoryIcon(selectedTransaction.category)} 
                      size={32} 
                      categoryColor={getCategoryColor(selectedTransaction.category)}
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <h2 className={`${selectedTransaction.type === 'income' ? 'text-success' : 'text-error'} text-2xl font-black m-0`}>
                      {selectedTransaction.type === 'income' ? '+' : '-'}{selectedTransaction.amount.toFixed(2)}
                      <span className="text-md ml-xs opacity-50">{selectedTransaction.currency}</span>
                    </h2>
                    <span className="font-bold uppercase tracking-wide">{selectedTransaction.category}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-md">
                  <div className="flex items-start gap-md">
                    <Calendar size={18} className="text-muted mt-xs" />
                    <div className="flex flex-col">
                      <label className="m-0">Date & Time</label>
                      <span className="font-semibold">{formatDateTime(selectedTransaction.date)}</span>
                    </div>
                  </div>
                  {selectedTransaction.note && (
                    <div className="flex items-start gap-md">
                      <FileText size={18} className="text-muted mt-xs" />
                      <div className="flex flex-col">
                        <label className="m-0">Note</label>
                        <span className="font-medium lh-md">{selectedTransaction.note}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-md mt-lg pt-md border-top">
                  <button className="flex-1 btn-primary p-md" onClick={() => setIsEditing(true)}>
                    <Edit2 size={18} /> {t('history.editTitle')}
                  </button>
                  <button 
                    className="p-md bg-white border-error text-error"
                    onClick={handleDelete}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <TransactionForm 
                initialData={selectedTransaction} 
                onSubmit={(data) => {
                  dispatch({ 
                    type: 'UPDATE_TRANSACTION', 
                    payload: { ...selectedTransaction, ...data } 
                  });
                  setIsEditing(false);
                  addToast(t('common.updated'), 'success');
                }}
                submitLabel={t('history.update')}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
