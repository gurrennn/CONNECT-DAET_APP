'use client'

import { DEFAULT_PAGE_SIZE } from '../lib/analyticsConstants'

/**
 * Reusable sortable, paginated data table for TIA-DAS
 *
 * Props:
 *  columns:      [{ key, label, render?, sortable?, className? }]
 *  data:         array of row objects
 *  total:        total record count (server-side)
 *  page:         current page (1-indexed)
 *  pageSize:     records per page
 *  onPageChange: fn(page)
 *  sortKey, sortDir, onSort: optional sort handling
 *  emptyMessage: string shown when data is empty
 *  loading:      bool — shows skeleton rows when true
 */
export default function DataTable({
  columns = [],
  data = [],
  total = 0,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  onPageChange,
  sortKey,
  sortDir = 'asc',
  onSort,
  emptyMessage = 'No records found.',
  loading = false,
}) {
  const totalPages = Math.ceil(total / pageSize)
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, total)

  const handleSort = (key) => {
    if (!onSort) return
    onSort(key, sortKey === key && sortDir === 'asc' ? 'desc' : 'asc')
  }

  const getPageNumbers = () => {
    const pages = []
    const delta = 2
    const left = Math.max(1, page - delta)
    const right = Math.min(totalPages, page + delta)
    if (left > 1) { pages.push(1); if (left > 2) pages.push('...') }
    for (let i = left; i <= right; i++) pages.push(i)
    if (right < totalPages) { if (right < totalPages - 1) pages.push('...'); pages.push(totalPages) }
    return pages
  }

  const renderBody = () => {
    // Skeleton rows while loading
    if (loading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <tr key={`skel-${i}`}>
          {columns.map((col, j) => (
            <td key={col.key} className="px-4 py-3">
              <div
                className="h-4 bg-gray-100 animate-pulse rounded"
                style={{
                  width: j === 0 ? '55%' : j === columns.length - 1 ? '70px' : '75%',
                  animationDelay: `${(i * columns.length + j) * 25}ms`,
                }}
              />
            </td>
          ))}
        </tr>
      ))
    }

    // Empty state
    if (data.length === 0) {
      return (
        <tr>
          <td colSpan={columns.length} className="px-4 py-12 text-center">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <span className="text-3xl">📭</span>
              <span className="text-sm">{emptyMessage}</span>
            </div>
          </td>
        </tr>
      )
    }

    // Data rows
    return data.map((row, rowIdx) => (
      <tr key={row.id || rowIdx} className="hover:bg-gray-50 transition-colors">
        {columns.map((col) => (
          <td key={col.key} className={`px-4 py-3 text-gray-700 ${col.className || ''}`}>
            {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
          </td>
        ))}
      </tr>
    ))
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Scrollable table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`
                    px-4 py-3 font-semibold text-gray-600 whitespace-nowrap
                    ${col.sortable && onSort ? 'cursor-pointer select-none hover:text-blue-600' : ''}
                    ${col.className || ''}
                  `}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && onSort && (
                      <span className="text-xs text-gray-400">
                        {sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {renderBody()}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500">
            Showing {startItem}–{endItem} of {total} records
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="px-2.5 py-1.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed min-h-[36px]"
            >‹</button>
            {getPageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`dots-${i}`} className="px-2 text-gray-400">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm border min-h-[36px] transition-colors ${
                    p === page ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 hover:bg-gray-100 text-gray-700'
                  }`}
                >{p}</button>
              )
            )}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="px-2.5 py-1.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed min-h-[36px]"
            >›</button>
          </div>
        </div>
      )}
      {total > 0 && totalPages <= 1 && (
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500">{total} record{total !== 1 ? 's' : ''}</p>
        </div>
      )}
    </div>
  )
}
