'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LS_KEYS } from '../lib/analyticsConstants'

// ── SVG icon components ───────────────────────────────────────
const Icon = ({ d, viewBox = '0 0 24 24' }) => (
  <svg viewBox={viewBox} fill="currentColor" className="w-5 h-5 flex-shrink-0" aria-hidden="true">
    <path d={d} />
  </svg>
)

const Icons = {
  dashboard:   () => <Icon d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />,
  statistics:  () => <Icon d="M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm2.5 2.1h-15V5h15v14.1zm0-16.1h-15C2.3 3 1 4.3 1 5.9v14.1C1 21.6 2.3 23 3.9 23h15c1.7 0 3-1.4 3-3V5.9C22 4.3 20.6 3 18.9 3z" />,
  economic:    () => <Icon d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />,
  sustain:     () => <Icon d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 2-8 2s3-2 7-2c-6 0-11 4-11 4 1-4 7-4 7-4-9 2-10 10-10 10C3.14 11.95 1.52 10.3 1 8h-.23C.37 9.07 0 10.07 0 11c0 6.07 7.21 10.3 12 10.3A13 13 0 0021 7.3L17 8z" />,
  analytics:   () => <Icon d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />,
  ai:          () => <Icon d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z" />,
  integrations:() => <Icon d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />,
  reports:     () => <Icon d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />,
  admins:      () => <Icon d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />,
  audit:       () => <Icon d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />,
  settings:    () => <Icon d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />,
  signout:     () => <Icon d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />,
  menu:        () => <Icon d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />,
  close:       () => <Icon d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />,
  chevronLeft: () => <Icon d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />,
  chevronRight:() => <Icon d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />,
}

const NAV_ITEMS = [
  { label: 'Dashboard',         href: '/analytics',                 IconComp: Icons.dashboard,    exact: true },
  { label: 'Tourism Statistics',href: '/analytics/statistics',      IconComp: Icons.statistics },
  { label: 'Economic Impact',   href: '/analytics/economic-impact', IconComp: Icons.economic },
  { label: 'Sustainability',    href: '/analytics/sustainability',  IconComp: Icons.sustain },
  { label: 'Data Analytics',   href: '/analytics/insights',        IconComp: Icons.analytics },
  { label: 'Integrations',      href: '/analytics/integrations',    IconComp: Icons.integrations },
  { label: 'Reports',           href: '/analytics/reports',         IconComp: Icons.reports },
  { label: 'Administrators',    href: '/analytics/administrators',  IconComp: Icons.admins },
  { label: 'System Logs',       href: '/analytics/audit-logs',      IconComp: Icons.audit },
  { label: 'Settings',          href: '/analytics/settings',        IconComp: Icons.settings },
]

export default function AnalyticsSidebar({ adminName, adminRole, onSignOut }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LS_KEYS.SIDEBAR_COLLAPSED)
      if (saved === 'true') setCollapsed(true)
    }
  }, [])

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev
      localStorage.setItem(LS_KEYS.SIDEBAR_COLLAPSED, String(next))
      return next
    })
  }

  const isActive = (item) => {
    if (item.href === '/analytics/insights#ai') return false
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href) && item.href !== '/analytics'
  }

  const SidebarContent = () => (
    <div className={`flex flex-col h-full bg-gradient-to-b from-blue-800 to-blue-900 text-white transition-all duration-200 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo / Header */}
      <div className="flex items-center justify-between p-4 border-b border-blue-700 min-h-[64px]">
        {!collapsed && (
          <div>
            <div className="text-sm font-bold text-white leading-tight">TIA-DAS</div>
            <div className="text-xs text-blue-200 leading-tight">Tourism Analytics</div>
          </div>
        )}
        <button
          onClick={toggleCollapsed}
          className="p-1.5 rounded-md hover:bg-blue-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <Icons.chevronRight /> : <Icons.chevronLeft />}
        </button>
      </div>

      {/* Admin Info */}
      {!collapsed && adminName && (
        <div className="px-4 py-3 border-b border-blue-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-medium text-white truncate">{adminName}</div>
              <div className="text-xs text-blue-300 capitalize">{adminRole?.replace('_', ' ')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2" aria-label="Analytics navigation">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-2.5 mx-2 my-0.5 rounded-lg text-sm font-medium
                transition-all duration-150 min-h-[44px] relative
                ${active
                  ? 'bg-white text-blue-800 shadow-md font-semibold ring-2 ring-white/30'
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }
              `}
              title={collapsed ? item.label : undefined}
              onClick={() => setMobileOpen(false)}
            >
              {active && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full" />
              )}
              <item.IconComp />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-3 border-t border-blue-700">
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-blue-100 hover:bg-blue-700 transition-colors min-h-[44px]"
            title={collapsed ? 'Sign Out' : undefined}
          >
            <Icons.signout />
            {!collapsed && <span>Sign Out</span>}
          </button>
        )}
        {!collapsed && (
          <div className="mt-2 text-xs text-blue-400 text-center">
            CONNECT-DAET.ph v1.0
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-800 text-white rounded-lg shadow-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle mobile navigation"
      >
        {mobileOpen ? <Icons.close /> : <Icons.menu />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`md:hidden fixed top-0 left-0 h-full z-50 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <SidebarContent />
      </div>
    </>
  )
}
