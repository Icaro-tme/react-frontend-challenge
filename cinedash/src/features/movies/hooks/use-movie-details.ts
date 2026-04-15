import { useMemo } from 'react'
import { buildMovieGenresById } from '../../../entities/movie/model/genres'
import { mapTmdbMovieDetails } from '../../../entities/movie/model/mapper'
import { getErrorMessage as getSharedErrorMessage } from '../../../shared/lib/get-error-message'
import {
  useMovieDetailsQuery,
  useMovieGenresQuery,
} from '../../../entities/movie/api/movie.query'
import type { ElencoFilmeItem, TrailerFilme } from '../model/movie-details.types'
import type { EstadoUsuarioFilmesSnapshot } from '../../../entities/user/model/user-movie-state.types'
import type { RouteLanguage } from '../../../shared/config/language'

interface UseMovieDetailsInput {
  movieId: number
  routeLanguage: RouteLanguage
  estadoUsuario: EstadoUsuarioFilmesSnapshot
}

function getErrorMessage(erro: unknown): string {
  return getSharedErrorMessage(erro, 'Erro ao buscar detalhes do filme.')
}

export function useMovieDetails({
  movieId,
  routeLanguage,
  estadoUsuario,
}: UseMovieDetailsInput) {
  const generosQuery = useMovieGenresQuery({ routeLanguage })
  const genresById = useMemo(
    () => buildMovieGenresById(generosQuery.data?.genres),
    [generosQuery.data?.genres],
  )

  const detalhesQuery = useMovieDetailsQuery({
    routeLanguage,
    movieId,
    appendToResponse: ['credits', 'videos'],
  })

  const filme = useMemo(() => {
    if (!detalhesQuery.data) {
      return null
    }

    return mapTmdbMovieDetails(detalhesQuery.data, {
      estadoUsuario,
      genresById,
    })
  }, [detalhesQuery.data, estadoUsuario, genresById])

  const elencoPrincipal = useMemo<ElencoFilmeItem[]>(() => {
    const cast = detalhesQuery.data?.credits?.cast ?? []

    return cast.slice(0, 8).map((atorAtual) => ({
      id: atorAtual.id,
      nome: atorAtual.name,
      personagem: atorAtual.character,
      fotoPerfil: atorAtual.profile_path,
    }))
  }, [detalhesQuery.data?.credits?.cast])

  const trailer = useMemo<TrailerFilme | null>(() => {
    const videos = detalhesQuery.data?.videos?.results ?? []

    const trailerYoutube =
      videos.find(
        (videoAtual) =>
          videoAtual.site === 'YouTube' &&
          videoAtual.type === 'Trailer' &&
          videoAtual.official,
      ) ??
      videos.find(
        (videoAtual) =>
          videoAtual.site === 'YouTube' && videoAtual.type === 'Trailer',
      ) ??
      videos.find((videoAtual) => videoAtual.site === 'YouTube')

    if (!trailerYoutube) {
      return null
    }

    return {
      id: trailerYoutube.id,
      nome: trailerYoutube.name,
      chave: trailerYoutube.key,
      url: `https://www.youtube.com/watch?v=${trailerYoutube.key}`,
    }
  }, [detalhesQuery.data?.videos?.results])

  return {
    filme,
    elencoPrincipal,
    trailer,
    duracaoMinutos: detalhesQuery.data?.runtime ?? null,
    tagline: detalhesQuery.data?.tagline ?? '',
    isLoading: detalhesQuery.isLoading,
    errorMessage: detalhesQuery.error ? getErrorMessage(detalhesQuery.error) : null,
  }
}
