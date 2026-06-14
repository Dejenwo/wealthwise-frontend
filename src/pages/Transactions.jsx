import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    description: '', amount: '', type: 'expense',
    transaction_date: new Date().toISOString().split('T')[0], notes: ''
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
      await api.post('/transactions', { ...form, amount: parseFloat(form.amount) })
      setShowForm(false)
      setForm({ description: '', amount: '', type: 'expense', transaction_date: new Date().toISOString().split('T')[0], notes: '' })
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
    <div className="min-h-screen bg-gray-50 pb-16 sm:pb-0">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/dashboard" className="text-base sm:text-lg font-semibold text-gray-900">WealthWise</Link>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className="hidden sm:inline text-sm text-gray-500">Transactions</span>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-blue-700"
          >
            + Add
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 mb-4 sm:mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">New Transaction</h3>
            {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg mb-3">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0">
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Description</label>
                <input required value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Whole Foods" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Amount ($)</label>
                <input required type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Date</label>
                <input required type="date" value={form.transaction_date} onChange={e => setForm({...form, transaction_date: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Notes (optional)</label>
                <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Optional" />
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <button type="submit" className="flex-1 sm:flex-none bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700">
                  Save
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 sm:flex-none border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Transactions ({total})</h3>
          </div>
          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No transactions yet.</div>
          ) : (
            <div>
              {transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <div className="min-w-0 flex-1 mr-3">
                    <div className="text-sm font-medium text-gray-800 truncate">{t.description}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-2">
                      <span>{t.transaction_date}</span>
                      <span className={t.type === 'income' ? 'bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs' : 'bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs'}>
                        {t.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    <span className={t.type === 'income' ? 'text-sm font-medium text-green-600' : 'text-sm font-medium text-gray-900'}>
                      {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                    </span>
                    <button onClick={() => handleDelete(t.id)} className="text-xs text-red-400 hover:text-red-600">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between px-4 sm:px-5 py-3">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="text-sm text-blue-600 disabled:text-gray-300">Previous</button>
                <span className="text-xs text-gray-400">Page {page}</span>
                <button disabled={transactions.length < 10} onClick={() => setPage(p => p + 1)}
                  className="text-sm text-blue-600 disabled:text-gray-300">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around">
        <Link to="/dashboard" className="flex flex-col items-center py-1 text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs mt-0.5">Home</span>
        </Link>
        <Link to="/transactions" className="flex flex-col items-center py-1 text-blue-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span className="text-xs mt-0.5">Transactions</span>
        </Link>
        <Link to="/goals" className="flex flex-col items-center py-1 text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-xs mt-0.5">Goals</span>
        </Link>
      </div>
    </div>
  )
}
