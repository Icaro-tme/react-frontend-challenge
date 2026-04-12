export function getErrorMessage(
  erro: unknown,
  mensagemPadrao: string,
): string {
  if (erro instanceof Error && erro.message) {
    return erro.message
  }

  return mensagemPadrao
}
