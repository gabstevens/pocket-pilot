import type { Category } from '../types';

export const COMMON_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'BRL'];

export const INITIAL_CATEGORIES: Category[] = [
  { name: 'Food', icon: 'Coffee' },
  { name: 'Transport', icon: 'Bus' },
  { name: 'Salary', icon: 'Wallet' },
  { name: 'Rent', icon: 'Building' },
  { name: 'Entertainment', icon: 'Gamepad2' },
  { name: 'Health', icon: 'Stethoscope' },
  { name: 'Shopping', icon: 'Tag' },
  { name: 'Utilities', icon: 'Lightbulb' },
  { name: 'Others', icon: 'CircleEllipsis' }
];
