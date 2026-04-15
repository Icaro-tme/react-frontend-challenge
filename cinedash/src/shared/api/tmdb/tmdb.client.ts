import { getTmdbConfig } from './tmdb.config'
import type {
  ConfiguracaoTmdb,
  QueryParametros,
  TmdbClientDependencias,
} from './tmdb.types'

function getUrlBase(url: string): string {
  return url.endsWith('/') ? url : `${url}/`
}

function appendQueryParams(url: URL, parametros: QueryParametros): void {
  Object.entries(parametros).forEach(([chave, valor]) => {
    if (valor === undefined || valor === null) {
      return
    }

    url.searchParams.set(chave, String(valor))
  })
}

function buildRequestUrl(
  configuracao: ConfiguracaoTmdb,
  caminho: string,
  parametros: QueryParametros,
): URL {
  const caminhoNormalizado = caminho.startsWith('/') ? caminho.slice(1) : caminho
  const url = new URL(caminhoNormalizado, getUrlBase(configuracao.apiBaseUrl))

  appendQueryParams(url, parametros)

  if (!configuracao.tokenAcessoLeitura && configuracao.apiKey) {
    url.searchParams.set('api_key', configuracao.apiKey)
  }

  return url
}

function buildHeaders(configuracao: ConfiguracaoTmdb): HeadersInit {
  const cabecalhos: HeadersInit = {
    accept: 'application/json',
  }

  if (configuracao.tokenAcessoLeitura) {
    return {
      ...cabecalhos,
      Authorization: `Bearer ${configuracao.tokenAcessoLeitura}`,
    }
  }

  return cabecalhos
}

function validateConfig(configuracao: ConfiguracaoTmdb): void {
  if (configuracao.tokenAcessoLeitura || configuracao.apiKey) {
    return
  }

  throw new Error(
    'Credenciais da TMDB ausentes. Configure VITE_TMDB_API_READ_ACCESS_TOKEN ou VITE_TMDB_API_KEY.',
  )
}

export function createTmdbGetClient(dependencias: TmdbClientDependencias = {}) {
  const fetchFn = dependencias.fetchFn ?? fetch
  const configuracao = dependencias.configuracao ?? getTmdbConfig()

  validateConfig(configuracao)

  async function get<TResposta>(
    caminho: string,
    parametros: QueryParametros = {},
  ): Promise<TResposta> {
    const url = buildRequestUrl(configuracao, caminho, parametros)

    const resposta = await fetchFn(url.toString(), {
      method: 'GET',
      headers: buildHeaders(configuracao),
    })

    if (!resposta.ok) {
      throw new Error(`Falha na requisicao a TMDB (${resposta.status}).`)
    }

    return (await resposta.json()) as TResposta
  }

  return {
    get,
  }
}
