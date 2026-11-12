'use client'

import KPICard from './KPICard'
import { formatPeso, formatNumber, formatPercent } from '../lib/analyticsHelpers'

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
      change: kpis.growthRate,
      changeLabel: 'vs prior period',
    },
    {
      title: 'Local Tourist Arrivals',
      value: formatNumber(kpis.localArrivals),
      subtitle: 'Year-to-date',
    },
    {
      title: 'Foreign Tourist Arrivals',
      value: formatNumber(kpis.foreignArrivals),
      subtitle: 'Year-to-date',
    },
    {
      title: 'Estimated Tourism Revenue',
      value: formatPeso(kpis.estimatedRevenue, { compact: true }),
      subtitle: 'Year-to-date (estimated)',
    },
    {
      title: 'Tourism-Related Employment',
      value: formatNumber(kpis.tourismEmployment),
      subtitle: 'Recorded employment count',
    },
    {
      title: 'Tourism Growth Rate',
      value: kpis.growthRate != null ? formatPercent(kpis.growthRate) : '—',
      subtitle: 'Last 30 days vs prior 30 days',
    },
    {
      title: 'Statistics Records',
      value: formatNumber(kpis.statisticsRecords),
      subtitle: 'Active records',
    },
    {
      title: 'Peak Destination',
      value: kpis.peakDestination || '—',
      subtitle: 'Most tourist arrivals (YTD)',
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
