'use client'

import { useState } from 'react'
import { Button } from '../../../components/ui/Button'

export type DateRangePreset = '7d' | '30d' | '90d' | '180d' | 'ytd' | 'all' | 'custom'

interface DateRangeSelectorProps {
  value: DateRangePreset
  onChange: (preset: DateRangePreset, startDate?: Date, endDate?: Date) => void
  showComparison?: boolean
  onCompareToggle?: (enabled: boolean) => void
}

export function DateRangeSelector({ 
  value, 
  onChange, 
  showComparison = false,
  onCompareToggle 
}: DateRangeSelectorProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [compareEnabled, setCompareEnabled] = useState(false)

  const presets = [
    { value: '7d' as const, label: 'Last 7 Days' },
    { value: '30d' as const, label: 'Last 30 Days' },
    { value: '90d' as const, label: 'Last 90 Days' },
    { value: '180d' as const, label: 'Last 6 Months' },
    { value: 'ytd' as const, label: 'Year to Date' },
    { value: 'all' as const, label: 'All Time' },
    { value: 'custom' as const, label: 'Custom Range' },
  ]

  const handlePresetClick = (preset: DateRangePreset) => {
    if (preset === 'custom') {
      setShowCustom(true)
      return
    }
    setShowCustom(false)
    onChange(preset)
  }

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      onChange('custom', new Date(customStart), new Date(customEnd))
      setShowCustom(false)
    }
  }

  const handleCompareToggle = () => {
    const newValue = !compareEnabled
    setCompareEnabled(newValue)
    onCompareToggle?.(newValue)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-sm font-medium text-gray-700">Date Range:</span>
        {presets.map((preset) => (
          <Button
            key={preset.value}
            size="sm"
            variant={value === preset.value ? 'primary' : 'secondary'}
            onClick={() => handlePresetClick(preset.value)}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {showCustom && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <label htmlFor="start-date" className="text-sm font-medium text-gray-700">
              From:
            </label>
            <input
              id="start-date"
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="end-date" className="text-sm font-medium text-gray-700">
              To:
            </label>
            <input
              id="end-date"
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button size="sm" onClick={handleCustomApply}>
            Apply
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setShowCustom(false)}>
            Cancel
          </Button>
        </div>
      )}

      {showComparison && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
          <input
            id="compare-toggle"
            type="checkbox"
            checked={compareEnabled}
            onChange={handleCompareToggle}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="compare-toggle" className="text-sm text-gray-700 cursor-pointer">
            Compare to previous period
          </label>
        </div>
      )}
    </div>
  )
}
