import { describe, expect, it } from 'vitest'
import {
  buildSetlistAnaliseAssinatura,
  buildSetlistAnaliseScore,
} from '../../../../features/setlist/model/setlist-analysis.utils'

describe('setlist analysis utils', () => {
  it('deve criar assinatura deterministica para ids de filmes', () => {
    const assinaturaA = buildSetlistAnaliseAssinatura([30, 10, 20])
    const assinaturaB = buildSetlistAnaliseAssinatura([20, 30, 10])

    expect(assinaturaA).toBe('10|20|30')
    expect(assinaturaB).toBe('10|20|30')
  })

  it('deve calcular indicadores principais da analise score', () => {
    const analise = buildSetlistAnaliseScore({
      detalhesFilmes: [
        {
          id: 1,
          title: 'Filme A',
          poster_path: null,
          backdrop_path: null,
          overview: 'A',
          release_date: '2010-01-01',
          vote_average: 8,
          popularity: 80,
          budget: 100,
          adult: false,
          genres: [],
        },
        {
          id: 2,
          title: 'Filme B',
          poster_path: null,
          backdrop_path: null,
          overview: 'B',
          release_date: '2020-01-01',
          vote_average: 6,
          popularity: 20,
          budget: 300,
          adult: true,
          genres: [],
        },
      ],
      classificacoesFilmes: [
        {
          id: 1,
          results: [
            {
              iso_3166_1: 'BR',
              release_dates: [
                {
                  certification: '12',
                  release_date: '2010-01-01',
                },
              ],
            },
          ],
        },
        {
          id: 2,
          results: [
            {
              iso_3166_1: 'US',
              release_dates: [
                {
                  certification: 'R',
                  release_date: '2020-01-01',
                },
              ],
            },
          ],
        },
      ],
      idsTrending: [1],
      idsPopulares: [1, 2],
    })

    expect(analise.totalFilmes).toBe(2)
    expect(analise.mediaNotas).toBe(7)
    expect(analise.mediaBudget).toBe(200)
    expect(analise.mediaPopularidade).toBe(50)
    expect(analise.mediaAnoLancamento).toBe(2015)
    expect(analise.mediaClassificacaoIndicativa).toBe(14.5)
    expect(analise.percentualTrending).toBe(50)
    expect(analise.percentualPopulares).toBe(100)
    expect(analise.filmesAcimaNotaSete).toBe(1)
    expect(analise.filmesBaixaPopularidade).toBe(1)
    expect(analise.scoreCuradoria).toBeGreaterThan(0)
  })
})
