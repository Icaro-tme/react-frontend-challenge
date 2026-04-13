export type NivelCuradoriaSpoor = 'positivo' | 'atencao' | 'critico'

export interface FilmeSetlistAnaliseSpoor {
  id: number
  titulo: string
  notaMedia: number
  popularidade: number
  budget: number
  anoLancamento: number | null
  classificacaoIndicativa: number | null
  emTendencia: boolean
  emPopulares: boolean
}

export interface SetlistAnaliseSpoor {
  totalFilmes: number
  mediaNotas: number
  mediaBudget: number
  mediaPopularidade: number
  mediaAnoLancamento: number | null
  mediaClassificacaoIndicativa: number | null
  percentualTrending: number
  percentualPopulares: number
  scoreCuradoria: number
  nivelCuradoria: NivelCuradoriaSpoor
  filmesAcimaNotaSete: number
  filmesBaixaPopularidade: number
  filmes: FilmeSetlistAnaliseSpoor[]
}

export interface SetlistAnaliseSpoorCache {
  assinatura: string
  calculadoEm: number
  analise: SetlistAnaliseSpoor
}

export interface SetlistAnaliseSpoorCsv {
  fileName: string
  content: string
}
