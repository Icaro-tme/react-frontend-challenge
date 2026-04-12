import type { PerfilAuth } from '../../auth/model/auth.enums'

export interface Usuario {
  id: string
  email: string
  nome: string
  perfil: PerfilAuth
}
