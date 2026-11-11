'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './lib/supabaseClient'
import { isAdminUser } from './lib/adminAccess'

/**
 * Root route — no public homepage.
 * Checks auth state and redirects immediately:
 *   authenticated admin  → /analytics
 *   everyone else        → /auth
 */
export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && isAdminUser(session.user)) {
        router.replace('/analytics')
      } else {
        router.replace('/auth')
      }
    })
  }, [router])

  // Blank screen while the check runs — no flash of content
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  )
}
