import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Setlist } from '../../../entities/setlist/model/setlist.types'
import {
  getUsuarioAtualKey,
  subscribeAuthSessionChange,
  USUARIO_CONVIDADO_KEY,
} from '../../../shared/lib/auth-session'

interface SetlistState {
  setlistsPorUsuario: Record<string, Setlist[]>
  setlists: Setlist[]
  createSetlist: (nomeSetlist: string) => Setlist
  removeSetlist: (setlistId: string) => void
  addMovieToSetlist: (setlistId: string, movieId: number) => void
  removeMovieFromSetlist: (setlistId: string, movieId: number) => void
  toggleMovieInSetlist: (setlistId: string, movieId: number) => void
  toggleMovieInDefaultSetlist: (movieId: number) => void
  hasMovieInSetlist: (setlistId: string, movieId: number) => boolean
  getSetlistsByMovieId: (movieId: number) => Setlist[]
}

const DEFAULT_SETLIST_ID = 'setlist-padrao'
const DEFAULT_SETLIST_NAME = 'Minha Setlist'

interface SetlistPersistedStateV0 {
  setlists?: Setlist[]
}

interface SetlistPersistedStateV1 {
  setlistsPorUsuario?: Record<string, Setlist[]>
}

function createSetlistId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `setlist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function createDefaultSetlist(): Setlist {
  return {
    id: DEFAULT_SETLIST_ID,
    name: DEFAULT_SETLIST_NAME,
    movieIds: [],
  }
}

function toggleMovieId(movieIds: number[], movieId: number): number[] {
  if (movieIds.includes(movieId)) {
    return movieIds.filter((movieIdAtual) => movieIdAtual !== movieId)
  }

  return [...movieIds, movieId]
}

function addMovieId(movieIds: number[], movieId: number): number[] {
  if (movieIds.includes(movieId)) {
    return movieIds
  }

  return [...movieIds, movieId]
}

function removeMovieId(movieIds: number[], movieId: number): number[] {
  return movieIds.filter((movieIdAtual) => movieIdAtual !== movieId)
}

function normalizeSetlists(entrada: unknown): Setlist[] {
  if (!Array.isArray(entrada)) {
    return []
  }

  return entrada
    .filter((setlistAtual): setlistAtual is Setlist => {
      if (!setlistAtual || typeof setlistAtual !== 'object') {
        return false
      }

      return (
        'id' in setlistAtual &&
        typeof setlistAtual.id === 'string' &&
        'name' in setlistAtual &&
        typeof setlistAtual.name === 'string' &&
        'movieIds' in setlistAtual &&
        Array.isArray(setlistAtual.movieIds)
      )
    })
    .map((setlistAtual) => ({
      ...setlistAtual,
      movieIds: setlistAtual.movieIds.filter((movieIdAtual) =>
        Number.isInteger(movieIdAtual),
      ),
    }))
}

function ensureDefaultSetlist(setlists: Setlist[]): Setlist[] {
  const jaExiste = setlists.some((setlistAtual) => setlistAtual.id === DEFAULT_SETLIST_ID)

  if (jaExiste) {
    return setlists
  }

  return [createDefaultSetlist(), ...setlists]
}

function getSetlistsUsuarioAtual(
  setlistsPorUsuario: Record<string, Setlist[]>,
  usuarioKey: string,
): Setlist[] {
  return ensureDefaultSetlist(normalizeSetlists(setlistsPorUsuario[usuarioKey]))
}

function migrateSetlistsPorUsuario(
  estadoPersistido: unknown,
): Record<string, Setlist[]> {
  if (!estadoPersistido || typeof estadoPersistido !== 'object') {
    return {}
  }

  const estadoV1 = estadoPersistido as SetlistPersistedStateV1

  if (estadoV1.setlistsPorUsuario) {
    return Object.entries(estadoV1.setlistsPorUsuario).reduce<
      Record<string, Setlist[]>
    >((acumulador, [usuarioKey, setlists]) => {
      acumulador[usuarioKey] = ensureDefaultSetlist(normalizeSetlists(setlists))
      return acumulador
    }, {})
  }

  const estadoV0 = estadoPersistido as SetlistPersistedStateV0
  const setlistsLegadas = ensureDefaultSetlist(normalizeSetlists(estadoV0.setlists))

  if (setlistsLegadas.length === 0) {
    return {}
  }

  return {
    [USUARIO_CONVIDADO_KEY]: setlistsLegadas,
  }
}

function syncSetlistsUsuarioAtual() {
  const usuarioAtualKey = getUsuarioAtualKey()

  useSetlistStore.setState((estadoAtual) => ({
    setlists: getSetlistsUsuarioAtual(estadoAtual.setlistsPorUsuario, usuarioAtualKey),
  }))
}

export const useSetlistStore = create<SetlistState>()(
  persist(
    (set, get) => ({
      setlistsPorUsuario: {},
      setlists: [createDefaultSetlist()],
      createSetlist: (nomeSetlist) => {
        const usuarioAtualKey = getUsuarioAtualKey()
        const setlistCriada: Setlist = {
          id: createSetlistId(),
          name: nomeSetlist,
          movieIds: [],
        }

        set((estadoAtual) => ({
          setlistsPorUsuario: {
            ...estadoAtual.setlistsPorUsuario,
            [usuarioAtualKey]: [
              ...getSetlistsUsuarioAtual(estadoAtual.setlistsPorUsuario, usuarioAtualKey),
              setlistCriada,
            ],
          },
          setlists:
            usuarioAtualKey === getUsuarioAtualKey()
              ? [
                  ...getSetlistsUsuarioAtual(
                    estadoAtual.setlistsPorUsuario,
                    usuarioAtualKey,
                  ),
                  setlistCriada,
                ]
              : estadoAtual.setlists,
        }))

        return setlistCriada
      },
      removeSetlist: (setlistId) => {
        if (setlistId === DEFAULT_SETLIST_ID) {
          return
        }

        const usuarioAtualKey = getUsuarioAtualKey()

        set((estadoAtual) => ({
          setlistsPorUsuario: {
            ...estadoAtual.setlistsPorUsuario,
            [usuarioAtualKey]: ensureDefaultSetlist(
              getSetlistsUsuarioAtual(
                estadoAtual.setlistsPorUsuario,
                usuarioAtualKey,
              ).filter(
                (setlistAtual) => setlistAtual.id !== setlistId,
              ),
            ),
          },
          setlists:
            usuarioAtualKey === getUsuarioAtualKey()
              ? ensureDefaultSetlist(
                  getSetlistsUsuarioAtual(
                    estadoAtual.setlistsPorUsuario,
                    usuarioAtualKey,
                  ).filter(
                    (setlistAtual) => setlistAtual.id !== setlistId,
                  ),
                )
              : estadoAtual.setlists,
        }))
      },
      addMovieToSetlist: (setlistId, movieId) => {
        const usuarioAtualKey = getUsuarioAtualKey()

        set((estadoAtual) => {
          const setlistsUsuarioAtual = getSetlistsUsuarioAtual(
            estadoAtual.setlistsPorUsuario,
            usuarioAtualKey,
          )

          const proximasSetlists = setlistsUsuarioAtual.map((setlistAtual) => {
            if (setlistAtual.id !== setlistId) {
              return setlistAtual
            }

            return {
              ...setlistAtual,
              movieIds: addMovieId(setlistAtual.movieIds, movieId),
            }
          })

          return {
            setlistsPorUsuario: {
              ...estadoAtual.setlistsPorUsuario,
              [usuarioAtualKey]: proximasSetlists,
            },
            setlists:
              usuarioAtualKey === getUsuarioAtualKey()
                ? proximasSetlists
                : estadoAtual.setlists,
          }
        })
      },
      removeMovieFromSetlist: (setlistId, movieId) => {
        const usuarioAtualKey = getUsuarioAtualKey()

        set((estadoAtual) => {
          const setlistsUsuarioAtual = getSetlistsUsuarioAtual(
            estadoAtual.setlistsPorUsuario,
            usuarioAtualKey,
          )

          const proximasSetlists = setlistsUsuarioAtual.map((setlistAtual) => {
            if (setlistAtual.id !== setlistId) {
              return setlistAtual
            }

            return {
              ...setlistAtual,
              movieIds: removeMovieId(setlistAtual.movieIds, movieId),
            }
          })

          return {
            setlistsPorUsuario: {
              ...estadoAtual.setlistsPorUsuario,
              [usuarioAtualKey]: proximasSetlists,
            },
            setlists:
              usuarioAtualKey === getUsuarioAtualKey()
                ? proximasSetlists
                : estadoAtual.setlists,
          }
        })
      },
      toggleMovieInSetlist: (setlistId, movieId) => {
        const usuarioAtualKey = getUsuarioAtualKey()

        set((estadoAtual) => {
          const setlistsUsuarioAtual = getSetlistsUsuarioAtual(
            estadoAtual.setlistsPorUsuario,
            usuarioAtualKey,
          )

          const proximasSetlists = setlistsUsuarioAtual.map((setlistAtual) => {
            if (setlistAtual.id !== setlistId) {
              return setlistAtual
            }

            return {
              ...setlistAtual,
              movieIds: toggleMovieId(setlistAtual.movieIds, movieId),
            }
          })

          return {
            setlistsPorUsuario: {
              ...estadoAtual.setlistsPorUsuario,
              [usuarioAtualKey]: proximasSetlists,
            },
            setlists:
              usuarioAtualKey === getUsuarioAtualKey()
                ? proximasSetlists
                : estadoAtual.setlists,
          }
        })
      },
      toggleMovieInDefaultSetlist: (movieId) => {
        get().toggleMovieInSetlist(DEFAULT_SETLIST_ID, movieId)
      },
      hasMovieInSetlist: (setlistId, movieId) => {
        const usuarioAtualKey = getUsuarioAtualKey()

        const setlistAtual = getSetlistsUsuarioAtual(
          get().setlistsPorUsuario,
          usuarioAtualKey,
        ).find((setlistAtualInterno) => setlistAtualInterno.id === setlistId)

        return Boolean(setlistAtual?.movieIds.includes(movieId))
      },
      getSetlistsByMovieId: (movieId) => {
        const usuarioAtualKey = getUsuarioAtualKey()

        return getSetlistsUsuarioAtual(get().setlistsPorUsuario, usuarioAtualKey).filter(
          (setlistAtual) => setlistAtual.movieIds.includes(movieId),
        )
      },
    }),
    {
      name: 'cinedash-setlist-store',
      version: 1,
      migrate: (estadoPersistido) => ({
        setlistsPorUsuario: migrateSetlistsPorUsuario(estadoPersistido),
      }),
      storage: createJSONStorage(() => localStorage),
      partialize: (estadoAtual) => ({
        setlistsPorUsuario: estadoAtual.setlistsPorUsuario,
      }),
      onRehydrateStorage: () => {
        return () => {
          syncSetlistsUsuarioAtual()
        }
      },
    },
  ),
)

subscribeAuthSessionChange((usuarioAtualKey, usuarioAnteriorKey) => {
  if (usuarioAtualKey !== usuarioAnteriorKey) {
    syncSetlistsUsuarioAtual()
  }
})

syncSetlistsUsuarioAtual()
