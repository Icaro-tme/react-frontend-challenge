import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaChevronDown, FaListCheck } from 'react-icons/fa6'
import type { Setlist } from '../../../entities/setlist/model/setlist.types'
import type { RouteLanguage } from '../../../shared/config/language'
import type { SetlistAnaliseScore } from '../model/setlist-analysis.types'

type StatusAnaliseSetlist =
  | 'semSetlist'
  | 'semFilmes'
  | 'naoCalculada'
  | 'desatualizada'
  | 'atualizada'

interface SetlistAnalysisCollapsibleProps {
  setlists: Setlist[]
  setlistSelecionadaId: string
  onSetlistSelecionadaChange: (setlistId: string) => void
  analiseResumo?: SetlistAnaliseScore | null
  isCalculandoAnalise?: boolean
  statusAnalise?: StatusAnaliseSetlist
  onCalcularAnalise?: () => void
  routeLanguage?: RouteLanguage
}

function SetlistAnalysisSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="w-56 h-4 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="w-full h-20 rounded-xl bg-slate-200 dark:bg-slate-700" />
    </div>
  )
}

export function SetlistAnalysisCollapsible({
  setlists,
  setlistSelecionadaId,
  onSetlistSelecionadaChange,
  analiseResumo,
  isCalculandoAnalise = false,
  statusAnalise = 'semSetlist',
  onCalcularAnalise,
  routeLanguage = 'pt-BR',
}: SetlistAnalysisCollapsibleProps) {
  const { t } = useTranslation()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [estaExpandido, setEstaExpandido] = useState(false)
  const [estaCarregando, setEstaCarregando] = useState(false)

  const formatadorNumero = useMemo(
    () =>
      new Intl.NumberFormat(routeLanguage, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [routeLanguage],
  )

  const formatadorMoeda = useMemo(
    () =>
      new Intl.NumberFormat(routeLanguage, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }),
    [routeLanguage],
  )

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  function toggleExpansao() {
    setEstaExpandido((estadoAtual) => {
      const proximoEstado = !estadoAtual

      if (proximoEstado) {
        setEstaCarregando(true)

        if (timerRef.current) {
          clearTimeout(timerRef.current)
        }

        timerRef.current = setTimeout(() => {
          setEstaCarregando(false)
          timerRef.current = null
        }, 260)
      }

      return proximoEstado
    })
  }

  const setlistSelecionada = setlists.find(
    (setlistAtual) => setlistAtual.id === setlistSelecionadaId,
  )

  return (
    <section className="p-4 my-4 space-y-4 border rounded-2xl border-slate-200/90 bg-white/70 dark:border-slate-700 dark:bg-slate-900/70">
      <button type="button" className="w-full text-left" onClick={toggleExpansao}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="badge-chip badge-chip--amber">{t('filmes.analise.badge')}</span>
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
              <FaListCheck className="text-cyan-700 dark:text-cyan-300" />
              {t('filmes.analise.titulo')}
            </h2>
          </div>

          <FaChevronDown
            className={`text-slate-600 transition-transform duration-300 dark:text-slate-300 ${
              estaExpandido ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      <div
        className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ${
          estaExpandido
            ? 'mt-4 grid-rows-[1fr] opacity-100'
            : 'mt-0 grid-rows-[0fr] opacity-70'
        }`}
      >
        <div className="min-h-0">
          {estaCarregando ? (
            <SetlistAnalysisSkeleton />
          ) : (
            <div className="space-y-3">
              {setlists.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {t('filmes.analise.nenhumaSetlist')}
                </p>
              ) : (
                <>
                  <div>
                    <label htmlFor="dashboard-setlist-select" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('filmes.analise.selecionarSetlist')}
                    </label>
                    <select
                      id="dashboard-setlist-select"
                      value={setlistSelecionadaId}
                      className="mt-1"
                      onClick={(evento) => {
                        evento.stopPropagation()
                      }}
                      onChange={(evento) => {
                        onSetlistSelecionadaChange(evento.target.value)
                      }}
                    >
                      <option value="">{t('filmes.analise.nenhumaSetlistSelecionada')}</option>
                      {setlists.map((setlistAtual) => (
                        <option key={setlistAtual.id} value={setlistAtual.id}>
                          {setlistAtual.name} ({setlistAtual.movieIds.length})
                        </option>
                      ))}
                    </select>
                  </div>

                  {setlistSelecionada ? (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {t('filmes.analise.qtdeFilmes')}: <strong>{setlistSelecionada.movieIds.length}</strong>
                      </p>

                      {onCalcularAnalise ? (
                        <button
                          type="button"
                          className="text-xs btn btn--slate"
                          disabled={isCalculandoAnalise || statusAnalise === 'semFilmes'}
                          onClick={(evento) => {
                            evento.stopPropagation()
                            onCalcularAnalise()
                          }}
                        >
                          {isCalculandoAnalise
                            ? t('filmes.analise.calculando')
                            : statusAnalise === 'desatualizada'
                              ? t('filmes.analise.recalcular')
                              : t('filmes.analise.calcular')}
                        </button>
                      ) : null}

                      {analiseResumo ? (
                        <div className="overflow-auto border rounded-xl border-slate-200 dark:border-slate-700">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-slate-100/90 text-xs uppercase tracking-[0.08em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              <tr>
                                <th className="px-3 py-2">{t('filmes.analise.metricas.score')}</th>
                                <th className="px-3 py-2">{t('filmes.analise.metricas.mediaNotas')}</th>
                                <th className="px-3 py-2">{t('filmes.analise.metricas.mediaBudget')}</th>
                                <th className="px-3 py-2">{t('filmes.analise.metricas.trending')}</th>
                                <th className="px-3 py-2">{t('filmes.analise.metricas.populares')}</th>
                                <th className="px-3 py-2">{t('filmes.analise.metricas.mediaAno')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="bg-white/70 dark:bg-slate-900/60">
                                <td className="px-3 py-2 font-semibold text-slate-900 dark:text-slate-100">
                                  {formatadorNumero.format(analiseResumo.scoreCuradoria)}
                                  <span className="ml-1 text-xs font-normal text-slate-500 dark:text-slate-400">
                                    ({t(`filmes.setlistPagina.analise.niveis.${analiseResumo.nivelCuradoria}`)})
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{formatadorNumero.format(analiseResumo.mediaNotas)}</td>
                                <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{formatadorMoeda.format(analiseResumo.mediaBudget)}</td>
                                <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{formatadorNumero.format(analiseResumo.percentualTrending)}%</td>
                                <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{formatadorNumero.format(analiseResumo.percentualPopulares)}%</td>
                                <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                                  {analiseResumo.mediaAnoLancamento !== null ? Math.round(analiseResumo.mediaAnoLancamento) : '-'}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
