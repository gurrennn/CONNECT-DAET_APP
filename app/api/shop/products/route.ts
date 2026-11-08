import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Mock products - in production, fetch from a products table
    const products = [
      {
        id: '1',
        name: 'Daet Souvenir T-Shirt',
        description: 'Premium cotton t-shirt with Daet landmark print',
        price: 450,
        category: 'Apparel',
        stock: 125,
        image_url: '/products/tshirt.jpg',
        is_active: true
      },
      {
        id: '2',
        name: 'Pineapple Jam',
        description: 'Locally-made pineapple preserves from Camarines Norte',
        price: 180,
        category: 'Food',
        stock: 48,
        image_url: '/products/jam.jpg',
        is_active: true
      },
      {
        id: '3',
        name: 'Handwoven Basket',
        description: 'Traditional Filipino basket, handcrafted by local artisans',
        price: 350,
        category: 'Crafts',
        stock: 0,
        image_url: '/products/basket.jpg',
        is_active: true
      },
      {
        id: '4',
        name: 'Daet Coffee Beans',
        description: 'Premium Arabica coffee beans, locally grown',
        price: 280,
        category: 'Food',
        stock: 92,
        image_url: '/products/coffee.jpg',
        is_active: true
      },
      {
        id: '5',
        name: 'Tourism Map & Guide',
        description: 'Comprehensive guide to Daet tourist destinations',
        price: 75,
        category: 'Souvenirs',
        stock: 200,
        image_url: '/products/map.jpg',
        is_active: true
      },
      {
        id: '6',
        name: 'Bamboo Water Bottle',
        description: 'Eco-friendly bamboo water bottle with Daet logo',
        price: 320,
        category: 'Accessories',
        stock: 55,
        image_url: '/products/bottle.jpg',
        is_active: true
      }
    ]

    return NextResponse.json({ success: true, data: products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
