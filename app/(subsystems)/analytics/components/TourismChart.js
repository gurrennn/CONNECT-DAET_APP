'use client'

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { CHART_COLORS, PIE_COLORS } from '../lib/analyticsConstants'
import { formatPeso } from '../lib/analyticsHelpers'

// ─────────────────────────────────────────────────────────────
// ChartCard — shared wrapper
// Wraps every chart in a card that shows a "?" explain button.
// The explain button (and only the button) triggers onExplain.
// The rest of the card is NOT clickable so Recharts tooltips/
// hover interactions are fully preserved.
// ─────────────────────────────────────────────────────────────
function ChartCard({ title, children, onExplain }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        {onExplain && (
          <button
            onClick={onExplain}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium transition group"
            title="Click to understand this chart"
            aria-label={`Explain ${title}`}
          >
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold leading-none group-hover:bg-blue-700 transition">?</span>
            Explain
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

// ─── Monthly Arrivals Line / Bar Chart ──────────────────────

export function MonthlyArrivalsChart({ data = [], chartType = 'line', onExplain }) {
  const Chart = chartType === 'bar' ? BarChart : LineChart

  return (
    <ChartCard title="Monthly Tourist Arrivals" onExplain={onExplain}>
      <ResponsiveContainer width="100%" height={280}>
        <Chart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(val, name) => [Number(val).toLocaleString(), name]}
            labelFormatter={(l) => `Month: ${l}`}
          />
          <Legend />
          {chartType === 'bar' ? (
            <>
              <Bar dataKey="local" name="Local" fill={CHART_COLORS.primary} />
              <Bar dataKey="foreign" name="Foreign" fill={CHART_COLORS.secondary} />
            </>
          ) : (
            <>
              <Line type="monotone" dataKey="local" name="Local" stroke={CHART_COLORS.primary} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="foreign" name="Foreign" stroke={CHART_COLORS.secondary} strokeWidth={2} dot={{ r: 3 }} />
            </>
          )}
        </Chart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ─── Yearly Growth Bar Chart ─────────────────────────────────

export function YearlyGrowthChart({ data = [], onExplain }) {
  return (
    <ChartCard title="Yearly Tourism Growth" onExplain={onExplain}>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(val) => [Number(val).toLocaleString(), 'Arrivals']} />
          <Legend />
          <Bar dataKey="total" name="Total Arrivals" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ─── Local vs Foreign Pie Chart ──────────────────────────────

export function LocalForeignPieChart({ localCount = 0, foreignCount = 0, onExplain }) {
  const total = localCount + foreignCount
  const pieData = [
    { name: 'Local Tourists', value: localCount },
    { name: 'Foreign Tourists', value: foreignCount },
  ]

  return (
    <ChartCard title="Local vs. Foreign Visitors" onExplain={onExplain}>
      {total === 0 ? (
        <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
          No arrival data recorded yet.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={90}
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              labelLine
            >
              {pieData.map((entry, index) => (
                <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(val) => [Number(val).toLocaleString(), 'Visitors']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

// ─── Revenue Trend Line Chart ────────────────────────────────

export function RevenueTrendChart({ data = [], onExplain }) {
  return (
    <ChartCard title="Estimated Tourism Revenue Trend" onExplain={onExplain}>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(val) => [formatPeso(Number(val)), 'Revenue']}
            labelFormatter={(l) => `Month: ${l}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            name="Revenue (₱)"
            stroke={CHART_COLORS.secondary}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ─── Destination Bar Chart ───────────────────────────────────

export function DestinationChart({ data = [], onExplain }) {
  return (
    <ChartCard title="Visitors by Destination" onExplain={onExplain}>
      {data.length === 0 ? (
        <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
          No destination data available.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="destination" type="category" tick={{ fontSize: 11 }} width={120} />
            <Tooltip formatter={(val) => [Number(val).toLocaleString(), 'Visitors']} />
            <Bar dataKey="total" name="Visitors" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

// ─── Sustainability Radar / Bar ───────────────────────────────

export function SustainabilityBarChart({ data = [], onExplain }) {
  return (
    <ChartCard title="Sustainability Indicators" onExplain={onExplain}>
      {data.length === 0 ? (
        <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
          No sustainability records yet.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="indicator_name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(val) => [Number(val), 'Value']} />
            <Bar dataKey="indicator_value" name="Value" fill={CHART_COLORS.teal} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

// ─── Generic Simple Bar Chart ─────────────────────────────────

export function SimpleBarChart({ data = [], xKey = 'name', yKey = 'value', title, color, yFormatter, onExplain }) {
  return (
    <ChartCard title={title || 'Chart'} onExplain={onExplain}>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={yFormatter} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(val) => [yFormatter ? yFormatter(val) : Number(val).toLocaleString(), 'Value']} />
          <Bar dataKey={yKey} fill={color || CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ─── Revenue Trend (alias used in economic-impact page) ──────
export { RevenueTrendChart as default }
