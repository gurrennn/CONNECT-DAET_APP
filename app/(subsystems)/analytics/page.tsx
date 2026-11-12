'use client'

import { useEffect, useState, useCallback } from 'react'
import AnalyticsHeader from './components/AnalyticsHeader'
import DashboardOverview from './components/DashboardOverview'
import AnalyticsLoading from './components/AnalyticsLoading'
import ChartExplainModal from './components/ChartExplainModal'
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
  getDestinationBreakdown,
  getSatisfactionScore,
} from './lib/analyticsQueries'
import { formatDate } from './lib/analyticsHelpers'

export default function AnalyticsDashboard() {
  const [kpis, setKpis] = useState<any>(null)
  const [monthlyArrivals, setMonthlyArrivals] = useState<Array<{ month: string; local: number; foreign: number; total: number }>>([])
  const [yearlyArrivals, setYearlyArrivals] = useState<Array<{ year: number; local: number; foreign: number; total: number }>>([])
  const [monthlyRevenue, setMonthlyRevenue] = useState<Array<{ month: string; revenue: number }>>([])
  const [destinationData, setDestinationData] = useState<Array<{ destination: string; total: number; local: number; foreign: number }>>([])
  const [satisfaction, setSatisfaction] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // Chart explain modal state
  const [explainModal, setExplainModal] = useState<{ open: boolean; chartType: string; data: any; extra?: any }>({
    open: false, chartType: '', data: null,
  })
  const openExplain = (chartType: string, data: any, extra?: any) =>
    setExplainModal({ open: true, chartType, data, extra })
  const closeExplain = () => setExplainModal(prev => ({ ...prev, open: false }))

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  const loadData = useCallback(async (year: number) => {
    setRefreshing(true)
    setError(null)
    try {
      const [kpisData, monthly, yearly, revenue, destinations, satisfactionData] = await Promise.all([
        getDashboardKPIs(year),
        getMonthlyArrivals(year),
        getYearlyArrivals(),
        getMonthlyRevenue(year),
        getDestinationBreakdown(year),
        getSatisfactionScore(),
      ])
      setKpis(kpisData)
      setMonthlyArrivals(monthly)
      setYearlyArrivals(yearly)
      setMonthlyRevenue(revenue)
      setDestinationData(destinations)
      setSatisfaction(satisfactionData)
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
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white"
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
            <div className="bg-gray-200/80 border border-gray-300 rounded-xl p-5 flex items-start gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">No tourism data yet</h3>
                <p className="text-sm text-gray-600">
                  Charts and KPIs will populate once you add records. Start by going to{' '}
                  <a href="/analytics/statistics" className="underline font-medium text-blue-600">Tourism Statistics</a>
                  {' '}to enter your first tourist arrival data.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <a href="/analytics/statistics" className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition">
                    + Add Tourism Statistics
                  </a>
                  <a href="/analytics/economic-impact" className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition">
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
              <MonthlyArrivalsChart
                data={monthlyArrivals as any}
                chartType="bar"
                onExplain={() => openExplain('monthly_arrivals', monthlyArrivals)}
              />
              <LocalForeignPieChart
                localCount={kpis?.localArrivals || 0}
                foreignCount={kpis?.foreignArrivals || 0}
                onExplain={() => openExplain('local_foreign', null, { localCount: kpis?.localArrivals || 0, foreignCount: kpis?.foreignArrivals || 0 })}
              />
            </div>
          </section>

          {/* Charts row 2 */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Economic & Historical</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <RevenueTrendChart
                data={monthlyRevenue as any}
                onExplain={() => openExplain('revenue_trend', monthlyRevenue)}
              />
              <YearlyGrowthChart
                data={yearlyArrivals as any}
                onExplain={() => openExplain('yearly_growth', yearlyArrivals)}
              />
            </div>
          </section>

          {/* Charts row 3 — Destination breakdown + Satisfaction */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Cross-System Intelligence
              <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-normal normal-case">
                CONNECT-DAET Integration
              </span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <DestinationChart
                data={destinationData as any}
                onExplain={() => openExplain('destination', destinationData)}
              />

              {/* Satisfaction KPI card from Subsystem 9 */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-800">Tourist Satisfaction Score</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${satisfaction?.isLive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {satisfaction?.isLive ? 'Live · Subsystem 9' : 'Awaiting Subsystem 9'}
                  </span>
                </div>

                {satisfaction?.isLive && satisfaction?.avgScore !== null ? (
                  <div>
                    {/* Score ring */}
                    <div className="flex items-center gap-6 mb-5">
                      <div className="relative flex items-center justify-center w-24 h-24">
                        <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                          <circle
                            cx="18" cy="18" r="15.9" fill="none"
                            stroke={satisfaction.avgScore >= 4 ? '#10b981' : satisfaction.avgScore >= 3 ? '#f59e0b' : '#ef4444'}
                            strokeWidth="3"
                            strokeDasharray={`${(satisfaction.avgScore / 5) * 100} 100`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <div className="text-2xl font-bold text-gray-900">{satisfaction.avgScore}</div>
                          <div className="text-xs text-gray-400">/5</div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-2">Based on {satisfaction.totalFeedback} feedback submissions</p>
                        <div className="space-y-1">
                          {[
                            { label: 'Positive', count: satisfaction.positive, color: 'bg-green-500' },
                            { label: 'Neutral', count: satisfaction.neutral, color: 'bg-yellow-400' },
                            { label: 'Negative', count: satisfaction.negative, color: 'bg-red-400' },
                          ].map(({ label, count, color }) => (
                            <div key={label} className="flex items-center gap-2 text-xs text-gray-600">
                              <div className={`w-2 h-2 rounded-full ${color}`} />
                              <span className="w-14">{label}</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${color}`}
                                  style={{ width: `${satisfaction.totalFeedback > 0 ? (count / satisfaction.totalFeedback) * 100 : 0}%` }}
                                />
                              </div>
                              <span className="w-6 text-right">{count}</span>
                            </div>
                          ))}
                        </div>
                        {satisfaction.trend != null && (
                          <p className={`text-xs mt-2 font-medium ${satisfaction.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {satisfaction.trend >= 0 ? '↑' : '↓'} {Math.abs(satisfaction.trend).toFixed(2)} pts vs prior period
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-center gap-3">
                    <p className="text-sm text-gray-500 max-w-xs">
                      Satisfaction scores will appear here once <strong>Subsystem 9</strong> (Emoji-Based Sentiment Analysis) starts sending feedback data via the ingest API.
                    </p>
                    <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      POST /api/analytics/ingest
                    </code>
                  </div>
                )}
              </div>
            </div>
          </section>




        </div>
      )}

      {/* Chart Explanation Modal */}
      <ChartExplainModal
        open={explainModal.open}
        onClose={closeExplain}
        chartType={explainModal.chartType}
        data={explainModal.data}
        extra={explainModal.extra}
      />
    </div>
  )
}
