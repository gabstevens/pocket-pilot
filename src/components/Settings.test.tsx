import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Settings from './Settings';
import { TransactionContext } from '../context/context';
import { BrowserRouter } from 'react-router-dom';
import { THEME_COLORS } from '../constants';

const mockContext = {
  transactions: [],
  categories: [],
  language: 'en-US',
  baseCurrency: 'USD',
  lastCurrency: 'USD',
  exchangeRates: {},
  toasts: [],
  activeDialog: null,
  draftTransaction: {},
  primaryColor: 'black',
  dispatch: vi.fn(),
  t: (s: string) => s,
  addToast: vi.fn(),
  confirm: vi.fn(),
};

describe('Settings Component', () => {
  it('renders color selection buttons', () => {
    render(
      <BrowserRouter>
        <TransactionContext.Provider value={mockContext}>
          <Settings />
        </TransactionContext.Provider>
      </BrowserRouter>
    );

    // Check if palette section is there (using translation key as mocked)
    expect(screen.getByText('settings.primaryColor')).toBeDefined();

    // Check if all colors from THEME_COLORS are rendered
    Object.keys(THEME_COLORS).forEach(color => {
      const button = screen.getByLabelText(`Select ${color} theme`);
      expect(button).toBeDefined();
    });

    // The 'black' button should have a specific border color because it's selected in mockContext
    const blackButton = screen.getByLabelText('Select black theme');
    expect(blackButton.style.borderColor).toBe('var(--text-color)');

    // The 'blue' button should have transparent border
    const blueButton = screen.getByLabelText('Select blue theme');
    expect(blueButton.style.borderColor).toBe('transparent');
  });
});
