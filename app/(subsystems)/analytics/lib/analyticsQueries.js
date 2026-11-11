// ============================================================
// TIA-DAS Supabase Query Functions
// Tourism Impact Assessment and Data Analytics System
// ============================================================

import { supabase } from '../../../lib/supabaseClient'

// ─── Audit Log Helper ────────────────────────────────────────

export async function logAuditAction({ adminId, action, tableName, recordId, details }) {
  // Get the admin's email to denormalize into the log row
  let adminEmail = null
  try {
    const { data: { user } } = await supabase.auth.getUser()
    adminEmail = user?.email || null
  } catch (_) {}

  const { error } = await supabase.from('analytics_audit_logs').insert({
    admin_id: adminId || null,
    admin_email: adminEmail,
    action,
    table_name: tableName || null,
    record_id: recordId || null,
    details: details || {},
  })

  // Log to console in dev so issues are visible — does not throw to avoid
  // blocking the main operation that called this
  if (error) {
    console.warn('[TIA-DAS] Audit log write failed:', error.message)
  }
}

// ─── Dashboard / KPIs ────────────────────────────────────────

export async function getDashboardKPIs() {
  try {
    const currentYear = new Date().getFullYear()
    const startOfYear = `${currentYear}-01-01`

    const [statsResult, economicResult, sustainResult] = await Promise.all([
      supabase
        .from('analytics_tourism_statistics')
        .select('local_tourist_count, foreign_tourist_count, reporting_date')
        .gte('reporting_date', startOfYear)
        .eq('is_archived', false),
      supabase
        .from('analytics_economic_records')
        .select('estimated_amount, employment_count, record_date')
        .gte('record_date', startOfYear)
        .eq('is_archived', false),
      supabase
        .from('analytics_sustainability_records')
        .select('indicator_value, indicator_name')
        .eq('is_archived', false)
        .limit(100),
    ])

    const stats = statsResult.data || []
    const economics = economicResult.data || []

    const totalLocal = stats.reduce((s, r) => s + (Number(r.local_tourist_count) || 0), 0)
    const totalForeign = stats.reduce((s, r) => s + (Number(r.foreign_tourist_count) || 0), 0)
    const totalArrivals = totalLocal + totalForeign
    const totalRevenue = economics.reduce((s, r) => s + (Number(r.estimated_amount) || 0), 0)
    const totalEmployment = economics.reduce((s, r) => s + (Number(r.employment_count) || 0), 0)

    // Growth rate — compare last 30 days vs prior 30 days
    const now = new Date()
    const thirtyDaysAgo = new Date(now - 30 * 86400000)
    const sixtyDaysAgo = new Date(now - 60 * 86400000)

    const recent = stats.filter(r => new Date(r.reporting_date) >= thirtyDaysAgo)
    const prior = stats.filter(r =>
      new Date(r.reporting_date) >= sixtyDaysAgo &&
      new Date(r.reporting_date) < thirtyDaysAgo
    )

    const recentTotal = recent.reduce((s, r) => s + (Number(r.local_tourist_count) || 0) + (Number(r.foreign_tourist_count) || 0), 0)
    const priorTotal = prior.reduce((s, r) => s + (Number(r.local_tourist_count) || 0) + (Number(r.foreign_tourist_count) || 0), 0)
    const growthRate = priorTotal > 0 ? ((recentTotal - priorTotal) / priorTotal) * 100 : null

    return {
      totalArrivals,
      localArrivals: totalLocal,
      foreignArrivals: totalForeign,
      estimatedRevenue: totalRevenue,
      tourismEmployment: totalEmployment,
      growthRate,
      statisticsRecords: stats.length,
      lastUpdated: new Date().toISOString(),
    }
  } catch (err) {
    console.error('getDashboardKPIs error:', err)
    return null
  }
}

// Monthly arrivals for the current year
export async function getMonthlyArrivals(year = new Date().getFullYear()) {
  const { data, error } = await supabase
    .from('analytics_tourism_statistics')
    .select('reporting_date, local_tourist_count, foreign_tourist_count')
    .gte('reporting_date', `${year}-01-01`)
    .lte('reporting_date', `${year}-12-31`)
    .eq('is_archived', false)
    .order('reporting_date', { ascending: true })

  if (error) throw error

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const buckets = months.map(m => ({ month: m, local: 0, foreign: 0, total: 0 }))

  ;(data || []).forEach(r => {
    const monthIdx = new Date(r.reporting_date).getMonth()
    if (monthIdx >= 0 && monthIdx < 12) {
      buckets[monthIdx].local += Number(r.local_tourist_count) || 0
      buckets[monthIdx].foreign += Number(r.foreign_tourist_count) || 0
      buckets[monthIdx].total += (Number(r.local_tourist_count) || 0) + (Number(r.foreign_tourist_count) || 0)
    }
  })

  return buckets
}

// Yearly totals for growth chart
export async function getYearlyArrivals() {
  const { data, error } = await supabase
    .from('analytics_tourism_statistics')
    .select('reporting_date, local_tourist_count, foreign_tourist_count')
    .eq('is_archived', false)
    .order('reporting_date', { ascending: true })

  if (error) throw error

  const yearBuckets = {}
  ;(data || []).forEach(r => {
    const year = new Date(r.reporting_date).getFullYear()
    if (!yearBuckets[year]) yearBuckets[year] = { year, local: 0, foreign: 0, total: 0 }
    yearBuckets[year].local += Number(r.local_tourist_count) || 0
    yearBuckets[year].foreign += Number(r.foreign_tourist_count) || 0
    yearBuckets[year].total += (Number(r.local_tourist_count) || 0) + (Number(r.foreign_tourist_count) || 0)
  })

  return Object.values(yearBuckets).sort((a, b) => a.year - b.year)
}

// ─── Tourism Statistics ──────────────────────────────────────

export async function getStatisticsRecords({ page = 1, pageSize = 10, search = '', destination = '', dateFrom = '', dateTo = '' } = {}) {
  let query = supabase
    .from('analytics_tourism_statistics')
    .select('*', { count: 'exact' })
    .eq('is_archived', false)
    .order('reporting_date', { ascending: false })

  if (destination && destination !== 'all') query = query.eq('destination', destination)
  if (dateFrom) query = query.gte('reporting_date', dateFrom)
  if (dateTo) query = query.lte('reporting_date', dateTo)

  const from = (page - 1) * pageSize
  query = query.range(from, from + pageSize - 1)

  const { data, error, count } = await query
  if (error) throw error

  let results = (data || []).map(r => ({
    ...r,
    // compute total client-side in case generated column doesn't exist
    total_tourist_count: r.total_tourist_count ?? ((Number(r.local_tourist_count) || 0) + (Number(r.foreign_tourist_count) || 0)),
  }))

  if (search) {
    const q = search.toLowerCase()
    results = results.filter(r =>
      r.destination?.toLowerCase().includes(q) ||
      r.data_source?.toLowerCase().includes(q) ||
      r.visitor_category?.toLowerCase().includes(q) ||
      r.remarks?.toLowerCase().includes(q)
    )
  }

  return { data: results, total: count || 0, page, pageSize }
}

export async function createStatisticsRecord(record) {
  // Always compute total explicitly — works for both plain and generated column schemas
  const local = Number(record.local_tourist_count) || 0
  const foreign = Number(record.foreign_tourist_count) || 0
  const payload = { ...record, total_tourist_count: local + foreign }

  const { data, error } = await supabase
    .from('analytics_tourism_statistics')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateStatisticsRecord(id, updates) {
  // Recompute total if local/foreign counts are being updated
  const payload = { ...updates, updated_at: new Date().toISOString() }
  if (payload.local_tourist_count !== undefined || payload.foreign_tourist_count !== undefined) {
    const local = Number(payload.local_tourist_count) || 0
    const foreign = Number(payload.foreign_tourist_count) || 0
    payload.total_tourist_count = local + foreign
  }

  const { data, error } = await supabase
    .from('analytics_tourism_statistics')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function archiveStatisticsRecord(id) {
  const { data, error } = await supabase
    .from('analytics_tourism_statistics')
    .update({ is_archived: true, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Economic Records ────────────────────────────────────────

export async function getEconomicRecords({ page = 1, pageSize = 10, search = '', category = '', dateFrom = '', dateTo = '' } = {}) {
  let query = supabase
    .from('analytics_economic_records')
    .select('*', { count: 'exact' })
    .eq('is_archived', false)
    .order('record_date', { ascending: false })

  if (category && category !== 'all') query = query.eq('category', category)
  if (dateFrom) query = query.gte('record_date', dateFrom)
  if (dateTo) query = query.lte('record_date', dateTo)

  const from = (page - 1) * pageSize
  query = query.range(from, from + pageSize - 1)

  const { data, error, count } = await query
  if (error) throw error

  let results = data || []
  if (search) {
    const q = search.toLowerCase()
    results = results.filter(r =>
      r.category?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.data_source?.toLowerCase().includes(q)
    )
  }

  return { data: results, total: count || 0, page, pageSize }
}

export async function createEconomicRecord(record) {
  const { data, error } = await supabase
    .from('analytics_economic_records')
    .insert(record)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateEconomicRecord(id, updates) {
  const { data, error } = await supabase
    .from('analytics_economic_records')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function archiveEconomicRecord(id) {
  const { data, error } = await supabase
    .from('analytics_economic_records')
    .update({ is_archived: true, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// Monthly revenue aggregation
export async function getMonthlyRevenue(year = new Date().getFullYear()) {
  const { data, error } = await supabase
    .from('analytics_economic_records')
    .select('record_date, estimated_amount, category')
    .gte('record_date', `${year}-01-01`)
    .lte('record_date', `${year}-12-31`)
    .eq('is_archived', false)

  if (error) throw error

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const buckets = months.map(m => ({ month: m, revenue: 0 }))

  ;(data || []).forEach(r => {
    const idx = new Date(r.record_date).getMonth()
    if (idx >= 0) buckets[idx].revenue += Number(r.estimated_amount) || 0
  })

  return buckets
}

// ─── Sustainability Records ──────────────────────────────────

export async function getSustainabilityRecords({ page = 1, pageSize = 10, search = '', category = '' } = {}) {
  let query = supabase
    .from('analytics_sustainability_records')
    .select('*', { count: 'exact' })
    .eq('is_archived', false)
    .order('record_date', { ascending: false })

  if (category && category !== 'all') query = query.eq('category', category)

  const from = (page - 1) * pageSize
  query = query.range(from, from + pageSize - 1)

  const { data, error, count } = await query
  if (error) throw error

  let results = data || []
  if (search) {
    const q = search.toLowerCase()
    results = results.filter(r =>
      r.indicator_name?.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q) ||
      r.destination?.toLowerCase().includes(q) ||
      r.notes?.toLowerCase().includes(q)
    )
  }

  return { data: results, total: count || 0, page, pageSize }
}

export async function createSustainabilityRecord(record) {
  const { data, error } = await supabase
    .from('analytics_sustainability_records')
    .insert(record)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSustainabilityRecord(id, updates) {
  const { data, error } = await supabase
    .from('analytics_sustainability_records')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function archiveSustainabilityRecord(id) {
  const { data, error } = await supabase
    .from('analytics_sustainability_records')
    .update({ is_archived: true, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Admin Management ────────────────────────────────────────

export async function getAdmins({ page = 1, pageSize = 10, search = '' } = {}) {
  const from = (page - 1) * pageSize
  let query = supabase
    .from('analytics_admin_roles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)

  const { data, error, count } = await query
  if (error) throw error

  let results = data || []
  if (search) {
    const q = search.toLowerCase()
    results = results.filter(r =>
      r.full_name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.role?.toLowerCase().includes(q)
    )
  }

  return { data: results, total: count || 0, page, pageSize }
}

export async function createAdminRecord(admin) {
  const { data, error } = await supabase
    .from('analytics_admin_roles')
    .insert(admin)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateAdminRecord(id, updates) {
  const { data, error } = await supabase
    .from('analytics_admin_roles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deactivateAdmin(id) {
  const { data, error } = await supabase
    .from('analytics_admin_roles')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Reports ─────────────────────────────────────────────────

export async function getReportHistory({ page = 1, pageSize = 10 } = {}) {
  const from = (page - 1) * pageSize
  const { data, error, count } = await supabase
    .from('analytics_reports')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)

  if (error) throw error
  return { data: data || [], total: count || 0, page, pageSize }
}

export async function saveReport(report) {
  const { data, error } = await supabase
    .from('analytics_reports')
    .insert(report)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Data Sources / Integrations ─────────────────────────────

export async function getDataSources() {
  const { data, error } = await supabase
    .from('analytics_data_sources')
    .select('*')
    .order('source_name', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createDataSource(source) {
  const { data, error } = await supabase
    .from('analytics_data_sources')
    .insert(source)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateDataSource(id, updates) {
  const { data, error } = await supabase
    .from('analytics_data_sources')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Audit Logs ──────────────────────────────────────────────

export async function getAuditLogs({ page = 1, pageSize = 20, search = '', action = '' } = {}) {
  const from = (page - 1) * pageSize
  let query = supabase
    .from('analytics_audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)

  if (action && action !== 'all') query = query.eq('action', action)

  const { data, error, count } = await query
  if (error) throw error

  let results = data || []
  if (search) {
    const q = search.toLowerCase()
    results = results.filter(r =>
      r.action?.toLowerCase().includes(q) ||
      r.table_name?.toLowerCase().includes(q) ||
      r.admin_email?.toLowerCase().includes(q)
    )
  }

  return { data: results, total: count || 0, page, pageSize }
}

// ─── Insights ────────────────────────────────────────────────

export async function getInsights({ page = 1, pageSize = 10 } = {}) {
  const from = (page - 1) * pageSize
  const { data, error, count } = await supabase
    .from('analytics_insights')
    .select('*', { count: 'exact' })
    .order('generated_at', { ascending: false })
    .range(from, from + pageSize - 1)

  if (error) throw error
  return { data: data || [], total: count || 0, page, pageSize }
}

export async function saveInsight(insight) {
  const { data, error } = await supabase
    .from('analytics_insights')
    .insert(insight)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Import Logs ─────────────────────────────────────────────

export async function getImportLogs({ page = 1, pageSize = 10 } = {}) {
  const from = (page - 1) * pageSize
  const { data, error, count } = await supabase
    .from('analytics_import_logs')
    .select('*', { count: 'exact' })
    .order('imported_at', { ascending: false })
    .range(from, from + pageSize - 1)

  if (error) throw error
  return { data: data || [], total: count || 0, page, pageSize }
}

export async function saveImportLog(log) {
  const { data, error } = await supabase
    .from('analytics_import_logs')
    .insert(log)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Destination Breakdown ────────────────────────────────────
// Groups tourism statistics by destination for the chart.
// Returns sorted array of { destination, total, local, foreign }.

export async function getDestinationBreakdown(year = new Date().getFullYear()) {
  const { data, error } = await supabase
    .from('analytics_tourism_statistics')
    .select('destination, local_tourist_count, foreign_tourist_count')
    .gte('reporting_date', `${year}-01-01`)
    .lte('reporting_date', `${year}-12-31`)
    .eq('is_archived', false)

  if (error) throw error

  // Aggregate by destination client-side
  const buckets = {}
  ;(data || []).forEach(r => {
    const dest = r.destination || 'Other'
    if (!buckets[dest]) buckets[dest] = { destination: dest, local: 0, foreign: 0, total: 0 }
    buckets[dest].local += Number(r.local_tourist_count) || 0
    buckets[dest].foreign += Number(r.foreign_tourist_count) || 0
    buckets[dest].total += (Number(r.local_tourist_count) || 0) + (Number(r.foreign_tourist_count) || 0)
  })

  return Object.values(buckets)
    .filter(b => b.total > 0)
    .sort((a, b) => b.total - a.total)  // highest first
}

// ─── Satisfaction Score (from ingest API events) ──────────────
// Reads satisfaction_feedback events from analytics_import_logs
// that were submitted by Subsystem 9 (Sentiment & Feedback).
// Returns { avgScore, totalFeedback, positive, neutral, negative, trend }.
// When Subsystem 9 is live and posting to /api/analytics/ingest,
// this will return real data. Until then it uses the import logs
// for any test pings they've sent.

export async function getSatisfactionScore() {
  try {
    const { data, error } = await supabase
      .from('analytics_import_logs')
      .select('source_name, notes, imported_at, record_count')
      .eq('source_name', 'subsystem_9_sentiment')
      .eq('status', 'success')
      .order('imported_at', { ascending: false })
      .limit(100)

    if (error) throw error

    const logs = data || []

    if (logs.length === 0) {
      return { avgScore: null, totalFeedback: 0, positive: 0, neutral: 0, negative: 0, isLive: false }
    }

    // Parse value from notes field (format: "Value: 4.2 | ...")
    const scores = logs
      .map(log => {
        const match = log.notes?.match(/Value:\s*([\d.]+)/)
        return match ? parseFloat(match[1]) : null
      })
      .filter(v => v !== null && !isNaN(v) && v >= 1 && v <= 5)

    if (scores.length === 0) {
      return { avgScore: null, totalFeedback: logs.length, positive: 0, neutral: 0, negative: 0, isLive: true }
    }

    const avg = scores.reduce((s, v) => s + v, 0) / scores.length
    const positive = scores.filter(v => v >= 4).length
    const neutral = scores.filter(v => v >= 3 && v < 4).length
    const negative = scores.filter(v => v < 3).length

    // Simple trend: compare last 10 vs prior 10
    const recent = scores.slice(0, Math.min(10, scores.length))
    const prior = scores.slice(Math.min(10, scores.length), Math.min(20, scores.length))
    const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length
    const priorAvg = prior.length > 0 ? prior.reduce((s, v) => s + v, 0) / prior.length : recentAvg
    const trend = recentAvg - priorAvg

    return {
      avgScore: parseFloat(avg.toFixed(2)),
      totalFeedback: logs.length,
      positive,
      neutral,
      negative,
      trend: parseFloat(trend.toFixed(2)),
      isLive: true,
    }
  } catch (err) {
    console.warn('[TIA-DAS] getSatisfactionScore error:', err.message)
    return { avgScore: null, totalFeedback: 0, positive: 0, neutral: 0, negative: 0, isLive: false }
  }
}

// ─── Ingest Event Logs (for Integrations page) ────────────────
// Returns recent cross-subsystem events received via /api/analytics/ingest.

export async function getIngestEvents({ page = 1, pageSize = 20 } = {}) {
  const from = (page - 1) * pageSize
  const { data, error, count } = await supabase
    .from('analytics_import_logs')
    .select('*', { count: 'exact' })
    .neq('source_name', 'CSV Import')       // exclude manual CSV uploads
    .order('imported_at', { ascending: false })
    .range(from, from + pageSize - 1)

  if (error) throw error
  return { data: data || [], total: count || 0, page, pageSize }
}
