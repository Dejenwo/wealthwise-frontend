import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    description: '',
    amount: '',
    type: 'expense',
    transaction_date: new Date().toISOString().split('T')[0],
    notes: ''
  })
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions?page=' + page + '&page_size=10')
      setTransactions(res.data.items || [])
      setTotal(res.data.total || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTransactions() }, [page])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/transactions', {
        ...form,
        amount: parseFloat(form.amount),
      })
      setShowForm(false)
      setForm({
        description: '',
        amount: '',
        type: 'expense',
        transaction_date: new Date().toISOString().split('T')[0],
        notes: ''
      })
      fetchTransactions()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add transaction')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return
    await api.delete('/transactions/' + id)
    fetchTransactions()
  }

  const fmt = (n) => '$' + Math.abs(Number(n)).toLocaleString('en-US', { minimumFractionDigits: 2 })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-lg font-semibold text-gray-900 hover:text-blue-600">WealthWise</Link>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-500">Transactions</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-sm text-gray-600 hover:text-blue-600">Dashboard</Link>
          <Link to="/goals" className="text-sm text-gray-600 hover:text-blue-600">Goals</Link>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Transaction
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">New Transaction</h3>
            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg mb-3">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Description</label>
                <input
                  required
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. Whole Foods"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Amount ($)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={e => setForm({...form, amount: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm({...form, type: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Date</label>
                <input
                  required
                  type="date"
                  value={form.transaction_date}
                  onChange={e => setForm({...form, transaction_date: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Notes (optional)</label>
                <input
                  value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Optional note"
                />
              </div>
              <div className="col-span-2 flex gap-2 mt-1">
                <button
                  type="submit"
                  className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Save Transaction
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">All Transactions ({total})</h3>
          </div>
          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No transactions yet. Add your first one above.
            </div>
          ) : (
            <div>
              {transactions.map(t => (
                <div
                  key={t.id}
                  className="flex items-center justify-between px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-800">{t.description}</div>
                    <div className="text-xs text-gray-400">
                      {t.transaction_date}
                      {t.category ? ' · ' + t.category.name : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={t.type === 'income' ? 'text-sm font-medium text-green-600' : 'text-sm font-medium text-gray-900'}>
                      {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                    </span>
                    <span className={t.type === 'income' ? 'text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700' : 'text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600'}>
                      {t.type}
                    </span>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between px-5 py-3">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="text-sm text-blue-600 disabled:text-gray-300 hover:underline"
                >
                  Previous
                </button>
                <span className="text-xs text-gray-400">Page {page}</span>
                <button
                  disabled={transactions.length < 10}
                  onClick={() => setPage(p => p + 1)}
                  className="text-sm text-blue-600 disabled:text-gray-300 hover:underline"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
