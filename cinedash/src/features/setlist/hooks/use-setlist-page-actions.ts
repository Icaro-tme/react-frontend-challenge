import { useTranslation } from 'react-i18next'
import type { Movie } from '../../../entities/movie/model/types'
import type { Setlist } from '../../../entities/setlist/model/setlist.types'
import { useToast } from '../../../shared/ui/toast/use-toast'

type StatusAnaliseSetlist =
  | 'semSetlist'
  | 'semFilmes'
  | 'naoCalculada'
  | 'desatualizada'
  | 'atualizada'

interface CsvExportData {
  fileName: string
  content: string
}

interface UseSetlistPageActionsInput {
  canExport: boolean
  statusAnalise: StatusAnaliseSetlist
  nomeNovaSetlist: string
  setSetlistSelecionadaId: (setlistId: string) => void
  setNomeNovaSetlist: (nomeSetlist: string) => void
  setTermoBuscaFilmeInput: (termoBusca: string) => void
  setFilmeSugestaoSelecionadoId: (filmeId: number | null) => void
  setlistSelecionadaIdEfetiva: string
  termoBuscaValido: boolean
  filmeSugestaoSelecionado: Movie | null
  createSetlist: (nomeSetlist: string) => Setlist
  addMovieToSetlist: (setlistId: string, movieId: number) => void
  hasMovieInSetlist: (setlistId: string, movieId: number) => boolean
  toggleFavorite: (movieId: number) => void
  removeMovieFromSetlist: (setlistId: string, movieId: number) => void
  createCsvExport: () => CsvExportData | null
}

export function useSetlistPageActions({
  canExport,
  statusAnalise,
  nomeNovaSetlist,
  setSetlistSelecionadaId,
  setNomeNovaSetlist,
  setTermoBuscaFilmeInput,
  setFilmeSugestaoSelecionadoId,
  setlistSelecionadaIdEfetiva,
  termoBuscaValido,
  filmeSugestaoSelecionado,
  createSetlist,
  addMovieToSetlist,
  hasMovieInSetlist,
  toggleFavorite,
  removeMovieFromSetlist,
  createCsvExport,
}: UseSetlistPageActionsInput) {
  const { t } = useTranslation()
  const { showError, showInfo, showSuccess } = useToast()

  function createNewSetlist() {
    const nomeSetlist = nomeNovaSetlist.trim()

    if (!nomeSetlist) {
      showError(t('filmes.setlistPagina.feedback.nomeSetlistObrigatorio'))
      return
    }

    try {
      const setlistCriada = createSetlist(nomeSetlist)

      setSetlistSelecionadaId(setlistCriada.id)
      setNomeNovaSetlist('')
      showSuccess(t('filmes.feedback.setlistCriadaSucesso'))
    } catch {
      showError(t('filmes.feedback.setlistCriadaErro'))
    }
  }

  function addMovieBySearch() {
    if (!setlistSelecionadaIdEfetiva) {
      showError(t('filmes.setlistPagina.feedback.selecioneSetlist'))
      return
    }

    if (!termoBuscaValido) {
      showError(t('filmes.setlistPagina.feedback.termoBuscaInvalido'))
      return
    }

    if (!filmeSugestaoSelecionado) {
      showError(t('filmes.setlistPagina.feedback.selecioneFilmeValido'))
      return
    }

    if (hasMovieInSetlist(setlistSelecionadaIdEfetiva, filmeSugestaoSelecionado.id)) {
      showInfo(t('filmes.setlistPagina.feedback.filmeJaNaSetlist'))
      return
    }

    try {
      addMovieToSetlist(setlistSelecionadaIdEfetiva, filmeSugestaoSelecionado.id)
      setTermoBuscaFilmeInput('')
      setFilmeSugestaoSelecionadoId(null)
      showSuccess(t('filmes.feedback.setlistAdicionadoSucesso'))
    } catch {
      showError(t('filmes.feedback.setlistAdicionadoErro'))
    }
  }

  function toggleMovieFavorite(filmeAtual: Movie) {
    try {
      const eraFavorito = filmeAtual.isFavorite

      toggleFavorite(filmeAtual.id)
      showSuccess(
        eraFavorito
          ? t('filmes.feedback.favoritoRemovidoSucesso')
          : t('filmes.feedback.favoritoSucesso'),
      )
    } catch {
      showError(t('filmes.feedback.favoritoErro'))
    }
  }

  function removeMovie(filmeAtual: Movie) {
    if (!setlistSelecionadaIdEfetiva) {
      return
    }

    try {
      removeMovieFromSetlist(setlistSelecionadaIdEfetiva, filmeAtual.id)
      showSuccess(t('filmes.feedback.setlistRemovidoSucesso'))
    } catch {
      showError(t('filmes.feedback.setlistRemovidoErro'))
    }
  }

  function getStatusAnaliseLabel(): string {
    return t(`filmes.setlistPagina.analise.status.${statusAnalise}`)
  }

  function getStatusAnaliseClassName(): string {
    switch (statusAnalise) {
      case 'atualizada':
        return 'badge-chip badge-chip--emerald'
      case 'desatualizada':
        return 'badge-chip badge-chip--amber'
      case 'semSetlist':
      case 'semFilmes':
      case 'naoCalculada':
        return 'badge-chip badge-chip--slate'
    }
  }

  function exportAnalysisCsv() {
    if (!canExport) {
      showError(t('filmes.setlistPagina.analise.feedback.exportacaoSomenteAdmin'))
      return
    }

    const dadosCsv = createCsvExport()

    if (!dadosCsv) {
      showInfo(t('filmes.setlistPagina.analise.feedback.semAnalise'))
      return
    }

    const blobCsv = new Blob([dadosCsv.content], {
      type: 'text/csv;charset=utf-8;',
    })
    const urlArquivo = URL.createObjectURL(blobCsv)
    const linkDownload = document.createElement('a')

    linkDownload.href = urlArquivo
    linkDownload.download = dadosCsv.fileName
    linkDownload.click()

    URL.revokeObjectURL(urlArquivo)
    showSuccess(t('filmes.setlistPagina.analise.feedback.exportacaoSucesso'))
  }

  return {
    createNewSetlist,
    addMovieBySearch,
    toggleMovieFavorite,
    removeMovie,
    getStatusAnaliseLabel,
    getStatusAnaliseClassName,
    exportAnalysisCsv,
  }
}
