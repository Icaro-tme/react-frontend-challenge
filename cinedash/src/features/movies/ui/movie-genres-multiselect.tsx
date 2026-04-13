import { useEffect, useMemo, useRef, useState } from 'react'
import { FaCheck, FaXmark } from 'react-icons/fa6'
import { appSettings } from '../../../shared/config/app-settings'
import { useDebouncedValue } from '../../../shared/hooks/use-debounced-value'

interface MovieGenreOption {
  id: number
  name: string
}

interface MovieGenresMultiselectProps {
  options: MovieGenreOption[]
  selectedIds: number[]
  onChange: (selectedIds: number[]) => void
  label: string
  placeholder: string
  emptyOptionsLabel: string
}

const MAX_GENRE_OPTIONS = 8

export function MovieGenresMultiselect({
  options,
  selectedIds,
  onChange,
  label,
  placeholder,
  emptyOptionsLabel,
}: MovieGenresMultiselectProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [termoGenero, setTermoGenero] = useState('')
  const [estaAberto, setEstaAberto] = useState(false)

  const termoDebounced = useDebouncedValue(
    termoGenero,
    appSettings.filmes.tempoDebounceFiltrosMs,
  )

  useEffect(() => {
    function onPointerDown(evento: MouseEvent) {
      if (!containerRef.current) {
        return
      }

      if (containerRef.current.contains(evento.target as Node)) {
        return
      }

      setEstaAberto(false)
    }

    window.addEventListener('mousedown', onPointerDown)

    return () => {
      window.removeEventListener('mousedown', onPointerDown)
    }
  }, [])

  const opcoesSelecionadas = useMemo(
    () => options.filter((generoAtual) => selectedIds.includes(generoAtual.id)),
    [options, selectedIds],
  )

  const opcoesFiltradas = useMemo(() => {
    const termoNormalizado = termoDebounced.toLowerCase().trim()

    const opcoesDisponiveis = options.filter(
      (generoAtual) => !selectedIds.includes(generoAtual.id),
    )

    if (!termoNormalizado) {
      return opcoesDisponiveis.slice(0, MAX_GENRE_OPTIONS)
    }

    return opcoesDisponiveis
      .filter((generoAtual) =>
        generoAtual.name.toLowerCase().includes(termoNormalizado),
      )
      .slice(0, MAX_GENRE_OPTIONS)
  }, [options, selectedIds, termoDebounced])

  function adicionarGenero(generoId: number) {
    if (selectedIds.includes(generoId)) {
      return
    }

    onChange([...selectedIds, generoId])
    setTermoGenero('')
    setEstaAberto(true)
  }

  function removerGenero(generoId: number) {
    onChange(selectedIds.filter((idAtual) => idAtual !== generoId))
  }

  return (
    <div>
      <label htmlFor="filmes-filtro-genero">{label}</label>

      <div ref={containerRef} className="relative mt-2">
        <div className="flex min-h-12 flex-wrap items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 transition focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-200 dark:border-slate-600 dark:bg-slate-950 dark:focus-within:border-cyan-400 dark:focus-within:ring-cyan-900">
          {opcoesSelecionadas.map((generoAtual) => (
            <span
              key={generoAtual.id}
              className="inline-flex items-center gap-1 rounded-full border border-cyan-300 bg-cyan-100 px-2 py-1 text-[11px] font-semibold text-cyan-900 dark:border-cyan-700 dark:bg-cyan-900/45 dark:text-cyan-200"
            >
              {generoAtual.name}
              <button
                type="button"
                className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-cyan-200/70 dark:hover:bg-cyan-800/70"
                onClick={() => {
                  removerGenero(generoAtual.id)
                }}
                aria-label={generoAtual.name}
              >
                <FaXmark size={10} />
              </button>
            </span>
          ))}

          <input
            id="filmes-filtro-genero"
            value={termoGenero}
            placeholder={placeholder}
            className="min-w-[10rem] flex-1 border-0 bg-transparent p-0 text-sm text-slate-900 outline-none focus:ring-0 dark:text-slate-100"
            onFocus={() => {
              setEstaAberto(true)
            }}
            onChange={(evento) => {
              setTermoGenero(evento.target.value)
              setEstaAberto(true)
            }}
          />
        </div>

        {estaAberto ? (
          <div className="absolute z-30 mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-lg shadow-slate-900/15 dark:border-slate-700 dark:bg-slate-900">
            {opcoesFiltradas.length === 0 ? (
              <p className="px-2 py-3 text-xs text-slate-600 dark:text-slate-300">
                {emptyOptionsLabel}
              </p>
            ) : (
              <ul className="max-h-48 space-y-1 overflow-auto">
                {opcoesFiltradas.map((generoAtual) => (
                  <li key={generoAtual.id}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm text-slate-800 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
                      onClick={() => {
                        adicionarGenero(generoAtual.id)
                      }}
                    >
                      <span>{generoAtual.name}</span>
                      <FaCheck size={11} className="text-cyan-700 dark:text-cyan-300" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}