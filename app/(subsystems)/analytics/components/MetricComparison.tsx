'use client'

import { Card, CardContent, CardHeader } from '../../../components/ui/Card'

interface ComparisonData {
  current: number
  previous: number
  label: string
  format?: 'number' | 'currency' | 'percent'
}

interface MetricComparisonProps {
  data: ComparisonData[]
  periodLabel: string
}

export function MetricComparison({ data, periodLabel }: MetricComparisonProps) {
  const formatValue = (value: number, format?: string) => {
    switch (format) {
      case 'currency':
        return `₱${value.toLocaleString()}`
      case 'percent':
        return `${value}%`
      default:
        return value.toLocaleString()
    }
  }

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { percent: 0, isPositive: false }
    const percent = ((current - previous) / previous) * 100
    return { percent: Math.abs(percent), isPositive: percent >= 0 }
  }

  return (
    <Card className="mb-8 border-purple-200">
      <CardHeader>
        <h2 className="text-2xl font-semibold text-gray-800">📊 Period Comparison</h2>
        <p className="text-sm text-gray-600">Current period vs {periodLabel}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((metric, index) => {
            const change = calculateChange(metric.current, metric.previous)
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-2">{metric.label}</div>
                <div className="flex items-baseline gap-3 mb-2">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatValue(metric.current, metric.format)}
                  </div>
                  <div className={`text-sm font-semibold flex items-center gap-1 ${
                    change.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <span>{change.isPositive ? '↗' : '↘'}</span>
                    <span>{change.percent.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Previous: {formatValue(metric.previous, metric.format)}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
