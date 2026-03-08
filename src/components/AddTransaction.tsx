import React from 'react';
import { useTransactions } from '../hooks/useTransactions';
import type { Transaction } from '../types';
import TransactionForm from './TransactionForm';
import { generateUUID } from '../utils/uuid';

const AddTransaction: React.FC = () => {
  const { dispatch, t, addToast } = useTransactions();

  const handleSubmit = (data: Partial<Transaction>) => {
    dispatch({
      type: 'ADD_TRANSACTION',
      payload: {
        id: generateUUID(),
        amount: data.amount!,
        currency: data.currency!,
        type: data.type!,
        category: data.category!,
        date: data.date!,
        note: data.note,
        createdAt: Date.now()
      }
    });

    addToast(`${t('common.added')}: ${data.type === 'expense' ? '-' : '+'}${data.amount} ${data.currency}`, 'success');
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <header className="p-sm border-bottom bg-white flex-shrink-0">
        <h1>{t('add.title')}</h1>
      </header>
      <main className="container flex-1 overflow-y-auto">
        <TransactionForm onSubmit={handleSubmit} />
      </main>
    </div>
  );
};

export default AddTransaction;
