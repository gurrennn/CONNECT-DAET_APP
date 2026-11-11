'use client'

import { useState, useEffect, useCallback } from 'react'
import AnalyticsHeader from '../components/AnalyticsHeader'
import DataTable from '../components/DataTable'
import AnalyticsLoading from '../components/AnalyticsLoading'
import Breadcrumbs from '../components/Breadcrumbs'
import ConfirmModal from '../components/ConfirmModal'
import { ToastContainer, useToast } from '../components/Toast'
import ChartExplainModal from '../components/ChartExplainModal'
import { SustainabilityBarChart } from '../components/TourismChart'
import {
  getSustainabilityRecords,
  createSustainabilityRecord,
  updateSustainabilityRecord,
  archiveSustainabilityRecord,
  logAuditAction,
} from '../lib/analyticsQueries'
import { formatDate, formatNumber } from '../lib/analyticsHelpers'
import { validateSustainabilityForm, isValid } from '../lib/analyticsValidation'
import { SUSTAINABILITY_CATEGORIES, DESTINATIONS, DEFAULT_PAGE_SIZE } from '../lib/analyticsConstants'
import { supabase } from '../../../lib/supabaseClient'

const INDICATORS = {
  Environmental: ['Visitor Concentration (%)', 'Waste Diversion Rate (%)', 'Energy Usage (kWh)', 'Water Usage (m³)', 'Air Quality Index', 'Carbon Footprint (kg CO₂)', 'Green Cover Area (ha)'],
  Economic: ['Local Business Participation (%)', 'Revenue Leakage (%)', 'Employment Multiplier', 'Local Procurement (%)', 'Tourist Spending per Capita (₱)'],
  Social: ['Community Satisfaction Score', 'Cultural Site Preservation Score', 'Heritage Activity Participation (%)', 'Resident Quality of Life Index'],
  Governance: ['Tourism Policy Compliance Score', 'Permit Compliance Rate (%)', 'Inter-Agency Coordination Score', 'Monitoring Frequency (visits/month)'],
}

const UNIT_SUGGESTIONS = ['%', 'kWh', 'm³', 'kg CO₂', 'ha', 'Score (1-10)', 'Score (0-100)', 'visits/month', 'count', '₱']

const EMPTY_FORM = {
  record_date: '',
  category: '',
  indicator_name: '',
  indicator_value: '',
  unit: '',
  destination: '',
  notes: '',
}

export default function SustainabilityPage() {
  const { toasts, toast, removeToast } = useToast()
  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [confirmModal, setConfirmModal] = useState({ open: false, record: null, loading: false })

  const pageSize = DEFAULT_PAGE_SIZE

  // Chart data from loaded records
  const chartData = records
    .filter(r => r.indicator_value != null)
    .slice(0, 10)
    .map(r => ({ indicator_name: r.indicator_name, indicator_value: Number(r.indicator_value) }))

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getSustainabilityRecords({ page, pageSize, search, category: filterCategory })
      setRecords(result.data)
      setTotal(result.total)
    } catch (err) {
      setError(err.message || 'Failed to load sustainability records.')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, filterCategory])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  const showSuccess = (msg) => toast.success(msg)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }))
  }

  const handleCategoryChange = (e) => {
    setForm(prev => ({ ...prev, category: e.target.value, indicator_name: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validateSustainabilityForm(form)
    if (!isValid(errs)) { setFormErrors(errs); return }

    setSubmitting(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const payload = {
        record_date: form.record_date,
        category: form.category,
        indicator_name: form.indicator_name,
        indicator_value: form.indicator_value !== '' ? Number(form.indicator_value) : null,
        unit: form.unit || null,
        destination: form.destination || null,
        notes: form.notes || null,
      }

      if (editRecord) {
        await updateSustainabilityRecord(editRecord.id, { ...payload, updated_by: user?.id })
        await logAuditAction({ adminId: user?.id, action: 'update', tableName: 'analytics_sustainability_records', recordId: editRecord.id, details: payload })
        showSuccess('Record updated successfully.')
      } else {
        const created = await createSustainabilityRecord({ ...payload, created_by: user?.id, is_archived: false })
        await logAuditAction({ adminId: user?.id, action: 'create', tableName: 'analytics_sustainability_records', recordId: created.id, details: payload })
        showSuccess('Record saved successfully.')
      }

      setShowModal(false)
      setEditRecord(null)
      setForm(EMPTY_FORM)
      setPage(1)
      fetchRecords()
    } catch (err) {
      setError(err.message || 'Failed to save record.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleArchive = (record) => {
    setConfirmModal({ open: true, record, loading: false })
  }

  const handleArchiveConfirmed = async () => {
    setConfirmModal(prev => ({ ...prev, loading: true }))
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await archiveSustainabilityRecord(confirmModal.record.id)
      await logAuditAction({ adminId: user?.id, action: 'archive', tableName: 'analytics_sustainability_records', recordId: confirmModal.record.id })
      toast.success('Record archived.')
      setConfirmModal({ open: false, record: null, loading: false })
      fetchRecords()
    } catch (err) {
      toast.error(err.message || 'Failed to archive.')
      setConfirmModal(prev => ({ ...prev, loading: false }))
    }
  }

  const handleEdit = (record) => {
    setEditRecord(record)
    setForm({
      record_date: record.record_date || '',
      category: record.category || '',
      indicator_name: record.indicator_name || '',
      indicator_value: record.indicator_value ?? '',
      unit: record.unit || '',
      destination: record.destination || '',
      notes: record.notes || '',
    })
    setShowModal(true)
  }

  const openAdd = () => { setEditRecord(null); setForm(EMPTY_FORM); setFormErrors({}); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setEditRecord(null); setFormErrors({}); setError(null) }

  // Chart explain
  const [explainModal, setExplainModal] = useState({ open: false, chartType: '', data: null })
  const openExplain = (chartType, data) => setExplainModal({ open: true, chartType, data })
  const closeExplain = () => setExplainModal(prev => ({ ...prev, open: false }))

  const inputClass = (field) =>
    `w-full px-3 py-2.5 rounded-lg border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      formErrors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`

  const availableIndicators = INDICATORS[form.category] || []

  // Category score summary
  const categoryCounts = SUSTAINABILITY_CATEGORIES.map(cat => ({
    name: cat,
    count: records.filter(r => r.category === cat).length,
  }))

  const columns = [
    { key: 'record_date', label: 'Date', sortable: true, render: (v) => formatDate(v) },
    { key: 'category', label: 'Category', render: (v) => <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">{v}</span> },
    { key: 'indicator_name', label: 'Indicator' },
    { key: 'indicator_value', label: 'Value', render: (v, row) => v != null ? `${v}${row.unit ? ' ' + row.unit : ''}` : '—' },
    { key: 'destination', label: 'Destination', render: (v) => v || '—' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(row)} className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition min-h-[36px]">Edit</button>
          <button onClick={() => handleArchive(row)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100 transition min-h-[36px]">Archive</button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/analytics' },
        { label: 'Sustainability Assessment' },
      ]} />

      <AnalyticsHeader
        title="Tourism Sustainability Assessment"
        subtitle="Monitor environmental, economic, social, and governance indicators"
        actions={<button onClick={openAdd} className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition min-h-[44px]">+ Add Record</button>}
      />

      {successMsg && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">✅ {successMsg}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</div>}

      {/* Category summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {categoryCounts.map(cat => (
          <div key={cat.name} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{cat.count}</div>
            <div className="text-sm text-gray-500 mt-0.5">{cat.name} Records</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="mb-5">
          <SustainabilityBarChart
            data={chartData}
            onExplain={() => openExplain('sustainability', chartData)}
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-5 shadow-sm flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-[180px]"
        />
        <select
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setPage(1) }}
          className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {SUSTAINABILITY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? <AnalyticsLoading /> : (
        <DataTable
          columns={columns}
          data={records}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          emptyMessage="No sustainability records found. Click '+ Add Record' to begin."
        />
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Dashboard › Sustainability › {editRecord ? 'Edit Record' : 'Add Record'}</p>
                <h2 className="text-lg font-semibold text-gray-900">{editRecord ? 'Edit Sustainability Record' : 'Add Sustainability Record'}</h2>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 transition">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

              {/* ── Section 1: Basic Info ── */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Basic Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Record Date <span className="text-red-500">*</span></label>
                    <input type="date" name="record_date" value={form.record_date} onChange={handleChange} className={inputClass('record_date')} max={new Date().toISOString().split('T')[0]} />
                    {formErrors.record_date && <p className="text-red-500 text-xs mt-1">{formErrors.record_date}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                    <select name="category" value={form.category} onChange={handleCategoryChange} className={inputClass('category')}>
                      <option value="">Select category...</option>
                      {SUSTAINABILITY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {formErrors.category && <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destination <span className="text-gray-400 font-normal">(optional)</span></label>
                    <select name="destination" value={form.destination} onChange={handleChange} className={inputClass('destination')}>
                      <option value="">All / General</option>
                      {DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* ── Section 2: Indicator ── */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Indicator Details</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Indicator Name <span className="text-red-500">*</span></label>
                    {availableIndicators.length > 0 ? (
                      <select name="indicator_name" value={form.indicator_name} onChange={handleChange} className={inputClass('indicator_name')}>
                        <option value="">Select indicator...</option>
                        {availableIndicators.map(i => <option key={i} value={i}>{i}</option>)}
                        <option value="__custom">Other (custom)</option>
                      </select>
                    ) : (
                      <input type="text" name="indicator_name" value={form.indicator_name} onChange={handleChange} placeholder={form.category ? 'Enter indicator name...' : 'Select a category first'} disabled={!form.category} className={inputClass('indicator_name')} />
                    )}
                    {form.indicator_name === '__custom' && (
                      <input
                        type="text"
                        name="indicator_name"
                        value=""
                        onChange={(e) => setForm(prev => ({ ...prev, indicator_name: e.target.value }))}
                        placeholder="Enter custom indicator name..."
                        className={`${inputClass('indicator_name')} mt-2`}
                      />
                    )}
                    {formErrors.indicator_name && <p className="text-red-500 text-xs mt-1">{formErrors.indicator_name}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                      <input type="number" name="indicator_value" value={form.indicator_value} onChange={handleChange} step="any" placeholder="e.g. 75" className={inputClass('indicator_value')} />
                      {formErrors.indicator_value && <p className="text-red-500 text-xs mt-1">{formErrors.indicator_value}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                      <select name="unit" value={form.unit} onChange={handleChange} className={inputClass('unit')}>
                        <option value="">Select unit...</option>
                        {UNIT_SUGGESTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>

                  {form.indicator_value !== '' && form.unit && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 text-sm text-blue-700">
                      <span className="text-base">📊</span>
                      <span>Recorded as: <strong>{form.indicator_value} {form.unit}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* ── Section 3: Notes ── */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Notes</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className={`${inputClass('notes')} resize-none`} placeholder="Add any context or methodology notes..." />
                  {formErrors.notes && <p className="text-red-500 text-xs mt-1">{formErrors.notes}</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-1 border-t border-gray-100">
                <button type="button" onClick={closeModal} disabled={submitting} className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition min-h-[44px] disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition min-h-[44px] disabled:opacity-60 flex items-center gap-2">
                  {submitting && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                  {editRecord ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmModal.open}
        variant="danger"
        title="Archive this record?"
        message={confirmModal.record ? `Archive "${confirmModal.record.indicator_name}"? It will be hidden from active lists but preserved in the database.` : ''}
        confirmLabel="Yes, Archive"
        loading={confirmModal.loading}
        onConfirm={handleArchiveConfirmed}
        onCancel={() => setConfirmModal({ open: false, record: null, loading: false })}
      />

      <ChartExplainModal
        open={explainModal.open}
        onClose={closeExplain}
        chartType={explainModal.chartType}
        data={explainModal.data}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
