'use client'

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, DoughnutChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { CHART_COLORS, PIE_COLORS } from '../lib/analyticsConstants'
import { formatPeso } from '../lib/analyticsHelpers'

// ─── Monthly Arrivals Line / Bar Chart ──────────────────────

export function MonthlyArrivalsChart({ data = [], chartType = 'line' }) {
  const Chart = chartType === 'bar' ? BarChart : LineChart

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Monthly Tourist Arrivals</h3>
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
    </div>
  )
}

// ─── Yearly Growth Bar Chart ─────────────────────────────────

export function YearlyGrowthChart({ data = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Yearly Tourism Growth</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(val) => [Number(val).toLocaleString(), 'Arrivals']}
          />
          <Legend />
          <Bar dataKey="total" name="Total Arrivals" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Local vs Foreign Pie Chart ──────────────────────────────

export function LocalForeignPieChart({ localCount = 0, foreignCount = 0 }) {
  const total = localCount + foreignCount
  const pieData = [
    { name: 'Local Tourists', value: localCount },
    { name: 'Foreign Tourists', value: foreignCount },
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Local vs. Foreign Visitors</h3>
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
    </div>
  )
}

// ─── Revenue Trend Line Chart ────────────────────────────────

export function RevenueTrendChart({ data = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Estimated Tourism Revenue Trend</h3>
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
    </div>
  )
}

// ─── Destination Bar Chart ───────────────────────────────────

export function DestinationChart({ data = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Visitors by Destination</h3>
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
    </div>
  )
}

// ─── Sustainability Radar / Bar ───────────────────────────────

export function SustainabilityBarChart({ data = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Sustainability Indicators</h3>
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
    </div>
  )
}

// ─── Generic Simple Bar Chart ─────────────────────────────────

export function SimpleBarChart({ data = [], xKey = 'name', yKey = 'value', title, color, yFormatter }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      {title && <h3 className="text-base font-semibold text-gray-800 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={yFormatter} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(val) => [yFormatter ? yFormatter(val) : Number(val).toLocaleString(), 'Value']} />
          <Bar dataKey={yKey} fill={color || CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
