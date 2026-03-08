import type { Category } from '../types';

export const COMMON_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'BRL'];

export const CATEGORY_COLORS: Record<string, string> = {
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#f59e0b',
  green: '#22c55e',
  teal: '#14b8a6',
  blue: '#3b82f6',
  indigo: '#6366f1',
  purple: '#a855f7',
  pink: '#ec4899',
  slate: '#64748b',
};

export const INITIAL_CATEGORIES: Category[] = [
  { name: 'Food', icon: 'Coffee', color: 'orange' },
  { name: 'Transport', icon: 'Bus', color: 'blue' },
  { name: 'Salary', icon: 'Wallet', color: 'green' },
  { name: 'Rent', icon: 'Building', color: 'indigo' },
  { name: 'Entertainment', icon: 'Gamepad2', color: 'purple' },
  { name: 'Health', icon: 'Stethoscope', color: 'red' },
  { name: 'Shopping', icon: 'Tag', color: 'pink' },
  { name: 'Utilities', icon: 'Lightbulb', color: 'yellow' },
  { name: 'Others', icon: 'CircleEllipsis', color: 'blue' }
];
