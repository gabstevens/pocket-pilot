import React, { useState, useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { Info } from 'lucide-react';
import DateRangePicker from './DateRangePicker';

const Dashboard: React.FC = () => {
  const { transactions, exchangeRates, baseCurrency, t } = useTransactions();
  
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

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

  const hasMissingRates = useMemo(() => {
    const usedCurrencies = new Set(filteredTransactions.map(t => t.currency));
    usedCurrencies.delete(baseCurrency);
    return Array.from(usedCurrencies).some(c => !exchangeRates[c]);
  }, [filteredTransactions, baseCurrency, exchangeRates]);

  return (
    <div className="container">
      <h1>{t('dashboard.title')}</h1>

      <DateRangePicker 
        startDate={startDate} 
        endDate={endDate} 
        onChange={(start, end) => {
          setStartDate(start);
          setEndDate(end);
        }} 
      />

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
    </div>
  );
};

export default Dashboard;
