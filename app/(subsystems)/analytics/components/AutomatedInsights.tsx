'use client'

import { Card, CardContent, CardHeader } from '../../../components/ui/Card'
import { useEffect, useState } from 'react'

interface Insight {
  id: string
  type: 'trend' | 'anomaly' | 'opportunity' | 'warning'
  icon: string
  title: string
  description: string
  metric?: string
  change?: string
  priority: 'high' | 'medium' | 'low'
}

interface AutomatedInsightsProps {
  data: {
    visitorSpending: Array<{ month: string; spending: number }>
    footTraffic: Array<{ date: string; visitors: number }>
    sentiment: { positive: number; neutral: number; negative: number }
    resourceUsage: Array<{ facility: string; usage: number }>
  }
}

export function AutomatedInsights({ data }: AutomatedInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate insight generation (in real app, this would call Gemini API)
    const timer = setTimeout(() => {
      const generatedInsights = generateInsights(data)
      setInsights(generatedInsights)
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [data])

  const generateInsights = (analyticsData: any): Insight[] => {
    const insights: Insight[] = []

    // Revenue trend analysis
    if (analyticsData.visitorSpending.length >= 2) {
      const latest = analyticsData.visitorSpending[analyticsData.visitorSpending.length - 1]
      const previous = analyticsData.visitorSpending[analyticsData.visitorSpending.length - 2]
      const change = ((latest.spending - previous.spending) / previous.spending) * 100

      if (change > 15) {
        insights.push({
          id: '1',
          type: 'trend',
          icon: '📈',
          title: 'Strong Revenue Growth',
          description: `Visitor spending increased significantly in ${latest.month}. Consider scaling up operations to capitalize on this momentum.`,
          metric: `₱${latest.spending.toLocaleString()}`,
          change: `+${change.toFixed(1)}%`,
          priority: 'high'
        })
      } else if (change < -10) {
        insights.push({
          id: '1',
          type: 'warning',
          icon: '⚠️',
          title: 'Revenue Declining',
          description: `Spending dropped in ${latest.month}. Review marketing strategy and visitor feedback for improvement opportunities.`,
          metric: `₱${latest.spending.toLocaleString()}`,
          change: `${change.toFixed(1)}%`,
          priority: 'high'
        })
      }
    }

    // Sentiment analysis
    const totalFeedback = analyticsData.sentiment.positive + analyticsData.sentiment.neutral + analyticsData.sentiment.negative
    const negativePercent = totalFeedback > 0 ? (analyticsData.sentiment.negative / totalFeedback) * 100 : 0
    
    if (negativePercent > 15) {
      insights.push({
        id: '2',
        type: 'warning',
        icon: '😟',
        title: 'Elevated Negative Feedback',
        description: `${negativePercent.toFixed(0)}% of feedback is negative. Investigate common complaints and implement corrective actions.`,
        metric: `${analyticsData.sentiment.negative} negative reviews`,
        priority: 'high'
      })
    } else if (negativePercent < 5) {
      insights.push({
        id: '2',
        type: 'trend',
        icon: '😊',
        title: 'Excellent Visitor Satisfaction',
        description: `Only ${negativePercent.toFixed(1)}% negative feedback. Current service quality is exceptional - maintain these standards.`,
        metric: `${((analyticsData.sentiment.positive / totalFeedback) * 100).toFixed(0)}% positive`,
        priority: 'medium'
      })
    }

    // Resource utilization analysis
    const highUsage = analyticsData.resourceUsage.filter((r: { facility: string; usage: number }) => r.usage > 85)
    if (highUsage.length > 0) {
      insights.push({
        id: '3',
        type: 'warning',
        icon: '⚡',
        title: 'Capacity Strain Detected',
        description: `${highUsage.length} facilities are operating above 85% capacity. Consider expanding ${highUsage[0]?.facility} to prevent overcrowding.`,
        metric: `${highUsage[0]?.usage}% capacity`,
        priority: 'high'
      })
    }

    // Traffic pattern insight
    if (analyticsData.footTraffic.length >= 7) {
      const recentTraffic = analyticsData.footTraffic.slice(-7)
      const avgVisitors = recentTraffic.reduce((sum: number, day: { visitors: number }) => sum + day.visitors, 0) / 7
      const peak = Math.max(...recentTraffic.map((d: { visitors: number }) => d.visitors))
      
      if (peak > avgVisitors * 1.5) {
        insights.push({
          id: '4',
          type: 'opportunity',
          icon: '💡',
          title: 'Peak Day Pattern Identified',
          description: `Traffic peaks at ${peak.toLocaleString()} visitors on certain days. Optimize staff scheduling and inventory for these predictable surges.`,
          metric: `${((peak / avgVisitors - 1) * 100).toFixed(0)}% above average`,
          priority: 'medium'
        })
      }
    }

    // Growth opportunity
    insights.push({
      id: '5',
      type: 'opportunity',
      icon: '🚀',
      title: 'Growth Opportunity',
      description: 'Analysis shows strong correlation between museum visits and shop revenue. Consider bundled packages to boost both metrics.',
      priority: 'medium'
    })

    return insights
  }

  const getTypeStyles = (type: Insight['type']) => {
    switch (type) {
      case 'trend':
        return 'border-l-blue-500 bg-blue-50'
      case 'anomaly':
        return 'border-l-purple-500 bg-purple-50'
      case 'opportunity':
        return 'border-l-green-500 bg-green-50'
      case 'warning':
        return 'border-l-red-500 bg-red-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const getPriorityBadge = (priority: Insight['priority']) => {
    const styles = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return (
      <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${styles[priority]}`}>
        {priority.toUpperCase()}
      </span>
    )
  }

  if (loading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-gray-800">🧠 AI-Powered Insights</h2>
          <p className="text-sm text-gray-600">Analyzing your data...</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Generating insights...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-8 border-blue-200">
      <CardHeader>
        <h2 className="text-2xl font-semibold text-gray-800">🧠 AI-Powered Insights</h2>
        <p className="text-sm text-gray-600">Automatically generated observations and recommendations</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`border-l-4 rounded-lg p-4 ${getTypeStyles(insight.type)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{insight.icon}</span>
                    <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                    {getPriorityBadge(insight.priority)}
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                  {(insight.metric || insight.change) && (
                    <div className="flex items-center gap-3 text-sm">
                      {insight.metric && (
                        <span className="font-semibold text-gray-900">{insight.metric}</span>
                      )}
                      {insight.change && (
                        <span className={`font-medium ${
                          insight.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {insight.change}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
