import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [contributeId, setContributeId] = useState(null)
  const [contribution, setContribution] = useState('')
  const [form, setForm] = useState({ name: '', target_amount: '', current_amount: '0', target_date: '', color: '#185FA5' })
  const [error, setError] = useState('')

  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals')
      setGoals(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGoals() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/goals', { ...form, target_amount: parseFloat(form.target_amount), current_amount: parseFloat(form.current_amount || 0) })
      setShowForm(false)
      setForm({ name: '', target_amount: '', current_amount: '0', target_date: '', color: '#185FA5' })
      fetchGoals()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create goal')
    }
  }

  const handleContribute = async (goalId) => {
    if (!contribution || isNaN(contribution)) return
    try {
      await api.post('/goals/' + goalId + '/contribute', { amount: parseFloat(contribution) })
      setContributeId(null)
      setContribution('')
      fetchGoals()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to contribute')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this goal?')) return
    await api.delete('/goals/' + id)
    fetchGoals()
  }

  const fmt = (n) => '$' + Math.abs(Number(n)).toLocaleString('en-US', { minimumFractionDigits: 2 })

  return (
    <div className="min-h-screen bg-gray-50 pb-16 sm:pb-0">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/dashboard" className="text-base sm:text-lg font-semibold text-gray-900">WealthWise</Link>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className="hidden sm:inline text-sm text-gray-500">Goals</span>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-blue-700">
            + New Goal
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 mb-4 sm:mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">New Savings Goal</h3>
            {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg mb-3">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0">
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Goal Name</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Emergency Fund" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Target Amount ($)</label>
                <input required type="number" step="0.01" min="0" value={form.target_amount} onChange={e => setForm({...form, target_amount: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="10000" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Already Saved ($)</label>
                <input type="number" step="0.01" min="0" value={form.current_amount} onChange={e => setForm({...form, current_amount: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Target Date (optional)</label>
                <input type="date" value={form.target_date} onChange={e => setForm({...form, target_date: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Color</label>
                <input type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})}
                  className="w-full h-9 border border-gray-300 rounded-lg px-1 py-1 cursor-pointer" />
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <button type="submit" className="flex-1 sm:flex-none bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg">Create Goal</button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 sm:flex-none border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
        ) : goals.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No goals yet. Create your first one above.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {goals.map(g => (
              <div key={g.id} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1 mr-2">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{g.name}</h3>
                    <span className={g.status === 'completed' ? 'text-xs px-2 py-0.5 rounded-full mt-1 inline-block bg-green-100 text-green-700' : 'text-xs px-2 py-0.5 rounded-full mt-1 inline-block bg-blue-100 text-blue-700'}>
                      {g.status}
                    </span>
                  </div>
                  <span className="text-lg font-semibold flex-shrink-0" style={{ color: g.color }}>{g.percent_complete}%</span>
                </div>

                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div className="h-2 rounded-full" style={{ width: Math.min(g.percent_complete, 100) + '%', backgroundColor: g.color }} />
                </div>

                <div className="text-xs text-gray-500 mb-3">
                  {fmt(g.current_amount)} of {fmt(g.target_amount)}
                  {g.monthly_needed && <span className="ml-1 text-gray-400">· {fmt(g.monthly_needed)}/mo</span>}
                </div>

                {contributeId === g.id ? (
                  <div className="flex gap-2">
                    <input type="number" step="0.01" min="0" value={contribution} onChange={e => setContribution(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm" placeholder="Amount" autoFocus />
                    <button onClick={() => handleContribute(g.id)} className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg">Add</button>
                    <button onClick={() => { setContributeId(null); setContribution('') }}
                      className="border border-gray-300 text-gray-600 text-xs px-3 py-1.5 rounded-lg">Cancel</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setContributeId(g.id)}
                      className="flex-1 bg-blue-50 text-blue-600 text-xs font-medium py-2 rounded-lg hover:bg-blue-100">
                      + Contribute
                    </button>
                    <button onClick={() => handleDelete(g.id)} className="text-xs text-red-400 hover:text-red-600 px-2">Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around">
        <Link to="/dashboard" className="flex flex-col items-center py-1 text-gray-500">
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
        <Link to="/goals" className="flex flex-col items-center py-1 text-blue-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-xs mt-0.5">Goals</span>
        </Link>
      </div>
    </div>
  )
}
