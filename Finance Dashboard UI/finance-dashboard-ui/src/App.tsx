import { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Trash2,
  X,
  Sun,
  Moon,
  Landmark,
  ArrowUpCircle,
  ArrowDownCircle,
  Edit2
} from 'lucide-react'
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './App.css'
import { useFinanceStore } from './store/useFinanceStore'
import { EXCHANGE_RATES, type TransactionType, type Currency } from './types'

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const role = useFinanceStore((state) => state.role)
  const currency = useFinanceStore((state) => state.currency)
  const transactions = useFinanceStore((state) => state.transactions)
  const filters = useFinanceStore((state) => state.filters)
  const setRole = useFinanceStore((state) => state.setRole)
  const setCurrency = useFinanceStore((state) => state.setCurrency)
  const setFilters = useFinanceStore((state) => state.setFilters)
  const addTransaction = useFinanceStore((state) => state.addTransaction)
  const updateTransaction = useFinanceStore((state) => state.updateTransaction)
  const removeTransaction = useFinanceStore((state) => state.removeTransaction)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          transactions
            .map((item) => item.category)
            .sort((first, second) => first.localeCompare(second)),
        ),
      ),
    [transactions],
  )

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = filters.search.toLowerCase()
    return transactions
      .filter((item) => {
        const isTypeMatch = filters.type === 'all' || item.type === filters.type
        const isCategoryMatch =
          filters.category === 'all' || item.category === filters.category
        const isSearchMatch =
          item.title.toLowerCase().includes(normalizedSearch) ||
          item.category.toLowerCase().includes(normalizedSearch)
        return isTypeMatch && isCategoryMatch && isSearchMatch
      })
      .sort((first, second) => {
        if (filters.sortBy === 'date-desc') {
          return second.date.localeCompare(first.date)
        }
        if (filters.sortBy === 'date-asc') {
          return first.date.localeCompare(second.date)
        }
        if (filters.sortBy === 'amount-desc') {
          return second.amount - first.amount
        }
        return first.amount - second.amount
      })
  }, [filters, transactions])

  const totals = useMemo(() => {
    const income = transactions
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0)
    const expenses = transactions
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0)
    return { income, expenses, balance: income - expenses }
  }, [transactions])

  const monthlyTrend = useMemo(() => {
    const grouped = new Map<
      string,
      { month: string; income: number; expenses: number; balance: number }
    >()

    transactions.forEach((item) => {
      const monthKey = item.date.slice(0, 7)
      const monthName = new Date(`${monthKey}-01`).toLocaleDateString('en-US', {
        month: 'short',
      })
      const existing = grouped.get(monthKey) ?? {
        month: monthName,
        income: 0,
        expenses: 0,
        balance: 0,
      }
      if (item.type === 'income') {
        existing.income += item.amount
      } else {
        existing.expenses += item.amount
      }
      existing.balance = existing.income - existing.expenses
      grouped.set(monthKey, existing)
    })

    return Array.from(grouped.entries())
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([, value]) => value)
  }, [transactions])

  const spendingByCategory = useMemo(() => {
    const grouped = new Map<string, number>()
    transactions
      .filter((item) => item.type === 'expense')
      .forEach((item) => {
        grouped.set(item.category, (grouped.get(item.category) ?? 0) + item.amount)
      })
    return Array.from(grouped.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((first, second) => second.value - first.value)
  }, [transactions])

  const insights = useMemo(() => {
    const topCategory = spendingByCategory[0]
    const latestMonth = monthlyTrend[monthlyTrend.length - 1]
    const previousMonth = monthlyTrend[monthlyTrend.length - 2]
    const monthlyDiff =
      latestMonth && previousMonth ? latestMonth.balance - previousMonth.balance : 0
    return { topCategory, monthlyDiff }
  }, [monthlyTrend, spendingByCategory])

  const editingTransaction = useMemo(
    () => transactions.find((item) => item.id === editingId),
    [editingId, transactions],
  )

  const chartColors = ['#4f46e5', '#0ea5e9', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6']

  const formatCurrency = (value: number) => {
    const converted = value * EXCHANGE_RATES[currency]
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: currency 
    }).format(converted)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const amount = Number(formData.get('amount'))
    const payload = {
      date: String(formData.get('date')),
      title: String(formData.get('title')),
      category: String(formData.get('category')),
      amount: amount / EXCHANGE_RATES[currency], // Store in base currency (USD)
      type: String(formData.get('type')) as TransactionType,
    }

    if (editingId) {
      updateTransaction(editingId, payload)
      setEditingId(null)
      return
    }

    addTransaction(payload)
    event.currentTarget.reset()
  }

  return (
    <div className={`app-shell ${darkMode ? 'dark' : ''}`}>
      <header className="topbar">
        <div>
          <h1>Finance Dashboard</h1>
          <p>Track balances, analyze spending, and review transactions in one place.</p>
        </div>
        <div className="topbar-actions">
          <label className="role-select">
            Currency
            <select value={currency} onChange={(event) => setCurrency(event.target.value as Currency)}>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </label>
          <label className="role-select">
            Role
            <select value={role} onChange={(event) => setRole(event.target.value as 'viewer' | 'admin')}>
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button className="mode-btn" onClick={() => setDarkMode((state) => !state)}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            {darkMode ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      <section className="summary-grid">
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="summary-card"
        >
          <div className="summary-head">
            <span>Total Balance</span>
            <Landmark size={18} />
          </div>
          <strong>{formatCurrency(totals.balance)}</strong>
        </motion.article>
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="summary-card"
        >
          <div className="summary-head">
            <span>Income</span>
            <ArrowUpCircle size={18} />
          </div>
          <strong>{formatCurrency(totals.income)}</strong>
        </motion.article>
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="summary-card"
        >
          <div className="summary-head">
            <span>Expenses</span>
            <ArrowDownCircle size={18} />
          </div>
          <strong>{formatCurrency(totals.expenses)}</strong>
        </motion.article>
      </section>

      <section className="chart-grid">
        <article className="panel chart-panel">
          <h2>Balance Trend</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyTrend.map(d => ({ ...d, balance: d.balance * EXCHANGE_RATES[currency] }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line dataKey="balance" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </article>
        <article className="panel chart-panel">
          <h2>Spending Breakdown</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={spendingByCategory.map(d => ({ ...d, value: d.value * EXCHANGE_RATES[currency] }))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {spendingByCategory.map((entry, index) => (
                  <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </article>
      </section>

      <section className="panel insights-panel">
        <h2>Insights</h2>
        <div className="insight-list">
          <div className="insight-item">
            <span>Highest Spending Category</span>
            <strong>
              {insights.topCategory
                ? `${insights.topCategory.name} (${formatCurrency(insights.topCategory.value)})`
                : 'No expense data'}
            </strong>
          </div>
          <div className="insight-item">
            <span>Monthly Comparison</span>
            <strong className={insights.monthlyDiff >= 0 ? 'positive' : 'negative'}>
              {insights.monthlyDiff >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {formatCurrency(Math.abs(insights.monthlyDiff))}{' '}
              {insights.monthlyDiff >= 0 ? 'up from last month' : 'down from last month'}
            </strong>
          </div>
          <div className="insight-item">
            <span>Role Access</span>
            <strong>
              {role === 'admin'
                ? 'Admin can add and edit transactions.'
                : 'Viewer can explore data only.'}
            </strong>
          </div>
        </div>
      </section>

      <section className="panel transactions-panel">
        <div className="section-head">
          <h2>Transactions</h2>
        </div>
        <div className="filters-row">
          <label className="search-box">
            <Search size={16} />
            <input
              type="text"
              value={filters.search}
              placeholder="Search title or category"
              onChange={(event) => setFilters({ search: event.target.value })}
            />
          </label>
          <select value={filters.type} onChange={(event) => setFilters({ type: event.target.value as 'all' | TransactionType })}>
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select value={filters.category} onChange={(event) => setFilters({ category: event.target.value })}>
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select value={filters.sortBy} onChange={(event) => setFilters({ sortBy: event.target.value as 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' })}>
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>

        {role === 'admin' && (
          <form className="transaction-form" onSubmit={handleSubmit}>
            <input
              type="date"
              name="date"
              required
            />
            <input
              type="text"
              name="title"
              placeholder="Title"
              required
            />
            <input
              type="text"
              name="category"
              placeholder="Category"
              required
            />
            <input
              type="number"
              name="amount"
              step="0.01"
              min="0.01"
              placeholder="Amount"
              required
            />
            <select name="type" defaultValue="expense">
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <button type="submit">
              <Plus size={16} />
              Add
            </button>
          </form>
        )}

        <AnimatePresence>
          {editingId && editingTransaction && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => setEditingId(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-head">
                  <h2>Edit Transaction</h2>
                  <button onClick={() => setEditingId(null)} className="close-btn">
                    <X size={20} />
                  </button>
                </div>
                <form className="transaction-form vertical" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Date</label>
                    <input type="date" name="date" defaultValue={editingTransaction.date} required />
                  </div>
                  <div className="form-group">
                    <label>Title</label>
                    <input type="text" name="title" defaultValue={editingTransaction.title} placeholder="Title" required />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input type="text" name="category" defaultValue={editingTransaction.category} placeholder="Category" required />
                  </div>
                  <div className="form-group">
                    <label>Amount</label>
                    <input type="number" name="amount" defaultValue={editingTransaction.amount * EXCHANGE_RATES[currency]} step="0.01" min="0.01" placeholder="Amount" required />
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select name="type" defaultValue={editingTransaction.type}>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                  <button type="submit" className="submit-btn">Update Transaction</button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
                {role === 'admin' ? <th>Action</th> : null}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((item) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={item.id}
                    >
                      <td>{new Date(item.date).toLocaleDateString()}</td>
                      <td>{item.title}</td>
                      <td>{item.category}</td>
                      <td>
                        <span className={`pill ${item.type}`}>{item.type}</span>
                      </td>
                      <td className={item.type === 'income' ? 'positive' : 'negative'}>
                        {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
                      </td>
                      {role === 'admin' ? (
                        <td>
                          <div className="action-btns">
                            <button className="edit-btn" onClick={() => setEditingId(item.id)}>
                              <Edit2 size={14} />
                            </button>
                            <button className="delete-btn" onClick={() => removeTransaction(item.id)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      ) : null}
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td colSpan={role === 'admin' ? 6 : 5} className="empty-state">
                      No transactions match your filters.
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default App
