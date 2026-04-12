import type {
  CadastroUsuarioInput,
  UsuarioAuth,
} from '../../../entities/auth/model/auth.types'
import { appSettings } from '../../../shared/config/app-settings'
import { wait } from '../../../shared/lib/wait'
import { normalizeEmail, useAuthStore } from '../model/auth.store'

export interface DisponibilidadeEmail {
  email: string
  existe: boolean
  disponivel: boolean
}

export async function checkEmail(email: string): Promise<DisponibilidadeEmail> {
  const emailNormalizado = normalizeEmail(email)

  await wait(appSettings.auth.tempoDelayMockMs)

  const existe = useAuthStore.getState().hasEmail(emailNormalizado)

  return {
    email: emailNormalizado,
    existe,
    disponivel: !existe,
  }
}

export async function signInByEmail(email: string): Promise<UsuarioAuth | null> {
  await wait(appSettings.auth.tempoDelayMockMs)

  return useAuthStore.getState().signIn(email)
}

export async function registerUser(
  dados: CadastroUsuarioInput,
): Promise<UsuarioAuth | null> {
  await wait(appSettings.auth.tempoDelayMockMs)

  const usuarioCriado = useAuthStore.getState().registerUser(dados)

  if (!usuarioCriado) {
    return null
  }

  useAuthStore.getState().signIn(usuarioCriado.email)

  return usuarioCriado
}
