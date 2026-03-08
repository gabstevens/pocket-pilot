import { createContext } from 'react';
import type { AppState, Action, Toast, Dialog } from '../types';

export interface TransactionContextType extends AppState {
  dispatch: React.Dispatch<Action>;
  t: (path: string, replacements?: Record<string, string | number>) => string;
  addToast: (message: string, type?: Toast['type']) => void;
  confirm: (dialog: Omit<Dialog, 'onConfirm'>) => Promise<boolean>;
}

export const TransactionContext = createContext<TransactionContextType | undefined>(undefined);
