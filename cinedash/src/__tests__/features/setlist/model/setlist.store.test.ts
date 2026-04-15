import { beforeEach, describe, expect, it } from 'vitest'
import { useSetlistStore } from '../../../../features/setlist/model/setlist.store'

function resetSetlistStore(): void {
  useSetlistStore.setState({
    setlists: [
      {
        id: 'setlist-padrao',
        name: 'Minha Setlist',
        movieIds: [],
      },
    ],
  })
}

describe('store de setlist', () => {
  beforeEach(() => {
    localStorage.clear()
    resetSetlistStore()
  })

  it('deve criar setlist adicional mantendo a padrao', () => {
    const setlistCriada = useSetlistStore.getState().createSetlist('Sessao Acao')

    expect(setlistCriada.name).toBe('Sessao Acao')
    expect(useSetlistStore.getState().setlists).toHaveLength(2)
    expect(useSetlistStore.getState().setlists[0].id).toBe('setlist-padrao')
  })

  it('deve adicionar e remover filme sem duplicar ids', () => {
    const setlistCriada = useSetlistStore.getState().createSetlist('Sessao Drama')

    useSetlistStore.getState().addMovieToSetlist(setlistCriada.id, 77)
    useSetlistStore.getState().addMovieToSetlist(setlistCriada.id, 77)

    const setlistAtual = useSetlistStore
      .getState()
      .setlists.find((setlistAtualInterna) => setlistAtualInterna.id === setlistCriada.id)

    expect(setlistAtual?.movieIds).toEqual([77])
    expect(useSetlistStore.getState().hasMovieInSetlist(setlistCriada.id, 77)).toBe(true)

    useSetlistStore.getState().removeMovieFromSetlist(setlistCriada.id, 77)

    expect(useSetlistStore.getState().hasMovieInSetlist(setlistCriada.id, 77)).toBe(false)
  })

  it('deve alternar filme na setlist padrao', () => {
    useSetlistStore.getState().toggleMovieInDefaultSetlist(12)

    expect(useSetlistStore.getState().hasMovieInSetlist('setlist-padrao', 12)).toBe(true)

    useSetlistStore.getState().toggleMovieInDefaultSetlist(12)

    expect(useSetlistStore.getState().hasMovieInSetlist('setlist-padrao', 12)).toBe(false)
  })

  it('deve proteger remocao da setlist padrao e manter vinculos por filme', () => {
    const setlistAcao = useSetlistStore.getState().createSetlist('Acao')
    const setlistTerror = useSetlistStore.getState().createSetlist('Terror')

    useSetlistStore.getState().addMovieToSetlist(setlistAcao.id, 55)
    useSetlistStore.getState().addMovieToSetlist(setlistTerror.id, 55)

    const setlistsDoFilme = useSetlistStore.getState().getSetlistsByMovieId(55)

    expect(setlistsDoFilme.map((setlistAtual) => setlistAtual.id)).toEqual([
      setlistAcao.id,
      setlistTerror.id,
    ])

    useSetlistStore.getState().removeSetlist('setlist-padrao')

    expect(useSetlistStore.getState().setlists.some((setlistAtual) => setlistAtual.id === 'setlist-padrao')).toBe(true)
  })
})
