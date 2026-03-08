import React, { useState, useId, useRef } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { Globe, ShieldCheck, Landmark, ArrowRightLeft, Database, Download, Upload, AlertTriangle } from 'lucide-react';
import { COMMON_CURRENCIES } from '../constants';
import DateRangePicker from './DateRangePicker';
import { exportTransactionsToCSV, downloadCSV, parseCSV } from '../utils/csv';
import type { Transaction } from '../types';

const Settings: React.FC = () => {
  const { language, baseCurrency, exchangeRates, transactions, dispatch, t, addToast, confirm } = useTransactions();
  const idPrefix = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  const [selectedCurrency, setSelectedCurrency] = useState(
    COMMON_CURRENCIES.find(c => c !== baseCurrency) || 'EUR'
  );

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_LANGUAGE', payload: e.target.value });
  };

  const handleBaseCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_BASE_CURRENCY', payload: e.target.value });
  };

  const currentRate = exchangeRates[selectedCurrency]?.toString() || '1';

  const handleRateChange = (val: string) => {
    const cleaned = val.replace(',', '.').replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;

    const rate = parseFloat(cleaned);
    if (!isNaN(rate)) {
      dispatch({ 
        type: 'SET_EXCHANGE_RATE', 
        payload: { currency: selectedCurrency, rate } 
      });
    } else if (cleaned === '') {
      dispatch({ 
        type: 'SET_EXCHANGE_RATE', 
        payload: { currency: selectedCurrency, rate: 0 } 
      });
    }
  };

  const handleExport = () => {
    const filtered = transactions.filter(t => {
      const dateOnly = t.date.split('T')[0];
      return dateOnly >= startDate && dateOnly <= endDate;
    });

    if (filtered.length === 0) {
      addToast(t('history.noTransactions'), 'info');
      return;
    }

    const csv = exportTransactionsToCSV(filtered);
    downloadCSV(csv, `pocket-pilot-export-${startDate}-to-${endDate}.csv`);
    addToast(t('common.exported'), 'success');
  };

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
          title: t('settings.import'),
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
      } finally {
        e.target.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <header className="p-sm border-bottom bg-white flex-shrink-0">
        <h1>{t('settings.title')}</h1>
      </header>

      <main className="container flex-1 overflow-y-auto">
        <div className="flex flex-col gap-md">
          {/* Privacy Note */}
          <div className="card-accent flex items-center gap-md p-md">
            <ShieldCheck size={24} className="text-success" />
            <span className="text-sm font-semibold">
              {t('settings.dataPrivacy')}
            </span>
          </div>

          {/* Language */}
          <div className="form-group">
            <label htmlFor={`${idPrefix}-lang`} className="flex items-center gap-sm">
              <Globe size={16} /> {t('settings.language')}
            </label>
            <select id={`${idPrefix}-lang`} value={language} onChange={handleLanguageChange}>
              <option value="en-US">English (US)</option>
              <option value="it-IT">Italiano (Italia)</option>
            </select>
          </div>

          {/* Base Currency */}
          <div className="form-group">
            <label htmlFor={`${idPrefix}-base`} className="flex items-center gap-sm">
              <Landmark size={16} /> {t('settings.baseCurrency')}
            </label>
            <select id={`${idPrefix}-base`} value={baseCurrency} onChange={handleBaseCurrencyChange}>
              {COMMON_CURRENCIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Unified Exchange Rate Editor */}
          <div className="form-group">
            <label htmlFor={`${idPrefix}-rate`} className="flex items-center gap-sm">
              <ArrowRightLeft size={16} /> {t('settings.exchangeRates')}
            </label>
            <div className="card p-md">
              <p className="text-muted text-xs mb-md font-semibold">
                {t('settings.rateHelp', { base: baseCurrency })}
              </p>
              
              <div className="flex items-center border-bottom-strong">
                <div className="p-sm font-black text-lg opacity-50">1</div>
                <select 
                  id={`${idPrefix}-rate-currency`}
                  aria-label="Currency to convert"
                  value={selectedCurrency} 
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="input-rate-currency"
                >
                  {COMMON_CURRENCIES.filter(c => c !== baseCurrency).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="p-sm font-black text-lg opacity-50">=</div>
                <input 
                  id={`${idPrefix}-rate`}
                  type="text" 
                  inputMode="decimal"
                  placeholder="1.00" 
                  value={currentRate === '0' ? '' : currentRate}
                  onChange={(e) => handleRateChange(e.target.value)}
                  className="input-rate-value flex-1 text-right"
                />
                <div className="p-sm font-black text-md opacity-50 flex-shrink-0">
                  {baseCurrency}
                </div>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="form-group">
            <label className="flex items-center gap-sm">
              <Database size={16} /> {t('settings.dataManagement')}
            </label>
            <div className="card flex flex-col gap-md p-md">
              <div className="flex flex-col gap-sm">
                <h4 className="text-sm font-black uppercase">{t('dashboard.export')}</h4>
                <p className="text-muted text-xs font-semibold">
                  {t('settings.exportHelp')}
                </p>
                
                <DateRangePicker 
                  startDate={startDate} 
                  endDate={endDate} 
                  onChange={(start, end) => {
                    setStartDate(start);
                    setEndDate(end);
                  }} 
                />

                <button 
                  onClick={handleExport} 
                  className="btn-primary btn-full justify-center"
                >
                  <Download size={18} /> {t('settings.export')}
                </button>
              </div>

              <div className="divider" />

              <div className="flex flex-col gap-sm">
                <h4 className="text-sm font-black uppercase">{t('settings.import')}</h4>
                <p className="text-muted text-xs font-semibold">
                  {t('settings.importHelp')}
                </p>
                
                <div className="card-warning flex items-start gap-sm p-sm">
                  <AlertTriangle size={16} className="mt-xs flex-shrink-0" />
                  <span className="text-xs font-semibold">
                    {t('settings.importWarning')}
                  </span>
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept=".csv" 
                  onChange={handleImport} 
                  className="hidden" 
                />
                <button 
                  className="btn-primary btn-full justify-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={18} /> {t('settings.import')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
