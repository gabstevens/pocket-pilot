export type TransactionType = 'income' | 'expense';

export interface Category {
  name: string;
  icon?: string; // Lucide icon name
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: TransactionType;
  category: string;
  date: string; // ISO string (YYYY-MM-DDTHH:mm)
  note?: string;
  createdAt: number; // timestamp
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface Dialog {
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  language: string;
  baseCurrency: string;
  lastCurrency: string;
  exchangeRates: Record<string, number>;
  toasts: Toast[];
  activeDialog: Dialog | null;
  draftTransaction: Partial<Transaction>;
}

export type Action =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'SET_BASE_CURRENCY'; payload: string }
  | { type: 'SET_EXCHANGE_RATE'; payload: { currency: string; rate: number } }
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'OPEN_DIALOG'; payload: Dialog }
  | { type: 'CLOSE_DIALOG' }
  | { type: 'SET_DRAFT_TRANSACTION'; payload: Partial<Transaction> };
