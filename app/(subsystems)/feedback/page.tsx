'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { supabase } from '../../lib/supabaseClient'
import Navigation from '../../components/Navigation'

export default function FeedbackPage() {
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

  const sentimentData = [
    { type: 'Positive', count: 1847, percentage: 72, color: 'green' },
    { type: 'Neutral', count: 543, percentage: 21, color: 'yellow' },
    { type: 'Negative', count: 180, percentage: 7, color: 'red' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            💬 Visitor Feedback
          </h1>
          <p className="text-gray-600">
            Feedback collection, sentiment analysis, and response management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {sentimentData.map(sentiment => (
            <Card key={sentiment.type}>
              <CardHeader>
                <h3 className="text-lg font-semibold">{sentiment.type} Feedback</h3>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold text-${sentiment.color}-600`}>
                  {sentiment.count}
                </p>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`bg-${sentiment.color}-500 h-2 rounded-full`}
                      style={{ width: `${sentiment.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{sentiment.percentage}% of total</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent>
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🚧</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Feedback System In Development</h3>
              <p className="text-gray-600 mb-4">
                Complete feedback management with AI sentiment analysis,
                automated responses, and comprehensive analytics coming soon.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>✅ Rating Collection</p>
                <p>✅ Sentiment Analysis</p>
                <p>✅ Feedback Dashboard</p>
                <p>✅ Response Management</p>
                <p>✅ Trend Analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
