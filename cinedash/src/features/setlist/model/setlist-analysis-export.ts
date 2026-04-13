import type {
  SetlistAnaliseSpoor,
  SetlistAnaliseSpoorCsv,
} from './setlist-analysis.types'

interface CreateSetlistAnaliseSpoorCsvInput {
  nomeSetlist: string
  analise: SetlistAnaliseSpoor
}

function escapeCsvValue(valor: string | number): string {
  const texto = String(valor)

  if (!texto.includes(',') && !texto.includes('"') && !texto.includes('\n')) {
    return texto
  }

  return `"${texto.replaceAll('"', '""')}"`
}

function sanitizeFileName(nomeArquivo: string): string {
  return nomeArquivo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
}

export function createSetlistAnaliseSpoorCsv({
  nomeSetlist,
  analise,
}: CreateSetlistAnaliseSpoorCsvInput): SetlistAnaliseSpoorCsv {
  const linhasResumo = [
    ['setlist', nomeSetlist],
    ['totalFilmes', analise.totalFilmes],
    ['mediaNotas', analise.mediaNotas],
    ['mediaBudget', analise.mediaBudget],
    ['mediaPopularidade', analise.mediaPopularidade],
    ['mediaAnoLancamento', analise.mediaAnoLancamento ?? ''],
    ['mediaClassificacaoIndicativa', analise.mediaClassificacaoIndicativa ?? ''],
    ['percentualTrending', analise.percentualTrending],
    ['percentualPopulares', analise.percentualPopulares],
    ['scoreCuradoria', analise.scoreCuradoria],
    ['nivelCuradoria', analise.nivelCuradoria],
    ['filmesAcimaNotaSete', analise.filmesAcimaNotaSete],
    ['filmesBaixaPopularidade', analise.filmesBaixaPopularidade],
  ]

  const cabecalhoFilmes = [
    'filmeId',
    'titulo',
    'notaMedia',
    'popularidade',
    'budget',
    'anoLancamento',
    'classificacaoIndicativa',
    'emTendencia',
    'emPopulares',
  ]

  const linhasFilmes = analise.filmes.map((filmeAtual) => [
    filmeAtual.id,
    filmeAtual.titulo,
    filmeAtual.notaMedia,
    filmeAtual.popularidade,
    filmeAtual.budget,
    filmeAtual.anoLancamento ?? '',
    filmeAtual.classificacaoIndicativa ?? '',
    filmeAtual.emTendencia ? 'sim' : 'nao',
    filmeAtual.emPopulares ? 'sim' : 'nao',
  ])

  const blocos = [
    ['campoResumo', 'valorResumo'],
    ...linhasResumo,
    [],
    cabecalhoFilmes,
    ...linhasFilmes,
  ]

  const content = blocos
    .map((colunasAtual) => colunasAtual.map((colunaAtual) => escapeCsvValue(colunaAtual)).join(','))
    .join('\n')

  const nomeSetlistNormalizado = sanitizeFileName(nomeSetlist || 'setlist')

  return {
    fileName: `spoor-analise-${nomeSetlistNormalizado}.csv`,
    content,
  }
}
