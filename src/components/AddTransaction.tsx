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
    <div className="container">
      <h1>{t('add.title')}</h1>
      <TransactionForm onSubmit={handleSubmit} />
    </div>
  );
};

export default AddTransaction;
