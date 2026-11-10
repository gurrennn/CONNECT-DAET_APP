'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LS_KEYS } from '../lib/analyticsConstants'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/analytics', icon: '📊', exact: true },
  { label: 'Tourism Statistics', href: '/analytics/statistics', icon: '📋' },
  { label: 'Economic Impact', href: '/analytics/economic-impact', icon: '💰' },
  { label: 'Sustainability', href: '/analytics/sustainability', icon: '🌿' },
  { label: 'Data Analytics', href: '/analytics/insights', icon: '📈' },
  { label: 'AI Insights', href: '/analytics/insights#ai', icon: '🤖' },
  { label: 'Integrations', href: '/analytics/integrations', icon: '🔗' },
  { label: 'Reports', href: '/analytics/reports', icon: '📄' },
  { label: 'Administrators', href: '/analytics/administrators', icon: '👥' },
  { label: 'Audit Logs', href: '/analytics/audit-logs', icon: '🔍' },
  { label: 'Settings', href: '/analytics/settings', icon: '⚙️' },
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
    if (item.href === '/analytics/insights#ai') {
      return false // Don't highlight AI sub-link separately
    }
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
          <span className="text-lg">{collapsed ? '→' : '←'}</span>
        </button>
      </div>

      {/* Admin Info */}
      {!collapsed && adminName && (
        <div className="px-4 py-3 border-b border-blue-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
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
              {/* Active indicator bar — visible on both desktop and mobile */}
              {active && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full" />
              )}
              <span className={`text-lg flex-shrink-0 ${active ? '' : 'opacity-80'}`}>{item.icon}</span>
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-3 border-t border-blue-700">
        {onSignOut && (
          <button
            onClick={onSignOut}
            className={`
              flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium
              text-blue-100 hover:bg-blue-700 transition-colors min-h-[44px]
            `}
            title={collapsed ? 'Sign Out' : undefined}
          >
            <span className="text-lg flex-shrink-0">🚪</span>
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
        <span className="text-xl">{mobileOpen ? '✕' : '☰'}</span>
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
      <div className={`
        md:hidden fixed top-0 left-0 h-full z-50 transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <SidebarContent />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <SidebarContent />
      </div>
    </>
  )
}
