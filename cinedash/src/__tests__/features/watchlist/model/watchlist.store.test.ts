import { beforeEach, describe, expect, it } from 'vitest'
import { useWatchlistStore } from '../../../../features/watchlist/model/watchlist.store'

function resetWatchlistStore(): void {
  useWatchlistStore.setState({
    filmesWatchlistIds: [],
    filmesAssistidosIds: [],
  })
}

describe('store de watchlist', () => {
  beforeEach(() => {
    localStorage.clear()
    resetWatchlistStore()
  })

  it('deve adicionar e remover filme da watchlist limpando assistidos', () => {
    useWatchlistStore.getState().addToWatchlist(101)
    useWatchlistStore.getState().setWatched(101, true)

    expect(useWatchlistStore.getState().inWatchlist(101)).toBe(true)
    expect(useWatchlistStore.getState().isWatched(101)).toBe(true)

    useWatchlistStore.getState().removeFromWatchlist(101)

    expect(useWatchlistStore.getState().inWatchlist(101)).toBe(false)
    expect(useWatchlistStore.getState().isWatched(101)).toBe(false)
  })

  it('setWatched deve adicionar filme na watchlist automaticamente', () => {
    useWatchlistStore.getState().setWatched(202, true)

    expect(useWatchlistStore.getState().inWatchlist(202)).toBe(true)
    expect(useWatchlistStore.getState().isWatched(202)).toBe(true)

    useWatchlistStore.getState().setWatched(202, false)

    expect(useWatchlistStore.getState().inWatchlist(202)).toBe(true)
    expect(useWatchlistStore.getState().isWatched(202)).toBe(false)
  })

  it('toggleWatchlist deve alternar e limpar assistido quando remove', () => {
    useWatchlistStore.getState().toggleWatchlist(303)
    useWatchlistStore.getState().toggleWatched(303)

    expect(useWatchlistStore.getState().inWatchlist(303)).toBe(true)
    expect(useWatchlistStore.getState().isWatched(303)).toBe(true)

    useWatchlistStore.getState().toggleWatchlist(303)

    expect(useWatchlistStore.getState().inWatchlist(303)).toBe(false)
    expect(useWatchlistStore.getState().isWatched(303)).toBe(false)
  })

  it('toggleWatched deve alternar status mantendo filme na watchlist', () => {
    useWatchlistStore.getState().toggleWatched(404)

    expect(useWatchlistStore.getState().inWatchlist(404)).toBe(true)
    expect(useWatchlistStore.getState().isWatched(404)).toBe(true)

    useWatchlistStore.getState().toggleWatched(404)

    expect(useWatchlistStore.getState().inWatchlist(404)).toBe(true)
    expect(useWatchlistStore.getState().isWatched(404)).toBe(false)
  })
})
