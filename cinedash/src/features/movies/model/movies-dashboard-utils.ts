import type { Movie } from '../../../entities/movie/model/types'
import { appSettings } from '../../../shared/config/app-settings'

const TAMANHO_PAGINA_LOCAL = appSettings.filmes.tamanhoPaginaLocal
const ANO_LANCAMENTO_MINIMO = appSettings.filmes.anoLancamentoMinimo
const ANO_LANCAMENTO_MAXIMO = appSettings.filmes.anoLancamentoMaximo
const NOTA_MINIMA_PERMITIDA = appSettings.filmes.notaMinimaPermitida
const NOTA_MAXIMA_PERMITIDA = appSettings.filmes.notaMaximaPermitida

export function parseAno(anoTexto: string): number | null {
  if (!anoTexto.trim()) {
    return null
  }

  const ano = Number(anoTexto)

  if (!Number.isInteger(ano) || ano < ANO_LANCAMENTO_MINIMO || ano > ANO_LANCAMENTO_MAXIMO) {
    return null
  }

  return ano
}

export function parseNotaMinima(notaTexto: string): number | undefined {
  const notaNormalizada = notaTexto.trim()

  if (!notaNormalizada) {
    return undefined
  }

  const nota = Number(notaNormalizada)

  if (!Number.isFinite(nota) || nota < NOTA_MINIMA_PERMITIDA || nota > NOTA_MAXIMA_PERMITIDA) {
    return undefined
  }

  return Number(nota.toFixed(1))
}

export function filtrarPorGenero(filmes: Movie[], generosIds: number[]): Movie[] {
  if (generosIds.length === 0) {
    return filmes
  }

  return filmes.filter((filmeAtual) =>
    generosIds.some((generoId) => filmeAtual.genreIds.includes(generoId)),
  )
}

export function filtrarPorBuscaLocal(filmes: Movie[], termoBusca: string): Movie[] {
  const termoNormalizado = termoBusca.toLowerCase().trim()

  if (!termoNormalizado) {
    return filmes
  }

  return filmes.filter((filmeAtual) =>
    filmeAtual.title.toLowerCase().includes(termoNormalizado),
  )
}

export function filtrarPorPeriodoAno(
  filmes: Movie[],
  anoInicialTexto: string,
  anoFinalTexto: string,
): Movie[] {
  const anoInicial = parseAno(anoInicialTexto)
  const anoFinal = parseAno(anoFinalTexto)

  if (!anoInicial && !anoFinal) {
    return filmes
  }

  if (!anoInicial && anoFinal) {
    return filmes
  }

  if (!anoInicial) {
    return filmes
  }

  const limiteInicial = Math.min(anoInicial, anoFinal ?? anoInicial)
  const limiteFinal = Math.max(anoInicial, anoFinal ?? anoInicial)

  return filmes.filter((filmeAtual) => {
    if (!filmeAtual.releaseDate) {
      return false
    }

    const anoFilme = Number(filmeAtual.releaseDate.slice(0, 4))

    if (!Number.isInteger(anoFilme)) {
      return false
    }

    if (anoFilme < limiteInicial) {
      return false
    }

    if (anoFilme > limiteFinal) {
      return false
    }

    return true
  })
}

export function resolveAnoBusca(
  anoInicialTexto: string,
): number | undefined {
  return parseAno(anoInicialTexto) ?? undefined
}

export function buildDataInicial(anoInicialTexto: string): string | undefined {
  const anoInicial = parseAno(anoInicialTexto)

  if (!anoInicial) {
    return undefined
  }

  return `${anoInicial}-01-01`
}

export function buildDataFinal(
  anoInicialTexto: string,
): string | undefined {
  const anoInicial = parseAno(anoInicialTexto)

  if (!anoInicial) {
    return undefined
  }

  return `${anoInicial}-12-31`
}

export function limitarTotalPaginas(totalPaginas: number): number {
  if (!Number.isFinite(totalPaginas) || totalPaginas <= 0) {
    return 1
  }

  return totalPaginas
}

export interface LocalMoviesPagination {
  filmesPaginados: Movie[]
  totalPaginas: number
  totalResultados: number
}

export function paginarFilmesLocais(
  filmes: Movie[],
  paginaAtual: number,
): LocalMoviesPagination {
  const totalResultados = filmes.length
  const totalPaginas = Math.max(1, Math.ceil(totalResultados / TAMANHO_PAGINA_LOCAL))
  const paginaClamped = Math.min(Math.max(1, paginaAtual), totalPaginas)
  const indiceInicial = (paginaClamped - 1) * TAMANHO_PAGINA_LOCAL
  const indiceFinal = indiceInicial + TAMANHO_PAGINA_LOCAL

  return {
    filmesPaginados: filmes.slice(indiceInicial, indiceFinal),
    totalPaginas,
    totalResultados,
  }
}
