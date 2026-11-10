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
    `w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
    }`

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

        {/* Total (read-only computed) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Visitors</label>
          <div className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700">
            {((Number(form.local_tourist_count) || 0) + (Number(form.foreign_tourist_count) || 0)).toLocaleString()}
          </div>
        </div>

        {/* Visitor Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Visitor Category <span className="text-red-500">*</span>
          </label>
          <select name="visitor_category" value={form.visitor_category} onChange={handleChange} className={inputClass('visitor_category')}>
            <option value="">Select category...</option>
            {VISITOR_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.visitor_category && <p className="text-red-500 text-xs mt-1">{errors.visitor_category}</p>}
        </div>

        {/* Data Source */}
        <div className="sm:col-span-2">
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
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (optional)</label>
          <textarea
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            rows={2}
            maxLength={500}
            placeholder="Any additional notes..."
            className={`${inputClass('remarks')} resize-none`}
          />
          <p className="text-xs text-gray-400 mt-0.5 text-right">{form.remarks.length}/500</p>
          {errors.remarks && <p className="text-red-500 text-xs mt-1">{errors.remarks}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
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
