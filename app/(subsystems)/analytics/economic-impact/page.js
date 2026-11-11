'use client'

import { useState, useEffect, useCallback } from 'react'
import AnalyticsHeader from '../components/AnalyticsHeader'
import DataTable from '../components/DataTable'
import AnalyticsLoading from '../components/AnalyticsLoading'
import KPICard from '../components/KPICard'
import Breadcrumbs from '../components/Breadcrumbs'
import ConfirmModal from '../components/ConfirmModal'
import { ToastContainer, useToast } from '../components/Toast'
import ChartExplainModal from '../components/ChartExplainModal'
import { RevenueTrendChart, SimpleBarChart } from '../components/TourismChart'
import {
  getEconomicRecords,
  createEconomicRecord,
  updateEconomicRecord,
  archiveEconomicRecord,
  getMonthlyRevenue,
  logAuditAction,
} from '../lib/analyticsQueries'
import { formatPeso, formatNumber, formatDate } from '../lib/analyticsHelpers'
import { validateEconomicForm, isValid } from '../lib/analyticsValidation'
import { DATA_SOURCES, DEFAULT_PAGE_SIZE } from '../lib/analyticsConstants'
import { supabase } from '../../../lib/supabaseClient'

const ECONOMIC_CATEGORIES = [
  'Tourist Spending (Estimated)',
  'Tour Booking Revenue',
  'Accommodation Revenue',
  'Food & Beverage Revenue',
  'Souvenir & Craft Sales',
  'Transport Revenue',
  'Other Tourism Revenue',
  'Tourism-Related Employment',
  'Local Business Participation',
]

const EMPTY_FORM = {
  record_date: '',
  category: '',
  estimated_amount: '',
  employment_count: '',
  description: '',
  data_source: '',
  is_verified: false,
}

export default function EconomicImpactPage() {
  const { toasts, toast, removeToast } = useToast()
  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [monthlyRevenue, setMonthlyRevenue] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [confirmModal, setConfirmModal] = useState({ open: false, record: null, loading: false })

  const pageSize = DEFAULT_PAGE_SIZE

  // KPI aggregates from current records
  const totalRevenue = records.reduce((s, r) => s + (Number(r.estimated_amount) || 0), 0)
  const totalEmployment = records.reduce((s, r) => s + (Number(r.employment_count) || 0), 0)
  const verifiedCount = records.filter(r => r.is_verified).length

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [result, revenue] = await Promise.all([
        getEconomicRecords({ page, pageSize, search, category: filterCategory }),
        getMonthlyRevenue(new Date().getFullYear()),
      ])
      setRecords(result.data)
      setTotal(result.total)
      setMonthlyRevenue(revenue)
    } catch (err) {
      toast.error(err.message || 'Failed to load records.', 'Load Error')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, filterCategory])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validateEconomicForm(form)
    if (!isValid(errs)) { setFormErrors(errs); return }

    setSubmitting(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const payload = {
        record_date: form.record_date,
        category: form.category,
        estimated_amount: Number(form.estimated_amount) || 0,
        employment_count: Number(form.employment_count) || 0,
        description: form.description || null,
        data_source: form.data_source,
        is_verified: form.is_verified,
      }

      if (editRecord) {
        await updateEconomicRecord(editRecord.id, { ...payload, updated_by: user?.id })
        await logAuditAction({ adminId: user?.id, action: 'update', tableName: 'analytics_economic_records', recordId: editRecord.id, details: payload })
        toast.success('Record updated successfully.')
      } else {
        const created = await createEconomicRecord({ ...payload, created_by: user?.id, is_archived: false })
        await logAuditAction({ adminId: user?.id, action: 'create', tableName: 'analytics_economic_records', recordId: created.id, details: payload })
        toast.success('Record saved successfully.')
      }

      setShowModal(false)
      setEditRecord(null)
      setForm(EMPTY_FORM)
      setPage(1)
      fetchRecords()
    } catch (err) {
      toast.error(err.message || 'Failed to save record.')
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
      await archiveEconomicRecord(confirmModal.record.id)
      await logAuditAction({ adminId: user?.id, action: 'archive', tableName: 'analytics_economic_records', recordId: confirmModal.record.id })
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
      estimated_amount: record.estimated_amount ?? '',
      employment_count: record.employment_count ?? '',
      description: record.description || '',
      data_source: record.data_source || '',
      is_verified: record.is_verified || false,
    })
    setShowModal(true)
  }

  const openAdd = () => {
    setEditRecord(null)
    setForm(EMPTY_FORM)
    setFormErrors({})
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditRecord(null)
    setFormErrors({})
    setError(null)
  }

  // Chart explain
  const [explainModal, setExplainModal] = useState({ open: false, chartType: '', data: null })
  const openExplain = (chartType, data) => setExplainModal({ open: true, chartType, data })
  const closeExplain = () => setExplainModal(prev => ({ ...prev, open: false }))

  const inputClass = (field) =>
    `w-full px-3 py-2.5 rounded-lg border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      formErrors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`

  const columns = [
    { key: 'record_date', label: 'Date', sortable: true, render: (v) => formatDate(v) },
    { key: 'category', label: 'Category' },
    {
      key: 'estimated_amount',
      label: 'Estimated Amount',
      render: (v) => <span className="font-semibold text-emerald-700">{formatPeso(v, { compact: true })}</span>,
    },
    { key: 'employment_count', label: 'Employment', render: (v) => formatNumber(v) || '—' },
    { key: 'data_source', label: 'Source' },
    {
      key: 'is_verified',
      label: 'Verified',
      render: (v) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {v ? 'Verified' : 'Estimated'}
        </span>
      ),
    },
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
        { label: 'Economic Impact' },
      ]} />

      <AnalyticsHeader
        title="Economic Impact Assessment"
        subtitle="Monitor estimated tourism revenue and economic participation"
        actions={
          <button onClick={openAdd} className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition min-h-[44px]">
            + Add Record
          </button>
        }
      />

      {/* Disclaimer */}
      <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
        <strong>Important:</strong> Amounts labeled "Estimated" are approximations based on available data, not verified financial records.
        Values do not represent direct municipal tax revenue.
      </div>

      {/* Summary KPIs (from loaded page) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <KPICard
          title="Total Estimated Revenue (This Page)"
          value={formatPeso(totalRevenue, { compact: true })}
          subtitle="Estimated only"
          colorClass="from-emerald-500 to-emerald-600"
        />
        <KPICard
          title="Total Employment Records"
          value={formatNumber(totalEmployment)}
          subtitle="Jobs tracked"
          colorClass="from-blue-500 to-blue-600"
        />
        <KPICard
          title="Verified Records"
          value={`${verifiedCount} / ${records.length}`}
          subtitle="On this page"
          colorClass="from-purple-500 to-purple-600"
        />
      </div>

      {/* Revenue Chart */}
      <div className="mb-5">
        <RevenueTrendChart
          data={monthlyRevenue}
          onExplain={() => openExplain('revenue_trend', monthlyRevenue)}
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-5 shadow-sm flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-[180px]"
        />
        <select
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setPage(1) }}
          className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {ECONOMIC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
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
          loading={false}
          emptyMessage="No economic records found. Click '+ Add Record' to begin."
        />
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Dashboard › Economic Impact › {editRecord ? 'Edit Record' : 'Add Record'}</p>
                <h2 className="text-lg font-semibold text-gray-900">{editRecord ? 'Edit Economic Record' : 'Add Economic Record'}</h2>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Source <span className="text-red-500">*</span></label>
                    <select name="data_source" value={form.data_source} onChange={handleChange} className={inputClass('data_source')}>
                      <option value="">Select source...</option>
                      {DATA_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {formErrors.data_source && <p className="text-red-500 text-xs mt-1">{formErrors.data_source}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                    <select name="category" value={form.category} onChange={handleChange} className={inputClass('category')}>
                      <option value="">Select category...</option>
                      {ECONOMIC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {formErrors.category && <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* ── Section 2: Financial Data ── */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Financial & Employment Data</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Amount (₱) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₱</span>
                      <input type="number" name="estimated_amount" value={form.estimated_amount} onChange={handleChange} min="0" step="0.01" placeholder="0.00" className={`${inputClass('estimated_amount')} pl-7`} />
                    </div>
                    {formErrors.estimated_amount && <p className="text-red-500 text-xs mt-1">{formErrors.estimated_amount}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employment Count <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input type="number" name="employment_count" value={form.employment_count} onChange={handleChange} min="0" placeholder="0" className={inputClass('employment_count')} />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* ── Section 3: Notes & Verification ── */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Notes & Verification</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                    <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={`${inputClass('description')} resize-none`} placeholder="Add context or notes about this record..." />
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50">
                    <input type="checkbox" id="is_verified" name="is_verified" checked={form.is_verified} onChange={handleChange} className="w-4 h-4 mt-0.5 rounded border-gray-300 accent-blue-600" />
                    <div>
                      <label htmlFor="is_verified" className="text-sm font-medium text-gray-700 cursor-pointer">Mark as Verified Record</label>
                      <p className="text-xs text-gray-400 mt-0.5">Check this if the amount has been confirmed by an official source or audit.</p>
                    </div>
                  </div>
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
        message={confirmModal.record ? `Archive the ${confirmModal.record.category} record from ${formatDate(confirmModal.record.record_date)}? It will be preserved but hidden from active lists.` : ''}
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
