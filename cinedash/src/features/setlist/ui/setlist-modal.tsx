import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaTrash } from 'react-icons/fa6'
import type { Movie } from '../../../entities/movie/model/types'
import type { Setlist } from '../../../entities/setlist/model/setlist.types'
import { ActionIconButton } from '../../../shared/ui/action-icon-button'
import { MovieModalShell } from '../../../shared/ui/movie-modal-shell'
import { SetlistMovieListTable } from './setlist-movie-list-table'

interface SetlistModalProps {
  isOpen: boolean
  movie: Movie | null
  setlists: Setlist[]
  getMoviesBySetlist: (setlistId: string) => Movie[]
  hasMovieInSetlist: (setlistId: string, movieId: number) => boolean
  onClose: () => void
  onCreateSetlist: (nomeSetlist: string) => void
  onAddMovieToSetlist: (setlistId: string, movieId: number) => void
  onRemoveMovieFromSetlist: (setlistId: string, movieId: number) => void
}

export function SetlistModal({
  isOpen,
  movie,
  setlists,
  getMoviesBySetlist,
  hasMovieInSetlist,
  onClose,
  onCreateSetlist,
  onAddMovieToSetlist,
  onRemoveMovieFromSetlist,
}: SetlistModalProps) {
  const { t } = useTranslation()
  const [setlistSelecionadaId, setSetlistSelecionadaId] = useState('')
  const [nomeNovaSetlist, setNomeNovaSetlist] = useState('')

  const setlistSelecionadaIdEfetiva = useMemo(() => {
    if (setlists.length === 0) {
      return ''
    }

    const setlistSelecionadaExiste = setlists.some(
      (setlistAtual) => setlistAtual.id === setlistSelecionadaId,
    )

    if (setlistSelecionadaExiste) {
      return setlistSelecionadaId
    }

    return setlists[0].id
  }, [setlistSelecionadaId, setlists])

  const filmesDaSetlistSelecionada = useMemo(() => {
    if (!setlistSelecionadaIdEfetiva) {
      return []
    }

    return getMoviesBySetlist(setlistSelecionadaIdEfetiva)
  }, [setlistSelecionadaIdEfetiva, getMoviesBySetlist])

  const filmeSelecionadoNaSetlist = movie
    ? hasMovieInSetlist(setlistSelecionadaIdEfetiva, movie.id)
    : false

  return (
    <MovieModalShell
      isOpen={isOpen}
      title={t('filmes.modais.setlist.titulo')}
      closeLabel={t('acoes.fechar')}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {movie
              ? `${t('filmes.modais.setlist.filmeSelecionado')}: ${movie.title}`
              : t('filmes.modais.setlist.nenhumFilmeSelecionado')}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
          <div>
            <label htmlFor="setlist-select">{t('filmes.modais.setlist.selecionar')}</label>
            <select
              id="setlist-select"
              value={setlistSelecionadaIdEfetiva}
              onChange={(evento) => {
                setSetlistSelecionadaId(evento.target.value)
              }}
            >
              {setlists.map((setlistAtual) => (
                <option key={setlistAtual.id} value={setlistAtual.id}>
                  {setlistAtual.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              className="btn btn--emerald w-full"
              disabled={!movie || !setlistSelecionadaIdEfetiva}
              onClick={() => {
                if (!movie || !setlistSelecionadaIdEfetiva) {
                  return
                }

                if (filmeSelecionadoNaSetlist) {
                  onRemoveMovieFromSetlist(setlistSelecionadaIdEfetiva, movie.id)
                  return
                }

                onAddMovieToSetlist(setlistSelecionadaIdEfetiva, movie.id)
              }}
            >
              {filmeSelecionadoNaSetlist
                ? t('filmes.modais.setlist.removerFilme')
                : t('filmes.modais.setlist.salvarFilme')}
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
          <div>
            <label htmlFor="nova-setlist">{t('filmes.modais.setlist.novaSetlist')}</label>
            <input
              id="nova-setlist"
              value={nomeNovaSetlist}
              onChange={(evento) => {
                setNomeNovaSetlist(evento.target.value)
              }}
              placeholder={t('filmes.modais.setlist.placeholderNovaSetlist')}
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              className="btn btn--slate w-full"
              disabled={!nomeNovaSetlist.trim()}
              onClick={() => {
                const nomeNormalizado = nomeNovaSetlist.trim()

                if (!nomeNormalizado) {
                  return
                }

                onCreateSetlist(nomeNormalizado)
                setNomeNovaSetlist('')
              }}
            >
              {t('filmes.modais.setlist.criarSetlist')}
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            {t('filmes.modais.setlist.listaFilmes')}
          </p>
          <SetlistMovieListTable
            movies={filmesDaSetlistSelecionada}
            emptyMessage={t('filmes.modais.setlist.listaVazia')}
            movieHeaderLabel={t('filmes.modais.colunas.filme')}
            genresHeaderLabel={t('filmes.modais.colunas.generos')}
            actionsHeaderLabel={t('filmes.modais.colunas.acoes')}
            renderActions={(filmeAtual) => (
              <ActionIconButton
                size="sm"
                tooltip={t('filmes.modais.setlist.removerLinha')}
                colorClassName="hover:border-rose-400 hover:bg-rose-600 hover:text-white"
                onClick={() => {
                  if (!setlistSelecionadaIdEfetiva) {
                    return
                  }

                  onRemoveMovieFromSetlist(setlistSelecionadaIdEfetiva, filmeAtual.id)
                }}
              >
                <FaTrash size={12} />
              </ActionIconButton>
            )}
          />
        </div>
      </div>
    </MovieModalShell>
  )
}
