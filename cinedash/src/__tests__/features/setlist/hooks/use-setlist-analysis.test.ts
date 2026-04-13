import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Setlist } from '../../../../entities/setlist/model/setlist.types'
import { tmdbService } from '../../../../shared/api/tmdb'
import { useSetlistAnalysis } from '../../../../features/setlist/hooks/use-setlist-analysis'

const detalhesPorId = {
  1: {
    id: 1,
    title: 'Filme 1',
    poster_path: null,
    backdrop_path: null,
    overview: 'A',
    release_date: '2011-01-01',
    vote_average: 8,
    popularity: 70,
    budget: 100,
    adult: false,
    genres: [],
  },
  2: {
    id: 2,
    title: 'Filme 2',
    poster_path: null,
    backdrop_path: null,
    overview: 'B',
    release_date: '2014-01-01',
    vote_average: 7,
    popularity: 65,
    budget: 200,
    adult: false,
    genres: [],
  },
  3: {
    id: 3,
    title: 'Filme 3',
    poster_path: null,
    backdrop_path: null,
    overview: 'C',
    release_date: '2018-01-01',
    vote_average: 5,
    popularity: 15,
    budget: 0,
    adult: false,
    genres: [],
  },
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useSetlistAnalysis', () => {
  beforeEach(() => {
    vi.spyOn(tmdbService, 'getMovieDetails').mockImplementation(async ({ movieId }) => {
      const detalhe = detalhesPorId[movieId as keyof typeof detalhesPorId]

      if (!detalhe) {
        throw new Error('Filme de teste não encontrado.')
      }

      return detalhe
    })

    vi.spyOn(tmdbService, 'getMovieReleaseDates').mockImplementation(async ({ movieId }) => ({
      id: movieId,
      results: [
        {
          iso_3166_1: 'BR',
          release_dates: [
            {
              certification: '12',
              release_date: '2024-01-01',
            },
          ],
        },
      ],
    }))

    vi.spyOn(tmdbService, 'getTrendingMovies').mockResolvedValue({
      page: 1,
      results: [
        {
          id: 1,
          title: 'Filme 1',
          poster_path: null,
          backdrop_path: null,
          overview: 'A',
        },
      ],
      total_pages: 1,
      total_results: 1,
    })

    vi.spyOn(tmdbService, 'getPopularMovies').mockResolvedValue({
      page: 1,
      results: [
        {
          id: 1,
          title: 'Filme 1',
          poster_path: null,
          backdrop_path: null,
          overview: 'A',
        },
        {
          id: 2,
          title: 'Filme 2',
          poster_path: null,
          backdrop_path: null,
          overview: 'B',
        },
      ],
      total_pages: 1,
      total_results: 2,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('deve calcular analise e marcar como desatualizada quando a setlist muda', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    })

    const setlistInicial: Setlist = {
      id: 'setlist-teste',
      name: 'Setlist Teste',
      movieIds: [1, 2],
    }

    const { result, rerender } = renderHook(
      ({ setlistSelecionada }) =>
        useSetlistAnalysis({
          routeLanguage: 'pt-BR',
          setlistSelecionada,
        }),
      {
        initialProps: {
          setlistSelecionada: setlistInicial as Setlist | null,
        },
        wrapper: createWrapper(queryClient),
      },
    )

    expect(result.current.statusAnalise).toBe('naoCalculada')

    act(() => {
      result.current.calcularAnalise()
    })

    await waitFor(() => {
      expect(result.current.statusAnalise).toBe('atualizada')
    })

    expect(result.current.analiseAtual?.totalFilmes).toBe(2)

    rerender({
      setlistSelecionada: {
        ...setlistInicial,
        movieIds: [1, 2, 3],
      },
    })

    expect(result.current.statusAnalise).toBe('desatualizada')
    expect(result.current.analiseAnterior?.totalFilmes).toBe(2)
  })
})
