'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { supabase } from '../../lib/supabaseClient'
import Navigation from '../../components/Navigation'

export default function MuseumPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [scans, setScans] = useState<any[]>([])

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
      loadScans()
    } catch (error) {
      console.error('Auth check failed:', error)
      router.replace('/auth')
    } finally {
      setLoading(false)
    }
  }

  const loadScans = async () => {
    // Mock data for now
    setScans([
      { id: '1', location: 'Main Exhibit', scans: 234, date: 'Nov 8, 2026' },
      { id: '2', location: 'Heritage Gallery', scans: 187, date: 'Nov 8, 2026' },
      { id: '3', location: 'Interactive Zone', scans: 156, date: 'Nov 8, 2026' },
    ])
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏛️ Museum Experience
          </h1>
          <p className="text-gray-600">
            QR code scanning, exhibit tracking, and visitor analytics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scans.map(scan => (
            <Card key={scan.id}>
              <CardHeader>
                <h3 className="text-lg font-semibold">{scan.location}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{scan.scans}</p>
                <p className="text-sm text-gray-600">scans today</p>
                <p className="text-xs text-gray-500 mt-2">{scan.date}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardContent>
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🚧</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Museum System In Development</h3>
              <p className="text-gray-600 mb-4">
                Full museum management features including QR code generation,
                exhibit analytics, and interactive experiences coming soon.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>✅ QR Code Scanner</p>
                <p>✅ Exhibit Tracking</p>
                <p>✅ Visitor Flow Analytics</p>
                <p>✅ Interactive Exhibits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
