'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import { isAdminUser } from '../../../lib/adminAccess'

export default function AnalyticsLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && isAdminUser(user)) {
        router.replace('/analytics')
      } else {
        setChecking(false)
      }
    })
  }, [router])

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

      if (signInError) {
        setError(signInError.message)
        return
      }

      if (!isAdminUser(data.user)) {
        await supabase.auth.signOut()
        setError('Access denied. This system is restricted to authorized administrators only.')
        return
      }

      router.replace('/analytics')
    } catch (err) {
      setError(err.message || 'Sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-3">
            <span className="text-3xl">📊</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">TIA-DAS</h1>
          <p className="text-xs text-gray-500 mt-0.5">Tourism Impact Assessment & Data Analytics</p>
          <p className="text-xs text-blue-600 mt-1">Admin Portal — CONNECT-DAET.ph</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="admin@example.com"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Your password"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-5 py-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition min-h-[48px] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
            {loading ? 'Signing in…' : 'Sign In to Admin Dashboard'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-xs text-gray-400 hover:text-gray-600 transition">
            ← Back to CONNECT-DAET.ph
          </a>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-500 text-center">
          Restricted to Municipal Tourism Office of Daet administrators only.
        </div>
      </div>
    </div>
  )
}
