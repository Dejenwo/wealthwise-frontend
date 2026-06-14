import { useCallback, useEffect, useState } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import api from '../api/client'

export default function BankConnect({ onSuccess }) {
  const [linkToken, setLinkToken] = useState(null)
  const [connected, setConnected] = useState(false)
  const [institution, setInstitution] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const init = async () => {
      try {
        const statusRes = await api.get('/plaid/status')
        setConnected(statusRes.data.connected)
        setInstitution(statusRes.data.institution)
        if (!statusRes.data.connected) {
          const tokenRes = await api.post('/plaid/create-link-token')
          setLinkToken(tokenRes.data.link_token)
        }
      } catch (err) {
        console.error('BankConnect error:', err)
        setError(err.response?.data?.detail || 'Failed to initialize bank connection')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const onPlaidSuccess = useCallback(async (public_token, metadata) => {
    try {
      await api.post('/plaid/exchange-token', {
        public_token,
        institution_name: metadata.institution.name,
      })
      setConnected(true)
      setInstitution(metadata.institution.name)
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error('Exchange token error:', err)
      setError(err.response?.data?.detail || 'Failed to connect bank')
    }
  }, [onSuccess])

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
  })

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await api.post('/plaid/sync-transactions')
      setSyncResult(res.data)
      if (onSuccess) onSuccess()
    } catch (err) {
      setSyncResult({ error: err.response?.data?.detail || 'Sync failed' })
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
          <p className="text-xs text-gray-400">Loading bank connection...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Bank Account</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 mb-3">
          {error}
        </div>
        <button
          onClick={() => { setError(null); setLoading(true); window.location.reload() }}
          className="text-xs text-blue-600 hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Bank Account</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {connected
              ? 'Connected to ' + institution
              : 'Connect your bank to auto-import transactions'}
          </p>
        </div>
        {connected ? (
          <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
            Connected
          </span>
        ) : (
          <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">
            Not connected
          </span>
        )}
      </div>

      {connected ? (
        <div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {syncing ? 'Syncing...' : 'Sync Transactions Now'}
          </button>
          {syncResult && !syncResult.error && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700">
              Imported {syncResult.imported} new transactions
              {syncResult.skipped > 0 && ', skipped ' + syncResult.skipped + ' duplicates'}
            </div>
          )}
          {syncResult && syncResult.error && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
              {syncResult.error}
            </div>
          )}
        </div>
      ) : (
        <div>
          <button
            onClick={() => open()}
            disabled={!ready || !linkToken}
            className="w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {!ready || !linkToken ? 'Preparing connection...' : 'Connect Bank Account'}
          </button>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Secure connection powered by Plaid
          </p>
        </div>
      )}
    </div>
  )
}
