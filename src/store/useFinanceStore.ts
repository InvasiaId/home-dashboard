import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Account {
  id: string;
  name: string;
  balance: number;
}

export interface TransactionCategory {
  id: string;
  name: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  accountId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  date: string;
}

interface FinanceStore {
  accounts: Account[];
  categories: TransactionCategory[];
  transactions: Transaction[];
  addTransaction: (data: Omit<Transaction, 'id' | 'date' | 'type'>) => void;
  addAccount: (name: string, initialBalance: number) => void;
  updateAccount: (id: string, name: string, balance: number) => void;
  deleteAccount: (id: string) => void;
  addCategory: (name: string, type: TransactionType) => void;
  updateCategory: (id: string, name: string, type: TransactionType) => void;
  deleteCategory: (id: string) => void;
}

const defaultAccounts: Account[] = [
  { id: '1', name: 'Bank Mandiri', balance: 0 },
  { id: '2', name: 'Bank Jago', balance: 0 },
  { id: '3', name: 'Dompet (Cash)', balance: 0 },
];

const defaultCategories: TransactionCategory[] = [
  { id: 'c1', name: 'Gajian / Salary', type: 'INCOME' },
  { id: 'c2', name: 'Bonus', type: 'INCOME' },
  { id: 'c3', name: 'Hasil Jualan', type: 'INCOME' },
  { id: 'c4', name: 'Makanan & Minuman', type: 'EXPENSE' },
  { id: 'c5', name: 'Transportasi', type: 'EXPENSE' },
  { id: 'c6', name: 'Tagihan & Utilitas', type: 'EXPENSE' },
  { id: 'c7', name: 'Hiburan', type: 'EXPENSE' },
  { id: 'c8', name: 'Belanja', type: 'EXPENSE' },
];

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      accounts: defaultAccounts,
      categories: defaultCategories,
      transactions: [],
      addTransaction: ({ accountId, categoryId, amount }) => set(state => {
        const category = state.categories.find(c => c.id === categoryId);
        if (!category) return state;

        const newTransaction: Transaction = {
          id: crypto.randomUUID(),
          accountId,
          categoryId,
          amount,
          type: category.type,
          date: new Date().toISOString()
        };

        const updatedAccounts = state.accounts.map(acc => {
          if (acc.id === accountId) {
            return {
              ...acc,
              balance: category.type === 'INCOME' ? acc.balance + amount : acc.balance - amount
            };
          }
          return acc;
        });

        return {
          transactions: [newTransaction, ...state.transactions],
          accounts: updatedAccounts
        };
      }),
      addAccount: (name, initialBalance) => set(state => ({
        accounts: [...state.accounts, { id: crypto.randomUUID(), name, balance: initialBalance }]
      })),
      updateAccount: (id, name, balance) => set(state => ({
        accounts: state.accounts.map(a => a.id === id ? { ...a, name, balance } : a)
      })),
      deleteAccount: (id) => set(state => ({
        accounts: state.accounts.filter(a => a.id !== id)
      })),
      addCategory: (name, type) => set(state => ({
        categories: [...state.categories, { id: crypto.randomUUID(), name, type }]
      })),
      updateCategory: (id, name, type) => set(state => ({
        categories: state.categories.map(c => c.id === id ? { ...c, name, type } : c)
      })),
      deleteCategory: (id) => set(state => ({
        categories: state.categories.filter(c => c.id !== id)
      }))
    }),
    {
      name: 'finance-storage'
    }
  )
);
