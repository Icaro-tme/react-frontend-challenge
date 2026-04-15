import type { Setlist } from '../../setlist/model/setlist.types'

export interface EstadoUsuarioFilmesSnapshot {
  favoriteMovieIds: number[]
  watchlistMovieIds: number[]
  watchedMovieIds: number[]
  setlists: Setlist[]
}
