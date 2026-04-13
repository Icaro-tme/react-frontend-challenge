import type { JanelaTendencia, OrdenacaoDescoberta } from '../../../shared/api/tmdb'

export const MOVIES_LISTING_VIEWS = [
  'tendencias',
  'populares',
  'bemAvaliados',
  'proximosLancamentos',
  'descoberta',
  'pesquisa',
] as const

export type MovieListingView = (typeof MOVIES_LISTING_VIEWS)[number]

export interface MovieListingFilters {
  termoBusca: string
  generosIds: number[]
  anoLancamentoInicial: string
  notaMinima: string
  regiao: string
  janelaTendencia: JanelaTendencia
  ordenacaoDescoberta: OrdenacaoDescoberta
}
