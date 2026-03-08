import React, { useId } from 'react';
import { useTransactions } from '../hooks/useTransactions';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ startDate, endDate, onChange }) => {
  const { t } = useTransactions();
  const id = useId();

  return (
    <div className="form-group">
      <label htmlFor={`${id}-start`}>{t('dashboard.dateRange')}</label>
      <div className="flex items-center gap-sm flex-wrap">
        <input 
          id={`${id}-start`}
          type="date" 
          value={startDate} 
          onChange={(e) => onChange(e.target.value, endDate)} 
          className="flex-1 input-minimal"
          style={{ padding: '8px 4px' }}
          aria-label="Start Date"
        />
        <span className="text-muted" style={{ fontWeight: 700 }}>{t('dashboard.to')}</span>
        <input 
          id={`${id}-end`}
          type="date" 
          value={endDate} 
          onChange={(e) => onChange(startDate, e.target.value)} 
          className="flex-1 input-minimal"
          style={{ padding: '8px 4px' }}
          aria-label="End Date"
        />
      </div>
    </div>
  );
};

export default DateRangePicker;
