'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { supabase } from '../../lib/supabaseClient'
import Navigation from '../../components/Navigation'

export default function RewardsPage() {
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

  const badges = [
    { id: '1', name: 'First Visit', earned: 1248, icon: '🎖️' },
    { id: '2', name: 'Beach Explorer', earned: 892, icon: '🏖️' },
    { id: '3', name: 'Cultural Enthusiast', earned: 654, icon: '🎭' },
    { id: '4', name: 'Foodie', earned: 523, icon: '🍽️' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏆 Rewards Program
          </h1>
          <p className="text-gray-600">
            Loyalty points, badges, and gamification system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {badges.map(badge => (
            <Card key={badge.id}>
              <CardHeader>
                <div className="text-center">
                  <span className="text-5xl mb-2 block">{badge.icon}</span>
                  <h3 className="text-lg font-semibold">{badge.name}</h3>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-center">
                  <span className="text-2xl font-bold text-purple-600">{badge.earned}</span>
                  <span className="text-sm text-gray-600 block">users earned</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent>
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🚧</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Rewards System In Development</h3>
              <p className="text-gray-600 mb-4">
                Full loyalty program with points, achievements, rewards redemption,
                and leaderboards coming soon.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>✅ Points System</p>
                <p>✅ Badge Achievements</p>
                <p>✅ Reward Redemption</p>
                <p>✅ Gamification Elements</p>
                <p>✅ Leaderboards</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
