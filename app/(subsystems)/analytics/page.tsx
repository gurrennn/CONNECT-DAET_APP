'use client'

import { useEffect, useState, useCallback } from 'react'
import AnalyticsHeader from './components/AnalyticsHeader'
import DashboardOverview from './components/DashboardOverview'
import AnalyticsLoading from './components/AnalyticsLoading'
import {
  MonthlyArrivalsChart,
  YearlyGrowthChart,
  LocalForeignPieChart,
  RevenueTrendChart,
  DestinationChart,
} from './components/TourismChart'
import {
  getDashboardKPIs,
  getMonthlyArrivals,
  getYearlyArrivals,
  getMonthlyRevenue,
} from './lib/analyticsQueries'
import { formatDate } from './lib/analyticsHelpers'

export default function AnalyticsDashboard() {
  const [kpis, setKpis] = useState<any>(null)
  const [monthlyArrivals, setMonthlyArrivals] = useState<Array<{ month: string; local: number; foreign: number; total: number }>>([])
  const [yearlyArrivals, setYearlyArrivals] = useState<Array<{ year: number; local: number; foreign: number; total: number }>>([])
  const [monthlyRevenue, setMonthlyRevenue] = useState<Array<{ month: string; revenue: number }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  const loadData = useCallback(async (year: number) => {
    setRefreshing(true)
    setError(null)
    try {
      const [kpisData, monthly, yearly, revenue] = await Promise.all([
        getDashboardKPIs(),
        getMonthlyArrivals(year),
        getYearlyArrivals(),
        getMonthlyRevenue(year),
      ])
      setKpis(kpisData)
      setMonthlyArrivals(monthly)
      setYearlyArrivals(yearly)
      setMonthlyRevenue(revenue)
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadData(selectedYear)
  }, [selectedYear, loadData])

  // Build destination chart data from kpis (placeholder; real data needs a destination aggregation query)
  const destinationData: any[] = []

  return (
    <div>
      <AnalyticsHeader
        title="Admin Dashboard"
        subtitle={`Tourism Impact Assessment & Data Analytics System — ${new Date().getFullYear()}`}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button
              onClick={() => loadData(selectedYear)}
              disabled={refreshing}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60 flex items-center gap-2 min-h-[40px]"
            >
              {refreshing && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
              {refreshing ? 'Refreshing…' : '↻ Refresh'}
            </button>
          </div>
        }
      />

      {/* Error banner */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <strong>Error:</strong> {error} — The database schema may not yet be applied. Run the SQL migration in Supabase first.
        </div>
      )}

      {/* Loading overlay */}
      {loading ? (
        <AnalyticsLoading message="Loading dashboard data…" />
      ) : (
        <div className="space-y-6">
          {/* KPI Cards */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Key Performance Indicators</h2>
            <DashboardOverview kpis={kpis} loading={loading} />
          </section>

          {/* Fix 2: Empty state banner when no records exist yet */}
          {kpis?.statisticsRecords === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4">
              <span className="text-3xl flex-shrink-0">📭</span>
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">No tourism data yet</h3>
                <p className="text-sm text-amber-800">
                  Charts and KPIs will populate once you add records.
                  Start by going to{' '}
                  <a href="/analytics/statistics" className="underline font-medium">Tourism Statistics → + Add Record</a>
                  {' '}to enter your first tourist arrival data.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <a href="/analytics/statistics" className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 transition">
                    + Add Tourism Statistics
                  </a>
                  <a href="/analytics/economic-impact" className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-800 text-xs font-medium hover:bg-amber-50 transition">
                    + Add Economic Data
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Charts row 1 */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Arrival Trends — {selectedYear}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <MonthlyArrivalsChart data={monthlyArrivals as any} chartType="bar" />
              <LocalForeignPieChart
                localCount={kpis?.localArrivals || 0}
                foreignCount={kpis?.foreignArrivals || 0}
              />
            </div>
          </section>

          {/* Charts row 2 */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Economic & Historical</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <RevenueTrendChart data={monthlyRevenue as any} />
              <YearlyGrowthChart data={yearlyArrivals as any} />
            </div>
          </section>

          {/* Quick Links */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Add Statistic', href: '/analytics/statistics', icon: '📋', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700' },
                { label: 'Economic Data', href: '/analytics/economic-impact', icon: '💰', color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700' },
                { label: 'Sustainability', href: '/analytics/sustainability', icon: '🌿', color: 'bg-teal-50 hover:bg-teal-100 text-teal-700' },
                { label: 'AI Insights', href: '/analytics/insights', icon: '🤖', color: 'bg-purple-50 hover:bg-purple-100 text-purple-700' },
                { label: 'Generate Report', href: '/analytics/reports', icon: '📄', color: 'bg-orange-50 hover:bg-orange-100 text-orange-700' },
                { label: 'Audit Logs', href: '/analytics/audit-logs', icon: '🔍', color: 'bg-gray-50 hover:bg-gray-100 text-gray-700' },
              ].map(item => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`${item.color} rounded-xl p-4 flex flex-col items-center gap-2 text-center transition-colors min-h-[80px] justify-center border border-transparent hover:border-current/10`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs font-medium leading-tight">{item.label}</span>
                </a>
              ))}
            </div>
          </section>

          {/* Info footer */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <strong>📌 Note:</strong> All statistics shown are based on verified records entered by administrators.
            Charts showing no data mean no records have been added yet.
            To populate the dashboard, go to <a href="/analytics/statistics" className="underline font-medium">Tourism Statistics</a> and add records.
          </div>
        </div>
      )}
    </div>
  )
}
