export default function KPICard({ title, value, subtitle, icon, colorClass = 'from-blue-500 to-blue-600', change, changeLabel }) {
  const isPositive = change > 0
  const isNeutral = change === null || change === undefined

  return (
    <div className={`bg-gradient-to-br ${colorClass} rounded-2xl p-5 text-white shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/80 mb-1 truncate">{title}</p>
          <p className="text-2xl font-bold leading-tight truncate">{value}</p>
          {subtitle && <p className="text-xs text-white/70 mt-1 truncate">{subtitle}</p>}
        </div>
        {icon && (
          <div className="text-3xl ml-3 flex-shrink-0 opacity-80">
            {icon}
          </div>
        )}
      </div>
      {!isNeutral && (
        <div className="mt-3 flex items-center gap-1 text-xs text-white/90">
          <span>{isPositive ? '↑' : '↓'}</span>
          <span className="font-medium">{Math.abs(change).toFixed(1)}%</span>
          {changeLabel && <span className="text-white/70">{changeLabel}</span>}
        </div>
      )}
    </div>
  )
}
