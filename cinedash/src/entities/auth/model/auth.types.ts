import type { PerfilAuth } from './auth.enums'
import type { Usuario } from '../../user/model/user.types'

export type UsuarioAuth = Usuario

export interface SessaoAuth {
  token: string
  expiraEm: number
}

export interface CadastroUsuarioInput {
  email: string
  nome: string
  perfil: PerfilAuth
}
