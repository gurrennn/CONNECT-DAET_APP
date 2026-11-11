'use client'

import { useState, useEffect, useCallback } from 'react'
import AnalyticsHeader from '../components/AnalyticsHeader'
import AnalyticsLoading from '../components/AnalyticsLoading'
import DataTable from '../components/DataTable'
import {
  getDataSources,
  createDataSource,
  updateDataSource,
  getImportLogs,
  logAuditAction,
} from '../lib/analyticsQueries'
import {
  INTEGRATION_STATUS,
  INTEGRATION_STATUS_LABELS,
  INTEGRATION_STATUS_COLORS,
  OTHER_SUBSYSTEMS,
} from '../lib/analyticsConstants'
import { formatDate, formatDateTime } from '../lib/analyticsHelpers'
import { supabase } from '../../../lib/supabaseClient'

const DATA_CATEGORIES = ['Manual Entry', 'CSV Import', 'System Integration', 'API Feed', 'Survey Data', 'Government Report']

const EMPTY_FORM = {
  source_name: '',
  source_description: '',
  source_category: 'Manual Entry',
  integration_status: INTEGRATION_STATUS.NOT_CONNECTED,
}

export default function IntegrationsPage() {
  const [dataSources, setDataSources] = useState([])
  const [importLogs, setImportLogs] = useState([])
  const [importLogsTotal, setImportLogsTotal] = useState(0)
  const [importPage, setImportPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [editSource, setEditSource] = useState(null)
  const [activeTab, setActiveTab] = useState('sources')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [sources, logsResult] = await Promise.all([
        getDataSources(),
        getImportLogs({ page: importPage, pageSize: 10 }),
      ])
      setDataSources(sources)
      setImportLogs(logsResult.data)
      setImportLogsTotal(logsResult.total)
    } catch (err) {
      setError(err.message || 'Failed to load integration data.')
    } finally {
      setLoading(false)
    }
  }, [importPage])

  useEffect(() => { fetchData() }, [fetchData])

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3000) }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.source_name.trim()) {
      setFormErrors({ source_name: 'Source name is required.' })
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (editSource) {
        await updateDataSource(editSource.id, { ...form, updated_by: user?.id })
        await logAuditAction({ adminId: user?.id, action: 'update', tableName: 'analytics_data_sources', recordId: editSource.id })
        showSuccess('Data source updated.')
      } else {
        const created = await createDataSource({ ...form, created_by: user?.id })
        await logAuditAction({ adminId: user?.id, action: 'create', tableName: 'analytics_data_sources', recordId: created.id })
        showSuccess('Data source registered.')
      }

      setShowModal(false)
      setEditSource(null)
      setForm(EMPTY_FORM)
      fetchData()
    } catch (err) {
      setError(err.message || 'Failed to save data source.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (source) => {
    setEditSource(source)
    setForm({
      source_name: source.source_name || '',
      source_description: source.source_description || '',
      source_category: source.source_category || 'Manual Entry',
      integration_status: source.integration_status || INTEGRATION_STATUS.NOT_CONNECTED,
    })
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditSource(null); setFormErrors({}); setError(null) }

  const sourceColumns = [
    { key: 'source_name', label: 'Source Name' },
    { key: 'source_category', label: 'Category' },
    { key: 'source_description', label: 'Description', render: (v) => v ? (v.length > 50 ? v.slice(0, 50) + '…' : v) : '—' },
    {
      key: 'integration_status',
      label: 'Status',
      render: (v) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${INTEGRATION_STATUS_COLORS[v] || 'bg-gray-100 text-gray-700'}`}>
          {INTEGRATION_STATUS_LABELS[v] || v}
        </span>
      ),
    },
    { key: 'updated_at', label: 'Last Updated', render: (v) => v ? formatDateTime(v) : '—' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button onClick={() => handleEdit(row)} className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition min-h-[36px]">Edit</button>
      ),
    },
  ]

  const importLogColumns = [
    { key: 'source_name', label: 'Source' },
    { key: 'imported_at', label: 'Imported At', render: (v) => formatDateTime(v) },
    { key: 'record_count', label: 'Records', render: (v) => v?.toLocaleString() || '—' },
    { key: 'status', label: 'Status', render: (v) => <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{v || 'unknown'}</span> },
    { key: 'notes', label: 'Notes', render: (v) => v || '—' },
  ]

  const inputClass = (field) =>
    `w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      formErrors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`

  if (loading) return <AnalyticsLoading message="Loading integration data…" />

  return (
    <div>
      <AnalyticsHeader
        title="Data Source & Integration Management"
        subtitle="Manage data sources and prepare for future subsystem integrations"
        actions={<button onClick={() => { setEditSource(null); setForm(EMPTY_FORM); setFormErrors({}); setShowModal(true) }} className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition min-h-[44px]">+ Register Source</button>}
      />

      {successMsg && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{successMsg}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-2 mb-5 border-b border-gray-200">
        {['sources', 'subsystems', 'import-logs'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition -mb-px min-h-[44px] ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'sources' ? 'Data Sources' : tab === 'subsystems' ? 'CONNECT-DAET Subsystems' : 'Import Logs'}
          </button>
        ))}
      </div>

      {activeTab === 'sources' && (
        <DataTable
          columns={sourceColumns}
          data={dataSources}
          total={dataSources.length}
          page={1}
          pageSize={dataSources.length || 10}
          emptyMessage="No data sources registered. Click '+ Register Source' to add one."
        />
      )}

      {activeTab === 'subsystems' && (
        <div>
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
            <strong>Integration Status:</strong> The other CONNECT-DAET subsystems are developed independently by separate teams.
            These integrations are listed for future reference. All are currently <strong>Pending Integration</strong> or <strong>Not Connected</strong>.
            Do not interpret any subsystem as currently connected to TIA-DAS.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {OTHER_SUBSYSTEMS.map(sys => (
              <div key={sys.name} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm truncate">{sys.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{sys.team} · {sys.category}</p>
                  </div>
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${INTEGRATION_STATUS_COLORS.pending}`}>
                    Pending
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 flex items-center gap-1">
                  <span>Not connected — future integration</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'import-logs' && (
        <DataTable
          columns={importLogColumns}
          data={importLogs}
          total={importLogsTotal}
          page={importPage}
          pageSize={10}
          onPageChange={setImportPage}
          emptyMessage="No import logs found."
        />
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{editSource ? 'Edit Data Source' : 'Register Data Source'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl min-h-[44px] min-w-[44px] flex items-center justify-center">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source Name <span className="text-red-500">*</span></label>
                <input type="text" name="source_name" value={form.source_name} onChange={handleChange} className={inputClass('source_name')} placeholder="e.g. LGU Tourism Office" />
                {formErrors.source_name && <p className="text-red-500 text-xs mt-1">{formErrors.source_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="source_category" value={form.source_category} onChange={handleChange} className={inputClass('source_category')}>
                  {DATA_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Integration Status</label>
                <select name="integration_status" value={form.integration_status} onChange={handleChange} className={inputClass('integration_status')}>
                  {Object.entries(INTEGRATION_STATUS_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="source_description" value={form.source_description} onChange={handleChange} rows={2} className={`${inputClass('source_description')} resize-none`} placeholder="Describe this data source..." />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} disabled={submitting} className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition min-h-[44px] disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition min-h-[44px] disabled:opacity-60 flex items-center gap-2">
                  {submitting && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                  {editSource ? 'Update' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
