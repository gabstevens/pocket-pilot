import { render, screen, act } from '@testing-library/react';
import { TransactionProvider } from './index';
import { useTransactions } from '../hooks/useTransactions';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const TestComponent = () => {
  const { transactions, language, baseCurrency, toasts, activeDialog, dispatch, addToast, confirm } = useTransactions();
  
  return (
    <div>
      <div data-testid="lang">{language}</div>
      <div data-testid="base">{baseCurrency}</div>
      <div data-testid="toast-count">{toasts.length}</div>
      <div data-testid="dialog-active">{activeDialog ? 'yes' : 'no'}</div>
      
      <button data-testid="set-it" onClick={() => dispatch({ type: 'SET_LANGUAGE', payload: 'it-IT' })}>Set IT</button>
      <button data-testid="set-base" onClick={() => dispatch({ type: 'SET_BASE_CURRENCY', payload: 'EUR' })}>Set EUR</button>
      <button data-testid="add-toast" onClick={() => addToast('Test Toast', 'success')}>Add Toast</button>
      <button data-testid="open-confirm" onClick={() => confirm({ title: 'Confirm?', message: 'Sure?' })}>Open Confirm</button>
      
      <div data-testid="trans-count">{transactions.length}</div>
      <button data-testid="add-trans" onClick={() => dispatch({
        type: 'ADD_TRANSACTION',
        payload: {
          id: 't1',
          amount: 10,
          currency: 'USD',
          type: 'expense',
          category: 'Food',
          date: '2026-03-07T12:00',
          createdAt: Date.now()
        }
      })}>Add Trans</button>
    </div>
  );
};

describe('TransactionContext Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  it('handles language and base currency state', () => {
    render(
      <TransactionProvider>
        <TestComponent />
      </TransactionProvider>
    );

    expect(screen.getByTestId('lang').textContent).toBe('en-US');
    
    act(() => {
      screen.getByTestId('set-it').click();
    });
    expect(screen.getByTestId('lang').textContent).toBe('it-IT');
    expect(localStorage.getItem('language')).toBe('it-IT');

    act(() => {
      screen.getByTestId('set-base').click();
    });
    expect(screen.getByTestId('base').textContent).toBe('EUR');
    expect(localStorage.getItem('baseCurrency')).toBe('EUR');
  });

  it('manages transactions and persistence', () => {
    render(
      <TransactionProvider>
        <TestComponent />
      </TransactionProvider>
    );

    act(() => {
      screen.getByTestId('add-trans').click();
    });
    expect(screen.getByTestId('trans-count').textContent).toBe('1');
    
    const saved = JSON.parse(localStorage.getItem('transactions') || '[]');
    expect(saved).toHaveLength(1);
    expect(saved[0].id).toBe('t1');
  });

  it('handles toasts with auto-dismissal', async () => {
    render(
      <TransactionProvider>
        <TestComponent />
      </TransactionProvider>
    );

    act(() => {
      screen.getByTestId('add-toast').click();
    });
    expect(screen.getByTestId('toast-count').textContent).toBe('1');

    // Fast-forward 3 seconds
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    expect(screen.getByTestId('toast-count').textContent).toBe('0');
  });

  it('manages confirmation dialog flow', async () => {
    render(
      <TransactionProvider>
        <TestComponent />
      </TransactionProvider>
    );

    expect(screen.getByTestId('dialog-active').textContent).toBe('no');
    
    act(() => {
      screen.getByTestId('open-confirm').click();
    });
    expect(screen.getByTestId('dialog-active').textContent).toBe('yes');
  });
});
