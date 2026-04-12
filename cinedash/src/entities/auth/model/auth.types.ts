import type { PerfilAuth } from './auth.enums'

export interface UsuarioAuth {
  id: string
  email: string
  nome: string
  perfil: PerfilAuth
}

export interface SessaoAuth {
  token: string
  expiraEm: number
}

export interface CadastroUsuarioInput {
  email: string
  nome: string
  perfil: PerfilAuth
}
