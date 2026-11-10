'use client'

import { useState, useEffect, useCallback } from 'react'
import AnalyticsHeader from '../components/AnalyticsHeader'
import AnalyticsLoading from '../components/AnalyticsLoading'
import Breadcrumbs from '../components/Breadcrumbs'
import { ToastContainer, useToast } from '../components/Toast'
import {
  MonthlyArrivalsChart,
  YearlyGrowthChart,
  LocalForeignPieChart,
  RevenueTrendChart,
} from '../components/TourismChart'
import {
  getDashboardKPIs,
  getMonthlyArrivals,
  getYearlyArrivals,
  getMonthlyRevenue,
  getStatisticsRecords,
  getEconomicRecords,
  saveInsight,
} from '../lib/analyticsQueries'
import { formatPeso, formatNumber, formatPercent, formatDate } from '../lib/analyticsHelpers'
import { supabase } from '../../../lib/supabaseClient'

// ─── Rule-Based AI Engine ────────────────────────────────────

function generateRuleBasedInsights(kpis, monthlyArrivals, monthlyRevenue) {
  const insights = []
  const today = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long' })

  if (!kpis) {
    return [{
      type: 'info',
      title: 'Insufficient Data',
      body: 'No tourism statistics have been recorded yet. Add data in Tourism Statistics to generate insights.',
      icon: 'ℹ️',
    }]
  }

  // Arrival trend
  const arrivals = monthlyArrivals.filter(m => m.total > 0)
  if (arrivals.length >= 2) {
    const last = arrivals[arrivals.length - 1]
    const prev = arrivals[arrivals.length - 2]
    const change = prev.total > 0 ? ((last.total - prev.total) / prev.total) * 100 : 0
    if (change > 15) {
      insights.push({
        type: 'positive',
        title: `Strong Arrival Growth in ${last.month}`,
        body: `Tourist arrivals increased by ${change.toFixed(1)}% compared to the previous month (${prev.total.toLocaleString()} → ${last.total.toLocaleString()}). This indicates positive momentum in Daet's tourism sector.`,
        icon: '📈',
        recommendation: 'Consider increasing staffing and facilities at high-traffic destinations to maintain service quality.',
      })
    } else if (change < -15) {
      insights.push({
        type: 'warning',
        title: `Decline in Arrivals — ${last.month}`,
        body: `Tourist arrivals dropped by ${Math.abs(change).toFixed(1)}% from ${prev.total.toLocaleString()} to ${last.total.toLocaleString()}. This warrants attention and investigation.`,
        icon: '📉',
        recommendation: 'Review marketing campaigns, accessibility, and any events that may have deterred visitors this period.',
      })
    } else {
      insights.push({
        type: 'neutral',
        title: 'Stable Arrival Trend',
        body: `Tourist arrivals are relatively stable (${change >= 0 ? '+' : ''}${change.toFixed(1)}% vs prior month). Total arrivals for the latest month: ${last.total.toLocaleString()}.`,
        icon: '→',
      })
    }
  }

  // Local vs Foreign ratio
  if (kpis.totalArrivals > 0) {
    const foreignRatio = (kpis.foreignArrivals / kpis.totalArrivals) * 100
    if (foreignRatio > 20) {
      insights.push({
        type: 'positive',
        title: 'Strong International Visitor Interest',
        body: `Foreign tourists represent ${foreignRatio.toFixed(1)}% of total arrivals (${kpis.foreignArrivals.toLocaleString()} visitors). This is a healthy international market share.`,
        icon: '✈️',
        recommendation: 'Develop multilingual tourism materials and enhance international marketing through DOT partnerships.',
      })
    } else if (foreignRatio < 5 && kpis.totalArrivals > 50) {
      insights.push({
        type: 'info',
        title: 'Primarily Domestic Tourism',
        body: `${foreignRatio.toFixed(1)}% of visitors are foreign tourists. The market is predominantly domestic. This is normal for many LGUs.`,
        icon: '🏠',
        recommendation: 'Focus on domestic tourism campaigns while exploring opportunities to attract regional international visitors.',
      })
    }
  }

  // Revenue insight
  const revenueData = monthlyRevenue.filter(m => m.revenue > 0)
  if (revenueData.length > 0) {
    const totalRev = revenueData.reduce((s, m) => s + m.revenue, 0)
    const avgRev = totalRev / revenueData.length
    const lastRev = revenueData[revenueData.length - 1]

    if (lastRev.revenue > avgRev * 1.2) {
      insights.push({
        type: 'positive',
        title: `Above-Average Revenue — ${lastRev.month}`,
        body: `Estimated tourism revenue in ${lastRev.month} (${formatPeso(lastRev.revenue, { compact: true })}) is 20%+ above the ${revenueData.length}-month average (${formatPeso(avgRev, { compact: true })}).`,
        icon: '💰',
        recommendation: 'Identify which activities or events drove this increase and replicate the approach.',
      })
    } else if (lastRev.revenue < avgRev * 0.7 && revenueData.length >= 3) {
      insights.push({
        type: 'warning',
        title: `Below-Average Revenue — ${lastRev.month}`,
        body: `Estimated revenue of ${formatPeso(lastRev.revenue, { compact: true })} is notably below the average of ${formatPeso(avgRev, { compact: true })}.`,
        icon: '⚠️',
        recommendation: 'Review if off-peak promotions or special packages could help sustain economic activity during low seasons.',
      })
    }
  }

  // Forecasting
  if (monthlyArrivals.length >= 3) {
    const withData = monthlyArrivals.filter(m => m.total > 0)
    if (withData.length >= 3) {
      const recent = withData.slice(-3)
      const avg = recent.reduce((s, m) => s + m.total, 0) / 3
      const forecast = Math.round(avg * 1.05)
      insights.push({
        type: 'forecast',
        title: 'Arrival Forecast (Next Period)',
        body: `Based on the 3-month rolling average (${Math.round(avg).toLocaleString()} arrivals/month), the projected arrivals for the next period is approximately ${forecast.toLocaleString()}.`,
        icon: '🔮',
        disclaimer: 'This is a simple trend-based estimate, not an AI prediction. Actual values may vary.',
      })
    }
  }

  // General recommendation
  insights.push({
    type: 'recommendation',
    title: 'General Tourism Development Recommendation',
    body: 'Based on current records, the Municipal Tourism Office should focus on consistent data collection to improve forecasting accuracy. Regular reporting and quarterly reviews help identify patterns earlier.',
    icon: '💡',
    recommendation: 'Schedule monthly data input sessions and quarterly insight reviews with tourism stakeholders.',
  })

  return insights
}

const INSIGHT_COLORS = {
  positive: 'bg-green-50 border-green-200 text-green-900',
  warning: 'bg-amber-50 border-amber-200 text-amber-900',
  neutral: 'bg-blue-50 border-blue-200 text-blue-900',
  info: 'bg-sky-50 border-sky-200 text-sky-900',
  forecast: 'bg-purple-50 border-purple-200 text-purple-900',
  recommendation: 'bg-indigo-50 border-indigo-200 text-indigo-900',
}

export default function InsightsPage() {
  const [kpis, setKpis] = useState(null)
  const [monthlyArrivals, setMonthlyArrivals] = useState([])
  const [yearlyArrivals, setYearlyArrivals] = useState([])
  const [monthlyRevenue, setMonthlyRevenue] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiReport, setAiReport] = useState('')
  const [aiError, setAiError] = useState('')
  const [savingInsight, setSavingInsight] = useState(false)
  const [savedMsg, setSavedMsg] = useState(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  const loadData = useCallback(async (year) => {
    setLoading(true)
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
    } catch (err) {
      setError(err.message || 'Failed to load analytics data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData(selectedYear) }, [selectedYear, loadData])

  const ruleInsights = generateRuleBasedInsights(kpis, monthlyArrivals, monthlyRevenue)

  const generateAiReport = async () => {
    setAiLoading(true)
    setAiError('')
    setAiReport('')
    try {
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession()
      if (sessionErr || !session) throw new Error('Session expired. Please sign in again.')

      const response = await fetch('/api/ai-tourism-report', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'AI report generation failed.')
      if (!result.report) throw new Error('AI service returned an empty report.')
      setAiReport(result.report)
    } catch (err) {
      setAiError(err.message || 'Unable to generate AI report.')
    } finally {
      setAiLoading(false)
    }
  }

  const saveCurrentInsight = async () => {
    setSavingInsight(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await saveInsight({
        generated_at: new Date().toISOString(),
        insight_type: 'rule_based',
        content: JSON.stringify(ruleInsights),
        generated_by: user?.id,
        data_period: `${selectedYear}`,
      })
      setSavedMsg('Insights saved successfully.')
      setTimeout(() => setSavedMsg(null), 3000)
    } catch (err) {
      setError(err.message || 'Failed to save insights.')
    } finally {
      setSavingInsight(false)
    }
  }

  if (loading) return <AnalyticsLoading message="Loading analytics data…" />

  return (
    <div>
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/analytics' },
        { label: 'Data Analytics & AI Insights' },
      ]} />
      <AnalyticsHeader
        title="Data Analytics & AI Insights"
        subtitle="Analyze tourism trends and receive intelligent recommendations"
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
              onClick={saveCurrentInsight}
              disabled={savingInsight}
              className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition min-h-[44px] disabled:opacity-60"
            >
              {savingInsight ? 'Saving…' : '💾 Save Insights'}
            </button>
          </div>
        }
      />

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</div>}
      {savedMsg && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">✅ {savedMsg}</div>}

      <div className="space-y-6">
        {/* Summary Stats */}
        {kpis && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Arrivals (YTD)', value: formatNumber(kpis.totalArrivals), icon: '🧳' },
              { label: 'Estimated Revenue (YTD)', value: formatPeso(kpis.estimatedRevenue, { compact: true }), icon: '💰' },
              { label: 'Growth Rate', value: kpis.growthRate != null ? formatPercent(kpis.growthRate) : '—', icon: '📈' },
              { label: 'Statistics Records', value: formatNumber(kpis.statisticsRecords), icon: '📋' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{stat.icon}</span>
                  <span className="text-xs text-gray-500">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Charts Grid */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Tourism Trend Visualizations — {selectedYear}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <MonthlyArrivalsChart data={monthlyArrivals} chartType="line" />
            <LocalForeignPieChart
              localCount={kpis?.localArrivals || 0}
              foreignCount={kpis?.foreignArrivals || 0}
            />
            <RevenueTrendChart data={monthlyRevenue} />
            <YearlyGrowthChart data={yearlyArrivals} />
          </div>
        </section>

        {/* Rule-Based Insights */}
        <section id="ai">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Analytics-Based Insights</h2>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Rule-Based Engine</span>
          </div>
          <div className="space-y-3">
            {ruleInsights.map((insight, idx) => (
              <div key={idx} className={`rounded-xl border p-4 ${INSIGHT_COLORS[insight.type] || INSIGHT_COLORS.info}`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{insight.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1">{insight.title}</h3>
                    <p className="text-sm opacity-90">{insight.body}</p>
                    {insight.recommendation && (
                      <p className="text-xs mt-2 opacity-80 italic">
                        💡 <strong>Recommendation:</strong> {insight.recommendation}
                      </p>
                    )}
                    {insight.disclaimer && (
                      <p className="text-xs mt-2 opacity-70 italic">⚠️ {insight.disclaimer}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Gemini AI Report */}
        <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-gray-900">AI-Powered Tourism Report</h2>
              <p className="text-xs text-gray-500 mt-0.5">Powered by Google Gemini — uses live 30-day aggregates from the database</p>
            </div>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Gemini API</span>
          </div>

          {aiError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              ⚠️ {aiError}
              {aiError.includes('API') && (
                <span className="block mt-1 text-xs text-red-500">
                  If the API is unavailable, use the Rule-Based Insights above for analysis.
                </span>
              )}
            </div>
          )}

          {aiReport && (
            <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 whitespace-pre-wrap font-mono">
              {aiReport}
            </div>
          )}

          <button
            onClick={generateAiReport}
            disabled={aiLoading}
            className="px-5 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition min-h-[44px] disabled:opacity-60 flex items-center gap-2"
          >
            {aiLoading && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
            {aiLoading ? 'Generating AI Report…' : '🤖 Generate AI Tourism Insight'}
          </button>
          <p className="text-xs text-gray-400 mt-2">
            AI-generated content is for guidance only. Always verify recommendations with actual tourism data.
          </p>
        </section>
      </div>
    </div>
  )
}
