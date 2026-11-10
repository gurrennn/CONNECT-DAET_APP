'use client'

import { formatDate, formatDateTime } from '../lib/analyticsHelpers'

export default function ReportCard({ report, onDownload }) {
  const statusColors = {
    generated: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-700',
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex items-start gap-3 min-w-0">
        <div className="text-2xl flex-shrink-0">📄</div>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{report.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {report.report_type?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} •{' '}
            {report.created_by_name || 'Admin'} •{' '}
            {formatDateTime(report.created_at)}
          </p>
          {report.period_label && (
            <p className="text-xs text-gray-400 mt-0.5">Period: {report.period_label}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[report.status] || statusColors.generated}`}>
          {(report.status || 'generated').charAt(0).toUpperCase() + (report.status || 'generated').slice(1)}
        </span>
        {onDownload && (
          <button
            onClick={() => onDownload(report)}
            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition min-h-[36px]"
          >
            Download
          </button>
        )}
      </div>
    </div>
  )
}
