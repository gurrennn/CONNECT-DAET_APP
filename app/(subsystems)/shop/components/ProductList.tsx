'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from "../../../components/ui/Card"
import { Button } from "../../../components/ui/Button"

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  image_url?: string
  is_active: boolean
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'out-of-stock'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      // Mock data - replace with real API call
      const mockProducts: Product[] = [
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
      setProducts(mockProducts)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'active' && product.is_active && product.stock > 0) ||
      (filter === 'out-of-stock' && product.stock === 0)
    
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'primary' : 'secondary'}
                onClick={() => setFilter('all')}
                title="Show all products"
                aria-label="Show all products"
              >
                All Products ({products.length})
              </Button>
              <Button
                variant={filter === 'active' ? 'primary' : 'secondary'}
                onClick={() => setFilter('active')}
                title="Show active products"
                aria-label="Show active products"
              >
                In Stock ({products.filter(p => p.stock > 0).length})
              </Button>
              <Button
                variant={filter === 'out-of-stock' ? 'primary' : 'secondary'}
                onClick={() => setFilter('out-of-stock')}
                title="Show out of stock products"
                aria-label="Show out of stock products"
              >
                Out of Stock ({products.filter(p => p.stock === 0).length})
              </Button>
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="aspect-square bg-gray-200 rounded-md mb-4 flex items-center justify-center text-gray-400">
                {product.image_url ? (
                  <span className="text-6xl">🖼️</span>
                ) : (
                  <span className="text-6xl">📦</span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.category}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{product.description}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-blue-600">
                  ₱{product.price.toFixed(2)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  product.stock > 20 
                    ? 'bg-green-100 text-green-800' 
                    : product.stock > 0
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  className="flex-1"
                  disabled={product.stock === 0}
                  title={product.stock === 0 ? "Product out of stock" : "Add to cart"}
                  aria-label={`Add ${product.name} to cart`}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                <Button
                  variant="secondary"
                  title="View product details"
                  aria-label={`View details for ${product.name}`}
                >
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📦</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your filters or search term</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
