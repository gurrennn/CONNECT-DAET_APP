'use client'

import { useState, useEffect } from 'react'
import { validateStatisticsForm, isValid } from '../lib/analyticsValidation'
import { VISITOR_CATEGORIES, DESTINATIONS, DATA_SOURCES } from '../lib/analyticsConstants'

const EMPTY_FORM = {
  reporting_date: '',
  destination: '',
  local_tourist_count: '',
  foreign_tourist_count: '',
  visitor_category: '',
  data_source: '',
  remarks: '',
}

export default function StatisticsForm({ initialData = null, onSubmit, onCancel, loading = false }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setForm({
        reporting_date: initialData.reporting_date || '',
        destination: initialData.destination || '',
        local_tourist_count: initialData.local_tourist_count ?? '',
        foreign_tourist_count: initialData.foreign_tourist_count ?? '',
        visitor_category: initialData.visitor_category || '',
        data_source: initialData.data_source || '',
        remarks: initialData.remarks || '',
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setErrors({})
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validateStatisticsForm(form)
    if (!isValid(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    const local = Number(form.local_tourist_count) || 0
    const foreign = Number(form.foreign_tourist_count) || 0
    onSubmit({
      reporting_date: form.reporting_date,
      destination: form.destination,
      local_tourist_count: local,
      foreign_tourist_count: foreign,
      total_tourist_count: local + foreign,
      visitor_category: form.visitor_category,
      data_source: form.data_source,
      remarks: form.remarks || null,
    })
  }

  const inputClass = (field) =>
    `w-full px-3 py-2.5 rounded-lg border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
    }`

  const totalVisitors = (Number(form.local_tourist_count) || 0) + (Number(form.foreign_tourist_count) || 0)

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

      {/* ── Section 1: Basic Info ── */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Basic Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Reporting Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reporting Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="reporting_date"
              value={form.reporting_date}
              onChange={handleChange}
              className={inputClass('reporting_date')}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.reporting_date && <p className="text-red-500 text-xs mt-1">{errors.reporting_date}</p>}
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination <span className="text-red-500">*</span>
            </label>
            <select name="destination" value={form.destination} onChange={handleChange} className={inputClass('destination')}>
              <option value="">Select destination...</option>
              {DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination}</p>}
          </div>

          {/* Visitor Category */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visitor Category <span className="text-red-500">*</span>
            </label>
            <select name="visitor_category" value={form.visitor_category} onChange={handleChange} className={inputClass('visitor_category')}>
              <option value="">Select category...</option>
              {VISITOR_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.visitor_category && <p className="text-red-500 text-xs mt-1">{errors.visitor_category}</p>}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* ── Section 2: Visitor Counts ── */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Visitor Counts</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Local Tourists */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Local Tourist Count <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="local_tourist_count"
              value={form.local_tourist_count}
              onChange={handleChange}
              min="0"
              placeholder="0"
              className={inputClass('local_tourist_count')}
            />
            {errors.local_tourist_count && <p className="text-red-500 text-xs mt-1">{errors.local_tourist_count}</p>}
          </div>

          {/* Foreign Tourists */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foreign Tourist Count <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="foreign_tourist_count"
              value={form.foreign_tourist_count}
              onChange={handleChange}
              min="0"
              placeholder="0"
              className={inputClass('foreign_tourist_count')}
            />
            {errors.foreign_tourist_count && <p className="text-red-500 text-xs mt-1">{errors.foreign_tourist_count}</p>}
          </div>

          {/* Total (computed) */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Visitors</label>
            <div className="w-full px-3 py-2.5 rounded-lg border border-blue-100 bg-blue-50 text-sm font-semibold text-blue-700 flex items-center gap-2">
              <span className="text-base">👥</span>
              {totalVisitors.toLocaleString()}
              <span className="ml-auto text-xs font-normal text-blue-400">Auto-calculated</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* ── Section 3: Source & Notes ── */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Source & Notes</p>
        <div className="space-y-4">
          {/* Data Source */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Source <span className="text-red-500">*</span>
            </label>
            <select name="data_source" value={form.data_source} onChange={handleChange} className={inputClass('data_source')}>
              <option value="">Select source...</option>
              {DATA_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.data_source && <p className="text-red-500 text-xs mt-1">{errors.data_source}</p>}
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              rows={3}
              maxLength={500}
              placeholder="Any additional notes..."
              className={`${inputClass('remarks')} resize-none`}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{form.remarks.length}/500</p>
            {errors.remarks && <p className="text-red-500 text-xs mt-1">{errors.remarks}</p>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-1 border-t border-gray-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition min-h-[44px] disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition min-h-[44px] disabled:opacity-60 flex items-center gap-2"
        >
          {loading && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
          {initialData ? 'Update Record' : 'Save Record'}
        </button>
      </div>
    </form>
  )
}
