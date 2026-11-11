'use client'

import { useState, useEffect } from 'react'
import AnalyticsHeader from '../components/AnalyticsHeader'
import { SYSTEM_NAME, SYSTEM_FULL_NAME, ORGANIZATION } from '../lib/analyticsConstants'
import { supabase } from '../../../lib/supabaseClient'
import { logAuditAction } from '../lib/analyticsQueries'

const TABS = ['system', 'profile', 'reporting', 'security']
const TAB_LABELS = { system: 'System Info', profile: 'Admin Profile', reporting: 'Reporting', security: 'Security' }

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('system')
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState({ display_name: '', contact_email: '', position: '' })
  const [reporting, setReporting] = useState({ default_period: 'monthly', currency: 'PHP', date_format: 'MMMM D, YYYY', records_per_page: '10' })
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) {
        setUser(u)
        setProfile(prev => ({ ...prev, contact_email: u.email || '', display_name: u.email?.split('@')[0] || '' }))
      }
    })
  }, [])

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3000) }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await logAuditAction({ adminId: user?.id, action: 'update', tableName: 'analytics_settings', details: { section: 'profile' } })
      showSuccess('Profile preferences saved.')
    } catch (err) {
      setError(err.message || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveReporting = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await logAuditAction({ adminId: user?.id, action: 'update', tableName: 'analytics_settings', details: { section: 'reporting', ...reporting } })
      showSuccess('Reporting preferences saved.')
    } catch (err) {
      setError(err.message || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div>
      <AnalyticsHeader title="Settings" subtitle="System configuration and administrator preferences" />

      {successMsg && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{successMsg}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-2 mb-5 border-b border-gray-200 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition -mb-px whitespace-nowrap min-h-[44px] ${
              activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* System Info */}
      {activeTab === 'system' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">System Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Subsystem Name', value: SYSTEM_FULL_NAME },
                { label: 'Short Name', value: SYSTEM_NAME },
                { label: 'Organization', value: ORGANIZATION },
                { label: 'Assigned Route', value: '/analytics' },
                { label: 'Version', value: '1.0.0' },
                { label: 'Team', value: 'Team 10 — Lerum, Andrei S. & Perillo, Jerold C.' },
                { label: 'Project', value: 'CONNECT-DAET.ph' },
                { label: 'Technology', value: 'Next.js · React · Supabase · Tailwind CSS' },
              ].map(item => (
                <div key={item.label} className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{item.label}</span>
                  <span className="text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Database Tables</h2>
            <div className="text-sm text-gray-600 space-y-1">
              {[
                'analytics_tourism_statistics',
                'analytics_economic_records',
                'analytics_sustainability_records',
                'analytics_destinations',
                'analytics_data_sources',
                'analytics_import_logs',
                'analytics_insights',
                'analytics_reports',
                'analytics_admin_roles',
                'analytics_admin_permissions',
                'analytics_audit_logs',
              ].map(t => (
                <div key={t} className="flex items-center gap-2">
                  <span className="text-blue-600">▸</span>
                  <code className="font-mono text-xs bg-gray-50 px-2 py-0.5 rounded border border-gray-200">{t}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Admin Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm max-w-lg">
          <h2 className="font-semibold text-gray-900 mb-4">Admin Profile</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <input type="text" value={profile.display_name} onChange={(e) => setProfile(p => ({ ...p, display_name: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input type="email" value={profile.contact_email} disabled className={`${inputClass} bg-gray-50 cursor-not-allowed`} />
              <p className="text-xs text-gray-400 mt-1">Email is managed by Supabase Authentication.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position / Title</label>
              <input type="text" value={profile.position} onChange={(e) => setProfile(p => ({ ...p, position: e.target.value }))} className={inputClass} placeholder="e.g. Tourism Data Analyst" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auth User ID</label>
              <input type="text" value={user?.id || '—'} disabled className={`${inputClass} bg-gray-50 cursor-not-allowed font-mono text-xs`} />
            </div>
            <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition min-h-[44px] disabled:opacity-60">
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </form>
        </div>
      )}

      {/* Reporting Preferences */}
      {activeTab === 'reporting' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm max-w-lg">
          <h2 className="font-semibold text-gray-900 mb-4">Reporting Preferences</h2>
          <form onSubmit={handleSaveReporting} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Report Period</label>
              <select value={reporting.default_period} onChange={(e) => setReporting(p => ({ ...p, default_period: e.target.value }))} className={inputClass}>
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select value={reporting.currency} onChange={(e) => setReporting(p => ({ ...p, currency: e.target.value }))} className={inputClass}>
                <option value="PHP">Philippine Peso (₱ PHP)</option>
                <option value="USD">US Dollar ($ USD)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Records Per Page</label>
              <select value={reporting.records_per_page} onChange={(e) => setReporting(p => ({ ...p, records_per_page: e.target.value }))} className={inputClass}>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition min-h-[44px] disabled:opacity-60">
              {saving ? 'Saving…' : 'Save Preferences'}
            </button>
          </form>
        </div>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <div className="space-y-4 max-w-lg">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Security Settings</h2>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Authentication Provider', value: 'Supabase Auth', status: 'active' },
                { label: 'Row Level Security (RLS)', value: 'Enabled on all analytics tables', status: 'active' },
                { label: 'Admin Role Verification', value: 'Server-side via Supabase Auth + RLS', status: 'active' },
                { label: 'Audit Logging', value: 'All create/update/delete/archive actions', status: 'active' },
                { label: 'Password Management', value: 'Managed by Supabase Auth', status: 'active' },
                { label: 'Session Timeout', value: 'Configured in Supabase project settings', status: 'info' },
              ].map(item => (
                <div key={item.label} className="flex items-start justify-between gap-3 py-2 border-b border-gray-50">
                  <div>
                    <div className="font-medium text-gray-800">{item.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.value}</div>
                  </div>
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {item.status === 'active' ? 'Active' : 'Info'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <strong>🔒 Security Note:</strong> Admin-level operations require server-side verification through Supabase RLS policies.
            Frontend-only checks are for UI convenience only and do not substitute for backend authorization.
          </div>
        </div>
      )}
    </div>
  )
}
