import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [contributeId, setContributeId] = useState(null)
  const [contribution, setContribution] = useState('')
  const [form, setForm] = useState({
    name: '', target_amount: '', current_amount: '0',
    target_date: '', color: '#185FA5'
  })
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
      await api.post('/goals', {
        ...form,
        target_amount: parseFloat(form.target_amount),
        current_amount: parseFloat(form.current_amount || 0),
      })
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

  const statusColor = (status) => {
    if (status === 'completed') return 'bg-green-100 text-green-700'
    if (status === 'paused') return 'bg-gray-100 text-gray-600'
    return 'bg-blue-100 text-blue-700'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-lg font-semibold text-gray-900 hover:text-blue-600">WealthWise</Link>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-500">Goals</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-sm text-gray-600 hover:text-blue-600">Dashboard</Link>
          <Link to="/transactions" className="text-sm text-gray-600 hover:text-blue-600">Transactions</Link>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + New Goal
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">New Savings Goal</h3>
            {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg mb-3">{error}</div>}
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Goal Name</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. Emergency Fund"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Target Amount ($)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.target_amount}
                  onChange={e => setForm({...form, target_amount: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="10000"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Already Saved ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.current_amount}
                  onChange={e => setForm({...form, current_amount: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Target Date (optional)</label>
                <input
                  type="date"
                  value={form.target_date}
                  onChange={e => setForm({...form, target_date: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Color</label>
                <input
                  type="color"
                  value={form.color}
                  onChange={e => setForm({...form, color: e.target.value})}
                  className="w-full h-9 border border-gray-300 rounded-lg px-1 py-1 cursor-pointer"
                />
              </div>
              <div className="col-span-2 flex gap-2 mt-1">
                <button
                  type="submit"
                  className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Goal
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

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
        ) : goals.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No goals yet. Create your first savings goal above.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {goals.map(g => (
              <div key={g.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{g.name}</h3>
                    <span className={'text-xs px-2 py-0.5 rounded-full mt-1 inline-block ' + statusColor(g.status)}>
                      {g.status}
                    </span>
                  </div>
                  <span className="text-lg font-semibold" style={{ color: g.color }}>
                    {g.percent_complete}%
                  </span>
                </div>

                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: Math.min(g.percent_complete, 100) + '%', backgroundColor: g.color }}
                  />
                </div>

                <div className="text-xs text-gray-500 mb-3">
                  {fmt(g.current_amount)} saved of {fmt(g.target_amount)}
                  {g.monthly_needed && (
                    <span className="ml-2 text-gray-400">· {fmt(g.monthly_needed)}/mo needed</span>
                  )}
                </div>

                {contributeId === g.id ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={contribution}
                      onChange={e => setContribution(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm"
                      placeholder="Amount"
                      autoFocus
                    />
                    <button
                      onClick={() => handleContribute(g.id)}
                      className="bg-blue-600 text-white text-xs px-3 py-1 rounded-lg"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => { setContributeId(null); setContribution('') }}
                      className="border border-gray-300 text-gray-600 text-xs px-3 py-1 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setContributeId(g.id)}
                      className="flex-1 bg-blue-50 text-blue-600 text-xs font-medium py-1.5 rounded-lg hover:bg-blue-100"
                    >
                      + Contribute
                    </button>
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="text-xs text-red-400 hover:text-red-600 px-2"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
