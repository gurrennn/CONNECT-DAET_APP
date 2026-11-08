import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let query = supabase
      .from('tours_bookings')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({
        success: true,
        data: getMockBookings(),
        source: 'mock'
      })
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      source: 'database'
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('tours_bookings')
      .insert([
        {
          tour_name: body.tour_name,
          price: body.price,
          booking_date: body.booking_date,
          status: 'confirmed'
        }
      ])
      .select()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data?.[0]
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

function getMockBookings() {
  return [
    {
      id: '1',
      tour_name: 'Bagasbas Beach Experience',
      price: 1200,
      booking_date: new Date().toISOString().split('T')[0],
      status: 'confirmed',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      tour_name: 'Daet Heritage Walk',
      price: 800,
      booking_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'confirmed',
      created_at: new Date().toISOString()
    }
  ]
}
