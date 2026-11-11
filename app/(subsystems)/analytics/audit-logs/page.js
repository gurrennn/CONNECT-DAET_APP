'use client'

import { useState, useEffect, useCallback } from 'react'
import AnalyticsHeader from '../components/AnalyticsHeader'
import DataTable from '../components/DataTable'
import AnalyticsLoading from '../components/AnalyticsLoading'
import Breadcrumbs from '../components/Breadcrumbs'
import { getAuditLogs } from '../lib/analyticsQueries'
import { AUDIT_ACTIONS, AUDIT_ACTION_LABELS } from '../lib/analyticsConstants'
import { formatDateTime, formatRelativeTime } from '../lib/analyticsHelpers'

const ACTION_COLORS = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
  archive: 'bg-orange-100 text-orange-700',
  login: 'bg-gray-100 text-gray-700',
  logout: 'bg-gray-100 text-gray-700',
  generate_report: 'bg-purple-100 text-purple-700',
  import_data: 'bg-teal-100 text-teal-700',
  change_permission: 'bg-yellow-100 text-yellow-700',
  view: 'bg-sky-100 text-sky-700',
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [expandedRow, setExpandedRow] = useState(null)

  const pageSize = 20

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getAuditLogs({ page, pageSize, search, action: filterAction })
      setLogs(result.data)
      setTotal(result.total)
    } catch (err) {
      setError(err.message || 'Failed to load audit logs.')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, filterAction])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const columns = [
    {
      key: 'created_at',
      label: 'Timestamp',
      sortable: true,
      render: (v) => (
        <div>
          <div className="text-xs font-medium">{formatDateTime(v)}</div>
          <div className="text-xs text-gray-400">{formatRelativeTime(v)}</div>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (v) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[v] || 'bg-gray-100 text-gray-700'}`}>
          {AUDIT_ACTION_LABELS[v] || v}
        </span>
      ),
    },
    { key: 'table_name', label: 'Module', render: (v) => v ? v.replace('analytics_', '').replace(/_/g, ' ') : '—' },
    { key: 'admin_email', label: 'Admin', render: (v) => v || '—' },
    {
      key: 'details',
      label: 'Details',
      render: (v, row) => {
        if (!v || Object.keys(v).length === 0) return <span className="text-gray-400 text-xs">—</span>
        return (
          <button
            onClick={() => setExpandedRow(expandedRow?.id === row.id ? null : row)}
            className="text-xs text-blue-600 hover:underline"
          >
            View details
          </button>
        )
      },
    },
  ]

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/analytics' }, { label: 'Audit Logs' }]} />
      <AnalyticsHeader title="Audit Logs" subtitle="Track all administrative actions in the system" />

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 mb-5">
        Audit logs are read-only and protected. Administrators cannot modify or delete log entries.
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-5 shadow-sm flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by action, module, or admin…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-[200px]"
        />
        <select
          value={filterAction}
          onChange={(e) => { setFilterAction(e.target.value); setPage(1) }}
          className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Actions</option>
          {Object.entries(AUDIT_ACTION_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <button
          onClick={() => { setSearch(''); setFilterAction(''); setPage(1) }}
          className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition min-h-[44px]"
        >
          Clear
        </button>
      </div>

      {loading ? <AnalyticsLoading message="Loading audit logs…" /> : (
        <>
          <DataTable
            columns={columns}
            data={logs}
            total={total}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            emptyMessage="No audit log entries found."
          />

          {/* Expanded details panel */}
          {expandedRow && (
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 text-sm">Log Details — {formatDateTime(expandedRow.created_at)}</h3>
                <button onClick={() => setExpandedRow(null)} className="text-gray-400 hover:text-gray-600 text-lg min-h-[36px] min-w-[36px] flex items-center justify-center">✕</button>
              </div>
              <pre className="text-xs text-gray-700 bg-white rounded-lg border border-gray-200 p-3 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(expandedRow.details, null, 2)}
              </pre>
              <div className="mt-2 text-xs text-gray-500">
                <span className="font-medium">Record ID:</span> {expandedRow.record_id || 'N/A'} ·{' '}
                <span className="font-medium">Admin ID:</span> {expandedRow.admin_id || 'N/A'}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
