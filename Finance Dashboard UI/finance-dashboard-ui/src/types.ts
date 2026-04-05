export type Role = 'viewer' | 'admin'

export type TransactionType = 'income' | 'expense'

export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY'

export const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.45,
  JPY: 151.62,
}

export interface Transaction {
  id: string
  date: string
  title: string
  category: string
  amount: number
  type: TransactionType
}

export interface TransactionFilters {
  search: string
  category: string
  type: 'all' | TransactionType
  sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'
}
