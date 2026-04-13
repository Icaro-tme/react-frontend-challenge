import { useMemo } from 'react'
import type { EstadoUsuarioFilmesSnapshot } from '../../../entities/user/model/user-movie-state.types'
import type { Setlist } from '../../../entities/setlist/model/setlist.types'

interface UseMovieUserStateInput {
  favoriteMovieIds: number[]
  watchlistMovieIds: number[]
  watchedMovieIds: number[]
  setlists: Setlist[]
}

export function useMovieUserState({
  favoriteMovieIds,
  watchlistMovieIds,
  watchedMovieIds,
  setlists,
}: UseMovieUserStateInput): EstadoUsuarioFilmesSnapshot {

  return useMemo(
    () => ({
      favoriteMovieIds,
      watchlistMovieIds,
      watchedMovieIds,
      setlists,
    }),
    [favoriteMovieIds, watchlistMovieIds, watchedMovieIds, setlists],
  )
}
