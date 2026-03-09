import { describe, it, expect } from 'vitest';
import { getInitialState, reducer } from './state';
import type { Action, Transaction, Category, Dialog } from '../types';

describe('state', () => {
  it('should provide initial state', () => {
    const state = getInitialState();
    expect(state.transactions).toEqual([]);
  });

  it('should handle ADD_TRANSACTION', () => {
    const state = getInitialState();
    const transaction: Transaction = { id: '1', amount: 10, type: 'expense', category: '1', date: '2023-01-01', note: '', currency: 'USD', createdAt: Date.now() };
    const action: Action = { type: 'ADD_TRANSACTION', payload: transaction };
    const newState = reducer(state, action);
    expect(newState.transactions).toEqual([transaction]);
  });

  it('should handle UPDATE_TRANSACTION', () => {
    const transaction: Transaction = { id: '1', amount: 10, type: 'expense', category: '1', date: '2023-01-01', note: '', currency: 'USD', createdAt: Date.now() };
    const state = { ...getInitialState(), transactions: [transaction] };
    const updatedTransaction = { ...transaction, amount: 20 };
    const action: Action = { type: 'UPDATE_TRANSACTION', payload: updatedTransaction };
    const newState = reducer(state, action);
    expect(newState.transactions[0].amount).toBe(20);
  });

  it('should handle DELETE_TRANSACTION', () => {
    const transaction: Transaction = { id: '1', amount: 10, type: 'expense', category: '1', date: '2023-01-01', note: '', currency: 'USD', createdAt: Date.now() };
    const state = { ...getInitialState(), transactions: [transaction] };
    const action: Action = { type: 'DELETE_TRANSACTION', payload: '1' };
    const newState = reducer(state, action);
    expect(newState.transactions).toEqual([]);
  });

  it('should handle SET_TRANSACTIONS', () => {
    const state = getInitialState();
    const transactions: Transaction[] = [{ id: '1', amount: 10, type: 'expense', category: '1', date: '2023-01-01', note: '', currency: 'USD', createdAt: Date.now() }];
    const action: Action = { type: 'SET_TRANSACTIONS', payload: transactions };
    const newState = reducer(state, action);
    expect(newState.transactions).toEqual(transactions);
  });

  it('should handle ADD_CATEGORY', () => {
    const state = getInitialState();
    const category: Category = { name: 'NewCat', icon: 'star', color: 'blue' };
    const action: Action = { type: 'ADD_CATEGORY', payload: category };
    const newState = reducer(state, action);
    expect(newState.categories.some(c => c.name === 'NewCat')).toBe(true);

    // Duplicate category
    const newState2 = reducer(newState, action);
    expect(newState2.categories.length).toBe(newState.categories.length);
  });

  it('should handle UPDATE_CATEGORY and update transactions', () => {
    const oldCategory: Category = { name: 'OldName', icon: 'star', color: 'blue' };
    const transaction: Transaction = { id: '1', amount: 10, type: 'expense', category: 'OldName', date: '2023-01-01', note: '', currency: 'USD', createdAt: Date.now() };
    const state = { ...getInitialState(), categories: [oldCategory], transactions: [transaction] };
    
    const newCategory: Category = { name: 'NewName', icon: 'heart', color: 'red' };
    const action: Action = { type: 'UPDATE_CATEGORY', payload: { oldName: 'OldName', category: newCategory } };
    const newState = reducer(state, action);
    
    expect(newState.categories[0]).toEqual(newCategory);
    expect(newState.transactions[0].category).toBe('NewName');
  });

  it('should handle DELETE_CATEGORY', () => {
    const category: Category = { name: 'ToDel', icon: 'star' };
    const state = { ...getInitialState(), categories: [category] };
    const action: Action = { type: 'DELETE_CATEGORY', payload: 'ToDel' };
    const newState = reducer(state, action);
    expect(newState.categories.some(c => c.name === 'ToDel')).toBe(false);
  });

  it('should handle SET_CATEGORIES', () => {
    const state = getInitialState();
    const categories: Category[] = [{ name: 'NewCat', icon: 'star' }];
    const action: Action = { type: 'SET_CATEGORIES', payload: categories };
    const newState = reducer(state, action);
    expect(newState.categories).toEqual(categories);
  });

  it('should handle SET_LANGUAGE', () => {
    const state = getInitialState();
    const action: Action = { type: 'SET_LANGUAGE', payload: 'it-IT' };
    const newState = reducer(state, action);
    expect(newState.language).toBe('it-IT');
  });

  it('should handle SET_BASE_CURRENCY', () => {
    const state = getInitialState();
    const action: Action = { type: 'SET_BASE_CURRENCY', payload: 'EUR' };
    const newState = reducer(state, action);
    expect(newState.baseCurrency).toBe('EUR');
  });

  it('should handle SET_EXCHANGE_RATE', () => {
    const state = getInitialState();
    const action: Action = { type: 'SET_EXCHANGE_RATE', payload: { currency: 'EUR', rate: 0.85 } };
    const newState = reducer(state, action);
    expect(newState.exchangeRates['EUR']).toBe(0.85);
  });

  it('should handle ADD_TOAST and REMOVE_TOAST', () => {
    const state = getInitialState();
    const toast = { id: 'toast1', message: 'Hello', type: 'success' as const };
    let newState = reducer(state, { type: 'ADD_TOAST', payload: toast });
    expect(newState.toasts).toContain(toast);
    
    newState = reducer(newState, { type: 'REMOVE_TOAST', payload: 'toast1' });
    expect(newState.toasts).not.toContain(toast);
  });

  it('should handle OPEN_DIALOG and CLOSE_DIALOG', () => {
    const state = getInitialState();
    const dialog: Dialog = { title: 'T', message: 'M', onConfirm: () => {} };
    let newState = reducer(state, { type: 'OPEN_DIALOG', payload: dialog });
    expect(newState.activeDialog).toEqual(dialog);

    newState = reducer(newState, { type: 'CLOSE_DIALOG' });
    expect(newState.activeDialog).toBeNull();
  });

  it('should handle SET_DRAFT_TRANSACTION', () => {
    const state = getInitialState();
    const action: Action = { type: 'SET_DRAFT_TRANSACTION', payload: { amount: 100 } };
    const newState = reducer(state, action);
    expect(newState.draftTransaction.amount).toBe(100);
  });

  it('should handle SET_PRIMARY_COLOR', () => {
    const state = getInitialState();
    const action: Action = { type: 'SET_PRIMARY_COLOR', payload: 'teal' };
    const newState = reducer(state, action);
    expect(newState.primaryColor).toBe('teal');
  });
  
  it('should return default state for unknown action', () => {
    const state = getInitialState();
    const newState = reducer(state, { type: 'UNKNOWN' } as unknown as Action);
    expect(newState).toBe(state);
  });
});
