/**
 * AnalyticsLoading — skeleton loader for TIA-DAS pages
 *
 * Props:
 *   variant: 'page' | 'table' | 'cards' | 'spinner'  (default 'page')
 *   rows:    number of skeleton rows for 'table' variant (default 5)
 *   message: shown only in 'spinner' variant
 */
export default function AnalyticsLoading({ variant = 'page', rows = 5, message = 'Loading…' }) {
  if (variant === 'spinner') {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">{message}</p>
        </div>
      </div>
    )
  }

  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-gray-200 animate-pulse h-28" />
        ))}
      </div>
    )
  }

  if (variant === 'table') {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Fake header */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 animate-pulse rounded flex-1" />
          ))}
        </div>
        {/* Fake rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-3 border-b border-gray-100 flex gap-4 items-center">
            {Array.from({ length: 5 }).map((_, j) => (
              <div
                key={j}
                className={`h-4 bg-gray-100 animate-pulse rounded flex-1 ${j === 0 ? 'max-w-[80px]' : ''}`}
                style={{ animationDelay: `${(i * 5 + j) * 40}ms` }}
              />
            ))}
          </div>
        ))}
      </div>
    )
  }

  // Default: 'page' — header + cards + table skeleton
  return (
    <div className="space-y-6">
      {/* Breadcrumb skeleton */}
      <div className="flex gap-2 items-center">
        <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
        <div className="h-4 w-4 bg-gray-100 animate-pulse rounded" />
        <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
      </div>

      {/* Page title skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-56 bg-gray-200 animate-pulse rounded mb-2" />
          <div className="h-4 w-80 bg-gray-100 animate-pulse rounded" />
        </div>
        <div className="h-10 w-28 bg-gray-200 animate-pulse rounded-xl" />
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-gray-200 animate-pulse h-24" style={{ animationDelay: `${i * 80}ms` }} />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 animate-pulse rounded flex-1" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-4 py-3.5 border-b border-gray-100 flex gap-4 items-center last:border-0">
            {Array.from({ length: 6 }).map((_, j) => (
              <div
                key={j}
                className="h-4 bg-gray-100 animate-pulse rounded flex-1"
                style={{ animationDelay: `${(i * 6 + j) * 30}ms` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
