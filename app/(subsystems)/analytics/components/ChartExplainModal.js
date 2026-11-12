'use client'

import { useEffect, useRef } from 'react'
import { formatPeso, formatNumber, formatPercent } from '../lib/analyticsHelpers'

// ─────────────────────────────────────────────────────────────
// ChartExplainModal
// A single reusable modal that renders a contextual explanation
// for any chart in the TIA-DAS dashboard.
//
// Props:
//   open        – boolean, controls visibility
//   onClose     – function, called when user dismisses
//   chartType   – string key identifying which chart (see EXPLANATIONS below)
//   data        – the actual chart data array/object (drives dynamic analysis)
//   extra       – optional extra context (e.g. { localCount, foreignCount })
// ─────────────────────────────────────────────────────────────

// ── Section component ─────────────────────────────────────────
function Section({ icon, title, children, accent = 'blue' }) {
  return (
    <div className="bg-gray-200/80 border border-gray-300 rounded-xl p-4">
      <h4 className="font-semibold text-sm text-gray-700 mb-2">{title}</h4>
      <div className="text-sm leading-relaxed space-y-1 text-gray-600">{children}</div>
    </div>
  )
}

function Bullet({ children }) {
  return <p className="flex gap-2"><span className="mt-0.5 shrink-0">•</span><span>{children}</span></p>
}

// ── Dynamic analysis functions — one per chart type ───────────

function analyzeMonthlyArrivals(data = []) {
  const withData = data.filter(m => m.total > 0)
  if (withData.length === 0) {
    return { hasData: false }
  }

  const peak = withData.reduce((a, b) => a.total > b.total ? a : b)
  const lowest = withData.reduce((a, b) => a.total < b.total ? a : b)
  const totalAll = withData.reduce((s, m) => s + m.total, 0)
  const avgMonthly = Math.round(totalAll / withData.length)
  const totalLocal = withData.reduce((s, m) => s + (m.local || 0), 0)
  const totalForeign = withData.reduce((s, m) => s + (m.foreign || 0), 0)
  const foreignPct = totalAll > 0 ? ((totalForeign / totalAll) * 100).toFixed(1) : 0

  // Month-over-month trend for the last two data points
  let momTrend = null
  if (withData.length >= 2) {
    const last = withData[withData.length - 1]
    const prev = withData[withData.length - 2]
    const change = prev.total > 0 ? ((last.total - prev.total) / prev.total * 100).toFixed(1) : null
    momTrend = { last, prev, change }
  }

  return { hasData: true, peak, lowest, totalAll, avgMonthly, totalLocal, totalForeign, foreignPct, momTrend, withData }
}

function analyzeLocalForeign(localCount = 0, foreignCount = 0) {
  const total = localCount + foreignCount
  if (total === 0) return { hasData: false }

  const localPct = ((localCount / total) * 100).toFixed(1)
  const foreignPct = ((foreignCount / total) * 100).toFixed(1)
  const dominant = localCount >= foreignCount ? 'local' : 'foreign'

  return { hasData: true, total, localCount, foreignCount, localPct, foreignPct, dominant }
}

function analyzeRevenueTrend(data = []) {
  const withData = data.filter(m => m.revenue > 0)
  if (withData.length === 0) return { hasData: false }

  const peak = withData.reduce((a, b) => a.revenue > b.revenue ? a : b)
  const totalRevenue = withData.reduce((s, m) => s + m.revenue, 0)
  const avg = totalRevenue / withData.length

  let momTrend = null
  if (withData.length >= 2) {
    const last = withData[withData.length - 1]
    const prev = withData[withData.length - 2]
    const change = prev.revenue > 0 ? ((last.revenue - prev.revenue) / prev.revenue * 100).toFixed(1) : null
    momTrend = { last, prev, change }
  }

  return { hasData: true, peak, totalRevenue, avg, momTrend, withData }
}

function analyzeYearlyGrowth(data = []) {
  const withData = data.filter(d => d.total > 0)
  if (withData.length === 0) return { hasData: false }

  const peak = withData.reduce((a, b) => a.total > b.total ? a : b)
  const latest = withData[withData.length - 1]

  let yoyTrend = null
  if (withData.length >= 2) {
    const prev = withData[withData.length - 2]
    const change = prev.total > 0 ? ((latest.total - prev.total) / prev.total * 100).toFixed(1) : null
    yoyTrend = { latest, prev, change }
  }

  return { hasData: true, peak, latest, yoyTrend, withData }
}

function analyzeDestinations(data = []) {
  if (!data || data.length === 0) return { hasData: false }

  const sorted = [...data].sort((a, b) => b.total - a.total)
  const top = sorted[0]
  const bottom = sorted[sorted.length - 1]
  const totalVisitors = sorted.reduce((s, d) => s + d.total, 0)
  const topShare = totalVisitors > 0 ? ((top.total / totalVisitors) * 100).toFixed(1) : 0

  return { hasData: true, sorted, top, bottom, totalVisitors, topShare }
}

function analyzeSustainability(data = []) {
  if (!data || data.length === 0) return { hasData: false }

  const sorted = [...data].sort((a, b) => (b.indicator_value || 0) - (a.indicator_value || 0))
  const highest = sorted[0]
  const lowest = sorted[sorted.length - 1]

  return { hasData: true, sorted, highest, lowest, count: data.length }
}

// ── Main explanation renderer ─────────────────────────────────

function renderExplanation(chartType, data, extra) {

  // ── Monthly Tourist Arrivals ──────────────────────────────
  if (chartType === 'monthly_arrivals') {
    const a = analyzeMonthlyArrivals(data)
    return {
      title: 'Monthly Tourist Arrivals',
      icon: 'chart',
      color: 'blue',
      sections: [
        {
          icon: '1.', title: 'What Does This Graph Show?', accent: 'blue',
          content: (
            <p>This graph shows how many tourists visited Daet each month during the selected year. It is split into two groups: <strong>Local tourists</strong> (from within the Philippines) and <strong>Foreign tourists</strong> (from other countries), so you can see which group visits more and when.</p>
          ),
        },
        {
          icon: '2.', title: 'How to Read This Graph', accent: 'teal',
          content: (
            <>
              <Bullet>The <strong>horizontal axis (bottom)</strong> shows the months of the year (Jan through Dec).</Bullet>
              <Bullet>The <strong>vertical axis (left)</strong> shows the number of tourists.</Bullet>
              <Bullet><strong>Blue bars</strong> represent local (domestic) tourists.</Bullet>
              <Bullet><strong>Green bars</strong> represent foreign (international) tourists.</Bullet>
              <Bullet>Taller bars mean more tourists visited that month.</Bullet>
            </>
          ),
        },
        {
          icon: '3.', title: 'What Does the Data Tell Us?', accent: a.hasData ? 'green' : 'amber',
          content: !a.hasData ? (
            <p>There is not enough data yet to generate an analysis. Add tourism statistics records to see insights here.</p>
          ) : (
            <>
              <Bullet>A total of <strong>{formatNumber(a.totalAll)}</strong> tourists visited across {a.withData.length} month(s) with recorded data.</Bullet>
              <Bullet>The monthly average is approximately <strong>{formatNumber(a.avgMonthly)}</strong> tourists.</Bullet>
              <Bullet><strong>{a.peak.month}</strong> recorded the highest arrivals at <strong>{formatNumber(a.peak.total)}</strong> tourists.</Bullet>
              <Bullet><strong>{a.lowest.month}</strong> had the lowest recorded arrivals at <strong>{formatNumber(a.lowest.total)}</strong> tourists.</Bullet>
              <Bullet>Out of all arrivals, <strong>{a.foreignPct}%</strong> were foreign tourists ({formatNumber(a.totalForeign)}) and <strong>{(100 - parseFloat(a.foreignPct)).toFixed(1)}%</strong> were local tourists ({formatNumber(a.totalLocal)}).</Bullet>
              {a.momTrend?.change != null && (
                <Bullet>Compared to <strong>{a.momTrend.prev.month}</strong> ({formatNumber(a.momTrend.prev.total)}), arrivals in <strong>{a.momTrend.last.month}</strong> ({formatNumber(a.momTrend.last.total)}) {parseFloat(a.momTrend.change) >= 0 ? 'increased' : 'decreased'} by <strong>{Math.abs(a.momTrend.change)}%</strong>.</Bullet>
              )}
            </>
          ),
        },
        {
          icon: '4.', title: 'Key Findings', accent: 'purple',
          content: !a.hasData ? <p>No findings available yet.</p> : (
            <>
              {parseFloat(a.foreignPct) > 20 && <Bullet>Foreign tourist interest is strong at {a.foreignPct}%. This is an opportunity to invest in multilingual tourism materials and international marketing.</Bullet>}
              {parseFloat(a.foreignPct) <= 10 && <Bullet>The market is primarily domestic. Daet's tourism is driven by Filipino travelers, which is normal for many local destinations.</Bullet>}
              <Bullet>Peak month is <strong>{a.peak.month}</strong>. This is likely tied to a local event, holiday, or favorable season.</Bullet>
              {a.momTrend?.change != null && parseFloat(a.momTrend.change) < -15 && <Bullet>Arrivals dropped significantly in the latest month. This warrants investigation — check if any events, weather, or access issues occurred.</Bullet>}
              {a.momTrend?.change != null && parseFloat(a.momTrend.change) > 15 && <Bullet>Arrivals grew significantly in the latest month — a positive sign of increasing tourism momentum.</Bullet>}
            </>
          ),
        },
        {
          icon: '5.', title: 'Why Is This Important?', accent: 'amber',
          content: (
            <p>Knowing when tourists visit most helps the Tourism Office prepare staff, services, and infrastructure during peak months, and launch promotions to attract visitors during slow months. This graph is one of the most important indicators of Daet's tourism health.</p>
          ),
        },
        {
          icon: '6.', title: 'Recommended Actions', accent: 'green',
          content: !a.hasData ? <p>Add records to generate recommendations.</p> : (
            <>
              <Bullet>Increase tourism services and staffing during <strong>{a.peak.month}</strong> to handle the peak demand.</Bullet>
              <Bullet>Launch promotional campaigns before <strong>{a.lowest.month}</strong> to boost low-season arrivals.</Bullet>
              {parseFloat(a.foreignPct) < 10 && <Bullet>Partner with the Department of Tourism (DOT) to explore international marketing and attract more foreign visitors.</Bullet>}
              <Bullet>Record data consistently every month to improve the accuracy of future forecasts.</Bullet>
            </>
          ),
        },
      ],
    }
  }

  // ── Local vs. Foreign Pie ─────────────────────────────────
  if (chartType === 'local_foreign') {
    const a = analyzeLocalForeign(extra?.localCount, extra?.foreignCount)
    return {
      title: 'Local vs. Foreign Visitors',
      icon: 'pie',
      color: 'blue',
      sections: [
        {
          icon: '1.', title: 'What Does This Graph Show?', accent: 'blue',
          content: <p>This pie chart shows the proportion of tourists who are from the Philippines (local) versus tourists who came from other countries (foreign) for the selected year. It helps you quickly understand the composition of Daet's visitor base.</p>,
        },
        {
          icon: '2.', title: 'How to Read This Graph', accent: 'teal',
          content: (
            <>
              <Bullet>The chart is a <strong>circle divided into two slices</strong>.</Bullet>
              <Bullet>The <strong>blue slice</strong> represents local (domestic) tourists.</Bullet>
              <Bullet>The <strong>green slice</strong> represents foreign (international) tourists.</Bullet>
              <Bullet>The <strong>percentage label</strong> on each slice shows what portion of total visitors they represent.</Bullet>
              <Bullet>A larger slice means that group makes up a bigger share of visitors.</Bullet>
            </>
          ),
        },
        {
          icon: '3.', title: 'What Does the Data Tell Us?', accent: a.hasData ? 'green' : 'amber',
          content: !a.hasData ? (
            <p>No visitor data has been recorded yet. Add tourism statistics to see the breakdown here.</p>
          ) : (
            <>
              <Bullet>Total recorded visitors: <strong>{formatNumber(a.total)}</strong></Bullet>
              <Bullet><strong>Local tourists</strong>: {formatNumber(a.localCount)} ({a.localPct}% of total)</Bullet>
              <Bullet><strong>Foreign tourists</strong>: {formatNumber(a.foreignCount)} ({a.foreignPct}% of total)</Bullet>
              <Bullet>The <strong>{a.dominant === 'local' ? 'local' : 'foreign'} segment dominates</strong> — {a.dominant === 'local' ? `${a.localPct}% of visitors are from within the Philippines` : `${a.foreignPct}% of visitors are from other countries`}.</Bullet>
            </>
          ),
        },
        {
          icon: '4.', title: 'Key Findings', accent: 'purple',
          content: !a.hasData ? <p>No findings yet.</p> : (
            <>
              {parseFloat(a.foreignPct) > 30 && <Bullet>Strong international interest — {a.foreignPct}% foreign visitors is above average for a local destination. Keep building international visibility.</Bullet>}
              {parseFloat(a.foreignPct) >= 10 && parseFloat(a.foreignPct) <= 30 && <Bullet>Moderate international presence at {a.foreignPct}%. There is room to grow foreign visitor numbers through targeted campaigns.</Bullet>}
              {parseFloat(a.foreignPct) < 10 && <Bullet>Daet is predominantly a domestic destination ({a.localPct}% local). This is common for many LGUs. Focus on domestic traveler comfort while exploring international marketing opportunities.</Bullet>}
            </>
          ),
        },
        {
          icon: '5.', title: 'Why Is This Important?', accent: 'amber',
          content: <p>Local and foreign tourists have different needs, spending patterns, and travel motivations. Foreign tourists typically spend more per day but require different services (multilingual guides, international payment options). Understanding this split helps allocate the tourism budget more effectively.</p>,
        },
        {
          icon: '6.', title: 'Recommended Actions', accent: 'green',
          content: !a.hasData ? <p>Add records to generate recommendations.</p> : (
            <>
              {parseFloat(a.foreignPct) < 15 && <Bullet>Work with the DOT to increase international promotions of Daet, particularly targeting Southeast Asian travel markets.</Bullet>}
              <Bullet>Ensure tourist facilities cater to the dominant group — {a.dominant === 'local' ? 'focus on Filipino preferences, language, and payment methods' : 'ensure English/multilingual signage and international payment acceptance'}.</Bullet>
              <Bullet>Track this ratio quarterly to measure the impact of any marketing campaigns.</Bullet>
            </>
          ),
        },
      ],
    }
  }

  // ── Revenue Trend ─────────────────────────────────────────
  if (chartType === 'revenue_trend') {
    const a = analyzeRevenueTrend(data)
    return {
      title: 'Estimated Tourism Revenue Trend',
      icon: 'revenue',
      color: 'green',
      sections: [
        {
          icon: '1.', title: 'What Does This Graph Show?', accent: 'blue',
          content: <p>This graph shows the estimated amount of money generated by tourism in Daet each month. The figures are <strong>estimates based on administrative records</strong> — they are not verified financial statements, but they provide a useful picture of the economic impact of tourism over time.</p>,
        },
        {
          icon: '2.', title: 'How to Read This Graph', accent: 'teal',
          content: (
            <>
              <Bullet>The <strong>bottom axis</strong> shows the months (Jan–Dec).</Bullet>
              <Bullet>The <strong>left axis</strong> shows the estimated revenue in Philippine Pesos (₱). Values shown as "K" mean thousands (e.g., ₱50K = ₱50,000).</Bullet>
              <Bullet>The <strong>green line</strong> connects monthly revenue estimates — an upward trend means tourism revenue is growing.</Bullet>
              <Bullet>Each <strong>dot on the line</strong> represents one month's total estimated revenue.</Bullet>
            </>
          ),
        },
        {
          icon: '3.', title: 'What Does the Data Tell Us?', accent: a.hasData ? 'green' : 'amber',
          content: !a.hasData ? (
            <p>No economic records have been entered yet. Add data under Economic Impact to see revenue trends.</p>
          ) : (
            <>
              <Bullet>Total estimated revenue across {a.withData.length} month(s): <strong>{formatPeso(a.totalRevenue)}</strong></Bullet>
              <Bullet>Monthly average: approximately <strong>{formatPeso(a.avg)}</strong></Bullet>
              <Bullet>Peak revenue month: <strong>{a.peak.month}</strong> at <strong>{formatPeso(a.peak.revenue)}</strong></Bullet>
              {a.momTrend?.change != null && (
                <Bullet>Revenue in <strong>{a.momTrend.last.month}</strong> ({formatPeso(a.momTrend.last.revenue)}) {parseFloat(a.momTrend.change) >= 0 ? 'increased' : 'decreased'} by <strong>{Math.abs(a.momTrend.change)}%</strong> compared to {a.momTrend.prev.month} ({formatPeso(a.momTrend.prev.revenue)}).</Bullet>
              )}
            </>
          ),
        },
        {
          icon: '4.', title: 'Key Findings', accent: 'purple',
          content: !a.hasData ? <p>No findings yet.</p> : (
            <>
              <Bullet>Revenue peak in <strong>{a.peak.month}</strong> likely corresponds to higher tourist arrivals or a major event that month. Cross-reference with the Monthly Arrivals chart to confirm.</Bullet>
              {a.momTrend?.change != null && parseFloat(a.momTrend.change) < -20 && <Bullet>Revenue dropped significantly in the latest month. This may indicate fewer visitors, lower spending, or incomplete records.</Bullet>}
              {a.momTrend?.change != null && parseFloat(a.momTrend.change) > 20 && <Bullet>Revenue grew significantly — a positive sign of increasing economic contribution from tourism.</Bullet>}
              <Bullet>Note: These are <strong>estimates only</strong>. They are not audited financial figures and should not be used as official government revenue reports.</Bullet>
            </>
          ),
        },
        {
          icon: '5.', title: 'Why Is This Important?', accent: 'amber',
          content: <p>Understanding tourism revenue trends helps the Tourism Office justify budget requests, measure the economic return on tourism investments, and identify which months need promotional boosts to maintain economic activity.</p>,
        },
        {
          icon: '6.', title: 'Recommended Actions', accent: 'green',
          content: !a.hasData ? <p>Add economic records to generate recommendations.</p> : (
            <>
              <Bullet>Investigate what drove the revenue peak in <strong>{a.peak.month}</strong> and try to replicate those conditions (events, promotions, accessibility improvements).</Bullet>
              <Bullet>Launch off-peak tourism promotions in months where revenue falls below the average of <strong>{formatPeso(a.avg)}</strong>.</Bullet>
              <Bullet>Work with accredited accommodations and tour operators to collect more precise revenue data for future records.</Bullet>
            </>
          ),
        },
      ],
    }
  }

  // ── Yearly Growth ─────────────────────────────────────────
  if (chartType === 'yearly_growth') {
    const a = analyzeYearlyGrowth(data)
    return {
      title: 'Yearly Tourism Growth',
      icon: 'yearly',
      color: 'blue',
      sections: [
        {
          icon: '1.', title: 'What Does This Graph Show?', accent: 'blue',
          content: <p>This bar chart shows the total number of tourists who visited Daet in each year that has recorded data. It lets you see whether tourism is growing, declining, or staying the same over multiple years.</p>,
        },
        {
          icon: '2.', title: 'How to Read This Graph', accent: 'teal',
          content: (
            <>
              <Bullet>Each <strong>bar</strong> represents one year.</Bullet>
              <Bullet>The <strong>height of the bar</strong> shows the total tourist arrivals for that year.</Bullet>
              <Bullet>A <strong>taller bar</strong> means more tourists visited that year.</Bullet>
              <Bullet>Reading left to right shows whether tourism is growing over time.</Bullet>
            </>
          ),
        },
        {
          icon: '3.', title: 'What Does the Data Tell Us?', accent: a.hasData ? 'green' : 'amber',
          content: !a.hasData ? (
            <p>Not enough yearly data yet. Data from at least two years is needed to show growth trends.</p>
          ) : (
            <>
              <Bullet>Data spans <strong>{a.withData.length}</strong> year(s): {a.withData.map(d => d.year).join(', ')}</Bullet>
              <Bullet>Best year on record: <strong>{a.peak.year}</strong> with <strong>{formatNumber(a.peak.total)}</strong> total arrivals.</Bullet>
              <Bullet>Most recent year: <strong>{a.latest?.year}</strong> with <strong>{formatNumber(a.latest?.total)}</strong> arrivals.</Bullet>
              {a.yoyTrend?.change != null && (
                <Bullet>Year-over-year change from <strong>{a.yoyTrend.prev.year}</strong> to <strong>{a.yoyTrend.latest.year}</strong>: {parseFloat(a.yoyTrend.change) >= 0 ? 'increased' : 'decreased'} by <strong>{Math.abs(a.yoyTrend.change)}%</strong> ({formatNumber(a.yoyTrend.prev.total)} to {formatNumber(a.yoyTrend.latest.total)}).</Bullet>
              )}
            </>
          ),
        },
        {
          icon: '4.', title: 'Key Findings', accent: 'purple',
          content: !a.hasData ? <p>No findings yet.</p> : (
            <>
              {a.yoyTrend?.change != null && parseFloat(a.yoyTrend.change) > 0 && <Bullet>Tourism is growing year-over-year — a positive sign for Daet's attractiveness as a destination.</Bullet>}
              {a.yoyTrend?.change != null && parseFloat(a.yoyTrend.change) < 0 && <Bullet>Tourism arrivals declined from {a.yoyTrend.prev.year} to {a.yoyTrend.latest.year}. Investigating the causes is important for recovery planning.</Bullet>}
              {a.withData.length < 3 && <Bullet>Only {a.withData.length} year(s) of data is available. More years of consistent records will make this chart more meaningful for long-term planning.</Bullet>}
            </>
          ),
        },
        {
          icon: '5.', title: 'Why Is This Important?', accent: 'amber',
          content: <p>Long-term growth trends help the Tourism Office and municipal government measure the success of tourism strategies, justify infrastructure investments, and set realistic targets for future years. This graph is essential for annual tourism planning.</p>,
        },
        {
          icon: '6.', title: 'Recommended Actions', accent: 'green',
          content: !a.hasData ? <p>Add records across multiple years to generate recommendations.</p> : (
            <>
              <Bullet>Set a tourism arrival target for the next year based on the growth trend — aim for at least {a.yoyTrend?.change != null && parseFloat(a.yoyTrend.change) > 0 ? `${Math.ceil(parseFloat(a.yoyTrend.change))}% growth` : '5–10% growth'}.</Bullet>
              <Bullet>Add data consistently every year to build a reliable multi-year trend that can support LGU budget proposals.</Bullet>
              {a.yoyTrend?.change != null && parseFloat(a.yoyTrend.change) < 0 && <Bullet>Conduct a review of factors that caused the decline — weather events, lack of promotions, accessibility issues — and address them in the action plan.</Bullet>}
            </>
          ),
        },
      ],
    }
  }

  // ── Destination Popularity ────────────────────────────────
  if (chartType === 'destination') {
    const a = analyzeDestinations(data)
    return {
      title: 'Visitors by Destination',
      icon: 'map',
      color: 'blue',
      sections: [
        {
          icon: '1.', title: 'What Does This Graph Show?', accent: 'blue',
          content: <p>This chart shows how many tourists visited each specific destination in Daet during the selected year. It helps identify which places are the most popular and which ones may need more promotion or development.</p>,
        },
        {
          icon: '2.', title: 'How to Read This Graph', accent: 'teal',
          content: (
            <>
              <Bullet>Each <strong>horizontal bar</strong> represents one destination (e.g., Bagasbas Beach, Rizal Monument).</Bullet>
              <Bullet>The <strong>length of each bar</strong> shows how many tourists visited that destination — longer means more visitors.</Bullet>
              <Bullet>Destinations are sorted from most to least visited.</Bullet>
              <Bullet>The numbers at the end of each bar show the exact visitor count.</Bullet>
            </>
          ),
        },
        {
          icon: '3.', title: 'What Does the Data Tell Us?', accent: a.hasData ? 'green' : 'amber',
          content: !a.hasData ? (
            <p>No destination data has been recorded yet. Add tourism statistics with specific destinations to see this chart.</p>
          ) : (
            <>
              <Bullet>Total recorded destinations: <strong>{a.sorted.length}</strong></Bullet>
              <Bullet>Most visited: <strong>{a.top.destination}</strong> with <strong>{formatNumber(a.top.total)}</strong> visitors ({a.topShare}% of all recorded visits).</Bullet>
              <Bullet>Least visited in the dataset: <strong>{a.bottom.destination}</strong> with <strong>{formatNumber(a.bottom.total)}</strong> visitors.</Bullet>
              <Bullet>Total visitors across all destinations: <strong>{formatNumber(a.totalVisitors)}</strong></Bullet>
            </>
          ),
        },
        {
          icon: '4.', title: 'Key Findings', accent: 'purple',
          content: !a.hasData ? <p>No findings yet.</p> : (
            <>
              <Bullet><strong>{a.top.destination}</strong> is the standout attraction, capturing {a.topShare}% of all recorded visits. It is the primary draw for tourists coming to Daet.</Bullet>
              {parseFloat(a.topShare) > 50 && <Bullet>Heavy concentration on one destination ({a.topShare}%) may indicate over-reliance. Distributing tourists to other sites would reduce strain and benefit more communities.</Bullet>}
              <Bullet>Less-visited destinations like <strong>{a.bottom.destination}</strong> may benefit from targeted promotions or improved facilities.</Bullet>
            </>
          ),
        },
        {
          icon: '5.', title: 'Why Is This Important?', accent: 'amber',
          content: <p>Knowing which destinations attract the most tourists helps direct infrastructure budgets — better roads, facilities, and signage where they matter most. It also helps the Tourism Office design diverse itineraries that spread economic benefits across more communities in Daet.</p>,
        },
        {
          icon: '6.', title: 'Recommended Actions', accent: 'green',
          content: !a.hasData ? <p>Add records with destination data to generate recommendations.</p> : (
            <>
              <Bullet>Prioritize facility maintenance and visitor management at <strong>{a.top.destination}</strong> as the highest-traffic site.</Bullet>
              <Bullet>Create tourism packages that combine the top destination with lesser-visited sites to distribute tourist traffic.</Bullet>
              <Bullet>Assess why <strong>{a.bottom.destination}</strong> has fewer visitors — accessibility, awareness, or lack of attractions may be factors to address.</Bullet>
            </>
          ),
        },
      ],
    }
  }

  // ── Sustainability ────────────────────────────────────────
  if (chartType === 'sustainability') {
    const a = analyzeSustainability(data)
    return {
      title: 'Sustainability Indicators',
      icon: 'sustain',
      color: 'teal',
      sections: [
        {
          icon: '1.', title: 'What Does This Graph Show?', accent: 'blue',
          content: <p>This chart shows the values of various sustainability indicators recorded for Daet's tourism sector. These indicators measure how tourism is affecting the environment, economy, society, and local governance. High or low values depend on what each indicator measures.</p>,
        },
        {
          icon: '2.', title: 'How to Read This Graph', accent: 'teal',
          content: (
            <>
              <Bullet>Each <strong>bar</strong> represents one sustainability indicator (e.g., "Waste Diversion Rate", "Carbon Footprint").</Bullet>
              <Bullet>The <strong>height of the bar</strong> shows the numeric value recorded for that indicator.</Bullet>
              <Bullet>The <strong>unit of measurement</strong> (%, kWh, score, etc.) differs per indicator — check the specific record for context.</Bullet>
              <Bullet>Some indicators are better when <strong>high</strong> (e.g., community satisfaction), and some are better when <strong>low</strong> (e.g., carbon footprint).</Bullet>
            </>
          ),
        },
        {
          icon: '3.', title: 'What Does the Data Tell Us?', accent: a.hasData ? 'green' : 'amber',
          content: !a.hasData ? (
            <p>No sustainability records have been entered yet. Add data under Sustainability Assessment to see this chart.</p>
          ) : (
            <>
              <Bullet>Currently showing <strong>{a.count}</strong> sustainability indicator(s).</Bullet>
              <Bullet>Highest recorded value: <strong>{a.highest.indicator_name}</strong> at <strong>{a.highest.indicator_value}</strong>.</Bullet>
              <Bullet>Lowest recorded value: <strong>{a.lowest.indicator_name}</strong> at <strong>{a.lowest.indicator_value}</strong>.</Bullet>
            </>
          ),
        },
        {
          icon: '4.', title: 'Key Findings', accent: 'purple',
          content: !a.hasData ? <p>No findings yet.</p> : (
            <Bullet>Sustainability data requires context-specific interpretation. Review each indicator with its category (Environmental, Economic, Social, or Governance) to understand whether the recorded value is desirable or needs improvement.</Bullet>
          ),
        },
        {
          icon: '5.', title: 'Why Is This Important?', accent: 'amber',
          content: <p>Sustainable tourism ensures that Daet's natural and cultural resources remain intact for future generations. Tracking these indicators helps the municipality balance tourist growth with environmental protection and community well-being — a key requirement for responsible tourism development.</p>,
        },
        {
          icon: '6.', title: 'Recommended Actions', accent: 'green',
          content: !a.hasData ? <p>Add sustainability records to generate recommendations.</p> : (
            <>
              <Bullet>Review each indicator against established benchmarks (DOT or international sustainability standards).</Bullet>
              <Bullet>Record sustainability data at least quarterly to track trends over time.</Bullet>
              <Bullet>Share sustainability findings with barangay councils and stakeholders to build community support for eco-tourism practices.</Bullet>
            </>
          ),
        },
      ],
    }
  }

  // Fallback
  return {
    title: 'Chart Information',
    icon: 'chart',
    sections: [
      {
        icon: 'info', title: 'About This Chart', accent: 'blue',
        content: <p>This chart displays analytics data from the TIA-DAS system. Click the specific chart headings in the legend to show or hide individual data series.</p>,
      },
    ],
  }
}

// ── Main modal component ──────────────────────────────────────

export default function ChartExplainModal({ open, onClose, chartType, data, extra }) {
  const overlayRef = useRef(null)

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const explanation = renderExplanation(chartType, data, extra)

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh]">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-blue-600">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Chart Explanation</p>
            <h2 className="text-base font-bold text-gray-900 truncate">{explanation.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 w-9 h-9 rounded-lg flex items-center justify-center transition text-lg shrink-0"
            aria-label="Close explanation"
          >
            ✕
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
          {explanation.sections.map((s, i) => (
            <Section key={i} icon={s.icon} title={s.title} accent={s.accent}>
              {s.content}
            </Section>
          ))}

          <p className="text-xs text-gray-400 text-center pt-2 pb-1">
            TIA-DAS · CONNECT-DAET.ph · Explanations update automatically as data changes
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
          >
            Got it — Close
          </button>
        </div>
      </div>
    </div>
  )
}
