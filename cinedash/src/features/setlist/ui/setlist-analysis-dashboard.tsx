import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { RouteLanguage } from '../../../shared/config/language'
import type { SetlistAnaliseScore } from '../model/setlist-analysis.types'

interface SetlistAnalysisDashboardProps {
  analise: SetlistAnaliseScore
  routeLanguage: RouteLanguage
}

const CORES_GRAFICO = {
  primaria: '#0891b2',
  secundaria: '#6366f1',
  sucesso: '#10b981',
  alerta: '#f59e0b',
  perigo: '#ef4444',
  neutro: '#64748b',
  rosa: '#ec4899',
  azul: '#3b82f6',
}

const CORES_PIE = ['#0891b2', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

function corPorNota(nota: number): string {
  if (nota >= 7) return CORES_GRAFICO.sucesso
  if (nota >= 5) return CORES_GRAFICO.alerta
  return CORES_GRAFICO.perigo
}

export function SetlistAnalysisDashboard({
  analise,
  routeLanguage,
}: SetlistAnalysisDashboardProps) {
  const { t } = useTranslation()

  const formatadorMoeda = useMemo(
    () =>
      new Intl.NumberFormat(routeLanguage, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }),
    [routeLanguage],
  )

  // dados para gráfico de barras: notas dos filmes
  const dadosNotasFilmes = useMemo(
    () =>
      analise.filmes
        .map((filmeAtual) => ({
          nome: filmeAtual.titulo.length > 18
            ? `${filmeAtual.titulo.slice(0, 18)}...`
            : filmeAtual.titulo,
          nota: filmeAtual.notaMedia,
        }))
        .sort((a, b) => b.nota - a.nota)
        .slice(0, 12),
    [analise.filmes],
  )

  // dados para gráfico de pizza: trending vs popular vs outros
  const dadosDistribuicao = useMemo(() => {
    const trending = analise.filmes.filter((f) => f.emTendencia).length
    const populares = analise.filmes.filter((f) => f.emPopulares && !f.emTendencia).length
    const outros = analise.totalFilmes - trending - populares

    return [
      { nome: t('filmes.analiseDashboard.trending'), valor: trending },
      { nome: t('filmes.analiseDashboard.populares'), valor: populares },
      { nome: t('filmes.analiseDashboard.outros'), valor: outros },
    ].filter((item) => item.valor > 0)
  }, [analise, t])

  // dados para gráfico radar: perfil da setlist
  const dadosRadar = useMemo(
    () => [
      {
        metrica: t('filmes.analiseDashboard.radarNotas'),
        valor: Math.min(100, (analise.mediaNotas / 10) * 100),
      },
      {
        metrica: t('filmes.analiseDashboard.radarPopularidade'),
        valor: Math.min(100, analise.mediaPopularidade),
      },
      {
        metrica: t('filmes.analiseDashboard.radarTrending'),
        valor: analise.percentualTrending,
      },
      {
        metrica: t('filmes.analiseDashboard.radarPopulares'),
        valor: analise.percentualPopulares,
      },
      {
        metrica: t('filmes.analiseDashboard.radarScore'),
        valor: analise.scoreCuradoria,
      },
    ],
    [analise, t],
  )

  // dados para gráfico de barras horizontais: budget dos filmes
  const dadosBudget = useMemo(
    () =>
      analise.filmes
        .filter((filmeAtual) => filmeAtual.budget > 0)
        .map((filmeAtual) => ({
          nome: filmeAtual.titulo.length > 18
            ? `${filmeAtual.titulo.slice(0, 18)}...`
            : filmeAtual.titulo,
          budget: filmeAtual.budget,
        }))
        .sort((a, b) => b.budget - a.budget)
        .slice(0, 10),
    [analise.filmes],
  )

  return (
    <div className="space-y-6">
      {/* score curadoria - destaque */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] rounded-xl border border-slate-200 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-950/25">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
            {t('filmes.setlistPagina.analise.metricas.scoreCuradoria')}
          </p>
          <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">
            {analise.scoreCuradoria.toFixed(2)}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {t(`filmes.setlistPagina.analise.niveis.${analise.nivelCuradoria}`)}
          </p>
        </div>

        <div className="flex-1 min-w-[200px] rounded-xl border border-slate-200 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-950/25">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
            {t('filmes.setlistPagina.analise.metricas.mediaNotas')}
          </p>
          <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">
            {analise.mediaNotas.toFixed(2)}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {analise.filmesAcimaNotaSete} {t('filmes.analiseDashboard.filmesNotaAlta')}
          </p>
        </div>

        <div className="flex-1 min-w-[200px] rounded-xl border border-slate-200 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-950/25">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
            {t('filmes.setlistPagina.analise.metricas.mediaBudget')}
          </p>
          <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">
            {formatadorMoeda.format(analise.mediaBudget)}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {analise.totalFilmes} {t('filmes.analiseDashboard.filmesTotal')}
          </p>
        </div>
      </div>

      {/* gráficos em grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* radar: perfil da setlist */}
        <div className="rounded-xl border border-slate-200 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-950/25">
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-slate-700 dark:text-slate-300">
            {t('filmes.analiseDashboard.perfilSetlist')}
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={dadosRadar}>
              <PolarGrid stroke="#94a3b8" />
              <PolarAngleAxis
                dataKey="metrica"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />
              <Radar
                dataKey="valor"
                stroke={CORES_GRAFICO.primaria}
                fill={CORES_GRAFICO.primaria}
                fillOpacity={0.25}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* pizza: distribuição trending/popular/outros */}
        <div className="rounded-xl border border-slate-200 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-950/25">
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-slate-700 dark:text-slate-300">
            {t('filmes.analiseDashboard.distribuicao')}
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={dadosDistribuicao}
                dataKey="valor"
                nameKey="nome"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {dadosDistribuicao.map((_, indice) => (
                  <Cell key={`distribuicao-${indice}`} fill={CORES_PIE[indice % CORES_PIE.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* barras: notas dos filmes */}
        {dadosNotasFilmes.length > 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-950/25">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-slate-700 dark:text-slate-300">
              {t('filmes.analiseDashboard.notasPorFilme')}
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosNotasFilmes} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" domain={[0, 10]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="nome"
                  width={130}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    color: '#e2e8f0',
                  }}
                />
                <Bar dataKey="nota" radius={[0, 4, 4, 0]}>
                  {dadosNotasFilmes.map((item, indice) => (
                    <Cell key={`nota-${indice}`} fill={corPorNota(item.nota)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : null}

        {/* barras: budget dos filmes */}
        {dadosBudget.length > 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-950/25">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-slate-700 dark:text-slate-300">
              {t('filmes.analiseDashboard.budgetPorFilme')}
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosBudget} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  type="number"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(valor) => formatadorMoeda.format(valor)}
                />
                <YAxis
                  type="category"
                  dataKey="nome"
                  width={130}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    color: '#e2e8f0',
                  }}
                  formatter={(valor) => formatadorMoeda.format(Number(valor))}
                />
                <Bar dataKey="budget" fill={CORES_GRAFICO.secundaria} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : null}
      </div>
    </div>
  )
}
