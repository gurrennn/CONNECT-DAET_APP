import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import { Card, CardContent, CardHeader } from '../../../components/ui/Card'

function ChartDetailsButton({
  chartKey,
  onChartClick
}: {
  chartKey: string
  onChartClick?: (chartKey: string) => void
}) {
  if (!onChartClick) return null

  return (
    <button
      type="button"
      onClick={() => onChartClick(chartKey)}
      aria-haspopup="dialog"
      className="mt-1 inline-flex min-h-11 items-center rounded-md text-sm font-medium text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      Chart details
    </button>
  )
}

interface VisitorSpendingChartProps {
  data: Array<{ month: string; spending: number }>
  onChartClick?: (chartKey: string) => void
}

export const VisitorSpendingChart: React.FC<VisitorSpendingChartProps> = ({ data, onChartClick }) => (
  <Card className="transition-shadow hover:shadow-lg">
    <CardHeader>
      <h3 className="text-lg font-semibold text-gray-800">Visitor Spending Trends</h3>
      <ChartDetailsButton chartKey="visitor-spending" onChartClick={onChartClick} />
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(value) => `₱${(value / 1000000).toFixed(1)}M`} />
          <Tooltip 
            formatter={(value) => [`₱${Number(value ?? 0).toLocaleString()}`, 'Spending']}
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
  <Card className="transition-shadow hover:shadow-lg">
    <CardHeader>
      <h3 className="text-lg font-semibold text-gray-800">Daily Foot Traffic</h3>
      <ChartDetailsButton chartKey="foot-traffic" onChartClick={onChartClick} />
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
            formatter={(value) => [Number(value ?? 0).toLocaleString(), 'Visitors']}
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
  <Card className="transition-shadow hover:shadow-lg">
    <CardHeader>
      <h3 className="text-lg font-semibold text-gray-800">Rewards Claimed per Week</h3>
      <ChartDetailsButton chartKey="rewards" onChartClick={onChartClick} />
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip 
            formatter={(value) => [Number(value ?? 0), 'Rewards']}
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
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-800">Visitor Sentiment Analysis</h3>
        <ChartDetailsButton chartKey="sentiment" onChartClick={onChartClick} />
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
  <Card className="transition-shadow hover:shadow-lg">
    <CardHeader>
      <h3 className="text-lg font-semibold text-gray-800">Visitor Demographics</h3>
      <ChartDetailsButton chartKey="demographics" onChartClick={onChartClick} />
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="age_group" type="category" />
          <Tooltip 
            formatter={(value) => [Number(value ?? 0).toLocaleString(), 'Visitors']}
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
  <Card className="transition-shadow hover:shadow-lg">
    <CardHeader>
      <h3 className="text-lg font-semibold text-gray-800">Resource Utilization</h3>
      <ChartDetailsButton chartKey="resource-usage" onChartClick={onChartClick} />
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="facility" />
          <YAxis domain={[0, 100]} />
          <Tooltip 
            formatter={(value) => [`${Number(value ?? 0)}%`, 'Usage']}
            labelFormatter={(label) => `Facility: ${label}`}
          />
          <Legend />
          <Bar dataKey="usage" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
)
