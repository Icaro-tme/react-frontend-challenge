import type { ReactNode } from 'react'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  FaCircleCheck,
  FaCircleExclamation,
  FaCircleInfo,
  FaXmark,
} from 'react-icons/fa6'
import { ToastContext, type ToastContextValue } from './toast.context'
import type { ToastItem, ToastTone } from './toast.types'

interface ToastProviderProps {
  children: ReactNode
}

const DEFAULT_DURATION_MS = 3600

function createToastId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function getToastStyles(tone: ToastTone): string {
  switch (tone) {
    case 'success':
      return 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
    case 'error':
      return 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-700 dark:bg-rose-900/40 dark:text-rose-200'
    case 'info':
      return 'border-cyan-300 bg-cyan-50 text-cyan-900 dark:border-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-200'
  }
}

function getToastIcon(tone: ToastTone) {
  switch (tone) {
    case 'success':
      return <FaCircleCheck className="mt-0.5" size={14} />
    case 'error':
      return <FaCircleExclamation className="mt-0.5" size={14} />
    case 'info':
      return <FaCircleInfo className="mt-0.5" size={14} />
  }
}

export function ToastProvider({ children }: ToastProviderProps) {
  const { t } = useTranslation()
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const toastTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const dismissToast = useCallback((toastId: string) => {
    const timeoutId = toastTimeoutsRef.current[toastId]

    if (timeoutId) {
      clearTimeout(timeoutId)
      delete toastTimeoutsRef.current[toastId]
    }

    setToasts((estadoAtual) =>
      estadoAtual.filter((toastAtual) => toastAtual.id !== toastId),
    )
  }, [])

  const showToast = useCallback(
    (tone: ToastTone, message: string) => {
      const novoToastId = createToastId()

      setToasts((estadoAtual) => [
        ...estadoAtual,
        {
          id: novoToastId,
          tone,
          message,
        },
      ])

      toastTimeoutsRef.current[novoToastId] = setTimeout(() => {
        dismissToast(novoToastId)
      }, DEFAULT_DURATION_MS)
    },
    [dismissToast],
  )

  useEffect(() => {
    return () => {
      Object.values(toastTimeoutsRef.current).forEach((timeoutId) => {
        clearTimeout(timeoutId)
      })

      toastTimeoutsRef.current = {}
    }
  }, [])

  const contextValue = useMemo<ToastContextValue>(
    () => ({
      showSuccess: (message) => {
        showToast('success', message)
      },
      showError: (message) => {
        showToast('error', message)
      },
      showInfo: (message) => {
        showToast('info', message)
      },
    }),
    [showToast],
  )

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[120] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((toastAtual) => (
          <article
            key={toastAtual.id}
            className={`pointer-events-auto flex items-start gap-2 rounded-xl border px-3 py-2 text-sm shadow-lg shadow-slate-900/10 ${getToastStyles(toastAtual.tone)}`}
            role="status"
          >
            {getToastIcon(toastAtual.tone)}

            <p className="flex-1 leading-relaxed">{toastAtual.message}</p>

            <button
              type="button"
              className="rounded-md p-1 transition hover:bg-black/10 dark:hover:bg-white/10"
              aria-label={t('acoes.fechar')}
              onClick={() => {
                dismissToast(toastAtual.id)
              }}
            >
              <FaXmark size={12} />
            </button>
          </article>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
