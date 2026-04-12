export interface Movie {
  id: number
  title: string
  posterUrl: string
  backdropUrl: string
  releaseDate: string
  overview: string
  voteAverage: number
  voteCount: number
  popularity: number
  genreIds: number[]
  genres: string[]
  isFavorite: boolean
  setlists: string[]
  inWatchlist: boolean
  watched: boolean
}

export type MovieGenresById = Record<number, string>
