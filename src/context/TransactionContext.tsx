import { useReducer, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Toast, Dialog } from '../types';
import { translations } from '../locales/i18n';
import { getInitialState, reducer } from './state';
import { generateUUID } from '../utils/uuid';
import { TransactionContext } from './context';
import { THEME_COLORS } from '../constants';

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, getInitialState());

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(state.transactions));
    localStorage.setItem('categories', JSON.stringify(state.categories));
    localStorage.setItem('language', state.language);
    localStorage.setItem('baseCurrency', state.baseCurrency);
    localStorage.setItem('lastCurrency', state.lastCurrency);
    localStorage.setItem('exchangeRates', JSON.stringify(state.exchangeRates));
    localStorage.setItem('primaryColor', state.primaryColor);
    
    document.documentElement.lang = state.language.split('-')[0];
    const hexColor = THEME_COLORS[state.primaryColor] || THEME_COLORS.black;
    document.documentElement.style.setProperty('--primary-color', hexColor);
    document.documentElement.style.setProperty('--primary-bg', `${hexColor}04`); // 04 is ~1.5% opacity
  }, [state.transactions, state.categories, state.language, state.baseCurrency, state.lastCurrency, state.exchangeRates, state.primaryColor]);

  const t = useMemo(() => (path: string, replacements?: Record<string, string | number>) => {
    const keys = path.split('.');
    let value: unknown = translations[state.language];
    for (const key of keys) {
      value = (value as Record<string, unknown>)?.[key];
      if (!value) break;
    }
    
    if (typeof value !== 'string') return path;
    
    let result = value;
    if (replacements) {
      Object.entries(replacements).forEach(([key, val]) => {
        result = result.replace(`{{${key}}}`, val.toString());
      });
    }
    
    return result;
  }, [state.language]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = generateUUID();
    dispatch({ type: 'ADD_TOAST', payload: { message, type, id } as Toast });
    setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: id });
    }, 3000);
  }, []);

  const confirm = useCallback((dialog: Omit<Dialog, 'onConfirm'>): Promise<boolean> => {
    return new Promise((resolve) => {
      dispatch({ 
        type: 'OPEN_DIALOG', 
        payload: { 
          ...dialog, 
          onConfirm: () => {
            dispatch({ type: 'CLOSE_DIALOG' });
            resolve(true);
          }
        } 
      });
    });
  }, []);

  return (
    <TransactionContext.Provider value={{ ...state, dispatch, t, addToast, confirm }}>
      {children}
    </TransactionContext.Provider>
  );
}
