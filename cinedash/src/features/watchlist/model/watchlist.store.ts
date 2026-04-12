import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  getUsuarioAtualKey,
  subscribeAuthSessionChange,
  USUARIO_CONVIDADO_KEY,
} from '../../../shared/lib/auth-session'

interface WatchlistUsuarioState {
  filmesWatchlistIds: number[]
  filmesAssistidosIds: number[]
}

interface WatchlistState {
  watchlistPorUsuario: Record<string, WatchlistUsuarioState>
  filmesWatchlistIds: number[]
  filmesAssistidosIds: number[]
  addToWatchlist: (filmeId: number) => void
  removeFromWatchlist: (filmeId: number) => void
  setWatched: (filmeId: number, watched: boolean) => void
  toggleWatchlist: (filmeId: number) => void
  toggleWatched: (filmeId: number) => void
  inWatchlist: (filmeId: number) => boolean
  isWatched: (filmeId: number) => boolean
}

interface WatchlistPersistedStateV0 {
  filmesWatchlistIds?: number[]
  filmesAssistidosIds?: number[]
}

interface WatchlistPersistedStateV1 {
  watchlistPorUsuario?: Record<string, WatchlistUsuarioState>
}

function toMovieIds(valor: unknown): number[] {
  if (!Array.isArray(valor)) {
    return []
  }

  return valor.filter((idAtual): idAtual is number => Number.isInteger(idAtual))
}

function normalizeWatchlistUsuarioState(
  estadoUsuario: Partial<WatchlistUsuarioState> | undefined,
): WatchlistUsuarioState {
  const filmesWatchlistIds = toMovieIds(estadoUsuario?.filmesWatchlistIds)
  const filmesAssistidosIds = toMovieIds(estadoUsuario?.filmesAssistidosIds).filter(
    (filmeId) => filmesWatchlistIds.includes(filmeId),
  )

  return {
    filmesWatchlistIds,
    filmesAssistidosIds,
  }
}

function getWatchlistUsuarioAtual(
  watchlistPorUsuario: Record<string, WatchlistUsuarioState>,
  usuarioKey: string,
): WatchlistUsuarioState {
  return normalizeWatchlistUsuarioState(watchlistPorUsuario[usuarioKey])
}

function migrateWatchlistPorUsuario(
  estadoPersistido: unknown,
): Record<string, WatchlistUsuarioState> {
  if (!estadoPersistido || typeof estadoPersistido !== 'object') {
    return {}
  }

  const estadoV1 = estadoPersistido as WatchlistPersistedStateV1

  if (estadoV1.watchlistPorUsuario) {
    return Object.entries(estadoV1.watchlistPorUsuario).reduce<
      Record<string, WatchlistUsuarioState>
    >((acumulador, [usuarioKey, estadoUsuario]) => {
      acumulador[usuarioKey] = normalizeWatchlistUsuarioState(estadoUsuario)
      return acumulador
    }, {})
  }

  const estadoV0 = estadoPersistido as WatchlistPersistedStateV0
  const estadoConvidado = normalizeWatchlistUsuarioState({
    filmesWatchlistIds: estadoV0.filmesWatchlistIds,
    filmesAssistidosIds: estadoV0.filmesAssistidosIds,
  })

  if (estadoConvidado.filmesWatchlistIds.length === 0) {
    return {}
  }

  return {
    [USUARIO_CONVIDADO_KEY]: estadoConvidado,
  }
}

function syncWatchlistUsuarioAtual() {
  const usuarioAtualKey = getUsuarioAtualKey()

  useWatchlistStore.setState((estadoAtual) => {
    const estadoUsuarioAtual = getWatchlistUsuarioAtual(
      estadoAtual.watchlistPorUsuario,
      usuarioAtualKey,
    )

    return {
      filmesWatchlistIds: estadoUsuarioAtual.filmesWatchlistIds,
      filmesAssistidosIds: estadoUsuarioAtual.filmesAssistidosIds,
    }
  })
}

function removeMovieId(listaIds: number[], filmeId: number): number[] {
  return listaIds.filter((idAtual) => idAtual !== filmeId)
}

function addMovieId(listaIds: number[], filmeId: number): number[] {
  if (listaIds.includes(filmeId)) {
    return listaIds
  }

  return [...listaIds, filmeId]
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchlistPorUsuario: {},
      filmesWatchlistIds: [],
      filmesAssistidosIds: [],
      addToWatchlist: (filmeId) => {
        const usuarioAtualKey = getUsuarioAtualKey()

        set((estadoAtual) => ({
          watchlistPorUsuario: {
            ...estadoAtual.watchlistPorUsuario,
            [usuarioAtualKey]: {
              ...getWatchlistUsuarioAtual(
                estadoAtual.watchlistPorUsuario,
                usuarioAtualKey,
              ),
              filmesWatchlistIds: addMovieId(
                getWatchlistUsuarioAtual(
                  estadoAtual.watchlistPorUsuario,
                  usuarioAtualKey,
                ).filmesWatchlistIds,
                filmeId,
              ),
            },
          },
          filmesWatchlistIds: addMovieId(
            estadoAtual.filmesWatchlistIds,
            filmeId,
          ),
          filmesAssistidosIds: estadoAtual.filmesAssistidosIds,
        }))
      },
      removeFromWatchlist: (filmeId) => {
        const usuarioAtualKey = getUsuarioAtualKey()

        set((estadoAtual) => ({
          watchlistPorUsuario: {
            ...estadoAtual.watchlistPorUsuario,
            [usuarioAtualKey]: {
              filmesWatchlistIds: removeMovieId(
                getWatchlistUsuarioAtual(
                  estadoAtual.watchlistPorUsuario,
                  usuarioAtualKey,
                ).filmesWatchlistIds,
                filmeId,
              ),
              filmesAssistidosIds: removeMovieId(
                getWatchlistUsuarioAtual(
                  estadoAtual.watchlistPorUsuario,
                  usuarioAtualKey,
                ).filmesAssistidosIds,
                filmeId,
              ),
            },
          },
          filmesWatchlistIds: removeMovieId(estadoAtual.filmesWatchlistIds, filmeId),
          filmesAssistidosIds: removeMovieId(estadoAtual.filmesAssistidosIds, filmeId),
        }))
      },
      setWatched: (filmeId, watched) => {
        const usuarioAtualKey = getUsuarioAtualKey()

        set((estadoAtual) => ({
          watchlistPorUsuario: {
            ...estadoAtual.watchlistPorUsuario,
            [usuarioAtualKey]: {
              filmesWatchlistIds: addMovieId(
                getWatchlistUsuarioAtual(
                  estadoAtual.watchlistPorUsuario,
                  usuarioAtualKey,
                ).filmesWatchlistIds,
                filmeId,
              ),
              filmesAssistidosIds: watched
                ? addMovieId(
                    getWatchlistUsuarioAtual(
                      estadoAtual.watchlistPorUsuario,
                      usuarioAtualKey,
                    ).filmesAssistidosIds,
                    filmeId,
                  )
                : removeMovieId(
                    getWatchlistUsuarioAtual(
                      estadoAtual.watchlistPorUsuario,
                      usuarioAtualKey,
                    ).filmesAssistidosIds,
                    filmeId,
                  ),
            },
          },
          filmesWatchlistIds: addMovieId(estadoAtual.filmesWatchlistIds, filmeId),
          filmesAssistidosIds: watched
            ? addMovieId(estadoAtual.filmesAssistidosIds, filmeId)
            : removeMovieId(estadoAtual.filmesAssistidosIds, filmeId),
        }))
      },
      toggleWatchlist: (filmeId) => {
        const usuarioAtualKey = getUsuarioAtualKey()
        const estadoUsuarioAtual = getWatchlistUsuarioAtual(
          get().watchlistPorUsuario,
          usuarioAtualKey,
        )
        const estaNaWatchlist = estadoUsuarioAtual.filmesWatchlistIds.includes(filmeId)

        set((estadoAtual) => {
          const estadoUsuario = getWatchlistUsuarioAtual(
            estadoAtual.watchlistPorUsuario,
            usuarioAtualKey,
          )

          if (estaNaWatchlist) {
            return {
              watchlistPorUsuario: {
                ...estadoAtual.watchlistPorUsuario,
                [usuarioAtualKey]: {
                  filmesWatchlistIds: removeMovieId(
                    estadoUsuario.filmesWatchlistIds,
                    filmeId,
                  ),
                  filmesAssistidosIds: removeMovieId(
                    estadoUsuario.filmesAssistidosIds,
                    filmeId,
                  ),
                },
              },
              filmesWatchlistIds: removeMovieId(estadoAtual.filmesWatchlistIds, filmeId),
              filmesAssistidosIds: removeMovieId(estadoAtual.filmesAssistidosIds, filmeId),
            }
          }

          return {
            watchlistPorUsuario: {
              ...estadoAtual.watchlistPorUsuario,
              [usuarioAtualKey]: {
                filmesWatchlistIds: addMovieId(
                  estadoUsuario.filmesWatchlistIds,
                  filmeId,
                ),
                filmesAssistidosIds: estadoUsuario.filmesAssistidosIds,
              },
            },
            filmesWatchlistIds: addMovieId(estadoAtual.filmesWatchlistIds, filmeId),
            filmesAssistidosIds: estadoAtual.filmesAssistidosIds,
          }
        })
      },
      toggleWatched: (filmeId) => {
        const usuarioAtualKey = getUsuarioAtualKey()
        const estadoUsuarioAtual = getWatchlistUsuarioAtual(
          get().watchlistPorUsuario,
          usuarioAtualKey,
        )
        const jaAssistido = estadoUsuarioAtual.filmesAssistidosIds.includes(filmeId)

        set((estadoAtual) => ({
          watchlistPorUsuario: {
            ...estadoAtual.watchlistPorUsuario,
            [usuarioAtualKey]: {
              filmesWatchlistIds: addMovieId(
                getWatchlistUsuarioAtual(
                  estadoAtual.watchlistPorUsuario,
                  usuarioAtualKey,
                ).filmesWatchlistIds,
                filmeId,
              ),
              filmesAssistidosIds: jaAssistido
                ? removeMovieId(
                    getWatchlistUsuarioAtual(
                      estadoAtual.watchlistPorUsuario,
                      usuarioAtualKey,
                    ).filmesAssistidosIds,
                    filmeId,
                  )
                : addMovieId(
                    getWatchlistUsuarioAtual(
                      estadoAtual.watchlistPorUsuario,
                      usuarioAtualKey,
                    ).filmesAssistidosIds,
                    filmeId,
                  ),
            },
          },
          filmesWatchlistIds: addMovieId(estadoAtual.filmesWatchlistIds, filmeId),
          filmesAssistidosIds: jaAssistido
            ? removeMovieId(estadoAtual.filmesAssistidosIds, filmeId)
            : addMovieId(estadoAtual.filmesAssistidosIds, filmeId),
        }))
      },
      inWatchlist: (filmeId) => {
        const usuarioAtualKey = getUsuarioAtualKey()
        const estadoUsuarioAtual = getWatchlistUsuarioAtual(
          get().watchlistPorUsuario,
          usuarioAtualKey,
        )

        return estadoUsuarioAtual.filmesWatchlistIds.includes(filmeId)
      },
      isWatched: (filmeId) => {
        const usuarioAtualKey = getUsuarioAtualKey()
        const estadoUsuarioAtual = getWatchlistUsuarioAtual(
          get().watchlistPorUsuario,
          usuarioAtualKey,
        )

        return estadoUsuarioAtual.filmesAssistidosIds.includes(filmeId)
      },
    }),
    {
      name: 'cinedash-watchlist-store',
      version: 1,
      migrate: (estadoPersistido) => ({
        watchlistPorUsuario: migrateWatchlistPorUsuario(estadoPersistido),
      }),
      storage: createJSONStorage(() => localStorage),
      partialize: (estadoAtual) => ({
        watchlistPorUsuario: estadoAtual.watchlistPorUsuario,
      }),
      onRehydrateStorage: () => {
        return () => {
          syncWatchlistUsuarioAtual()
        }
      },
    },
  ),
)

subscribeAuthSessionChange((usuarioAtualKey, usuarioAnteriorKey) => {
  if (usuarioAtualKey !== usuarioAnteriorKey) {
    syncWatchlistUsuarioAtual()
  }
})

syncWatchlistUsuarioAtual()
