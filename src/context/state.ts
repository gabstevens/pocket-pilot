import type { AppState, Action, Toast } from '../types';
import { INITIAL_CATEGORIES } from '../constants';
import { safeParse } from '../utils/storage';
import { generateUUID } from '../utils/uuid';

export const getInitialState = (): AppState => {
  return {
    transactions: safeParse('transactions', []),
    categories: safeParse('categories', INITIAL_CATEGORIES),
    language: localStorage.getItem('language') || (navigator.language === 'it-IT' ? 'it-IT' : 'en-US'),
    baseCurrency: localStorage.getItem('baseCurrency') || 'USD',
    lastCurrency: localStorage.getItem('lastCurrency') || 'USD',
    exchangeRates: safeParse<Record<string, number>>('exchangeRates', {}),
    toasts: [],
    activeDialog: null,
    draftTransaction: {}
  };
};

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return {
        ...state,
        lastCurrency: action.payload.currency,
        transactions: [action.payload, ...state.transactions].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
        draftTransaction: {}
      };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t => 
          t.id === action.payload.id ? action.payload : t
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload)
      };
    case 'SET_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      };
    case 'ADD_CATEGORY':
      if (state.categories.find(c => c.name === action.payload.name)) return state;
      return {
        ...state,
        categories: [...state.categories, action.payload]
      };
    case 'SET_CATEGORIES':
      return {
        ...state,
        categories: action.payload
      };
    case 'SET_LANGUAGE':
      return {
        ...state,
        language: action.payload
      };
    case 'SET_BASE_CURRENCY':
      return {
        ...state,
        baseCurrency: action.payload
      };
    case 'SET_EXCHANGE_RATE':
      return {
        ...state,
        exchangeRates: {
          ...state.exchangeRates,
          [action.payload.currency]: action.payload.rate
        }
      };
    case 'ADD_TOAST': {
      const { message, type } = action.payload;
      return {
        ...state,
        toasts: [...state.toasts, { message, type, id: generateUUID() } as Toast]
      };
    }
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== action.payload)
      };
    case 'OPEN_DIALOG':
      return {
        ...state,
        activeDialog: action.payload
      };
    case 'CLOSE_DIALOG':
      return {
        ...state,
        activeDialog: null
      };
    case 'SET_DRAFT_TRANSACTION':
      return {
        ...state,
        draftTransaction: {
          ...state.draftTransaction,
          ...action.payload
        }
      };
    default:
      return state;
  }
}
