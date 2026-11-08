import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const since = searchParams.get('since') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Call the PostgreSQL function for aggregated metrics
    const { data: metricsData, error: metricsError } = await supabase
      .rpc('get_tourism_ai_metrics', {
        p_since: since
      })

    if (metricsError) {
      console.error('Error calling get_tourism_ai_metrics:', metricsError)
      return NextResponse.json({
        success: true,
        data: getMockMetrics(),
        source: 'mock'
      })
    }

    // Fetch additional detailed data
    const [shopData, toursData, museumData, experiencesData, feedbackData] = await Promise.all([
      supabase.from('shop_transactions').select('*').gte('created_at', since),
      supabase.from('tours_bookings').select('*').gte('created_at', since),
      supabase.from('museum_scans').select('*').gte('created_at', since),
      supabase.from('experiences_checkins').select('*').gte('created_at', since),
      supabase.from('feedback').select('*').gte('created_at', since)
    ])

    return NextResponse.json({
      success: true,
      data: {
        summary: metricsData,
        details: {
          shop_transactions: shopData.data || [],
          tours_bookings: toursData.data || [],
          museum_scans: museumData.data || [],
          experiences_checkins: experiencesData.data || [],
          feedback: feedbackData.data || []
        }
      },
      source: 'database'
    })
  } catch (error) {
    console.error('Error fetching analytics metrics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}

function getMockMetrics() {
  return {
    revenue_php: 2890000,
    transaction_count: 1234,
    visitor_events: 5678,
    average_resource_usage_percent: 67.5,
    resource_readings: 450,
    average_energy_usage: 234.56,
    average_water_usage: 123.45
  }
}
