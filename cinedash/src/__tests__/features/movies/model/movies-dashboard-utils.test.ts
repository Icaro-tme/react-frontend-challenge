import { describe, expect, it } from 'vitest'
import type { Movie } from '../../../../entities/movie/model/types'
import {
  buildDataFinal,
  buildDataInicial,
  filtrarPorBuscaLocal,
  filtrarPorGenero,
  filtrarPorPeriodoAno,
  paginarFilmesLocais,
  parseAno,
  resolveAnoBusca,
} from '../../../../features/movies/model/movies-dashboard-utils'

function createMovie(
  id: number,
  title: string,
  releaseDate: string,
  genreIds: number[],
): Movie {
  return {
    id,
    title,
    posterUrl: '',
    backdropUrl: '',
    releaseDate,
    overview: '',
    voteAverage: 0,
    voteCount: 0,
    popularity: 0,
    genreIds,
    genres: [],
    isFavorite: false,
    setlists: [],
    inWatchlist: false,
    watched: false,
  }
}

describe('utils de dashboard de filmes', () => {
  it('deve validar parse de ano e composicao de datas', () => {
    expect(parseAno('2020')).toBe(2020)
    expect(parseAno('abc')).toBeNull()
    expect(parseAno('1600')).toBeNull()

    expect(buildDataInicial('2022')).toBe('2022-01-01')
    expect(buildDataFinal('2022')).toBe('2022-12-31')
  })

  it('deve resolver ano de busca somente para cenarios validos', () => {
    expect(resolveAnoBusca('2023')).toBe(2023)
    expect(resolveAnoBusca('')).toBeUndefined()
  })

  it('deve filtrar por genero, termo local e periodo de ano', () => {
    const filmesBase = [
      createMovie(1, 'Filme Alfa', '2018-01-01', [28, 12]),
      createMovie(2, 'Filme Beta', '2020-01-01', [35]),
      createMovie(3, 'Filme Gama', '2022-01-01', [28]),
    ]

    expect(filtrarPorGenero(filmesBase, [28]).map((filmeAtual) => filmeAtual.id)).toEqual([
      1,
      3,
    ])

    expect(
      filtrarPorBuscaLocal(filmesBase, 'beta').map((filmeAtual) => filmeAtual.id),
    ).toEqual([2])

    expect(
      filtrarPorPeriodoAno(filmesBase, '2022', '2020').map(
        (filmeAtual) => filmeAtual.id,
      ),
    ).toEqual([2, 3])
  })

  it('deve paginar lista local usando limite do app settings', () => {
    const filmes = Array.from({ length: 25 }, (_, indice) =>
      createMovie(indice + 1, `Filme ${indice + 1}`, '2020-01-01', [28]),
    )

    const pagina2 = paginarFilmesLocais(filmes, 2)

    expect(pagina2.totalResultados).toBe(25)
    expect(pagina2.totalPaginas).toBe(2)
    expect(pagina2.filmesPaginados).toHaveLength(5)
    expect(pagina2.filmesPaginados[0]?.id).toBe(21)
  })
})
