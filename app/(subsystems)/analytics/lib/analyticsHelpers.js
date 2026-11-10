// ============================================================
// TIA-DAS Helper Utilities
// Tourism Impact Assessment and Data Analytics System
// ============================================================

import { CHART_COLORS, PIE_COLORS } from './analyticsConstants'

// ─── Formatting ──────────────────────────────────────────────

/**
 * Format a number as Philippine Peso
 */
export function formatPeso(value, options = {}) {
  const { compact = false, decimals = 2 } = options
  if (value == null || isNaN(value)) return '₱0.00'

  if (compact) {
    if (Math.abs(value) >= 1_000_000) {
      return `₱${(value / 1_000_000).toFixed(1)}M`
    }
    if (Math.abs(value) >= 1_000) {
      return `₱${(value / 1_000).toFixed(1)}K`
    }
  }

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format a large number with commas
 */
export function formatNumber(value) {
  if (value == null || isNaN(value)) return '0'
  return new Intl.NumberFormat('en-PH').format(value)
}

/**
 * Format a percentage
 */
export function formatPercent(value, decimals = 1) {
  if (value == null || isNaN(value)) return '0%'
  return `${Number(value).toFixed(decimals)}%`
}

/**
 * Format a date to readable string
 */
export function formatDate(dateString, options = {}) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '—'

  const defaults = { year: 'numeric', month: 'long', day: 'numeric' }
  return date.toLocaleDateString('en-PH', { ...defaults, ...options })
}

/**
 * Format a date + time
 */
export function formatDateTime(dateString) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(dateString)
}

// ─── Growth / Trend Calculations ─────────────────────────────

/**
 * Calculate growth rate between two values
 * Returns a percentage (positive = growth, negative = decline)
 */
export function calcGrowthRate(current, previous) {
  if (!previous || previous === 0) return null
  return ((current - previous) / previous) * 100
}

/**
 * Returns trend icon and color class based on change %
 */
export function getTrendIndicator(changePercent, reverseColors = false) {
  if (changePercent == null) return { icon: '—', colorClass: 'text-gray-500', label: 'No data' }

  const isPositive = changePercent > 0
  const isGood = reverseColors ? !isPositive : isPositive

  if (Math.abs(changePercent) < 1) {
    return { icon: '→', colorClass: 'text-gray-500', label: 'Stable' }
  }

  return {
    icon: isPositive ? '↑' : '↓',
    colorClass: isGood ? 'text-green-600' : 'text-red-600',
    label: `${isPositive ? '+' : ''}${changePercent.toFixed(1)}%`,
  }
}

// ─── Data Processing ─────────────────────────────────────────

/**
 * Group an array of records by a date field into monthly buckets
 * Returns array of { month: 'Jan 2025', count, total }
 */
export function groupByMonth(records, dateField = 'created_at', valueField = null) {
  if (!records || records.length === 0) return []

  const buckets = {}
  records.forEach((record) => {
    const date = new Date(record[dateField])
    if (isNaN(date.getTime())) return

    const key = date.toLocaleString('en-PH', { month: 'short', year: 'numeric' })
    if (!buckets[key]) {
      buckets[key] = { month: key, count: 0, total: 0 }
    }
    buckets[key].count++
    if (valueField && record[valueField]) {
      buckets[key].total += Number(record[valueField]) || 0
    }
  })

  return Object.values(buckets).sort((a, b) => {
    const dateA = new Date(a.month)
    const dateB = new Date(b.month)
    return dateA - dateB
  })
}

/**
 * Paginate an array client-side
 */
export function paginateArray(array, page, pageSize) {
  const start = (page - 1) * pageSize
  return {
    data: array.slice(start, start + pageSize),
    total: array.length,
    totalPages: Math.ceil(array.length / pageSize),
    page,
    pageSize,
  }
}

/**
 * Sort an array of objects by a key
 */
export function sortBy(array, key, direction = 'asc') {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    if (aVal == null) return 1
    if (bVal == null) return -1

    const result = typeof aVal === 'string'
      ? aVal.localeCompare(bVal)
      : aVal - bVal

    return direction === 'desc' ? -result : result
  })
}

/**
 * Filter records by a search query across multiple fields
 */
export function filterBySearch(records, query, fields) {
  if (!query || !query.trim()) return records
  const q = query.toLowerCase()
  return records.filter((record) =>
    fields.some((field) => {
      const val = record[field]
      return val != null && String(val).toLowerCase().includes(q)
    })
  )
}

// ─── Chart Helpers ───────────────────────────────────────────

/**
 * Get a color from the chart palette by index
 */
export function getChartColor(index) {
  return PIE_COLORS[index % PIE_COLORS.length]
}

/**
 * Build monthly labels for the current year
 */
export function getMonthLabels() {
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
}

/**
 * Generate sample monthly data (for labeled demo use only)
 */
export function generateSampleMonthlyData(baseValue = 1000, variance = 0.3, field = 'value') {
  return getMonthLabels().map((month) => ({
    month,
    [field]: Math.round(baseValue * (1 + (Math.random() - 0.5) * variance)),
  }))
}

// ─── Validation Helpers ──────────────────────────────────────

/**
 * Check if a value is a valid positive number
 */
export function isPositiveNumber(value) {
  return !isNaN(value) && Number(value) >= 0
}

/**
 * Truncate a string to max length with ellipsis
 */
export function truncate(str, maxLength = 50) {
  if (!str) return ''
  return str.length > maxLength ? str.slice(0, maxLength) + '…' : str
}

/**
 * Generate a random UUID v4 (client-side only, for temp IDs)
 */
export function generateTempId() {
  return 'tmp-' + Math.random().toString(36).slice(2, 11)
}

// ─── Supabase / RLS Helpers ──────────────────────────────────

/**
 * Extract a user-friendly error message from Supabase errors
 */
export function extractError(error) {
  if (!error) return null
  if (typeof error === 'string') return error
  return error.message || error.error_description || 'An unexpected error occurred.'
}

/**
 * Build a date range filter object for Supabase queries
 * Returns { gte, lte } ISO strings
 */
export function buildDateRange(preset) {
  const now = new Date()
  const end = now.toISOString()

  switch (preset) {
    case '7d': {
      const start = new Date(now)
      start.setDate(start.getDate() - 7)
      return { gte: start.toISOString(), lte: end }
    }
    case '30d': {
      const start = new Date(now)
      start.setDate(start.getDate() - 30)
      return { gte: start.toISOString(), lte: end }
    }
    case '90d': {
      const start = new Date(now)
      start.setDate(start.getDate() - 90)
      return { gte: start.toISOString(), lte: end }
    }
    case 'ytd': {
      const start = new Date(now.getFullYear(), 0, 1)
      return { gte: start.toISOString(), lte: end }
    }
    case 'all':
    default:
      return { gte: null, lte: null }
  }
}
