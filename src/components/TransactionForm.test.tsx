import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionProvider } from '../context';
import TransactionForm from './TransactionForm';
import { describe, it, expect, vi } from 'vitest';

const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <TransactionProvider>
      {ui}
    </TransactionProvider>
  );
};

describe('TransactionForm', () => {
  it('disables submit button when amount is invalid', () => {
    renderWithProvider(<TransactionForm onSubmit={vi.fn()} />);
    
    const submitBtn = screen.getByRole('button', { name: /add transaction/i });
    expect(submitBtn).toBeDisabled();

    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '50' } });
    
    expect(submitBtn).not.toBeDisabled();
  });

  it('calls onSubmit with correct data', () => {
    const handleSubmit = vi.fn();
    renderWithProvider(<TransactionForm onSubmit={handleSubmit} />);
    
    const amountInput = screen.getByPlaceholderText('0.00');
    const noteInput = screen.getByPlaceholderText(/description/i);
    const submitBtn = screen.getByRole('button', { name: /add transaction/i });

    fireEvent.change(amountInput, { target: { value: '100.50' } });
    fireEvent.change(noteInput, { target: { value: 'Test Note' } });
    
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
      amount: 100.50,
      note: 'Test Note',
      category: 'Food',
      type: 'expense'
    }));
  });

  it('toggles type when icon button is clicked', () => {
    renderWithProvider(<TransactionForm onSubmit={vi.fn()} />);
    
    // The type toggle is the first button in the amount group
    const toggleBtn = screen.getByTitle(/expense/i);
    
    // Initially expense (Minus icon)
    expect(toggleBtn).toHaveClass('bg-expense');

    fireEvent.click(toggleBtn);
    
    // Now income (Plus icon) - Title update might need re-render check or just check style
    expect(toggleBtn).toHaveClass('bg-income');
  });

  it('renders custom submit label when provided', () => {
    const customLabel = 'Save Changes';
    renderWithProvider(<TransactionForm onSubmit={vi.fn()} submitLabel={customLabel} />);
    
    expect(screen.getByRole('button', { name: customLabel })).toBeInTheDocument();
  });
});
