'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from "../../../components/ui/Card"
import { Button } from "../../../components/ui/Button"
import { supabase } from '../../../lib/supabaseClient'

interface Transaction {
  id: string
  user_id: string
  amount: number
  items: any
  created_at: string
  updated_at: string
  status: 'completed' | 'pending' | 'refunded'
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'all'>('30days')

  useEffect(() => {
    loadTransactions()
  }, [dateRange])

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('shop_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      setTransactions(data || [])
    } catch (error) {
      console.error('Failed to load transactions:', error)
      // Load mock data as fallback
      loadMockTransactions()
    } finally {
      setLoading(false)
    }
  }

  const loadMockTransactions = () => {
    const mock: Transaction[] = [
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
        items: { product_name: 'Pineapple Jam', quantity: 3, product_name_2: 'Tourism Map & Guide', quantity_2: 3 },
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
      },
      {
        id: '4',
        user_id: 'user-101',
        amount: 640,
        items: { product_name: 'Bamboo Water Bottle', quantity: 2 },
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        status: 'completed'
      },
      {
        id: '5',
        user_id: 'user-202',
        amount: 280,
        items: { product_name: 'Daet Coffee Beans', quantity: 1 },
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        status: 'pending'
      }
    ]
    setTransactions(mock)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getItemsDisplay = (items: any) => {
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items)
      } catch {
        return items
      }
    }
    
    if (items.product_name) {
      return `${items.product_name} (${items.quantity || 1})`
    }
    
    return JSON.stringify(items)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const totalRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  const completedTransactions = transactions.filter(t => t.status === 'completed').length

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-gray-600 text-sm mb-2">Total Transactions</p>
              <p className="text-3xl font-bold text-gray-900">{transactions.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-gray-600 text-sm mb-2">Completed</p>
              <p className="text-3xl font-bold text-green-600">{completedTransactions}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-gray-600 text-sm mb-2">Total Revenue</p>
              <p className="text-3xl font-bold text-blue-600">₱{totalRevenue.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={dateRange === 'today' ? 'primary' : 'secondary'}
              onClick={() => setDateRange('today')}
              title="Show today's transactions"
              aria-label="Show today's transactions"
            >
              Today
            </Button>
            <Button
              variant={dateRange === '7days' ? 'primary' : 'secondary'}
              onClick={() => setDateRange('7days')}
              title="Show last 7 days"
              aria-label="Show last 7 days"
            >
              Last 7 Days
            </Button>
            <Button
              variant={dateRange === '30days' ? 'primary' : 'secondary'}
              onClick={() => setDateRange('30days')}
              title="Show last 30 days"
              aria-label="Show last 30 days"
            >
              Last 30 Days
            </Button>
            <Button
              variant={dateRange === 'all' ? 'primary' : 'secondary'}
              onClick={() => setDateRange('all')}
              title="Show all transactions"
              aria-label="Show all transactions"
            >
              All Time
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{transaction.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {getItemsDisplay(transaction.items)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ₱{transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(transaction.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button
                        variant="secondary"
                        title="View transaction details"
                        aria-label={`View details for transaction ${transaction.id}`}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {transactions.length === 0 && (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">💳</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600">Transactions will appear here as they occur</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
