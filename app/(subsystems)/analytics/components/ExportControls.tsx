'use client'

import { Button } from '../../../components/ui/Button'
import { useState } from 'react'

interface ExportControlsProps {
  onExport: (format: 'csv' | 'json' | 'pdf' | 'xlsx') => void
  onRefresh: () => void
  isRefreshing?: boolean
}

export function ExportControls({ onExport, onRefresh, isRefreshing = false }: ExportControlsProps) {
  const [showExportMenu, setShowExportMenu] = useState(false)

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <Button
        variant="primary"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        {isRefreshing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
            Refreshing...
          </>
        ) : (
          <>
            🔄 Refresh Data
          </>
        )}
      </Button>

      <div className="relative">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowExportMenu(!showExportMenu)}
        >
          📥 Export Data
        </Button>

        {showExportMenu && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowExportMenu(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
              <div className="py-1">
                <button
                  onClick={() => {
                    onExport('csv')
                    setShowExportMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  📊 Export as CSV
                </button>
                <button
                  onClick={() => {
                    onExport('xlsx')
                    setShowExportMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  📗 Export as Excel
                </button>
                <button
                  onClick={() => {
                    onExport('json')
                    setShowExportMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  🔧 Export as JSON
                </button>
                <button
                  onClick={() => {
                    onExport('pdf')
                    setShowExportMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  📄 Export as PDF
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => window.print()}
      >
        🖨️ Print View
      </Button>
    </div>
  )
}
