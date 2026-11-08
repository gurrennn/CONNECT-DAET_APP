'use client'

import { Card, CardContent, CardHeader } from '../../../components/ui/Card'

interface ListItem {
  name: string
  value: number
  change?: number
}

interface TopBottomListsProps {
  title: string
  items: ListItem[]
  valueFormat?: 'currency' | 'number' | 'percent'
  showChange?: boolean
}

export function TopBottomLists({ 
  title, 
  items, 
  valueFormat = 'number',
  showChange = false 
}: TopBottomListsProps) {
  const formatValue = (value: number) => {
    switch (valueFormat) {
      case 'currency':
        return `₱${value.toLocaleString()}`
      case 'percent':
        return `${value}%`
      default:
        return value.toLocaleString()
    }
  }

  const sortedItems = [...items].sort((a, b) => b.value - a.value)
  const topItems = sortedItems.slice(0, 5)
  const bottomItems = sortedItems.slice(-5).reverse()

  return (
    <Card className="mb-8">
      <CardHeader>
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Performers */}
          <div>
            <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
              <span>🏆</span> Top Performers
            </h4>
            <div className="space-y-2">
              {topItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-green-700">#{index + 1}</span>
                    <span className="text-sm text-gray-900">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatValue(item.value)}
                    </span>
                    {showChange && item.change !== undefined && (
                      <span className={`text-xs ${
                        item.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.change > 0 ? '+' : ''}{item.change.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Performers */}
          <div>
            <h4 className="text-sm font-semibold text-orange-700 mb-3 flex items-center gap-2">
              <span>⚠️</span> Needs Attention
            </h4>
            <div className="space-y-2">
              {bottomItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-orange-700">
                      #{sortedItems.length - index}
                    </span>
                    <span className="text-sm text-gray-900">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatValue(item.value)}
                    </span>
                    {showChange && item.change !== undefined && (
                      <span className={`text-xs ${
                        item.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.change > 0 ? '+' : ''}{item.change.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
