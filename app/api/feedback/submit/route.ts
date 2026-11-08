import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Simple sentiment analysis based on rating
    let sentiment = 'neutral'
    if (body.rating >= 4) sentiment = 'positive'
    else if (body.rating <= 2) sentiment = 'negative'

    const { data, error } = await supabase
      .from('feedback')
      .insert([
        {
          subsystem: body.subsystem,
          rating: body.rating,
          comment: body.comment,
          sentiment: sentiment
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
      data: data?.[0],
      message: 'Feedback submitted successfully'
    })
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const subsystem = searchParams.get('subsystem')
    
    let query = supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })

    if (subsystem) {
      query = query.eq('subsystem', subsystem)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({
        success: true,
        data: getMockFeedback(),
        source: 'mock'
      })
    }

    // Calculate sentiment distribution
    const sentimentCounts = {
      positive: data?.filter(f => f.sentiment === 'positive').length || 0,
      neutral: data?.filter(f => f.sentiment === 'neutral').length || 0,
      negative: data?.filter(f => f.sentiment === 'negative').length || 0
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      sentiment: sentimentCounts,
      source: 'database'
    })
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

function getMockFeedback() {
  return [
    {
      id: '1',
      subsystem: 'tours',
      rating: 5,
      comment: 'Amazing beach experience!',
      sentiment: 'positive',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      subsystem: 'shop',
      rating: 4,
      comment: 'Great souvenirs, friendly staff',
      sentiment: 'positive',
      created_at: new Date().toISOString()
    }
  ]
}
