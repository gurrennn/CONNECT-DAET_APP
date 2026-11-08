'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { supabase } from '../../lib/supabaseClient'
import Navigation from '../../components/Navigation'

export default function ExperiencesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/auth')
        return
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.replace('/auth')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const experiences = [
    { id: '1', name: 'Beach Volleyball', participants: 45, status: 'active' },
    { id: '2', name: 'Surfing Lessons', participants: 28, status: 'active' },
    { id: '3', name: 'Cultural Dance Workshop', participants: 32, status: 'active' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎨 Experiences & Activities
          </h1>
          <p className="text-gray-600">
            Activity management, check-ins, and participant tracking
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {experiences.map(exp => (
            <Card key={exp.id}>
              <CardHeader>
                <h3 className="text-lg font-semibold">{exp.name}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{exp.participants}</p>
                <p className="text-sm text-gray-600">participants</p>
                <span className="mt-2 inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {exp.status}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent>
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🚧</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Experiences System In Development</h3>
              <p className="text-gray-600 mb-4">
                Complete activity management including check-ins, ratings,
                and participant analytics coming soon.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>✅ Activity Listings</p>
                <p>✅ Check-in System</p>
                <p>✅ Participant Tracking</p>
                <p>✅ Experience Ratings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
