import React, { useState, useId } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { Globe, ShieldCheck, Landmark, ArrowRightLeft, Database, Download } from 'lucide-react';
import { COMMON_CURRENCIES } from '../constants';
import DateRangePicker from './DateRangePicker';
import { exportTransactionsToCSV, downloadCSV } from '../utils/csv';

const Settings: React.FC = () => {
  const { language, baseCurrency, exchangeRates, transactions, dispatch, t, addToast } = useTransactions();
  const idPrefix = useId();

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
    // Standardize input
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
      // Allow clearing the input temporarily
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

  return (
    <div className="container">
      <h1>{t('settings.title')}</h1>

      <div className="flex flex-col gap-xl">
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
          <div className="card" style={{ padding: '16px' }}>
            <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '12px', fontWeight: 600 }}>
              {t('settings.rateHelp', { base: baseCurrency })}
            </p>
            
            <div className="flex items-center" style={{ borderBottom: '2px solid #333' }}>
              <div style={{ padding: '8px', fontWeight: 800, fontSize: '1.2rem', opacity: 0.5 }}>1</div>
              <select 
                id={`${idPrefix}-rate-currency`}
                aria-label="Currency to convert"
                value={selectedCurrency} 
                onChange={(e) => setSelectedCurrency(e.target.value)}
                style={{ 
                  width: 'auto', 
                  border: 'none', 
                  fontSize: '1rem', 
                  fontWeight: 800, 
                  padding: '8px', 
                  background: 'var(--accent-color)', 
                  borderRadius: 'var(--radius-sm)',
                  flexShrink: 0
                }}
              >
                {COMMON_CURRENCIES.filter(c => c !== baseCurrency).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div style={{ padding: '8px', fontWeight: 800, fontSize: '1.2rem', opacity: 0.5 }}>=</div>
              <input 
                id={`${idPrefix}-rate`}
                type="text" 
                inputMode="decimal"
                placeholder="1.00" 
                value={currentRate === '0' ? '' : currentRate}
                onChange={(e) => handleRateChange(e.target.value)}
                style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 700, 
                  border: 'none', 
                  borderRadius: 0, 
                  padding: '8px 0',
                  color: 'var(--text-color)',
                  background: 'transparent',
                  flex: 1,
                  minWidth: 0,
                  textAlign: 'right',
                  paddingRight: '8px'
                }}
              />
              <div style={{ padding: '8px', fontWeight: 800, fontSize: '1rem', opacity: 0.5, flexShrink: 0 }}>
                {baseCurrency}
              </div>
            </div>
          </div>
        </div>

        {/* Data Management & Export */}
        <div className="form-group">
          <label className="flex items-center gap-sm">
            <Database size={16} /> {t('settings.dataManagement')}
          </label>
          <div className="card" style={{ padding: '16px' }}>
            <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '16px', fontWeight: 600 }}>
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
              className="btn-primary" 
              style={{ width: '100%', marginTop: '8px' }}
            >
              <Download size={18} /> {t('settings.export')}
            </button>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="card flex items-center gap-md" style={{ background: 'var(--accent-color)', border: 'none', marginTop: '0' }}>
          <ShieldCheck size={24} color="var(--success-color)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            {t('settings.dataPrivacy')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Settings;
