'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import { isAdminUser } from '../../lib/adminAccess'
import AnalyticsSidebar from './components/AnalyticsSidebar'
import { ROLE_LABELS } from './lib/analyticsConstants'

export default function AnalyticsLayout({ children }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [adminRole, setAdminRole] = useState('super_admin')
  const [adminName, setAdminName] = useState('')
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    let active = true

    const check = async () => {
      try {
        const { data: { user: u }, error } = await supabase.auth.getUser()
        if (!active) return

        if (error) {
          setAuthError(error.message)
          setChecking(false)
          return
        }

        if (!u) {
          router.replace('/auth')
          return
        }

        if (!isAdminUser(u)) {
          router.replace('/auth')
          return
        }

        // ── Fix 1: Read real name + role from analytics_admin_roles ──
        const { data: roleRow } = await supabase
          .from('analytics_admin_roles')
          .select('full_name, role')
          .eq('supabase_user_id', u.id)
          .eq('is_active', true)
          .maybeSingle()

        if (roleRow) {
          setAdminRole(roleRow.role || 'super_admin')
          setAdminName(roleRow.full_name || u.email?.split('@')[0] || 'Admin')
        } else {
          setAdminName(u.email?.split('@')[0] || 'Admin')
        }

        setChecking(false)
      } catch (err) {
        if (!active) return
        setAuthError(err instanceof Error ? err.message : 'Unable to verify access.')
        setChecking(false)
      }
    }

    check()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      const u = session?.user ?? null
      if (!u) { router.replace('/auth'); return }
      if (!isAdminUser(u)) { router.replace('/auth'); return }
    })

    return () => { active = false; subscription.unsubscribe() }
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace('/auth')
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-3 text-red-500 font-bold">!</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Access Error</h2>
          <p className="text-sm text-red-600 mb-4">{authError}</p>
          <button onClick={() => router.push('/auth')} className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            Go to Sign In
          </button>
        </div>
      </div>
    )
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Verifying access…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex bg-gray-50 z-40">
      {/* Sidebar — real name & role from DB */}
      <AnalyticsSidebar
        adminName={adminName}
        adminRole={adminRole}
        onSignOut={handleSignOut}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 ml-10 md:ml-0">
            <span className="text-sm font-semibold text-blue-600">TIA-DAS</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500 hidden sm:inline">
              Tourism Impact Assessment & Data Analytics System
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Live role badge */}
            <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              {ROLE_LABELS[adminRole] || adminRole}
            </span>
            <span className="text-xs text-gray-400 hidden lg:block">
              Municipal Tourism Office of Daet, Camarines Norte
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
