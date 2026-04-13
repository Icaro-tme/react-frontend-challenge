import type { Setlist } from '../../../entities/setlist/model/setlist.types'

interface WatchlistExportavel {
  filmesWatchlistIds: number[]
  filmesAssistidosIds: number[]
}

export interface DadosExportaveis {
  versao: number
  exportadoEm: string
  setlists: Setlist[]
  watchlist: WatchlistExportavel
  favoritos: number[]
}

interface CreateExportableUserDataInput {
  setlists: Setlist[]
  watchlist: WatchlistExportavel
  favoritos: number[]
}

export function createExportableUserData({
  setlists,
  watchlist,
  favoritos,
}: CreateExportableUserDataInput): DadosExportaveis {
  return {
    versao: 1,
    exportadoEm: new Date().toISOString(),
    setlists,
    watchlist: {
      filmesWatchlistIds: watchlist.filmesWatchlistIds,
      filmesAssistidosIds: watchlist.filmesAssistidosIds,
    },
    favoritos,
  }
}

export function exportUserDataAsJson(dados: DadosExportaveis): void {
  const conteudo = JSON.stringify(dados, null, 2)
  const blob = new Blob([conteudo], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `cinedash-dados-${Date.now()}.json`
  link.click()

  URL.revokeObjectURL(url)
}

export interface ImportResult {
  sucesso: boolean
  dados?: DadosExportaveis
}

function isIntegerArray(valor: unknown): valor is number[] {
  return Array.isArray(valor) && valor.every((item) => Number.isInteger(item))
}

function isSetlistValida(valor: unknown): valor is Setlist {
  if (!valor || typeof valor !== 'object') return false

  const obj = valor as Record<string, unknown>

  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    isIntegerArray(obj.movieIds)
  )
}

function isDadosExportaveis(valor: unknown): valor is DadosExportaveis {
  if (!valor || typeof valor !== 'object') return false

  const obj = valor as Record<string, unknown>

  if (typeof obj.versao !== 'number' || obj.versao < 1) return false
  if (!Array.isArray(obj.setlists)) return false
  if (!obj.setlists.every(isSetlistValida)) return false

  if (!obj.watchlist || typeof obj.watchlist !== 'object') return false

  const watchlist = obj.watchlist as Record<string, unknown>

  if (!isIntegerArray(watchlist.filmesWatchlistIds)) return false
  if (!isIntegerArray(watchlist.filmesAssistidosIds)) return false

  if (obj.favoritos !== undefined && !isIntegerArray(obj.favoritos)) return false

  return true
}

export function parseImportedJson(conteudo: string): ImportResult {
  try {
    const dados: unknown = JSON.parse(conteudo)

    if (!isDadosExportaveis(dados)) {
      return { sucesso: false }
    }

    return { sucesso: true, dados }
  } catch {
    return { sucesso: false }
  }
}
