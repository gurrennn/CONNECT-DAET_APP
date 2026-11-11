'use client'

import { useState, useEffect, useCallback } from 'react'
import AnalyticsHeader from '../components/AnalyticsHeader'
import DataTable from '../components/DataTable'
import StatisticsForm from '../components/StatisticsForm'
import AnalyticsLoading from '../components/AnalyticsLoading'
import Breadcrumbs from '../components/Breadcrumbs'
import ConfirmModal from '../components/ConfirmModal'
import { ToastContainer, useToast } from '../components/Toast'
import {
  getStatisticsRecords,
  createStatisticsRecord,
  updateStatisticsRecord,
  archiveStatisticsRecord,
  logAuditAction,
} from '../lib/analyticsQueries'
import { formatDate, formatNumber } from '../lib/analyticsHelpers'
import { DESTINATIONS, DEFAULT_PAGE_SIZE } from '../lib/analyticsConstants'
import { supabase } from '../../../lib/supabaseClient'

export default function StatisticsPage() {
  const { toasts, toast, removeToast } = useToast()

  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [filterDest, setFilterDest] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editRecord, setEditRecord] = useState(null)

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState({ open: false, record: null, loading: false })

  const pageSize = DEFAULT_PAGE_SIZE

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getStatisticsRecords({
        page, pageSize, search,
        destination: filterDest,
        dateFrom: filterFrom,
        dateTo: filterTo,
      })
      setRecords(result.data)
      setTotal(result.total)
    } catch (err) {
      toast.error(err.message || 'Failed to load records.', 'Load Error')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, filterDest, filterFrom, filterTo])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  const handleSubmit = async (formData) => {
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (editRecord) {
        await updateStatisticsRecord(editRecord.id, { ...formData, updated_by: user?.id })
        await logAuditAction({ adminId: user?.id, action: 'update', tableName: 'analytics_tourism_statistics', recordId: editRecord.id, details: formData })
        toast.success('Record updated successfully.')
      } else {
        const created = await createStatisticsRecord({ ...formData, created_by: user?.id, is_archived: false })
        await logAuditAction({ adminId: user?.id, action: 'create', tableName: 'analytics_tourism_statistics', recordId: created.id, details: formData })
        toast.success('Record saved successfully.')
      }

      setShowModal(false)
      setEditRecord(null)
      setPage(1)
      fetchRecords()
    } catch (err) {
      toast.error(err.message || 'Failed to save record.', 'Save Error')
    } finally {
      setSubmitting(false)
    }
  }

  const openArchiveConfirm = (record) => {
    setConfirmModal({ open: true, record, loading: false })
  }

  const handleArchiveConfirmed = async () => {
    setConfirmModal(prev => ({ ...prev, loading: true }))
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await archiveStatisticsRecord(confirmModal.record.id)
      await logAuditAction({
        adminId: user?.id, action: 'archive',
        tableName: 'analytics_tourism_statistics',
        recordId: confirmModal.record.id,
        details: { destination: confirmModal.record.destination },
      })
      toast.success('Record archived successfully.')
      setConfirmModal({ open: false, record: null, loading: false })
      fetchRecords()
    } catch (err) {
      toast.error(err.message || 'Failed to archive record.')
      setConfirmModal(prev => ({ ...prev, loading: false }))
    }
  }

  const handleEdit = (record) => { setEditRecord(record); setShowModal(true) }
  const openAddModal = () => { setEditRecord(null); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setEditRecord(null) }

  const columns = [
    { key: 'reporting_date', label: 'Date', sortable: true, render: (val) => formatDate(val) },
    { key: 'destination', label: 'Destination', sortable: true },
    { key: 'local_tourist_count', label: 'Local', render: (val) => formatNumber(val) },
    { key: 'foreign_tourist_count', label: 'Foreign', render: (val) => formatNumber(val) },
    {
      key: 'total_tourist_count',
      label: 'Total',
      render: (val, row) => (
        <span className="font-semibold">
          {formatNumber(val ?? (Number(row.local_tourist_count) + Number(row.foreign_tourist_count)))}
        </span>
      ),
    },
    { key: 'visitor_category', label: 'Category' },
    { key: 'data_source', label: 'Source' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleEdit(row)} className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition min-h-[36px]">
            Edit
          </button>
          <button onClick={() => openArchiveConfirm(row)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100 transition min-h-[36px]">
            Archive
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      {/* Breadcrumbs */}
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/analytics' },
        { label: 'Tourism Statistics' },
      ]} />

      <AnalyticsHeader
        title="Tourism Statistics"
        subtitle="Manage tourist arrival records and visitor statistics"
        actions={
          <button onClick={openAddModal} className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition min-h-[44px]">
            + Add Record
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input type="text" placeholder="Search records…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <select value={filterDest} onChange={(e) => { setFilterDest(e.target.value); setPage(1) }}
            className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Destinations</option>
            {DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <input type="date" value={filterFrom} onChange={(e) => { setFilterFrom(e.target.value); setPage(1) }}
            className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" title="Date from" />
          <input type="date" value={filterTo} onChange={(e) => { setFilterTo(e.target.value); setPage(1) }}
            className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" title="Date to" />
        </div>
        {(search || filterDest || filterFrom || filterTo) && (
          <button onClick={() => { setSearch(''); setFilterDest(''); setFilterFrom(''); setFilterTo(''); setPage(1) }}
            className="mt-2 text-xs text-blue-600 hover:underline">
            Clear all filters
          </button>
        )}
      </div>

      {/* Table — skeleton while loading */}
      <DataTable
        columns={columns}
        data={records}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        loading={loading}
        emptyMessage="No statistics records found. Click '+ Add Record' to get started."
      />

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">
                  Dashboard › Tourism Statistics › {editRecord ? 'Edit Record' : 'Add Record'}
                </p>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editRecord ? 'Edit Statistics Record' : 'Add Statistics Record'}
                </h2>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 transition">✕</button>
            </div>
            <div className="px-6 py-5">
              <StatisticsForm
                initialData={editRecord}
                onSubmit={handleSubmit}
                onCancel={closeModal}
                loading={submitting}
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirm Archive Modal — replaces browser confirm() */}
      <ConfirmModal
        open={confirmModal.open}
        variant="danger"
        title="Archive this record?"
        message={
          confirmModal.record
            ? `This will archive the record for ${confirmModal.record.destination} on ${formatDate(confirmModal.record.reporting_date)}. It will no longer appear in the active list but will be preserved in the database.`
            : ''
        }
        confirmLabel="Yes, Archive"
        cancelLabel="Cancel"
        loading={confirmModal.loading}
        onConfirm={handleArchiveConfirmed}
        onCancel={() => setConfirmModal({ open: false, record: null, loading: false })}
      />

      {/* Toast notifications — bottom right */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
