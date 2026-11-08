import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    
    // Fetch real transactions from Supabase
    const { data, error } = await supabase
      .from('shop_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Supabase error:', error)
      // Return mock data as fallback
      return NextResponse.json({
        success: true,
        data: getMockTransactions(),
        source: 'mock'
      })
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      source: 'database'
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

function getMockTransactions() {
  return [
    {
      id: '1',
      user_id: 'user-123',
      amount: 450,
      items: { product_name: 'Daet Souvenir T-Shirt', quantity: 1 },
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: 'completed'
    },
    {
      id: '2',
      user_id: 'user-456',
      amount: 810,
      items: { products: [
        { name: 'Pineapple Jam', quantity: 3, price: 180 },
        { name: 'Tourism Map & Guide', quantity: 3, price: 75 }
      ]},
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      status: 'completed'
    },
    {
      id: '3',
      user_id: 'user-789',
      amount: 350,
      items: { product_name: 'Handwoven Basket', quantity: 1 },
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      status: 'completed'
    }
  ]
}
