import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import BankConnect from '../components/BankConnect'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [summary, setSummary] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

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
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-gray-900">WealthWise</span>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-500">Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/transactions" className="text-sm text-gray-600 hover:text-blue-600">Transactions</Link>
          <Link to="/goals" className="text-sm text-gray-600 hover:text-blue-600">Goals</Link>
          <span className="text-sm text-gray-600">{user && user.full_name}</span>
          {user && user.plan === 'free' && (
            <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-1 rounded-full">
              Free Plan
            </span>
          )}
          {user && user.plan === 'pro' && (
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
              Pro
            </span>
          )}
          <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700">
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            Good {greeting}, {user && user.full_name ? user.full_name.split(' ')[0] : 'there'}
          </h2>
          <p className="text-gray-500 mt-1">
            Here is your financial snapshot for {monthName}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-xs text-gray-500 mb-1">Monthly Income</div>
            <div className="text-2xl font-semibold text-gray-900">
              {fmt(summary ? summary.total_income : 0)}
            </div>
            <div className="text-xs text-green-600 mt-1">This month</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-xs text-gray-500 mb-1">Total Spent</div>
            <div className="text-2xl font-semibold text-gray-900">
              {fmt(summary ? summary.total_expenses : 0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">This month</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-xs text-gray-500 mb-1">Net Savings</div>
            <div className={summary && summary.net >= 0 ? 'text-2xl font-semibold text-green-600' : 'text-2xl font-semibold text-red-600'}>
              {fmt(summary ? summary.net : 0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Savings rate: {summary ? summary.savings_rate : 0}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Recent Transactions</h3>
              <Link to="/transactions" className="text-xs text-blue-600 hover:underline">See all</Link>
            </div>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No transactions yet.
                <br />
                <Link to="/transactions" className="text-blue-600 hover:underline mt-1 block">
                  Add your first one
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map(t => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <div className="text-sm font-medium text-gray-800">{t.description}</div>
                      <div className="text-xs text-gray-400">{t.transaction_date}</div>
                    </div>
                    <div className={t.type === 'income' ? 'text-sm font-medium text-green-600' : 'text-sm font-medium text-gray-900'}>
                      {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Savings Goals</h3>
              <Link to="/goals" className="text-xs text-blue-600 hover:underline">See all</Link>
            </div>
            {goals.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No goals yet.
                <br />
                <Link to="/goals" className="text-blue-600 hover:underline mt-1 block">
                  Create your first goal
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map(g => (
                  <div key={g.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-800">{g.name}</span>
                      <span className="text-gray-500">{g.percent_complete}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: Math.min(g.percent_complete, 100) + '%' }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {fmt(g.current_amount)} of {fmt(g.target_amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <BankConnect onSuccess={() => fetchData()} />
        </div>

        {user && user.plan === 'free' && (
          <div className="mt-6 bg-blue-600 rounded-xl p-5 text-white flex items-center justify-between">
            <div>
              <div className="font-semibold">Unlock AI Financial Advisor</div>
              <div className="text-blue-100 text-sm mt-1">
                Get personalized insights, annual reports, and more with Pro.
              </div>
            </div>
            <button className="bg-white text-blue-600 font-medium text-sm px-4 py-2 rounded-lg hover:bg-blue-50">
              Upgrade — $9/mo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
