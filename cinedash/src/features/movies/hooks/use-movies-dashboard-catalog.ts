import { useMemo } from 'react'
import { mapTmdbMovieList } from '../../../entities/movie/model/mapper'
import {
  mergeUniqueMovies,
  selectFavoriteMovies,
  selectWatchlistMovies,
} from '../../../entities/movie/model/selectors'
import type { MovieGenresById } from '../../../entities/movie/model/types'
import type { TmdbMovieListResponse } from '../../../shared/api/tmdb'
import type { EstadoUsuarioFilmesSnapshot } from '../../../entities/user/model/user-movie-state.types'

interface UseMoviesDashboardCatalogInput {
  tendenciaData: TmdbMovieListResponse | undefined
  popularesData: TmdbMovieListResponse | undefined
  bemAvaliadosData: TmdbMovieListResponse | undefined
  proximosLancamentosData: TmdbMovieListResponse | undefined
  descobertaData: TmdbMovieListResponse | undefined
  buscaData: TmdbMovieListResponse | undefined
  estadoUsuario: EstadoUsuarioFilmesSnapshot
  genresById: MovieGenresById
}

export function useMoviesDashboardCatalog({
  tendenciaData,
  popularesData,
  bemAvaliadosData,
  proximosLancamentosData,
  descobertaData,
  buscaData,
  estadoUsuario,
  genresById,
}: UseMoviesDashboardCatalogInput) {
  const filmesTendencia = useMemo(() => {
    if (!tendenciaData) {
      return []
    }

    return mapTmdbMovieList(tendenciaData, {
      estadoUsuario,
      genresById,
    })
  }, [tendenciaData, estadoUsuario, genresById])

  const filmesPopulares = useMemo(() => {
    if (!popularesData) {
      return []
    }

    return mapTmdbMovieList(popularesData, {
      estadoUsuario,
      genresById,
    })
  }, [popularesData, estadoUsuario, genresById])

  const filmesDescoberta = useMemo(() => {
    if (!descobertaData) {
      return []
    }

    return mapTmdbMovieList(descobertaData, {
      estadoUsuario,
      genresById,
    })
  }, [descobertaData, estadoUsuario, genresById])

  const filmesBemAvaliados = useMemo(() => {
    if (!bemAvaliadosData) {
      return []
    }

    return mapTmdbMovieList(bemAvaliadosData, {
      estadoUsuario,
      genresById,
    })
  }, [bemAvaliadosData, estadoUsuario, genresById])

  const filmesProximosLancamentos = useMemo(() => {
    if (!proximosLancamentosData) {
      return []
    }

    return mapTmdbMovieList(proximosLancamentosData, {
      estadoUsuario,
      genresById,
    })
  }, [proximosLancamentosData, estadoUsuario, genresById])

  const filmesBusca = useMemo(() => {
    if (!buscaData) {
      return []
    }

    return mapTmdbMovieList(buscaData, {
      estadoUsuario,
      genresById,
    })
  }, [buscaData, estadoUsuario, genresById])

  const catalogoFilmes = useMemo(
    () =>
      mergeUniqueMovies([
        filmesTendencia,
        filmesPopulares,
        filmesBemAvaliados,
        filmesProximosLancamentos,
        filmesDescoberta,
        filmesBusca,
      ]),
    [
      filmesTendencia,
      filmesPopulares,
      filmesBemAvaliados,
      filmesProximosLancamentos,
      filmesDescoberta,
      filmesBusca,
    ],
  )

  const filmesFavoritos = useMemo(
    () => selectFavoriteMovies(catalogoFilmes),
    [catalogoFilmes],
  )

  const filmesWatchlist = useMemo(
    () => selectWatchlistMovies(catalogoFilmes),
    [catalogoFilmes],
  )

  return {
    filmesTendencia,
    filmesPopulares,
    filmesBemAvaliados,
    filmesProximosLancamentos,
    filmesDescoberta,
    filmesBusca,
    catalogoFilmes,
    filmesFavoritos,
    filmesWatchlist,
  }
}
