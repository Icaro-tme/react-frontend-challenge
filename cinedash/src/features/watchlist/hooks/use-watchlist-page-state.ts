import { useQueries } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import {
  movieDetailsQueryOptions,
  useMovieGenresQuery,
} from '../../../entities/movie/api/movie.query'
import { buildMovieGenresById } from '../../../entities/movie/model/genres'
import { mapTmdbMovieDetails } from '../../../entities/movie/model/mapper'
import { selectMovieById } from '../../../entities/movie/model/selectors'
import type { Setlist } from '../../../entities/setlist/model/setlist.types'
import type { EstadoUsuarioFilmesSnapshot } from '../../../entities/user/model/user-movie-state.types'
import { appSettings } from '../../../shared/config/app-settings'
import type { RouteLanguage } from '../../../shared/config/language'
import { useDebouncedValue } from '../../../shared/hooks/use-debounced-value'
import { getErrorMessage } from '../../../shared/lib/get-error-message'
import {
  type WatchlistSortDirection,
  type WatchlistSortField,
  type WatchlistStatusFilter,
} from '../model/watchlist-filters.types'
import { useWatchlistStore } from '../model/watchlist.store'

interface UseWatchlistPageStateInput {
  routeLanguage: RouteLanguage
  mensagemErroPadrao: string
  estadoUsuario: EstadoUsuarioFilmesSnapshot
  setlists: Setlist[]
  toggleFavorite: (movieId: number) => void
  createSetlist: (nomeSetlist: string) => Setlist
  addMovieToSetlist: (setlistId: string, movieId: number) => void
  removeMovieFromSetlist: (setlistId: string, movieId: number) => void
  hasMovieInSetlist: (setlistId: string, movieId: number) => boolean
}

function compareStrings(
  valorA: string,
  valorB: string,
  idioma: RouteLanguage,
): number {
  return valorA.localeCompare(valorB, idioma, {
    sensitivity: 'base',
  })
}

export function useWatchlistPageState({
  routeLanguage,
  mensagemErroPadrao,
  estadoUsuario,
  setlists,
  toggleFavorite,
  createSetlist,
  addMovieToSetlist,
  removeMovieFromSetlist,
  hasMovieInSetlist,
}: UseWatchlistPageStateInput) {
  const idsWatchlist = useWatchlistStore(
    (estadoAtual) => estadoAtual.filmesWatchlistIds,
  )
  const removeFromWatchlist = useWatchlistStore(
    (estadoAtual) => estadoAtual.removeFromWatchlist,
  )
  const setWatched = useWatchlistStore((estadoAtual) => estadoAtual.setWatched)
  const isWatched = useWatchlistStore((estadoAtual) => estadoAtual.isWatched)

  const [movieIdSetlistModal, setMovieIdSetlistModal] = useState<number | null>(null)

  const [termoBuscaInput, setTermoBuscaInput] = useState('')
  const [statusFiltro, setStatusFiltro] = useState<WatchlistStatusFilter>('todos')
  const [ordenacaoCampo, setOrdenacaoCampo] = useState<WatchlistSortField>('titulo')
  const [ordenacaoDirecao, setOrdenacaoDirecao] = useState<WatchlistSortDirection>('asc')
  const [paginaAtual, setPaginaAtual] = useState(1)

  const termoBuscaDebounced = useDebouncedValue(
    termoBuscaInput,
    appSettings.filmes.tempoDebounceFiltrosMs,
  )

  const generosQuery = useMovieGenresQuery({ routeLanguage })

  const generosPorId = useMemo(
    () => buildMovieGenresById(generosQuery.data?.genres),
    [generosQuery.data?.genres],
  )

  const detalhesFilmesQueries = useQueries({
    queries: idsWatchlist.map((movieIdAtual) =>
      movieDetailsQueryOptions({
        routeLanguage,
        movieId: movieIdAtual,
      }),
    ),
  })

  const filmesWatchlistBase = useMemo(() => {
    return detalhesFilmesQueries.flatMap((queryAtual) => {
      if (!queryAtual.data) {
        return []
      }

      return [
        mapTmdbMovieDetails(queryAtual.data, {
          estadoUsuario,
          genresById: generosPorId,
        }),
      ]
    })
  }, [detalhesFilmesQueries, estadoUsuario, generosPorId])

  const isLoading = detalhesFilmesQueries.some(
    (queryAtual) => queryAtual.isLoading || queryAtual.isFetching,
  )

  const erroFilmesWatchlist = detalhesFilmesQueries.find(
    (queryAtual) => queryAtual.error,
  )?.error

  const errorMessage = erroFilmesWatchlist
    ? getErrorMessage(erroFilmesWatchlist, mensagemErroPadrao)
    : null

  const filmesWatchlistFiltrados = useMemo(() => {
    const termoBuscaNormalizado = termoBuscaDebounced.trim().toLowerCase()

    return filmesWatchlistBase.filter((filmeAtual) => {
      if (
        termoBuscaNormalizado &&
        !filmeAtual.title.toLowerCase().includes(termoBuscaNormalizado)
      ) {
        return false
      }

      if (statusFiltro === 'assistidos' && !filmeAtual.watched) {
        return false
      }

      if (statusFiltro === 'pendentes' && filmeAtual.watched) {
        return false
      }

      if (statusFiltro === 'favoritos' && !filmeAtual.isFavorite) {
        return false
      }

      return true
    })
  }, [filmesWatchlistBase, termoBuscaDebounced, statusFiltro])

  const filmesWatchlistOrdenados = useMemo(() => {
    return [...filmesWatchlistFiltrados].sort((filmeA, filmeB) => {
      let comparacao = 0

      if (ordenacaoCampo === 'titulo') {
        comparacao = compareStrings(filmeA.title, filmeB.title, routeLanguage)
      }

      if (ordenacaoCampo === 'genero') {
        comparacao = compareStrings(
          filmeA.genres[0] ?? '',
          filmeB.genres[0] ?? '',
          routeLanguage,
        )
      }

      if (ordenacaoCampo === 'nota') {
        comparacao = filmeA.voteAverage - filmeB.voteAverage
      }

      if (ordenacaoDirecao === 'desc') {
        return comparacao * -1
      }

      return comparacao
    })
  }, [filmesWatchlistFiltrados, ordenacaoCampo, ordenacaoDirecao, routeLanguage])

  const totalResultados = filmesWatchlistOrdenados.length
  const totalPaginas = Math.max(
    1,
    Math.ceil(totalResultados / appSettings.filmes.tamanhoPaginaLocal),
  )
  const paginaAtualVisual = Math.min(paginaAtual, totalPaginas)

  const filmesWatchlistPaginados = useMemo(() => {
    const indiceInicial =
      (paginaAtualVisual - 1) * appSettings.filmes.tamanhoPaginaLocal
    const indiceFinal = indiceInicial + appSettings.filmes.tamanhoPaginaLocal

    return filmesWatchlistOrdenados.slice(indiceInicial, indiceFinal)
  }, [filmesWatchlistOrdenados, paginaAtualVisual])

  const movieSetlistSelecionado = useMemo(() => {
    if (!movieIdSetlistModal) {
      return null
    }

    return selectMovieById(filmesWatchlistBase, movieIdSetlistModal) ?? null
  }, [movieIdSetlistModal, filmesWatchlistBase])

  function getMoviesBySetlist(setlistId: string) {
    const setlistAtual = setlists.find(
      (setlistAtualInterna) => setlistAtualInterna.id === setlistId,
    )

    if (!setlistAtual) {
      return []
    }

    return filmesWatchlistBase.filter((filmeAtual) =>
      setlistAtual.movieIds.includes(filmeAtual.id),
    )
  }

  const temFiltrosAtivos =
    Boolean(termoBuscaInput.trim()) ||
    statusFiltro !== 'todos' ||
    ordenacaoCampo !== 'titulo' ||
    ordenacaoDirecao !== 'asc'

  function onTermoBuscaChange(termo: string) {
    setPaginaAtual(1)
    setTermoBuscaInput(termo)
  }

  function onStatusFiltroChange(proximoStatus: WatchlistStatusFilter) {
    setPaginaAtual(1)
    setStatusFiltro(proximoStatus)
  }

  function onOrdenacaoCampoChange(proximoCampo: WatchlistSortField) {
    setPaginaAtual(1)
    setOrdenacaoCampo(proximoCampo)
  }

  function onOrdenacaoDirecaoChange(proximaDirecao: WatchlistSortDirection) {
    setPaginaAtual(1)
    setOrdenacaoDirecao(proximaDirecao)
  }

  function onLimparFiltros() {
    setPaginaAtual(1)
    setTermoBuscaInput('')
    setStatusFiltro('todos')
    setOrdenacaoCampo('titulo')
    setOrdenacaoDirecao('asc')
  }

  return {
    isLoading,
    errorMessage,
    filmesWatchlistPaginados,
    totalResultados,
    totalPaginas,
    paginaAtualVisual,
    termoBuscaInput,
    statusFiltro,
    ordenacaoCampo,
    ordenacaoDirecao,
    temFiltrosAtivos,
    movieSetlistSelecionado,
    setlists,
    getMoviesBySetlist,
    hasMovieInSetlist,
    toggleFavorite,
    createSetlist,
    addMovieToSetlist,
    removeMovieFromSetlist,
    removeFromWatchlist,
    setWatched,
    isWatched,
    onTermoBuscaChange,
    onStatusFiltroChange,
    onOrdenacaoCampoChange,
    onOrdenacaoDirecaoChange,
    onLimparFiltros,
    onChangePage: setPaginaAtual,
    onOpenSetlistModal: setMovieIdSetlistModal,
    onCloseSetlistModal: () => setMovieIdSetlistModal(null),
  }
}
