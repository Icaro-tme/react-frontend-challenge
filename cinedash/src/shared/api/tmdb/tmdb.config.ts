import type { ConfiguracaoTmdb } from './tmdb.types'

const TMDB_BASE_PADRAO = 'https://api.themoviedb.org/3'

export function getTmdbConfig(): ConfiguracaoTmdb {
  return {
    apiBaseUrl: import.meta.env.VITE_TMDB_API_URL?.trim() || TMDB_BASE_PADRAO,
    tokenAcessoLeitura:
      import.meta.env.VITE_TMDB_API_READ_ACCESS_TOKEN?.trim() || '',
    apiKey: import.meta.env.VITE_TMDB_API_KEY?.trim() || '',
  }
}
