export type NivelCuradoriaScore = 'positivo' | 'atencao' | 'critico'

export interface FilmeSetlistAnaliseScore {
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

export interface SetlistAnaliseScore {
  totalFilmes: number
  mediaNotas: number
  mediaBudget: number
  mediaPopularidade: number
  mediaAnoLancamento: number | null
  mediaClassificacaoIndicativa: number | null
  percentualTrending: number
  percentualPopulares: number
  scoreCuradoria: number
  nivelCuradoria: NivelCuradoriaScore
  filmesAcimaNotaSete: number
  filmesBaixaPopularidade: number
  filmes: FilmeSetlistAnaliseScore[]
}

export interface SetlistAnaliseScoreCache {
  assinatura: string
  calculadoEm: number
  analise: SetlistAnaliseScore
}

export interface SetlistAnaliseScoreCsv {
  fileName: string
  content: string
}
