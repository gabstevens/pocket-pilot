import { describe, it, expect, vi } from 'vitest';
import { exportTransactionsToCSV, parseCSV, downloadCSV } from './csv';
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

  describe('downloadCSV', () => {
    it('should create and click a download link', () => {
      // Mock URL.createObjectURL
      const createObjectURL = vi.fn().mockReturnValue('blob:test');
      global.URL.createObjectURL = createObjectURL;
      
      const appendChild = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as unknown as Node);
      const removeChild = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as unknown as Node);
      
      // Mock link element
      const mockLink = {
        setAttribute: vi.fn(),
        click: vi.fn(),
        style: { visibility: '' }
      };
      const createElement = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLAnchorElement);

      downloadCSV('test,csv', 'test.csv');

      expect(createObjectURL).toHaveBeenCalled();
      expect(createElement).toHaveBeenCalledWith('a');
      expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'blob:test');
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'test.csv');
      expect(mockLink.click).toHaveBeenCalled();
      expect(appendChild).toHaveBeenCalled();
      expect(removeChild).toHaveBeenCalled();

      // Cleanup
      vi.restoreAllMocks();
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

    it('should return empty array for empty CSV', async () => {
      const file = new File([''], 'test.csv', { type: 'text/csv' });
      const result = await parseCSV(file);
      expect(result).toEqual([]);
    });

    it('should handle FileReader error', async () => {
      const file = new File(['test'], 'test.csv', { type: 'text/csv' });
      
      // Create a mock FileReader that throws an error
      const originalFileReader = global.FileReader;
      class MockFileReader {
        onerror: ((ev: ProgressEvent<FileReader>) => void) | null = null;
        readAsText() {
          setTimeout(() => {
            if (this.onerror) this.onerror({ target: this } as unknown as ProgressEvent<FileReader>);
          }, 0);
        }
      }
      global.FileReader = MockFileReader as unknown as typeof FileReader;

      await expect(parseCSV(file)).rejects.toThrow();
      
      global.FileReader = originalFileReader;
    });
  });
});
