import { create } from 'zustand'
import { mockTransactions } from '../data/mockTransactions'
import type { Role, Transaction, TransactionFilters, Currency } from '../types'

interface FinanceState {
  role: Role
  currency: Currency
  transactions: Transaction[]
  filters: TransactionFilters
  setRole: (role: Role) => void
  setCurrency: (currency: Currency) => void
  setFilters: (filters: Partial<TransactionFilters>) => void
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, transaction: Omit<Transaction, 'id'>) => void
  removeTransaction: (id: string) => void
}

const storageKey = 'finance-dashboard-state'

const getInitialTransactions = () => {
  const saved = localStorage.getItem(storageKey)
  if (!saved) {
    return mockTransactions
  }

  try {
    const parsed = JSON.parse(saved) as Transaction[]
    if (!Array.isArray(parsed)) {
      return mockTransactions
    }
    return parsed
  } catch {
    return mockTransactions
  }
}

export const useFinanceStore = create<FinanceState>((set) => ({
  role: 'viewer',
  currency: (localStorage.getItem('finance-currency') as Currency) || 'USD',
  transactions: getInitialTransactions(),
  filters: {
    search: '',
    category: 'all',
    type: 'all',
    sortBy: 'date-desc',
  },
  setRole: (role) => set({ role }),
  setCurrency: (currency) => {
    localStorage.setItem('finance-currency', currency)
    set({ currency })
  },
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  addTransaction: (transaction) =>
    set((state) => {
      const next = [...state.transactions, { ...transaction, id: crypto.randomUUID() }]
      localStorage.setItem(storageKey, JSON.stringify(next))
      return { transactions: next }
    }),
  updateTransaction: (id, transaction) =>
    set((state) => {
      const next = state.transactions.map((item) =>
        item.id === id ? { ...transaction, id } : item,
      )
      localStorage.setItem(storageKey, JSON.stringify(next))
      return { transactions: next }
    }),
  removeTransaction: (id) =>
    set((state) => {
      const next = state.transactions.filter((item) => item.id !== id)
      localStorage.setItem(storageKey, JSON.stringify(next))
      return { transactions: next }
    }),
}))
