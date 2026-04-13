import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
  movieDetailsQueryOptions,
  movieReleaseDatesQueryOptions,
  popularMoviesQueryOptions,
  trendingMoviesQueryOptions,
} from '../../../entities/movie/api/movie.query'
import type { Setlist } from '../../../entities/setlist/model/setlist.types'
import type { RouteLanguage } from '../../../shared/config/language'
import { getErrorMessage } from '../../../shared/lib/get-error-message'
import { createSetlistAnaliseSpoorCsv } from '../model/setlist-analysis-export'
import type {
  SetlistAnaliseSpoorCache,
  SetlistAnaliseSpoorCsv,
} from '../model/setlist-analysis.types'
import {
  buildSetlistAnaliseAssinatura,
  buildSetlistAnaliseSpoor,
} from '../model/setlist-analysis.utils'

interface UseSetlistAnalysisInput {
  routeLanguage: RouteLanguage
  setlistSelecionada: Setlist | null
}

interface CalcularAnaliseInput {
  assinatura: string
  setlistSelecionada: Setlist
}

type StatusAnaliseSetlist =
  | 'semSetlist'
  | 'semFilmes'
  | 'naoCalculada'
  | 'desatualizada'
  | 'atualizada'

function createAnaliseAtualCacheKey(
  routeLanguage: RouteLanguage,
  setlistId: string,
  assinatura: string,
) {
  return ['setlist', 'spoor-analise', routeLanguage, setlistId, assinatura] as const
}

function createAnaliseUltimaCacheKey(routeLanguage: RouteLanguage, setlistId: string) {
  return ['setlist', 'spoor-analise-last', routeLanguage, setlistId] as const
}

export function useSetlistAnalysis({
  routeLanguage,
  setlistSelecionada,
}: UseSetlistAnalysisInput) {
  const queryClient = useQueryClient()

  const setlistId = setlistSelecionada?.id ?? ''
  const assinaturaAtual = useMemo(
    () => buildSetlistAnaliseAssinatura(setlistSelecionada?.movieIds ?? []),
    [setlistSelecionada?.movieIds],
  )

  const chaveAnaliseAtual = createAnaliseAtualCacheKey(
    routeLanguage,
    setlistId,
    assinaturaAtual,
  )
  const chaveAnaliseUltima = createAnaliseUltimaCacheKey(routeLanguage, setlistId)

  const cacheAnaliseAtual = setlistId
    ? queryClient.getQueryData<SetlistAnaliseSpoorCache>(chaveAnaliseAtual)
    : undefined
  const cacheAnaliseUltima = setlistId
    ? queryClient.getQueryData<SetlistAnaliseSpoorCache>(chaveAnaliseUltima)
    : undefined

  const analiseAtual = cacheAnaliseAtual?.analise ?? null
  const analiseAnterior =
    cacheAnaliseUltima && cacheAnaliseUltima.assinatura !== assinaturaAtual
      ? cacheAnaliseUltima.analise
      : null

  const calcularAnaliseMutation = useMutation({
    mutationFn: async ({ assinatura, setlistSelecionada }: CalcularAnaliseInput) => {
      const idsFilmesSetlist = setlistSelecionada.movieIds

      if (idsFilmesSetlist.length === 0) {
        throw new Error('Nenhum filme encontrado na setlist para análise.')
      }

      const detalhesFilmes = await Promise.all(
        idsFilmesSetlist.map((movieIdAtual) =>
          queryClient.fetchQuery(
            movieDetailsQueryOptions({
              routeLanguage,
              movieId: movieIdAtual,
            }),
          ),
        ),
      )

      const classificacoesFilmes = await Promise.all(
        idsFilmesSetlist.map((movieIdAtual) =>
          queryClient.fetchQuery(
            movieReleaseDatesQueryOptions({
              routeLanguage,
              movieId: movieIdAtual,
            }),
          ),
        ),
      )

      const respostaTrending = await queryClient.fetchQuery(
        trendingMoviesQueryOptions({
          routeLanguage,
          timeWindow: 'week',
          page: 1,
        }),
      )

      const respostaPopulares = await queryClient.fetchQuery(
        popularMoviesQueryOptions({
          routeLanguage,
          page: 1,
        }),
      )

      const analise = buildSetlistAnaliseSpoor({
        detalhesFilmes,
        classificacoesFilmes,
        idsTrending: respostaTrending.results.map((filmeAtual) => filmeAtual.id),
        idsPopulares: respostaPopulares.results.map((filmeAtual) => filmeAtual.id),
      })

      return {
        assinatura,
        analise,
      }
    },
    onSuccess: ({ assinatura, analise }, entrada) => {
      const cacheAnalise: SetlistAnaliseSpoorCache = {
        assinatura,
        analise,
        calculadoEm: Date.now(),
      }

      const chaveAtual = createAnaliseAtualCacheKey(
        routeLanguage,
        entrada.setlistSelecionada.id,
        assinatura,
      )
      const chaveUltima = createAnaliseUltimaCacheKey(
        routeLanguage,
        entrada.setlistSelecionada.id,
      )

      queryClient.setQueryData(chaveAtual, cacheAnalise)
      queryClient.setQueryData(chaveUltima, cacheAnalise)
    },
  })

  const statusAnalise: StatusAnaliseSetlist = (() => {
    if (!setlistSelecionada) {
      return 'semSetlist'
    }

    if (setlistSelecionada.movieIds.length === 0) {
      return 'semFilmes'
    }

    if (analiseAtual) {
      return 'atualizada'
    }

    if (analiseAnterior) {
      return 'desatualizada'
    }

    return 'naoCalculada'
  })()

  function calcularAnalise() {
    if (!setlistSelecionada || setlistSelecionada.movieIds.length === 0) {
      return
    }

    calcularAnaliseMutation.mutate({
      assinatura: assinaturaAtual,
      setlistSelecionada,
    })
  }

  function createCsvExport(): SetlistAnaliseSpoorCsv | null {
    if (!setlistSelecionada) {
      return null
    }

    const analiseParaExportar = analiseAtual ?? analiseAnterior

    if (!analiseParaExportar) {
      return null
    }

    return createSetlistAnaliseSpoorCsv({
      nomeSetlist: setlistSelecionada.name,
      analise: analiseParaExportar,
    })
  }

  return {
    statusAnalise,
    analiseAtual,
    analiseAnterior,
    calculadoEmAtual: cacheAnaliseAtual?.calculadoEm ?? null,
    calculadoEmAnterior:
      cacheAnaliseUltima && cacheAnaliseUltima.assinatura !== assinaturaAtual
        ? cacheAnaliseUltima.calculadoEm
        : null,
    isCalculandoAnalise: calcularAnaliseMutation.isPending,
    erroCalculoAnalise: calcularAnaliseMutation.error
      ? getErrorMessage(
          calcularAnaliseMutation.error,
          'Não foi possível calcular a análise da setlist.',
        )
      : null,
    calcularAnalise,
    createCsvExport,
  }
}
