'use client'

import { useEffect, useRef } from 'react'

/**
 * Reusable confirmation modal
 *
 * Props:
 *   open:        bool
 *   title:       string
 *   message:     string | ReactNode
 *   confirmLabel: string  (default "Confirm")
 *   cancelLabel:  string  (default "Cancel")
 *   variant:     'danger' | 'warning' | 'info'  (default 'danger')
 *   onConfirm:   fn()
 *   onCancel:    fn()
 *   loading:     bool
 */
export default function ConfirmModal({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}) {
  const cancelRef = useRef(null)

  // Focus cancel button when modal opens (safer default)
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => cancelRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onCancel?.() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onCancel])

  if (!open) return null

  const confirmStyles = {
    danger:  'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white',
    info:    'bg-blue-600 hover:bg-blue-700 text-white',
  }

  const iconStyles = {
    danger:  { icon: '🗑️', bg: 'bg-red-100' },
    warning: { icon: '⚠️', bg: 'bg-amber-100' },
    info:    { icon: 'ℹ️', bg: 'bg-blue-100' },
  }

  const { icon, bg } = iconStyles[variant] || iconStyles.danger

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9998] p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center text-2xl mx-auto mb-4`}>
          {icon}
        </div>

        {/* Content */}
        <h2
          id="confirm-modal-title"
          className="text-lg font-semibold text-gray-900 text-center mb-2"
        >
          {title}
        </h2>
        {message && (
          <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
            {message}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            ref={cancelRef}
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition min-h-[44px] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition min-h-[44px] disabled:opacity-60 flex items-center justify-center gap-2 ${confirmStyles[variant] || confirmStyles.danger}`}
          >
            {loading && (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
