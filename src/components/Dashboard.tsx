import React, { useState, useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { parseCSV } from '../utils/csv';
import { Upload, Info } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import DateRangePicker from './DateRangePicker';
import type { Transaction } from '../types';

const Dashboard: React.FC = () => {
  const { transactions, exchangeRates, baseCurrency, dispatch, t, addToast, confirm } = useTransactions();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(searchParams.get('start') || firstDay);
  const [endDate, setEndDate] = useState(searchParams.get('end') || lastDay);

  const updateRange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setSearchParams({ start, end });
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const dateOnly = t.date.split('T')[0];
      return dateOnly >= startDate && dateOnly <= endDate;
    });
  }, [transactions, startDate, endDate]);

  const summary = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, t) => {
        let amountInBase = t.amount;
        if (t.currency !== baseCurrency) {
          const rate = exchangeRates[t.currency] || 1;
          amountInBase = t.amount * rate;
        }

        if (t.type === 'income') acc.income += amountInBase;
        else acc.expense += amountInBase;
        acc.balance = acc.income - acc.expense;
        return acc;
      },
      { income: 0, expense: 0, balance: 0 }
    );
  }, [filteredTransactions, baseCurrency, exchangeRates]);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const parsed = await parseCSV(file);
        const importedTransactions = parsed.map(t => ({
          ...t,
          id: t.id || crypto.randomUUID(),
          createdAt: Date.now(),
          currency: t.currency || baseCurrency
        })) as Transaction[];
        
        const confirmedResult = await confirm({
          title: t('dashboard.import'),
          message: t('dashboard.importConfirm', { count: importedTransactions.length })
        });

        if (confirmedResult) {
          const newTransactions = [...transactions];
          importedTransactions.forEach(imported => {
            const index = newTransactions.findIndex(t => t.id === imported.id);
            if (index > -1) newTransactions[index] = imported;
            else newTransactions.push(imported);
          });
          dispatch({ type: 'SET_TRANSACTIONS', payload: newTransactions });
          addToast(t('common.imported'), 'success');
        }
      } catch {
        addToast(t('common.error'), 'error');
      }
    }
  };

  const hasMissingRates = useMemo(() => {
    const usedCurrencies = new Set(filteredTransactions.map(t => t.currency));
    usedCurrencies.delete(baseCurrency);
    return Array.from(usedCurrencies).some(c => !exchangeRates[c]);
  }, [filteredTransactions, baseCurrency, exchangeRates]);

  const buttonStyle: React.CSSProperties = {
    background: 'white',
    border: '1px solid #999',
    padding: '12px 8px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.85rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    width: '100%'
  };

  return (
    <div className="container">
      <h1>{t('dashboard.title')}</h1>

      <DateRangePicker startDate={startDate} endDate={endDate} onChange={updateRange} />

      <div className="flex flex-col gap-md">
        <div className="card flex flex-col items-center" style={{ border: 'none', background: 'var(--text-color)', color: 'white', padding: '32px' }}>
          <span style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 700, letterSpacing: '0.05em' }}>{t('dashboard.balance')} ({baseCurrency})</span>
          <h2 style={{ fontSize: '2.5rem', margin: '4px 0', fontWeight: 800 }}>
            {summary.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </div>

        <div className="flex gap-md">
          <div className="card flex-1 flex flex-col items-center">
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>{t('dashboard.income')}</span>
            <span className="text-success" style={{ fontSize: '1.2rem' }}>+{summary.income.toFixed(2)}</span>
          </div>
          <div className="card flex-1 flex flex-col items-center">
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>{t('dashboard.expense')}</span>
            <span className="text-error" style={{ fontSize: '1.2rem' }}>-{summary.expense.toFixed(2)}</span>
          </div>
        </div>

        {hasMissingRates && (
          <div className="card flex items-start gap-sm" style={{ background: '#fff4e5', border: '1px solid #ffa117', color: '#663c00' }}>
            <Info size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Rates missing for some currencies. Using 1:1.
            </span>
          </div>
        )}
      </div>

      <div style={{ marginTop: 'var(--spacing-xl)' }}>
        <h3>{t('dashboard.management')}</h3>
        <label style={buttonStyle}>
          <Upload size={18} /> {t('dashboard.import')}
          <input type="file" accept=".csv" onChange={handleImport} style={{ display: 'none' }} />
        </label>
      </div>
    </div>
  );
};

export default Dashboard;
