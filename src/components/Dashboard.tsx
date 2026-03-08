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
    <div className="flex flex-col h-full w-full overflow-hidden">
      <header className="p-sm border-bottom bg-white flex-shrink-0">
        <h1>{t('dashboard.title')}</h1>
        <DateRangePicker 
          startDate={startDate} 
          endDate={endDate} 
          onChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }} 
        />
      </header>

      <main className="container flex-1 overflow-y-auto">
        <div className="flex flex-col gap-md">
          <div className="card-dark flex flex-col items-center p-xl">
            <span className="text-sm opacity-80 font-bold tracking-wide uppercase">{t('dashboard.balance')} ({baseCurrency})</span>
            <h2 className="text-2xl font-black m-0 mt-xs">
              {summary.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>

          <div className="flex gap-md">
            <div className="card flex-1 flex flex-col items-center p-md">
              <span className="text-xs text-muted font-black uppercase">{t('dashboard.income')}</span>
              <span className="text-success text-lg font-bold">+{summary.income.toFixed(2)}</span>
            </div>
            <div className="card flex-1 flex flex-col items-center p-md">
              <span className="text-xs text-muted font-black uppercase">{t('dashboard.expense')}</span>
              <span className="text-error text-lg font-bold">-{summary.expense.toFixed(2)}</span>
            </div>
          </div>

          {hasMissingRates && (
            <div className="card-warning flex items-start gap-sm p-md">
              <Info size={18} className="mt-xs flex-shrink-0" />
              <span className="text-sm font-semibold">
                Rates missing for some currencies. Using 1:1.
              </span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
