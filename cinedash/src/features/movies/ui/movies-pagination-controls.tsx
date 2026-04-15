import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6'

interface MoviesPaginationControlsProps {
  paginaAtual: number
  totalPaginas: number
  totalResultados: number
  isLoading: boolean
  onChangePage: (pagina: number) => void
}

function buildPaginationNumbers(paginaAtual: number, totalPaginas: number): number[] {
  const totalPaginasValidas = Math.max(1, totalPaginas)
  const tamanhoJanela = 5

  if (totalPaginasValidas <= tamanhoJanela) {
    return Array.from({ length: totalPaginasValidas }, (_, indice) => indice + 1)
  }

  let inicio = paginaAtual - 2
  let fim = paginaAtual + 2

  if (inicio < 1) {
    fim += 1 - inicio
    inicio = 1
  }

  if (fim > totalPaginasValidas) {
    inicio -= fim - totalPaginasValidas
    fim = totalPaginasValidas
  }

  inicio = Math.max(1, inicio)

  return Array.from({ length: fim - inicio + 1 }, (_, indice) => inicio + indice)
}

export function MoviesPaginationControls({
  paginaAtual,
  totalPaginas,
  totalResultados,
  isLoading,
  onChangePage,
}: MoviesPaginationControlsProps) {
  const { t } = useTranslation()

  const totalPaginasValidas = Math.max(1, totalPaginas)
  const paginaAtualVisual = Math.min(Math.max(1, paginaAtual), totalPaginasValidas)

  const numerosPaginacao = useMemo(
    () => buildPaginationNumbers(paginaAtualVisual, totalPaginasValidas),
    [paginaAtualVisual, totalPaginasValidas],
  )

  const mostrarReticenciasEsquerda =
    numerosPaginacao.length > 0 && numerosPaginacao[0] > 1
  const mostrarReticenciasDireita =
    numerosPaginacao.length > 0 &&
    numerosPaginacao[numerosPaginacao.length - 1] < totalPaginasValidas

  const hasPreviousPage = paginaAtualVisual > 1
  const hasNextPage = paginaAtualVisual < totalPaginasValidas

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/70">
      <p className="text-xs text-slate-700 dark:text-slate-300">
        {t('filmes.paginacao.resumo', {
          paginaAtual: paginaAtualVisual,
          totalPaginas: totalPaginasValidas,
          totalResultados,
        })}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, indice) => (
              <span
                key={`pagina-skeleton-${indice}`}
                className="h-8 w-8 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700"
              />
            ))
          ) : (
            <>
              {mostrarReticenciasEsquerda ? (
                <span className="px-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  ...
                </span>
              ) : null}

              {numerosPaginacao.map((numeroPagina) => {
                const paginaAtiva = numeroPagina === paginaAtualVisual

                return (
                  <button
                    key={numeroPagina}
                    type="button"
                    className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-semibold transition ${
                      paginaAtiva
                        ? 'border-cyan-500 bg-cyan-600 text-white dark:border-cyan-400 dark:bg-cyan-500'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-cyan-500 hover:text-cyan-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-cyan-300'
                    }`}
                    onClick={() => {
                      onChangePage(numeroPagina)
                    }}
                  >
                    {numeroPagina}
                  </button>
                )
              })}

              {mostrarReticenciasDireita ? (
                <span className="px-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  ...
                </span>
              ) : null}
            </>
          )}
        </div>

        <button
          type="button"
          className="btn-chip btn-chip--cyan inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!hasPreviousPage || isLoading}
          onClick={() => {
            onChangePage(Math.max(1, paginaAtualVisual - 1))
          }}
        >
          <FaChevronLeft size={11} />
          {t('filmes.paginacao.anterior')}
        </button>

        <button
          type="button"
          className="btn-chip btn-chip--cyan inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!hasNextPage || isLoading}
          onClick={() => {
            onChangePage(Math.min(totalPaginasValidas, paginaAtualVisual + 1))
          }}
        >
          {t('filmes.paginacao.proxima')}
          <FaChevronRight size={11} />
        </button>
      </div>
    </div>
  )
}
