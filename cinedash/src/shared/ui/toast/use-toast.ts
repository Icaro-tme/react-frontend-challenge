import { useContext } from 'react'
import { ToastContext } from './toast.context'

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast precisa ser utilizado dentro de ToastProvider.')
  }

  return context
}
