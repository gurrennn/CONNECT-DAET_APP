'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'

export default function ProtectedRoute({ children, requireAuth = true }) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    let active = true

    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (!active) return

        if (error) {
          setAuthError(error.message)
          setIsChecking(false)
          return
        }

        const authenticated = Boolean(user)
        setIsAuthenticated(authenticated)
        setIsChecking(false)

        if (requireAuth && !authenticated) {
          router.replace('/auth')
        }
      } catch (error) {
        if (!active) return
        setAuthError(error instanceof Error ? error.message : 'Unable to check your sign-in status.')
        setIsChecking(false)
      }
    }

    void checkAuth()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      const authenticated = Boolean(session?.user)
      setIsAuthenticated(authenticated)
      if (requireAuth && !authenticated) router.replace('/auth')
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [router, requireAuth])

  if (authError) {
    return <p role="alert" className="p-6 text-center text-red-600">Authentication error: {authError}</p>
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return null // Will redirect
  }

  return children
}
