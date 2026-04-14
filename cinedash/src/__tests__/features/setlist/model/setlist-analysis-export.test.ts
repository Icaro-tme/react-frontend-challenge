import { describe, expect, it } from 'vitest'
import { createSetlistAnaliseScoreCsv } from '../../../../features/setlist/model/setlist-analysis-export'

describe('setlist analysis export', () => {
  it('deve gerar csv com nome de arquivo normalizado e conteudo com resumo e filmes', () => {
    const csv = createSetlistAnaliseScoreCsv({
      nomeSetlist: 'Seleção Épica 2026',
      analise: {
        totalFilmes: 1,
        mediaNotas: 8,
        mediaBudget: 1000000,
        mediaPopularidade: 80,
        mediaAnoLancamento: 2024,
        mediaClassificacaoIndicativa: 14,
        percentualTrending: 100,
        percentualPopulares: 100,
        scoreCuradoria: 92,
        nivelCuradoria: 'positivo',
        filmesAcimaNotaSete: 1,
        filmesBaixaPopularidade: 0,
        filmes: [
          {
            id: 77,
            titulo: 'Filme Teste',
            notaMedia: 8,
            popularidade: 80,
            budget: 1000000,
            anoLancamento: 2024,
            classificacaoIndicativa: 14,
            emTendencia: true,
            emPopulares: true,
          },
        ],
      },
    })

    expect(csv.fileName).toBe('score-analise-selecao-epica-2026.csv')
    expect(csv.content).toContain('campoResumo,valorResumo')
    expect(csv.content).toContain('scoreCuradoria,92')
    expect(csv.content).toContain('filmeId,titulo,notaMedia,popularidade,budget,anoLancamento,classificacaoIndicativa,emTendencia,emPopulares')
    expect(csv.content).toContain('77,Filme Teste,8,80,1000000,2024,14,sim,sim')
  })
})
