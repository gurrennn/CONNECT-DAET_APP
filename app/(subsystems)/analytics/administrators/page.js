'use client'

import { useState, useEffect, useCallback } from 'react'
import AnalyticsHeader from '../components/AnalyticsHeader'
import DataTable from '../components/DataTable'
import AnalyticsLoading from '../components/AnalyticsLoading'
import Breadcrumbs from '../components/Breadcrumbs'
import ConfirmModal from '../components/ConfirmModal'
import { ToastContainer, useToast } from '../components/Toast'
import { getAdmins, createAdminRecord, updateAdminRecord, deactivateAdmin, logAuditAction } from '../lib/analyticsQueries'
import { validateAdminForm, isValid } from '../lib/analyticsValidation'
import { ADMIN_ROLES, ROLE_LABELS, ROLE_COLORS, ROLE_PERMISSIONS, DEFAULT_PAGE_SIZE } from '../lib/analyticsConstants'
import { formatDateTime } from '../lib/analyticsHelpers'
import { supabase } from '../../../lib/supabaseClient'

const EMPTY_FORM = {
  full_name: '',
  email: '',
  role: ADMIN_ROLES.TOURISM_ADMIN,
  password: '',
  is_active: true,
}

export default function AdministratorsPage() {
  const [admins, setAdmins] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [editAdmin, setEditAdmin] = useState(null)
  const [search, setSearch] = useState('')
  const [showPermissions, setShowPermissions] = useState(null)

  const pageSize = DEFAULT_PAGE_SIZE

  const fetchAdmins = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getAdmins({ page, pageSize, search })
      setAdmins(result.data)
      setTotal(result.total)
    } catch (err) {
      setError(err.message || 'Failed to load administrators.')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search])

  useEffect(() => { fetchAdmins() }, [fetchAdmins])

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3000) }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validateAdminForm(form, !editAdmin)
    if (!isValid(errs)) { setFormErrors(errs); return }

    setSubmitting(true)
    setError(null)
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      if (editAdmin) {
        const payload = { full_name: form.full_name, role: form.role, is_active: form.is_active }
        await updateAdminRecord(editAdmin.id, payload)
        await logAuditAction({ adminId: currentUser?.id, action: 'update', tableName: 'analytics_admin_roles', recordId: editAdmin.id, details: payload })
        showSuccess('Administrator updated.')
      } else {
        // Create Supabase Auth user then record
        const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
          email: form.email,
          password: form.password,
          email_confirm: true,
        }).catch(() => ({ data: null, error: { message: 'Auth user creation is not available via anon key. Record saved without Auth user.' } }))

        const created = await createAdminRecord({
          full_name: form.full_name,
          email: form.email,
          role: form.role,
          is_active: true,
          supabase_user_id: authData?.user?.id || null,
          created_by: currentUser?.id,
        })
        await logAuditAction({ adminId: currentUser?.id, action: 'create', tableName: 'analytics_admin_roles', recordId: created.id, details: { email: form.email, role: form.role } })
        showSuccess('Administrator record created.')
      }

      setShowModal(false)
      setEditAdmin(null)
      setForm(EMPTY_FORM)
      fetchAdmins()
    } catch (err) {
      setError(err.message || 'Failed to save administrator.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeactivate = async (admin) => {
    if (!confirm(`Deactivate ${admin.full_name}'s admin access?`)) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await deactivateAdmin(admin.id)
      await logAuditAction({ adminId: user?.id, action: 'change_permission', tableName: 'analytics_admin_roles', recordId: admin.id, details: { action: 'deactivate', target: admin.email } })
      showSuccess('Administrator deactivated.')
      fetchAdmins()
    } catch (err) {
      setError(err.message || 'Failed to deactivate admin.')
    }
  }

  const handleEdit = (admin) => {
    setEditAdmin(admin)
    setForm({ full_name: admin.full_name || '', email: admin.email || '', role: admin.role || ADMIN_ROLES.TOURISM_ADMIN, password: '', is_active: admin.is_active !== false })
    setFormErrors({})
    setShowModal(true)
  }

  const openAdd = () => { setEditAdmin(null); setForm(EMPTY_FORM); setFormErrors({}); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setEditAdmin(null); setFormErrors({}); setError(null) }

  const inputClass = (field) =>
    `w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      formErrors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`

  const columns = [
    {
      key: 'full_name',
      label: 'Name',
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {v?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <span>{v}</span>
        </div>
      ),
    },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (v) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[v] || 'bg-gray-100 text-gray-700'}`}>
          {ROLE_LABELS[v] || v}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (v) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {v !== false ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    { key: 'created_at', label: 'Created', render: (v) => formatDateTime(v) },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(row)} className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition min-h-[36px]">Edit</button>
          <button onClick={() => setShowPermissions(row)} className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium hover:bg-purple-100 transition min-h-[36px]">Perms</button>
          {row.is_active !== false && (
            <button onClick={() => handleDeactivate(row)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100 transition min-h-[36px]">Deactivate</button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/analytics' }, { label: 'Administrator Management' }]} />
      <AnalyticsHeader
        title="Administrator Management"
        subtitle="Manage admin accounts and role-based access control"
        actions={<button onClick={openAdd} className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition min-h-[44px]">+ Add Administrator</button>}
      />

      {successMsg && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">✅ {successMsg}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</div>}

      {/* Role cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {Object.entries(ROLE_LABELS).map(([roleKey, roleLabel]) => {
          const count = admins.filter(a => a.role === roleKey && a.is_active !== false).length
          return (
            <div key={roleKey} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[roleKey]}`}>{roleLabel}</span>
                <span className="text-2xl font-bold text-gray-900">{count}</span>
              </div>
              <div className="text-xs text-gray-400">Active admins on this page</div>
            </div>
          )
        })}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-5 shadow-sm">
        <input
          type="text"
          placeholder="Search by name, email, or role…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? <AnalyticsLoading /> : (
        <DataTable
          columns={columns}
          data={admins}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          emptyMessage="No administrators found. Click '+ Add Administrator' to create one."
        />
      )}

      {/* Permissions Modal */}
      {showPermissions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPermissions(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Permissions — {showPermissions.full_name}</h2>
              <button onClick={() => setShowPermissions(null)} className="text-gray-400 hover:text-gray-600 text-xl min-h-[44px] min-w-[44px] flex items-center justify-center">✕</button>
            </div>
            <div className="mb-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[showPermissions.role]}`}>
                {ROLE_LABELS[showPermissions.role]}
              </span>
            </div>
            <div className="space-y-2">
              {(ROLE_PERMISSIONS[showPermissions.role] || []).map(perm => (
                <div key={perm} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-green-600">✓</span>
                  <span className="capitalize">{perm.replace(/_/g, ' ')}</span>
                </div>
              ))}
              {!ROLE_PERMISSIONS[showPermissions.role]?.length && (
                <p className="text-sm text-gray-400">No permissions configured for this role.</p>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
              Permissions are defined per role and enforced server-side via Supabase RLS.
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{editAdmin ? 'Edit Administrator' : 'Add Administrator'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl min-h-[44px] min-w-[44px] flex items-center justify-center">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input type="text" name="full_name" value={form.full_name} onChange={handleChange} className={inputClass('full_name')} placeholder="Administrator's full name" />
                {formErrors.full_name && <p className="text-red-500 text-xs mt-1">{formErrors.full_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input type="email" name="email" value={form.email} onChange={handleChange} disabled={!!editAdmin} className={`${inputClass('email')} ${editAdmin ? 'bg-gray-50 cursor-not-allowed' : ''}`} placeholder="admin@example.com" />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>

              {!editAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                  <input type="password" name="password" value={form.password} onChange={handleChange} className={inputClass('password')} placeholder="Min. 8 characters" />
                  {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
                <select name="role" value={form.role} onChange={handleChange} className={inputClass('role')}>
                  {Object.entries(ROLE_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                </select>
                {form.role && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 font-medium mb-1">Permissions for this role:</p>
                    <div className="flex flex-wrap gap-1">
                      {(ROLE_PERMISSIONS[form.role] || []).map(p => (
                        <span key={p} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{p.replace(/_/g, ' ')}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {editAdmin && (
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_active" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 rounded border-gray-300" />
                  <label htmlFor="is_active" className="text-sm text-gray-700">Account is Active</label>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} disabled={submitting} className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition min-h-[44px] disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition min-h-[44px] disabled:opacity-60 flex items-center gap-2">
                  {submitting && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                  {editAdmin ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
