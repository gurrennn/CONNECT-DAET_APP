'use client'

import { Card, CardContent } from '../../../components/ui/Card'

interface StatCardProps {
  icon: string
  label: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'stable'
  format?: 'currency' | 'number' | 'percent'
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

export function StatCard({ 
  icon, 
  label, 
  value, 
  change, 
  trend,
  format = 'number',
  color = 'blue' 
}: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-600 to-blue-700',
    green: 'from-green-600 to-green-700',
    purple: 'from-purple-600 to-purple-700',
    orange: 'from-orange-600 to-orange-700',
    red: 'from-red-600 to-red-700'
  }

  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val
    
    switch (format) {
      case 'currency':
        return `₱${val.toLocaleString()}`
      case 'percent':
        return `${val}%`
      default:
        return val.toLocaleString()
    }
  }

  const getTrendIcon = () => {
    if (trend === 'up') return '↗️'
    if (trend === 'down') return '↘️'
    return '→'
  }

  return (
    <Card className={`bg-gradient-to-r ${colorClasses[color]} text-white hover:shadow-lg transition-shadow`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <span className="text-3xl">{icon}</span>
          {trend && (
            <span className="text-2xl">{getTrendIcon()}</span>
          )}
        </div>
        <div className="text-3xl font-bold mb-2 animate-count-up">
          {formatValue(value)}
        </div>
        <div className="text-sm opacity-90 mb-1">{label}</div>
        {change !== undefined && (
          <div className={`text-xs font-medium ${
            change >= 0 ? 'text-green-200' : 'text-red-200'
          }`}>
            {change >= 0 ? '+' : ''}{change.toFixed(1)}% vs previous period
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface QuickStatsProps {
  totalRevenue: number
  totalVisitors: number
  avgSatisfaction: number
  sustainabilityScore: number
}

export function QuickStats({ 
  totalRevenue, 
  totalVisitors, 
  avgSatisfaction, 
  sustainabilityScore 
}: QuickStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        icon="💰"
        label="Total Revenue"
        value={totalRevenue}
        format="currency"
        trend="up"
        change={15.3}
        color="green"
      />
      <StatCard
        icon="👥"
        label="Total Visitors"
        value={totalVisitors}
        format="number"
        trend="up"
        change={8.7}
        color="blue"
      />
      <StatCard
        icon="😊"
        label="Satisfaction Score"
        value={avgSatisfaction}
        format="percent"
        trend="stable"
        change={2.1}
        color="purple"
      />
      <StatCard
        icon="🌱"
        label="Sustainability Score"
        value={sustainabilityScore}
        format="number"
        trend="up"
        change={5.4}
        color="orange"
      />
    </div>
  )
}
