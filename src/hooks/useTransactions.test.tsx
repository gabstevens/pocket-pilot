import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTransactions } from './useTransactions';
import { TransactionProvider } from '../context/TransactionContext';
import React from 'react';

describe('useTransactions', () => {
  it('should throw an error if used outside of TransactionProvider', () => {
    // Suppress React error boundary logging
    const consoleError = console.error;
    console.error = () => {};
    
    expect(() => renderHook(() => useTransactions())).toThrow('useTransactions must be used within a TransactionProvider');
    
    console.error = consoleError;
  });

  it('should return context when used within TransactionProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TransactionProvider>{children}</TransactionProvider>
    );
    const { result } = renderHook(() => useTransactions(), { wrapper });
    expect(result.current).toBeDefined();
    expect(result.current.transactions).toBeDefined();
    expect(result.current.dispatch).toBeDefined();
  });
});
