import { describe, it, expect } from 'vitest';
import { exportTransactionsToCSV, parseCSV } from './csv';
import type { Transaction } from '../types';

const mockTransactions: Transaction[] = [
  {
    id: '1',
    amount: 100,
    currency: 'USD',
    type: 'income',
    category: 'Salary',
    date: '2023-10-01',
    note: 'October Salary',
    createdAt: Date.now()
  },
  {
    id: '2',
    amount: 50,
    currency: 'EUR',
    type: 'expense',
    category: 'Food',
    date: '2023-10-02',
    note: 'Lunch "out"',
    createdAt: Date.now()
  }
];

describe('CSV Utilities', () => {
  describe('exportTransactionsToCSV', () => {
    it('should correctly format transactions to CSV string', () => {
      const csv = exportTransactionsToCSV(mockTransactions);
      const lines = csv.split('\n');
      
      expect(lines[0]).toBe('Date,Type,Category,Amount,Currency,Note,ID');
      expect(lines[1]).toBe('"2023-10-01","income","Salary","100","USD","October Salary","1"');
      expect(lines[2]).toBe('"2023-10-02","expense","Food","50","EUR","Lunch ""out""","2"');
    });
  });

  describe('parseCSV', () => {
    it('should correctly parse CSV content from a File', async () => {
      const csvContent = 'Date,Type,Category,Amount,Currency,Note,ID\n"2023-10-01","income","Salary","100","USD","October Salary","1"';
      const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
      
      const result = await parseCSV(file);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        date: '2023-10-01',
        type: 'income',
        category: 'Salary',
        amount: 100,
        currency: 'USD',
        note: 'October Salary',
        id: '1'
      });
    });
  });
});
