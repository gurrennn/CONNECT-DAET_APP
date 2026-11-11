'use client'

import { useState, useEffect, useCallback } from 'react'
import AnalyticsHeader from '../components/AnalyticsHeader'
import AnalyticsLoading from '../components/AnalyticsLoading'
import ReportCard from '../components/ReportCard'
import Breadcrumbs from '../components/Breadcrumbs'
import { ToastContainer, useToast } from '../components/Toast'
import { getReportHistory, saveReport, getDashboardKPIs, getMonthlyArrivals, getMonthlyRevenue, getSustainabilityRecords, logAuditAction } from '../lib/analyticsQueries'
import { validateReportForm, isValid } from '../lib/analyticsValidation'
import { REPORT_TYPES } from '../lib/analyticsConstants'
import { formatPeso, formatNumber, formatDate } from '../lib/analyticsHelpers'
import { supabase } from '../../../lib/supabaseClient'

const PERIOD_TYPES = [
  { value: 'daily', label: 'Daily' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annual', label: 'Annual' },
  { value: 'custom', label: 'Custom Range' },
]

function buildReportContent(reportType, kpis, monthly, revenue, selectedYear, periodLabel) {
  const now = new Date().toLocaleString('en-PH', { dateStyle: 'full', timeStyle: 'short' })
  const lines = []

  lines.push('═══════════════════════════════════════════════════════════')
  lines.push('   CONNECT-DAET.ph — Subsystem 10: TIA-DAS')
  lines.push('   Tourism Impact Assessment and Data Analytics System')
  lines.push('   Municipal Tourism Office of Daet, Camarines Norte')
  lines.push('═══════════════════════════════════════════════════════════')
  lines.push('')
  lines.push(`Report Type  : ${REPORT_TYPES.find(r => r.value === reportType)?.label || reportType}`)
  lines.push(`Period       : ${periodLabel}`)
  lines.push(`Generated On : ${now}`)
  lines.push('')

  if (reportType === 'arrivals' || reportType === 'monthly' || reportType === 'annual' || reportType === 'performance') {
    lines.push('─────────────────────────────────────────────────────────────')
    lines.push('1. TOURIST ARRIVAL SUMMARY')
    lines.push('─────────────────────────────────────────────────────────────')
    if (kpis) {
      lines.push(`   Total Arrivals (YTD)   : ${formatNumber(kpis.totalArrivals)}`)
      lines.push(`   Local Tourists         : ${formatNumber(kpis.localArrivals)}`)
      lines.push(`   Foreign Tourists       : ${formatNumber(kpis.foreignArrivals)}`)
      lines.push(`   Growth Rate            : ${kpis.growthRate != null ? kpis.growthRate.toFixed(1) + '%' : 'N/A'}`)
      lines.push(`   Statistics Records     : ${kpis.statisticsRecords}`)
    } else {
      lines.push('   No arrival data available.')
    }
    lines.push('')

    if (monthly && monthly.length > 0) {
      lines.push('   Monthly Breakdown:')
      monthly.forEach(m => {
        if (m.total > 0) lines.push(`   ${m.month.padEnd(6)}: ${formatNumber(m.total)} (Local: ${formatNumber(m.local)}, Foreign: ${formatNumber(m.foreign)})`)
      })
      lines.push('')
    }
  }

  if (reportType === 'economic' || reportType === 'annual' || reportType === 'performance') {
    lines.push('─────────────────────────────────────────────────────────────')
    lines.push('2. ECONOMIC IMPACT SUMMARY')
    lines.push('─────────────────────────────────────────────────────────────')
    if (kpis) {
      lines.push(`   Estimated Revenue (YTD) : ${formatPeso(kpis.estimatedRevenue, { compact: false })}`)
      lines.push(`   Employment Count        : ${formatNumber(kpis.tourismEmployment)}`)
    } else {
      lines.push('   No economic data available.')
    }
    if (revenue && revenue.length > 0) {
      lines.push('')
      lines.push('   Monthly Revenue Estimates:')
      revenue.forEach(m => {
        if (m.revenue > 0) lines.push(`   ${m.month.padEnd(6)}: ${formatPeso(m.revenue)}`)
      })
    }
    lines.push('')
    lines.push('   ⚠️  DISCLAIMER: Revenue figures are ESTIMATES based on recorded data.')
    lines.push('       They do not represent verified financial statements or municipal tax records.')
    lines.push('')
  }

  if (reportType === 'sustainability' || reportType === 'annual') {
    lines.push('─────────────────────────────────────────────────────────────')
    lines.push('3. SUSTAINABILITY NOTES')
    lines.push('─────────────────────────────────────────────────────────────')
    lines.push('   See Sustainability module for detailed indicator records.')
    lines.push('')
  }

  lines.push('─────────────────────────────────────────────────────────────')
  lines.push('DATA SOURCE NOTES')
  lines.push('─────────────────────────────────────────────────────────────')
  lines.push('   All data sourced from TIA-DAS administrative records.')
  lines.push('   Data verified by Municipal Tourism Office administrators.')
  lines.push('')
  lines.push('═══════════════════════════════════════════════════════════')
  lines.push('   END OF REPORT — CONNECT-DAET.ph TIA-DAS v1.0')
  lines.push('═══════════════════════════════════════════════════════════')

  return lines.join('\n')
}

export default function ReportsPage() {
  const [reports, setReports] = useState([])
  const [reportsTotal, setReportsTotal] = useState(0)
  const [reportsPage, setReportsPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  // Form
  const [reportType, setReportType] = useState('')
  const [periodType, setPeriodType] = useState('monthly')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [formErrors, setFormErrors] = useState({})

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getReportHistory({ page: reportsPage, pageSize: 10 })
      setReports(result.data)
      setReportsTotal(result.total)
    } catch (err) {
      setError(err.message || 'Failed to load report history.')
    } finally {
      setLoading(false)
    }
  }, [reportsPage])

  useEffect(() => { fetchReports() }, [fetchReports])

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 4000) }

  const handleGenerate = async (e) => {
    e.preventDefault()
    const errs = validateReportForm({ report_type: reportType, period_type: periodType, start_date: startDate, end_date: endDate })
    if (!isValid(errs)) { setFormErrors(errs); return }

    setGenerating(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Build period label
      let periodLabel = ''
      if (periodType === 'custom') {
        periodLabel = `${formatDate(startDate)} – ${formatDate(endDate)}`
      } else if (periodType === 'annual') {
        periodLabel = `Year ${selectedYear}`
      } else if (periodType === 'monthly') {
        periodLabel = `${selectedYear} (All Months)`
      } else {
        periodLabel = `${periodType.charAt(0).toUpperCase() + periodType.slice(1)} — ${selectedYear}`
      }

      // Load data
      const [kpis, monthly, revenue] = await Promise.all([
        getDashboardKPIs(),
        getMonthlyArrivals(selectedYear),
        getMonthlyRevenue(selectedYear),
      ])

      const content = buildReportContent(reportType, kpis, monthly, revenue, selectedYear, periodLabel)
      const reportTitle = `${REPORT_TYPES.find(r => r.value === reportType)?.label || reportType} — ${periodLabel}`

      // Download
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tiadas-${reportType}-${selectedYear}-${Date.now()}.txt`
      document.body.appendChild(a)
      a.click()
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 200)

      // Save to DB
      const saved = await saveReport({
        title: reportTitle,
        report_type: reportType,
        period_label: periodLabel,
        period_type: periodType,
        status: 'generated',
        created_by: user?.id,
        created_by_name: user?.email?.split('@')[0] || 'Admin',
      })

      await logAuditAction({ adminId: user?.id, action: 'generate_report', tableName: 'analytics_reports', recordId: saved.id, details: { reportType, periodLabel } })

      showSuccess(`Report "${reportTitle}" generated and downloaded.`)
      fetchReports()
    } catch (err) {
      setError(err.message || 'Failed to generate report.')
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = async (report) => {
    alert(`Re-download is not supported for historical reports. Please re-generate the report to download it again.`)
  }

  const inputClass = (field) =>
    `px-3 py-2.5 rounded-lg border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      formErrors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
    }`

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/analytics' }, { label: 'Reports & Export' }]} />
      <AnalyticsHeader title="Reports & Export" subtitle="Generate and download tourism analytics reports" />

      {successMsg && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{successMsg}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

      {/* Generator Form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Generate New Report</h2>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type <span className="text-red-500">*</span></label>
              <select value={reportType} onChange={(e) => { setReportType(e.target.value); if (formErrors.report_type) setFormErrors(p => ({ ...p, report_type: null })) }} className={`w-full ${inputClass('report_type')}`}>
                <option value="">Select type...</option>
                {REPORT_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              {formErrors.report_type && <p className="text-red-500 text-xs mt-1">{formErrors.report_type}</p>}
            </div>

            {/* Period Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <select value={periodType} onChange={(e) => setPeriodType(e.target.value)} className={`w-full ${inputClass('')}`}>
                {PERIOD_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>

            {/* Year or Custom Range */}
            {periodType !== 'custom' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className={`w-full ${inputClass('')}`}>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date <span className="text-red-500">*</span></label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={`w-full ${inputClass('start_date')}`} />
                  {formErrors.start_date && <p className="text-red-500 text-xs mt-1">{formErrors.start_date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date <span className="text-red-500">*</span></label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={`w-full ${inputClass('end_date')}`} />
                  {formErrors.end_date && <p className="text-red-500 text-xs mt-1">{formErrors.end_date}</p>}
                </div>
              </>
            )}

            {/* Generate button */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={generating}
                className="w-full px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition min-h-[44px] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {generating && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                {generating ? 'Generating…' : 'Generate & Download'}
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Reports are generated as plain-text (.txt) files containing verified data from the TIA-DAS database.
          </p>
        </form>
      </div>

      {/* Report History */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3">Report History</h2>
        {loading ? <AnalyticsLoading message="Loading report history…" /> : (
          reports.length === 0 ? (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
              No reports generated yet. Use the form above to generate your first report.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map(report => (
                <ReportCard key={report.id} report={report} onDownload={handleDownload} />
              ))}
              {reportsTotal > 10 && (
                <div className="flex justify-center gap-2 pt-2">
                  <button disabled={reportsPage === 1} onClick={() => setReportsPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 disabled:opacity-40 min-h-[36px]">‹ Prev</button>
                  <span className="px-3 py-1.5 text-sm text-gray-500">Page {reportsPage}</span>
                  <button disabled={reportsPage * 10 >= reportsTotal} onClick={() => setReportsPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 disabled:opacity-40 min-h-[36px]">Next ›</button>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  )
}
