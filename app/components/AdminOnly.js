'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { isAdminUser } from '../lib/adminAccess'

export default function AdminOnly({ children }) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    let active = true

    const checkAdmin = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (!active) return

        if (error) {
          setAuthError(error.message)
          setIsChecking(false)
          return
        }

        const adminStatus = isAdminUser(user)
        setIsAdmin(adminStatus)
        setIsChecking(false)

        if (!user) {
          router.replace('/auth')
        } else if (!adminStatus) {
          router.replace('/')
        }
      } catch (error) {
        if (!active) return
        setAuthError(error instanceof Error ? error.message : 'Unable to check administrator access.')
        setIsChecking(false)
      }
    }

    void checkAdmin()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      const user = session?.user ?? null
      const adminStatus = isAdminUser(user)
      setIsAdmin(adminStatus)
      if (!user) router.replace('/auth')
      else if (!adminStatus) router.replace('/')
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [router])

  if (authError) {
    return <p role="alert" className="p-6 text-center text-red-600">Authentication error: {authError}</p>
  }

  if (isChecking) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Will redirect
  }

  return children
}
