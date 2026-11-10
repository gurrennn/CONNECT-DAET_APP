import Link from 'next/link'

/**
 * Breadcrumbs component
 *
 * Props:
 *   items: [{ label, href? }]
 *   — last item has no href (current page)
 *
 * Usage:
 *   <Breadcrumbs items={[
 *     { label: 'Dashboard', href: '/analytics' },
 *     { label: 'Tourism Statistics', href: '/analytics/statistics' },
 *     { label: 'Add Record' },
 *   ]} />
 */
export default function Breadcrumbs({ items = [] }) {
  if (!items.length) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1
          return (
            <li key={idx} className="flex items-center gap-1">
              {idx > 0 && (
                <span className="text-gray-300 select-none">›</span>
              )}
              {isLast || !item.href ? (
                <span
                  className="text-gray-800 font-medium truncate max-w-[180px]"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[180px] transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
