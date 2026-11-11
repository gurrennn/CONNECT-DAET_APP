'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { Button } from './ui/Button'
import { supabase } from '../lib/supabaseClient'
import { isAdminUser } from '../lib/adminAccess'

interface NavigationProps {
  currentPath?: string
}

export default function Navigation({ currentPath }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [authError, setAuthError] = useState('')
  const pathname = usePathname()
  const router = useRouter()
  const activePath = currentPath ?? pathname

  useEffect(() => {
    let active = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    })

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!active) return
        if (error) setAuthError(error.message)
        setUser(data.session?.user ?? null)
        setIsLoading(false)
      })
      .catch((error: unknown) => {
        if (!active) return
        setAuthError(error instanceof Error ? error.message : 'Unable to load your session.')
        setIsLoading(false)
      })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const navigationItems = [
    { name: 'Home', href: '/' },
    ...(isAdminUser(user)
      ? [
          { name: '📊 Analytics', href: '/analytics' },
        ]
      : []),
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return activePath === '/'
    }
    return activePath?.startsWith(href)
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    setAuthError('')
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        setAuthError(error.message)
        return
      }

      setIsMenuOpen(false)
      router.replace('/auth')
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to sign out.')
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              CONNECT-Daet
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  {item.name}
                </Link>
              ))}
              {!isLoading && (user ? (
                <Button variant="secondary" size="sm" onClick={handleSignOut} disabled={isSigningOut}>
                  {isSigningOut ? 'Signing out...' : 'Sign out'}
                </Button>
              ) : (
                <Link href="/auth" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                  Sign in
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    block px-3 py-2 rounded-md text-base font-medium transition-colors
                    ${isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {!isLoading && (user ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full"
                >
                  {isSigningOut ? 'Signing out...' : 'Sign out'}
                </Button>
              ) : (
                <Link
                  href="/auth"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign in
                </Link>
              ))}
            </div>
          </div>
        )}
        {authError && (
          <p role="alert" className="pb-2 text-sm text-red-600">
            Authentication error: {authError}
          </p>
        )}
      </div>
    </nav>
  )
}
