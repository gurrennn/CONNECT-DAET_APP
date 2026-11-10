'use client'

import { useEffect, useState, useCallback } from 'react'

// ─── Individual Toast ─────────────────────────────────────────

function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Slide in
    const showTimer = setTimeout(() => setVisible(true), 10)
    // Auto-remove after duration
    const hideTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onRemove(toast.id), 300)
    }, toast.duration || 4000)

    return () => { clearTimeout(showTimer); clearTimeout(hideTimer) }
  }, [toast, onRemove])

  const styles = {
    success: 'bg-white border-l-4 border-green-500',
    error:   'bg-white border-l-4 border-red-500',
    warning: 'bg-white border-l-4 border-amber-500',
    info:    'bg-white border-l-4 border-blue-500',
  }

  const icons = {
    success: '✅',
    error:   '❌',
    warning: '⚠️',
    info:    'ℹ️',
  }

  const textColors = {
    success: 'text-green-700',
    error:   'text-red-700',
    warning: 'text-amber-700',
    info:    'text-blue-700',
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg min-w-[280px] max-w-sm
        transition-all duration-300
        ${styles[toast.type] || styles.info}
        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
      `}
    >
      <span className="text-lg flex-shrink-0 mt-0.5">{icons[toast.type] || icons.info}</span>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className={`text-sm font-semibold ${textColors[toast.type] || textColors.info}`}>
            {toast.title}
          </p>
        )}
        <p className="text-sm text-gray-700 mt-0.5">{toast.message}</p>
      </div>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300) }}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 text-lg leading-none min-h-[24px] min-w-[24px] flex items-center justify-center"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}

// ─── Toast Container ──────────────────────────────────────────

export function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null

  return (
    <div
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 items-end"
      aria-label="Notifications"
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

// ─── useToast Hook ────────────────────────────────────────────

let toastId = 0

export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, type, title, message, duration }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = {
    success: (message, title) => addToast({ type: 'success', title, message }),
    error:   (message, title) => addToast({ type: 'error',   title: title || 'Error', message }),
    warning: (message, title) => addToast({ type: 'warning', title, message }),
    info:    (message, title) => addToast({ type: 'info',    title, message }),
  }

  return { toasts, toast, removeToast }
}
