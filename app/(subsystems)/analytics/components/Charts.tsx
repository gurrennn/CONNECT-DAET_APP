'use client'

import { useState } from 'react'
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import { Card, CardContent, CardHeader } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

const chartInfo = {
  'visitor-spending': {
    title: '💰 Visitor Spending Trends',
    description: 'This line chart displays monthly visitor spending patterns, showing how much money visitors are spending across all CONNECT-DAET services.',
    howItWorks: '• Aggregates transaction data from shop purchases, tour bookings, and experience fees\n• Tracks spending trends over time to identify seasonal patterns\n• Helps forecast revenue and plan marketing campaigns\n• Monitors the effectiveness of pricing strategies',
    metrics: '• Total monthly spending in Philippine Pesos\n• Spending growth rate month-over-month\n• Average spending per visitor\n• Peak spending periods'
  },
  'foot-traffic': {
    title: '👥 Daily Foot Traffic',
    description: 'This bar chart shows the number of visitors to CONNECT-DAET facilities on a daily basis, helping identify peak visitation days.',
    howItWorks: '• Counts visitors from museum QR code scans and experience check-ins\n• Displays daily visitor counts to identify patterns\n• Helps with staffing and resource planning\n• Used to optimize facility operations',
    metrics: '• Daily visitor count\n• Peak traffic days\n• Weekday vs weekend comparison\n• Visitor flow patterns'
  },
  'rewards': {
    title: '🎁 Rewards Claimed per Week',
    description: 'This bar chart tracks how many rewards are being claimed by users each week, showing engagement with the rewards program.',
    howItWorks: '• Monitors reward redemption from the gamification system\n• Tracks weekly reward claim patterns\n• Helps assess the effectiveness of reward incentives\n• Used to optimize reward offerings',
    metrics: '• Weekly rewards claimed\n• Reward redemption rate\n• Popular reward types\n• User engagement with rewards program'
  },
  'sentiment': {
    title: '😊 Visitor Sentiment Analysis',
    description: 'This pie chart shows the distribution of visitor feedback sentiment - positive, neutral, and negative responses across all services.',
    howItWorks: '• Analyzes feedback ratings and reviews from all subsystems\n• Categorizes responses into positive, neutral, and negative\n• Helps identify areas needing improvement\n• Tracks overall visitor satisfaction trends',
    metrics: '• Positive feedback percentage\n• Neutral feedback percentage\n• Negative feedback percentage\n• Overall sentiment score'
  },
  'demographics': {
    title: '👤 Visitor Demographics',
    description: 'This horizontal bar chart displays the age distribution of CONNECT-DAET visitors, helping understand the visitor profile.',
    howItWorks: '• Analyzes user profile data and booking information\n• Groups visitors by age ranges\n• Helps tailor services to target demographics\n• Used for marketing and service planning',
    metrics: '• Visitor count by age group\n• Age distribution percentages\n• Target demographic identification\n• Demographic trends over time'
  },
  'resource-usage': {
    title: '⚡ Resource Utilization',
    description: 'This bar chart shows the percentage of resource usage across different CONNECT-DAET facilities, helping identify capacity and efficiency.',
    howItWorks: '• Monitors facility utilization rates in real-time\n• Tracks energy, water, and space usage\n• Helps identify over-utilized or under-utilized facilities\n• Used for resource optimization and planning',
    metrics: '• Facility usage percentage\n• Capacity utilization rates\n• Peak usage times\n• Resource efficiency scores'
  }
}

interface VisitorSpendingChartProps {
  data: Array<{ month: string; spending: number }>
  onChartClick?: (chartKey: string) => void
}

export const VisitorSpendingChart: React.FC<VisitorSpendingChartProps> = ({ data, onChartClick }) => (
  <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onChartClick?.('visitor-spending')}>
    <CardHeader>
      <h3 className="text-lg font-semibold text-gray-800">Visitor Spending Trends</h3>
      <p className="text-xs text-blue-500">👆 Click to learn more</p>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(value) => `₱${(value / 1000000).toFixed(1)}M`} />
          <Tooltip 
            formatter={(value: number) => [`₱${value.toLocaleString()}`, 'Spending']}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="spending" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={{ fill: '#3B82F6', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
)

interface FootTrafficChartProps {
  data: Array<{ date: string; visitors: number }>
  onChartClick?: (chartKey: string) => void
}

export const FootTrafficChart: React.FC<FootTrafficChartProps> = ({ data, onChartClick }) => (
  <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onChartClick?.('foot-traffic')}>
    <CardHeader>
      <h3 className="text-lg font-semibold text-gray-800">Daily Foot Traffic</h3>
      <p className="text-xs text-blue-500">👆 Click to learn more</p>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => [value.toLocaleString(), 'Visitors']}
            labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
          />
          <Legend />
          <Bar dataKey="visitors" fill="#10B981" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
)

interface RewardsChartProps {
  data: Array<{ week: string; rewards_claimed: number }>
  onChartClick?: (chartKey: string) => void
}

export const RewardsChart: React.FC<RewardsChartProps> = ({ data, onChartClick }) => (
  <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onChartClick?.('rewards')}>
    <CardHeader>
      <h3 className="text-lg font-semibold text-gray-800">Rewards Claimed per Week</h3>
      <p className="text-xs text-blue-500">👆 Click to learn more</p>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => [value, 'Rewards']}
            labelFormatter={(label) => label}
          />
          <Legend />
          <Bar dataKey="rewards_claimed" fill="#8B5CF6" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
)

interface SentimentChartProps {
  data: { positive: number; neutral: number; negative: number }
  onChartClick?: (chartKey: string) => void
}

export const SentimentChart: React.FC<SentimentChartProps> = ({ data, onChartClick }) => {
  const chartData = [
    { name: 'Positive', value: data.positive, color: '#10B981' },
    { name: 'Neutral', value: data.neutral, color: '#F59E0B' },
    { name: 'Negative', value: data.negative, color: '#EF4444' }
  ]

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onChartClick?.('sentiment')}>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-800">Visitor Sentiment Analysis</h3>
        <p className="text-xs text-blue-500">👆 Click to learn more</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface DemographicsChartProps {
  data: Array<{ age_group: string; count: number }>
  onChartClick?: (chartKey: string) => void
}

export const DemographicsChart: React.FC<DemographicsChartProps> = ({ data, onChartClick }) => (
  <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onChartClick?.('demographics')}>
    <CardHeader>
      <h3 className="text-lg font-semibold text-gray-800">Visitor Demographics</h3>
      <p className="text-xs text-blue-500">👆 Click to learn more</p>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="age_group" type="category" />
          <Tooltip 
            formatter={(value: number) => [value.toLocaleString(), 'Visitors']}
            labelFormatter={(label) => `Age: ${label}`}
          />
          <Legend />
          <Bar dataKey="count" fill="#F59E0B" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
)

interface ResourceUsageChartProps {
  data: Array<{ facility: string; usage: number }>
  onChartClick?: (chartKey: string) => void
}

export const ResourceUsageChart: React.FC<ResourceUsageChartProps> = ({ data, onChartClick }) => (
  <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onChartClick?.('resource-usage')}>
    <CardHeader>
      <h3 className="text-lg font-semibold text-gray-800">Resource Utilization</h3>
      <p className="text-xs text-blue-500">👆 Click to learn more</p>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="facility" />
          <YAxis domain={[0, 100]} />
          <Tooltip 
            formatter={(value: number) => [`${value}%`, 'Usage']}
            labelFormatter={(label) => `Facility: ${label}`}
          />
          <Legend />
          <Bar dataKey="usage" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
)
