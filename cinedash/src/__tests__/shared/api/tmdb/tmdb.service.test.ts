import { describe, expect, it, vi } from 'vitest'
import { createTmdbService } from '../../../../shared/api/tmdb/tmdb.service'
import type { ConfiguracaoTmdb } from '../../../../shared/api/tmdb/tmdb.types'

function createOkResponse(dados: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue(dados),
  } as unknown as Response
}

function createErrorResponse(status: number): Response {
  return {
    ok: false,
    status,
    json: vi.fn().mockResolvedValue({}),
  } as unknown as Response
}

const configuracaoComToken: ConfiguracaoTmdb = {
  apiBaseUrl: 'https://api.themoviedb.org/3',
  tokenAcessoLeitura: 'token_teste',
  apiKey: '',
}

const configuracaoComApiKey: ConfiguracaoTmdb = {
  apiBaseUrl: 'https://api.themoviedb.org/3',
  tokenAcessoLeitura: '',
  apiKey: 'api_key_teste',
}

describe('servico tmdb', () => {
  it('deve buscar filmes em tendencia com token bearer', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createOkResponse({ results: [] }))

    const servico = createTmdbService({
      fetchFn: fetchMock as unknown as typeof fetch,
      configuracao: configuracaoComToken,
    })

    await servico.getTrendingMovies({
      timeWindow: 'week',
      language: 'en-US',
    })

    const [urlChamado, opcoes] = fetchMock.mock.calls[0] as [string, RequestInit]
    const url = new URL(urlChamado)

    expect(url.pathname).toBe('/3/trending/movie/week')
    expect(url.searchParams.get('language')).toBe('en-US')
    expect(opcoes.method).toBe('GET')
    expect(opcoes.headers).toEqual({
      accept: 'application/json',
      Authorization: 'Bearer token_teste',
    })
  })

  it('deve buscar filmes populares com fallback de api_key quando token estiver ausente', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createOkResponse({ results: [] }))

    const servico = createTmdbService({
      fetchFn: fetchMock as unknown as typeof fetch,
      configuracao: configuracaoComApiKey,
    })

    await servico.getPopularMovies({
      page: 2,
      language: 'pt-BR',
      region: 'BR',
    })

    const [urlChamado, opcoes] = fetchMock.mock.calls[0] as [string, RequestInit]
    const url = new URL(urlChamado)

    expect(url.pathname).toBe('/3/movie/popular')
    expect(url.searchParams.get('page')).toBe('2')
    expect(url.searchParams.get('region')).toBe('BR')
    expect(url.searchParams.get('api_key')).toBe('api_key_teste')
    expect(opcoes.headers).toEqual({
      accept: 'application/json',
    })
  })

  it('deve buscar filmes top rated', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createOkResponse({ results: [] }))

    const servico = createTmdbService({
      fetchFn: fetchMock as unknown as typeof fetch,
      configuracao: configuracaoComToken,
    })

    await servico.getTopRatedMovies({
      page: 4,
      language: 'en-US',
      region: 'US',
    })

    const [urlChamado] = fetchMock.mock.calls[0] as [string]
    const url = new URL(urlChamado)

    expect(url.pathname).toBe('/3/movie/top_rated')
    expect(url.searchParams.get('page')).toBe('4')
    expect(url.searchParams.get('region')).toBe('US')
  })

  it('deve buscar filmes upcoming', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createOkResponse({ results: [] }))

    const servico = createTmdbService({
      fetchFn: fetchMock as unknown as typeof fetch,
      configuracao: configuracaoComToken,
    })

    await servico.getUpcomingMovies({
      page: 3,
      language: 'pt-BR',
      region: 'BR',
    })

    const [urlChamado] = fetchMock.mock.calls[0] as [string]
    const url = new URL(urlChamado)

    expect(url.pathname).toBe('/3/movie/upcoming')
    expect(url.searchParams.get('page')).toBe('3')
    expect(url.searchParams.get('region')).toBe('BR')
  })

  it('deve buscar filmes de descoberta com filtros basicos', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createOkResponse({ results: [] }))

    const servico = createTmdbService({
      fetchFn: fetchMock as unknown as typeof fetch,
      configuracao: configuracaoComToken,
    })

    await servico.getDiscoverMovies({
      page: 3,
      language: 'pt-BR',
      generos: '28',
      anoLancamento: 2023,
      notaMinima: 7,
    })

    const [urlChamado] = fetchMock.mock.calls[0] as [string]
    const url = new URL(urlChamado)

    expect(url.pathname).toBe('/3/discover/movie')
    expect(url.searchParams.get('page')).toBe('3')
    expect(url.searchParams.get('with_genres')).toBe('28')
    expect(url.searchParams.get('primary_release_year')).toBe('2023')
    expect(url.searchParams.get('vote_average.gte')).toBe('7')
    expect(url.searchParams.get('include_adult')).toBe('false')
  })

  it('deve usar idioma padrao quando request nao informar idioma', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createOkResponse({ results: [] }))

    const servico = createTmdbService({
      fetchFn: fetchMock as unknown as typeof fetch,
      configuracao: configuracaoComToken,
    })

    await servico.getTrendingMovies()

    const [urlChamado] = fetchMock.mock.calls[0] as [string]
    const url = new URL(urlChamado)

    expect(url.searchParams.get('language')).toBe('pt-BR')
  })

  it('deve buscar detalhes do filme por id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createOkResponse({ id: 550 }))

    const servico = createTmdbService({
      fetchFn: fetchMock as unknown as typeof fetch,
      configuracao: configuracaoComToken,
    })

    await servico.getMovieDetails({
      movieId: 550,
      language: 'pt-BR',
      appendToResponse: ['credits', 'videos'],
    })

    const [urlChamado] = fetchMock.mock.calls[0] as [string]
    const url = new URL(urlChamado)

    expect(url.pathname).toBe('/3/movie/550')
    expect(url.searchParams.get('language')).toBe('pt-BR')
    expect(url.searchParams.get('append_to_response')).toBe('credits,videos')
  })

  it('deve buscar classificacoes indicativas do filme por id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createOkResponse({ id: 550, results: [] }))

    const servico = createTmdbService({
      fetchFn: fetchMock as unknown as typeof fetch,
      configuracao: configuracaoComToken,
    })

    await servico.getMovieReleaseDates({
      movieId: 550,
      language: 'pt-BR',
    })

    const [urlChamado] = fetchMock.mock.calls[0] as [string]
    const url = new URL(urlChamado)

    expect(url.pathname).toBe('/3/movie/550/release_dates')
    expect(url.searchParams.get('language')).toBe('pt-BR')
  })

  it('deve buscar filmes por nome no endpoint de search', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createOkResponse({ results: [] }))

    const servico = createTmdbService({
      fetchFn: fetchMock as unknown as typeof fetch,
      configuracao: configuracaoComToken,
    })

    await servico.searchMovies({
      query: 'Matrix',
      language: 'pt-BR',
      page: 2,
      anoLancamento: 1999,
      anoLancamentoPrimario: 1999,
      region: 'BR',
    })

    const [urlChamado] = fetchMock.mock.calls[0] as [string]
    const url = new URL(urlChamado)

    expect(url.pathname).toBe('/3/search/movie')
    expect(url.searchParams.get('query')).toBe('Matrix')
    expect(url.searchParams.get('page')).toBe('2')
    expect(url.searchParams.get('year')).toBe('1999')
    expect(url.searchParams.get('primary_release_year')).toBe('1999')
    expect(url.searchParams.get('region')).toBe('BR')
  })

  it('deve buscar lista de generos de filmes', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(createOkResponse({ genres: [{ id: 28, name: 'Acao' }] }))

    const servico = createTmdbService({
      fetchFn: fetchMock as unknown as typeof fetch,
      configuracao: configuracaoComToken,
    })

    await servico.getMovieGenres({ language: 'pt-BR' })

    const [urlChamado] = fetchMock.mock.calls[0] as [string]
    const url = new URL(urlChamado)

    expect(url.pathname).toBe('/3/genre/movie/list')
    expect(url.searchParams.get('language')).toBe('pt-BR')
  })

  it('deve lancar erro quando tmdb responder com status sem sucesso', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createErrorResponse(401))

    const servico = createTmdbService({
      fetchFn: fetchMock as unknown as typeof fetch,
      configuracao: configuracaoComToken,
    })

    await expect(servico.getTrendingMovies()).rejects.toThrow(
      'Falha na requisicao a TMDB (401).',
    )
  })

  it('deve lancar erro quando credenciais estiverem ausentes', () => {
    expect(() =>
      createTmdbService({
        fetchFn: vi.fn() as unknown as typeof fetch,
        configuracao: {
          apiBaseUrl: 'https://api.themoviedb.org/3',
          tokenAcessoLeitura: '',
          apiKey: '',
        },
      }),
    ).toThrow(
      'Credenciais da TMDB ausentes. Configure VITE_TMDB_API_READ_ACCESS_TOKEN ou VITE_TMDB_API_KEY.',
    )
  })
})