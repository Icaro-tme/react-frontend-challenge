import type {
  TmdbMovieDetailsResponse,
  TmdbMovieReleaseDatesResponse,
} from '../../../shared/api/tmdb'
import type {
  NivelCuradoriaSpoor,
  SetlistAnaliseSpoor,
} from './setlist-analysis.types'

interface BuildSetlistAnaliseSpoorInput {
  detalhesFilmes: TmdbMovieDetailsResponse[]
  classificacoesFilmes: TmdbMovieReleaseDatesResponse[]
  idsTrending: number[]
  idsPopulares: number[]
}

const CERTIFICACAO_POR_SIGLA: Record<string, number> = {
  L: 0,
  G: 0,
  PG: 10,
  'PG-13': 13,
  R: 17,
  'NC-17': 18,
  '10': 10,
  '12': 12,
  '14': 14,
  '16': 16,
  '18': 18,
}

function roundTwo(valor: number): number {
  return Number(valor.toFixed(2))
}

function parseAnoLancamento(dataLancamento: string | undefined): number | null {
  if (!dataLancamento) {
    return null
  }

  const ano = Number(dataLancamento.slice(0, 4))

  if (!Number.isInteger(ano)) {
    return null
  }

  return ano
}

function mediaNumerica(valores: number[]): number {
  if (valores.length === 0) {
    return 0
  }

  const soma = valores.reduce((acumulador, valorAtual) => acumulador + valorAtual, 0)

  return roundTwo(soma / valores.length)
}

function mediaNumericaOpcional(valores: Array<number | null>): number | null {
  const valoresValidos = valores.filter(
    (valorAtual): valorAtual is number => typeof valorAtual === 'number',
  )

  if (valoresValidos.length === 0) {
    return null
  }

  return mediaNumerica(valoresValidos)
}

function normalizarCertificacao(certificacao: string): string {
  return certificacao.trim().toUpperCase()
}

function buscarCertificacaoPorPais(
  classificacoesFilme: TmdbMovieReleaseDatesResponse | undefined,
  pais: string,
): number | null {
  if (!classificacoesFilme) {
    return null
  }

  const entradaPais = classificacoesFilme.results.find(
    (resultadoAtual) => resultadoAtual.iso_3166_1 === pais,
  )

  if (!entradaPais) {
    return null
  }

  const certificacaoEncontrada = entradaPais.release_dates.find((releaseAtual) => {
    return Boolean(normalizarCertificacao(releaseAtual.certification))
  })

  if (!certificacaoEncontrada) {
    return null
  }

  const classificacao = normalizarCertificacao(certificacaoEncontrada.certification)

  return CERTIFICACAO_POR_SIGLA[classificacao] ?? null
}

function resolverClassificacaoIndicativa(
  classificacoesFilme: TmdbMovieReleaseDatesResponse | undefined,
  filmeAdulto: boolean | undefined,
): number | null {
  const classificacaoBr = buscarCertificacaoPorPais(classificacoesFilme, 'BR')

  if (classificacaoBr !== null) {
    return classificacaoBr
  }

  const classificacaoUs = buscarCertificacaoPorPais(classificacoesFilme, 'US')

  if (classificacaoUs !== null) {
    return classificacaoUs
  }

  if (filmeAdulto === true) {
    return 18
  }

  if (filmeAdulto === false) {
    return 12
  }

  return null
}

function calcularScoreCuradoria(
  mediaNotas: number,
  mediaPopularidade: number,
  percentualTrending: number,
  percentualPopulares: number,
): number {
  const notaNormalizada = Math.min(1, Math.max(0, mediaNotas / 10))
  const popularidadeNormalizada = Math.min(1, Math.max(0, mediaPopularidade / 100))
  const trendingNormalizado = Math.min(1, Math.max(0, percentualTrending / 100))
  const popularesNormalizado = Math.min(1, Math.max(0, percentualPopulares / 100))

  const score =
    notaNormalizada * 40 +
    popularidadeNormalizada * 25 +
    trendingNormalizado * 20 +
    popularesNormalizado * 15

  return roundTwo(score)
}

function resolverNivelCuradoria(scoreCuradoria: number): NivelCuradoriaSpoor {
  if (scoreCuradoria >= 75) {
    return 'positivo'
  }

  if (scoreCuradoria >= 55) {
    return 'atencao'
  }

  return 'critico'
}

export function buildSetlistAnaliseAssinatura(movieIds: number[]): string {
  const idsOrdenados = [...movieIds].sort((a, b) => a - b)

  return idsOrdenados.join('|')
}

export function buildSetlistAnaliseSpoor({
  detalhesFilmes,
  classificacoesFilmes,
  idsTrending,
  idsPopulares,
}: BuildSetlistAnaliseSpoorInput): SetlistAnaliseSpoor {
  const classificacoesPorFilmeId = new Map(
    classificacoesFilmes.map((classificacaoAtual) => [classificacaoAtual.id, classificacaoAtual]),
  )
  const trendingIds = new Set(idsTrending)
  const popularesIds = new Set(idsPopulares)

  const filmes = detalhesFilmes.map((filmeAtual) => {
    const classificacoesFilme = classificacoesPorFilmeId.get(filmeAtual.id)
    const classificacaoIndicativa = resolverClassificacaoIndicativa(
      classificacoesFilme,
      filmeAtual.adult,
    )

    return {
      id: filmeAtual.id,
      titulo: filmeAtual.title ?? filmeAtual.name ?? `Filme #${filmeAtual.id}`,
      notaMedia: roundTwo(filmeAtual.vote_average ?? 0),
      popularidade: roundTwo(filmeAtual.popularity ?? 0),
      budget: filmeAtual.budget ?? 0,
      anoLancamento: parseAnoLancamento(filmeAtual.release_date),
      classificacaoIndicativa,
      emTendencia: trendingIds.has(filmeAtual.id),
      emPopulares: popularesIds.has(filmeAtual.id),
    }
  })

  const totalFilmes = filmes.length

  if (totalFilmes === 0) {
    return {
      totalFilmes: 0,
      mediaNotas: 0,
      mediaBudget: 0,
      mediaPopularidade: 0,
      mediaAnoLancamento: null,
      mediaClassificacaoIndicativa: null,
      percentualTrending: 0,
      percentualPopulares: 0,
      scoreCuradoria: 0,
      nivelCuradoria: 'critico',
      filmesAcimaNotaSete: 0,
      filmesBaixaPopularidade: 0,
      filmes,
    }
  }

  const mediaNotas = mediaNumerica(filmes.map((filmeAtual) => filmeAtual.notaMedia))
  const budgetsValidos = filmes
    .map((filmeAtual) => filmeAtual.budget)
    .filter((budgetAtual) => budgetAtual > 0)
  const mediaBudget = mediaNumerica(budgetsValidos)
  const mediaPopularidade = mediaNumerica(
    filmes.map((filmeAtual) => filmeAtual.popularidade),
  )
  const mediaAnoLancamento = mediaNumericaOpcional(
    filmes.map((filmeAtual) => filmeAtual.anoLancamento),
  )
  const mediaClassificacaoIndicativa = mediaNumericaOpcional(
    filmes.map((filmeAtual) => filmeAtual.classificacaoIndicativa),
  )

  const percentualTrending = roundTwo(
    (filmes.filter((filmeAtual) => filmeAtual.emTendencia).length / totalFilmes) * 100,
  )
  const percentualPopulares = roundTwo(
    (filmes.filter((filmeAtual) => filmeAtual.emPopulares).length / totalFilmes) * 100,
  )

  const scoreCuradoria = calcularScoreCuradoria(
    mediaNotas,
    mediaPopularidade,
    percentualTrending,
    percentualPopulares,
  )

  return {
    totalFilmes,
    mediaNotas,
    mediaBudget,
    mediaPopularidade,
    mediaAnoLancamento,
    mediaClassificacaoIndicativa,
    percentualTrending,
    percentualPopulares,
    scoreCuradoria,
    nivelCuradoria: resolverNivelCuradoria(scoreCuradoria),
    filmesAcimaNotaSete: filmes.filter((filmeAtual) => filmeAtual.notaMedia >= 7).length,
    filmesBaixaPopularidade: filmes.filter((filmeAtual) => filmeAtual.popularidade < 30)
      .length,
    filmes,
  }
}
