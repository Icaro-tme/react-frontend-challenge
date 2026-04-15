import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  getUsuarioAtualKey,
  subscribeAuthSessionChange,
  USUARIO_CONVIDADO_KEY,
} from '../../../shared/lib/auth-session'

interface FavoriteState {
  favoritosPorUsuario: Record<string, number[]>
  filmesFavoritosIds: number[]
  toggleFavorite: (filmeId: number) => void
  isFavorite: (filmeId: number) => boolean
}

interface FavoritePersistedStateV0 {
  filmesFavoritosIds?: number[]
}

interface FavoritePersistedStateV1 {
  favoritosPorUsuario?: Record<string, number[]>
}

function toMovieIds(valor: unknown): number[] {
  if (!Array.isArray(valor)) {
    return []
  }

  return valor.filter((idAtual): idAtual is number => Number.isInteger(idAtual))
}

function getFavoritosPorUsuario(
  favoritosPorUsuario: Record<string, number[]>,
  usuarioKey: string,
): number[] {
  return toMovieIds(favoritosPorUsuario[usuarioKey])
}

function migrateFavoritosPorUsuario(
  estadoPersistido: unknown,
): Record<string, number[]> {
  if (!estadoPersistido || typeof estadoPersistido !== 'object') {
    return {}
  }

  const estadoV1 = estadoPersistido as FavoritePersistedStateV1

  if (estadoV1.favoritosPorUsuario) {
    return Object.entries(estadoV1.favoritosPorUsuario).reduce<
      Record<string, number[]>
    >((acumulador, [usuarioKey, filmesIds]) => {
      acumulador[usuarioKey] = toMovieIds(filmesIds)
      return acumulador
    }, {})
  }

  const estadoV0 = estadoPersistido as FavoritePersistedStateV0
  const filmesIdsLegados = toMovieIds(estadoV0.filmesFavoritosIds)

  if (filmesIdsLegados.length === 0) {
    return {}
  }

  return {
    [USUARIO_CONVIDADO_KEY]: filmesIdsLegados,
  }
}

function syncFavoritosUsuarioAtual() {
  const usuarioAtualKey = getUsuarioAtualKey()

  useFavoriteStore.setState((estadoAtual) => ({
    filmesFavoritosIds: getFavoritosPorUsuario(
      estadoAtual.favoritosPorUsuario,
      usuarioAtualKey,
    ),
  }))
}

function removeMovieId(listaIds: number[], filmeId: number): number[] {
  return listaIds.filter((idAtual) => idAtual !== filmeId)
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favoritosPorUsuario: {},
      filmesFavoritosIds: [],
      toggleFavorite: (filmeId) => {
        const usuarioAtualKey = getUsuarioAtualKey()
        const favoritosUsuarioAtual = getFavoritosPorUsuario(
          get().favoritosPorUsuario,
          usuarioAtualKey,
        )

        const jaExiste = favoritosUsuarioAtual.includes(filmeId)
        const proximosFavoritos = jaExiste
          ? removeMovieId(favoritosUsuarioAtual, filmeId)
          : [...favoritosUsuarioAtual, filmeId]

        set((estadoAtual) => ({
          favoritosPorUsuario: {
            ...estadoAtual.favoritosPorUsuario,
            [usuarioAtualKey]: proximosFavoritos,
          },
          filmesFavoritosIds:
            usuarioAtualKey === getUsuarioAtualKey()
              ? proximosFavoritos
              : estadoAtual.filmesFavoritosIds,
        }))

      },
      isFavorite: (filmeId) => {
        const usuarioAtualKey = getUsuarioAtualKey()
        const favoritosUsuarioAtual = getFavoritosPorUsuario(
          get().favoritosPorUsuario,
          usuarioAtualKey,
        )

        return favoritosUsuarioAtual.includes(filmeId)
      },
    }),
    {
      name: 'cinedash-favorite-store',
      version: 1,
      migrate: (estadoPersistido) => ({
        favoritosPorUsuario: migrateFavoritosPorUsuario(estadoPersistido),
      }),
      storage: createJSONStorage(() => localStorage),
      partialize: (estadoAtual) => ({
        favoritosPorUsuario: estadoAtual.favoritosPorUsuario,
      }),
      onRehydrateStorage: () => {
        return () => {
          syncFavoritosUsuarioAtual()
        }
      },
    },
  ),
)

subscribeAuthSessionChange((usuarioAtualKey, usuarioAnteriorKey) => {
  if (usuarioAtualKey !== usuarioAnteriorKey) {
    syncFavoritosUsuarioAtual()
  }
})

syncFavoritosUsuarioAtual()
