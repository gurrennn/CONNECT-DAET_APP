export default function KPICard({ title, value, subtitle, change, changeLabel }) {
  const isPositive = change > 0
  const isNeutral = change === null || change === undefined

  return (
    <div className="bg-gray-200/80 border border-gray-300 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 mb-1 truncate">{title}</p>
          <p className="text-2xl font-bold leading-tight truncate text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1 truncate">{subtitle}</p>}
        </div>
      </div>
      {!isNeutral && (
        <div className="mt-3 flex items-center gap-1 text-xs text-gray-600">
          <span>{isPositive ? '↑' : '↓'}</span>
          <span className="font-medium">{Math.abs(change).toFixed(1)}%</span>
          {changeLabel && <span className="text-gray-500">{changeLabel}</span>}
        </div>
      )}
    </div>
  )
}
