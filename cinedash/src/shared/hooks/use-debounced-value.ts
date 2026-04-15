import { useEffect, useState } from 'react'

export function useDebouncedValue<T>(valor: T, atrasoMs: number): T {
  const [valorDebounced, setValorDebounced] = useState(valor)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setValorDebounced(valor)
    }, atrasoMs)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [valor, atrasoMs])

  return valorDebounced
}
