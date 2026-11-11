'use client'

import KPICard from './KPICard'
import { formatPeso, formatNumber, formatPercent, formatRelativeTime } from '../lib/analyticsHelpers'

export default function DashboardOverview({ kpis, loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-gray-200 animate-pulse h-28" />
        ))}
      </div>
    )
  }

  if (!kpis) {
    return (
      <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-5 text-yellow-800 text-sm">
        Dashboard data could not be loaded. Ensure the database schema has been applied and try refreshing.
      </div>
    )
  }

  const cards = [
    {
      title: 'Total Tourist Arrivals',
      value: formatNumber(kpis.totalArrivals),
      subtitle: 'Year-to-date',
      colorClass: 'from-blue-500 to-blue-600',
      change: kpis.growthRate,
      changeLabel: 'vs prior period',
    },
    {
      title: 'Local Tourist Arrivals',
      value: formatNumber(kpis.localArrivals),
      subtitle: 'Year-to-date',
      colorClass: 'from-indigo-500 to-indigo-600',
    },
    {
      title: 'Foreign Tourist Arrivals',
      value: formatNumber(kpis.foreignArrivals),
      subtitle: 'Year-to-date',
      colorClass: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Estimated Tourism Revenue',
      value: formatPeso(kpis.estimatedRevenue, { compact: true }),
      subtitle: 'Year-to-date (estimated)',
      colorClass: 'from-emerald-500 to-emerald-600',
    },
    {
      title: 'Tourism-Related Employment',
      value: formatNumber(kpis.tourismEmployment),
      subtitle: 'Recorded employment count',
      colorClass: 'from-amber-500 to-amber-600',
    },
    {
      title: 'Tourism Growth Rate',
      value: kpis.growthRate != null ? formatPercent(kpis.growthRate) : '—',
      subtitle: 'Last 30 days vs prior 30 days',
      colorClass: kpis.growthRate > 0 ? 'from-green-500 to-green-600' : kpis.growthRate < 0 ? 'from-red-500 to-red-600' : 'from-gray-500 to-gray-600',
    },
    {
      title: 'Statistics Records',
      value: formatNumber(kpis.statisticsRecords),
      subtitle: 'Active records',
      colorClass: 'from-sky-500 to-sky-600',
    },
    {
      title: 'Last Updated',
      value: formatRelativeTime(kpis.lastUpdated),
      subtitle: 'Dashboard refresh',
      colorClass: 'from-slate-500 to-slate-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <KPICard key={card.title} {...card} />
      ))}
    </div>
  )
}
