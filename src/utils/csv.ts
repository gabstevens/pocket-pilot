import type { Transaction } from '../types';

export function exportTransactionsToCSV(transactions: Transaction[]): string {
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Currency', 'Note', 'ID'];
  const rows = transactions.map(t => [
    t.date || '',
    t.type || '',
    t.category || '',
    (t.amount || 0).toString(),
    t.currency || '',
    t.note || '',
    t.id || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return csvContent;
}

export function downloadCSV(csvContent: string, fileName: string = 'transactions.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function parseCSV(file: File): Promise<Partial<Transaction>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        if (lines.length === 0) return resolve([]);
        
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        
        const data = lines.slice(1).filter(line => line.trim() !== '').map(line => {
          const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
          const cleanValues = values.map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));
          
          const entry: Partial<Transaction> = {};
          headers.forEach((h, i) => {
            const val = cleanValues[i];
            if (!val) return;
            
            if (h === 'Date') entry.date = val;
            if (h === 'Type') entry.type = val.toLowerCase() as 'income' | 'expense';
            if (h === 'Category') entry.category = val;
            if (h === 'Amount') entry.amount = parseFloat(val);
            if (h === 'Currency') entry.currency = val;
            if (h === 'Note') entry.note = val;
            if (h === 'ID') entry.id = val;
          });
          return entry;
        });
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
