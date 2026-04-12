export const appSettings = {
  idioma: {
    idiomasSuportados: ['pt-BR', 'en-US'] as const,
    idiomaPadrao: 'pt-BR' as const,
  },
  auth: {
    tempoSessaoMs: 30 * 60_000,
    tempoDebounceEmailMs: 350,
    tempoDelayMockMs: 350,
  },
  filmes: {
    tempoDebounceFiltrosMs: 300,
    tamanhoPaginaLocal: 20,
    anoLancamentoMinimo: 1800,
    anoLancamentoMaximo: 2200,
    notaMinimaPermitida: 0,
    notaMaximaPermitida: 10,
  },
  query: {
    staleTimeMs: 60_000,
    gcTimeMs: 10 * 60_000,
    retryQueries: 1,
    retryMutations: 0,
  },
} as const
