import { PerfilAuth, PermissaoAuth } from './auth.enums'
import type { UsuarioAuth } from './auth.types'

export const PERMISSOES_POR_PERFIL: Record<PerfilAuth, PermissaoAuth[]> = {
  [PerfilAuth.Administrador]: [PermissaoAuth.Exportar],
  [PerfilAuth.Operador]: [],
}

export const USUARIOS_SEED: UsuarioAuth[] = [
  {
    id: 'seed-operador',
    email: 'operador@cinedash.dev',
    nome: 'Operador Teste',
    perfil: PerfilAuth.Operador,
  },
]
