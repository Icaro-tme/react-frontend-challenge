import type { ReactNode } from 'react'

interface MovieModalShellProps {
  isOpen: boolean
  title: string
  closeLabel: string
  onClose: () => void
  children: ReactNode
}

export function MovieModalShell({
  isOpen,
  title,
  closeLabel,
  onClose,
  children,
}: MovieModalShellProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/30 dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h3>

          <button type="button" className="btn-chip btn-chip--cyan" onClick={onClose}>
            {closeLabel}
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}
