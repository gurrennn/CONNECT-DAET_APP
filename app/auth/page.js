'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { isAdminUser } from '../lib/adminAccess'

export default function AuthPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')

  // If already signed in as admin, skip the login page
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && isAdminUser(session.user)) {
        router.replace('/analytics')
      } else {
        setChecking(false)
      }
    })
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        setError(signInError.message)
        return
      }

      if (!isAdminUser(data.user)) {
        await supabase.auth.signOut()
        setError('Access denied. This system is restricted to authorized administrators of the Municipal Tourism Office of Daet.')
        return
      }

      router.replace('/analytics')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.')
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
    <div className="min-h-screen flex">

      {/* ── Left panel — brand ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 flex-col items-center justify-center p-12 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -right-20 w-[28rem] h-[28rem] rounded-full bg-white/5" />
        <div className="absolute top-1/3 right-8 w-40 h-40 rounded-full bg-white/5" />

        <div className="relative z-10 text-center max-w-sm">
          {/* Bar chart icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-sm mb-6 shadow-lg">
            <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10" aria-hidden="true">
              <rect x="4"  y="28" width="8"  height="16" rx="2" fill="white" fillOpacity="0.9" />
              <rect x="16" y="18" width="8"  height="26" rx="2" fill="white" />
              <rect x="28" y="10" width="8"  height="34" rx="2" fill="white" fillOpacity="0.9" />
              <rect x="40" y="4"  width="8"  height="40" rx="2" fill="white" fillOpacity="0.7" />
              <path d="M6 22 L18 14 L30 6 L44 2" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" />
            </svg>
          </div>

          <p className="text-blue-200 text-sm font-semibold tracking-widest uppercase mb-2">
            CONNECT-DAET.ph
          </p>
          <h1 className="text-3xl font-bold text-white leading-tight">
            Tourism Impact Assessment<br />& Data Analytics System
          </h1>
          <p className="text-blue-100 text-base font-medium mt-3">
            Smart Tourism. Data-Driven Decisions.
          </p>

          <p className="text-blue-200 text-sm mt-6 leading-relaxed">
            An intelligent analytics platform designed to help the Municipal Tourism Office of Daet monitor tourism performance, assess economic impact, and support sustainable tourism development.
          </p>

          <div className="mt-8 space-y-2">
            {[
              'Real-time visitor statistics',
              'Economic impact assessment',
              'Sustainability monitoring',
              'AI-powered insights',
            ].map(text => (
              <div key={text} className="flex items-center gap-3 text-left bg-white/10 rounded-xl px-4 py-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0" />
                <span className="text-sm text-blue-50">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 mt-10 text-blue-300 text-xs">
          Municipal Tourism Office · Daet, Camarines Norte
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-3 shadow">
              <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7" aria-hidden="true">
                <rect x="4"  y="28" width="8"  height="16" rx="2" fill="white" fillOpacity="0.9" />
                <rect x="16" y="18" width="8"  height="26" rx="2" fill="white" />
                <rect x="28" y="10" width="8"  height="34" rx="2" fill="white" fillOpacity="0.9" />
                <rect x="40" y="4"  width="8"  height="40" rx="2" fill="white" fillOpacity="0.7" />
              </svg>
            </div>
            <p className="text-xs text-blue-600 font-semibold tracking-widest uppercase">CONNECT-DAET.ph</p>
            <h1 className="text-base font-bold text-gray-900 mt-0.5">TIA-DAS</h1>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Administrator Sign In</h2>
              <p className="text-sm text-gray-500 mt-1">
                Municipal Tourism Office of Daet
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm leading-relaxed">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                      <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="admin@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="Your password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clipRule="evenodd" />
                        <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                        <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.99] transition-all min-h-[48px] disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Signing in…
                  </>
                ) : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="mt-5 text-xs text-gray-400 text-center leading-relaxed">
            Restricted to authorized administrators of the<br />
            Municipal Tourism Office of Daet, Camarines Norte.
          </p>
        </div>
      </div>
    </div>
  )
}
