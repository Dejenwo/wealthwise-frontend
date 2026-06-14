import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import BankConnect from '../components/BankConnect'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const fetchData = async () => {
    try {
      const [summaryRes, txnRes, goalRes] = await Promise.all([
        api.get('/transactions/summary/monthly?month=' + month + '&year=' + year),
        api.get('/transactions?page_size=5'),
        api.get('/goals'),
      ])
      setSummary(summaryRes.data)
      setTransactions(txnRes.data.items || [])
      setGoals(goalRes.data.slice(0, 3))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const fmt = (n) => '$' + Math.abs(Number(n)).toLocaleString('en-US', { minimumFractionDigits: 2 })
  const greeting = now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'
  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-base sm:text-lg font-semibold text-gray-900">WealthWise</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center gap-4">
            <Link to="/transactions" className="text-sm text-gray-600 hover:text-blue-600">Transactions</Link>
            <Link to="/goals" className="text-sm text-gray-600 hover:text-blue-600">Goals</Link>
            <span className="text-sm text-gray-600">{user && user.full_name}</span>
            {user && user.plan === 'free' && (
              <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-1 rounded-full">Free</span>
            )}
            {user && user.plan === 'pro' && (
              <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">Pro</span>
            )}
            <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700">Sign out</button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
            <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
            <div className="w-5 h-0.5 bg-gray-600"></div>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
            <Link to="/transactions" className="block text-sm text-gray-700 py-2" onClick={() => setMenuOpen(false)}>Transactions</Link>
            <Link to="/goals" className="block text-sm text-gray-700 py-2" onClick={() => setMenuOpen(false)}>Goals</Link>
            <div className="text-sm text-gray-500 py-2">{user && user.full_name}</div>
            <button onClick={logout} className="block text-sm text-red-500 py-2">Sign out</button>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Greeting */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Good {greeting}, {user && user.full_name ? user.full_name.split(' ')[0] : 'there'} 👋
          </h2>
          <p className="text-sm text-gray-500 mt-1">Your financial snapshot for {monthName}</p>
        </div>

        {/* Metrics — 1 col mobile, 3 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
            <div className="text-xs text-gray-500 mb-1">Monthly Income</div>
            <div className="text-xl sm:text-2xl font-semibold text-gray-900">{fmt(summary ? summary.total_income : 0)}</div>
            <div className="text-xs text-green-600 mt-1">This month</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
            <div className="text-xs text-gray-500 mb-1">Total Spent</div>
            <div className="text-xl sm:text-2xl font-semibold text-gray-900">{fmt(summary ? summary.total_expenses : 0)}</div>
            <div className="text-xs text-gray-500 mt-1">This month</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
            <div className="text-xs text-gray-500 mb-1">Net Savings</div>
            <div className={summary && summary.net >= 0 ? 'text-xl sm:text-2xl font-semibold text-green-600' : 'text-xl sm:text-2xl font-semibold text-red-600'}>
              {fmt(summary ? summary.net : 0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Savings rate: {summary ? summary.savings_rate : 0}%</div>
          </div>
        </div>

        {/* Transactions + Goals — 1 col mobile, 2 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Recent Transactions</h3>
              <Link to="/transactions" className="text-xs text-blue-600 hover:underline">See all</Link>
            </div>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No transactions yet.
                <br />
                <Link to="/transactions" className="text-blue-600 hover:underline mt-1 block">Add your first one</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map(t => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="min-w-0 flex-1 mr-3">
                      <div className="text-sm font-medium text-gray-800 truncate">{t.description}</div>
                      <div className="text-xs text-gray-400">{t.transaction_date}</div>
                    </div>
                    <div className={t.type === 'income' ? 'text-sm font-medium text-green-600 flex-shrink-0' : 'text-sm font-medium text-gray-900 flex-shrink-0'}>
                      {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Savings Goals</h3>
              <Link to="/goals" className="text-xs text-blue-600 hover:underline">See all</Link>
            </div>
            {goals.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No goals yet.
                <br />
                <Link to="/goals" className="text-blue-600 hover:underline mt-1 block">Create your first goal</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map(g => (
                  <div key={g.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-800 truncate mr-2">{g.name}</span>
                      <span className="text-gray-500 flex-shrink-0">{g.percent_complete}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-2 rounded-full bg-blue-500" style={{ width: Math.min(g.percent_complete, 100) + '%' }} />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{fmt(g.current_amount)} of {fmt(g.target_amount)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bank Connect */}
        <div className="mt-4 sm:mt-6">
          <BankConnect onSuccess={() => fetchData()} />
        </div>

        {/* Upgrade Banner */}
        {user && user.plan === 'free' && (
          <div className="mt-4 sm:mt-6 bg-blue-600 rounded-xl p-4 sm:p-5 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="font-semibold text-sm sm:text-base">Unlock AI Financial Advisor</div>
                <div className="text-blue-100 text-xs sm:text-sm mt-1">Get personalized insights, annual reports, and more with Pro.</div>
              </div>
              <button className="bg-white text-blue-600 font-medium text-sm px-4 py-2 rounded-lg hover:bg-blue-50 flex-shrink-0 w-full sm:w-auto">
                Upgrade — $9/mo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around">
        <Link to="/dashboard" className="flex flex-col items-center py-1 text-blue-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs mt-0.5">Home</span>
        </Link>
        <Link to="/transactions" className="flex flex-col items-center py-1 text-gray-500">
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

      {/* Bottom padding for mobile nav */}
      <div className="sm:hidden h-16"></div>
    </div>
  )
}
