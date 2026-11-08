'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from "../../../components/ui/Card"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { supabase } from '../../../lib/supabaseClient'

export default function ShopStats() {
  const [loading, setLoading] = useState(true)
  const [salesData, setSalesData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      // Mock data - replace with real API calls
      const mockSalesData = [
        { date: 'Nov 1', revenue: 8500, transactions: 24 },
        { date: 'Nov 2', revenue: 12300, transactions: 35 },
        { date: 'Nov 3', revenue: 9800, transactions: 28 },
        { date: 'Nov 4', revenue: 15200, transactions: 42 },
        { date: 'Nov 5', revenue: 11000, transactions: 31 },
        { date: 'Nov 6', revenue: 13500, transactions: 38 },
        { date: 'Nov 7', revenue: 16800, transactions: 47 },
      ]

      const mockCategoryData = [
        { name: 'Apparel', value: 35, revenue: 45000 },
        { name: 'Food', value: 25, revenue: 28000 },
        { name: 'Crafts', value: 20, revenue: 22000 },
        { name: 'Accessories', value: 15, revenue: 18000 },
        { name: 'Souvenirs', value: 5, revenue: 8000 }
      ]

      const mockTopProducts = [
        { name: 'Daet T-Shirt', sold: 87, revenue: 39150 },
        { name: 'Pineapple Jam', sold: 156, revenue: 28080 },
        { name: 'Coffee Beans', sold: 92, revenue: 25760 },
        { name: 'Water Bottle', sold: 63, revenue: 20160 },
        { name: 'Handwoven Basket', sold: 45, revenue: 15750 }
      ]

      setSalesData(mockSalesData)
      setCategoryData(mockCategoryData)
      setTopProducts(mockTopProducts)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const totalRevenue = salesData.reduce((sum, day) => sum + day.revenue, 0)
  const totalTransactions = salesData.reduce((sum, day) => sum + day.transactions, 0)
  const avgOrderValue = totalRevenue / totalTransactions

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-gray-600 text-sm mb-2">7-Day Revenue</p>
              <p className="text-2xl font-bold text-blue-600">₱{totalRevenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-gray-600 text-sm mb-2">Transactions</p>
              <p className="text-2xl font-bold text-green-600">{totalTransactions}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-gray-600 text-sm mb-2">Avg Order Value</p>
              <p className="text-2xl font-bold text-purple-600">₱{avgOrderValue.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-gray-600 text-sm mb-2">Growth Rate</p>
              <p className="text-2xl font-bold text-orange-600">+24.5%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Trend Chart */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Daily Sales Trend (Last 7 Days)</h3>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: any, name: any) => {
                  if (name === 'revenue') return [`₱${value.toLocaleString()}`, 'Revenue']
                  return [value, 'Transactions']
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} name="Revenue (₱)" />
              <Line type="monotone" dataKey="transactions" stroke="#10B981" strokeWidth={2} name="Transactions" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Sales by Category</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value}%`, 'Share']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value: any) => [`${value} units`, 'Sold']} />
                <Bar dataKey="sold" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Product Performance</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProducts.map((product, index) => (
                  <tr key={product.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {product.sold} units
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                      ₱{product.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
