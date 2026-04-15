import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  PERMISSOES_POR_PERFIL,
  USUARIOS_SEED,
} from '../../../entities/auth/model/auth.constants'
import { PerfilAuth, PermissaoAuth } from '../../../entities/auth/model/auth.enums'
import type {
  CadastroUsuarioInput,
  SessaoAuth,
  UsuarioAuth,
} from '../../../entities/auth/model/auth.types'
import { appSettings } from '../../../shared/config/app-settings'
import { notifyAuthSessionChanged } from '../../../shared/lib/auth-session'

interface EstadoAuth {
  sessao: SessaoAuth | null
  usuarioLogado: UsuarioAuth | null
  usuariosCadastrados: Record<string, UsuarioAuth>
  registerUser: (dados: CadastroUsuarioInput) => UsuarioAuth | null
  signIn: (email: string) => UsuarioAuth | null
  signOut: () => void
  isLogged: () => boolean
  canUseSystem: () => boolean
  canExport: () => boolean
  hasEmail: (email: string) => boolean
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase()
}

function mapUsersByEmail(usuarios: UsuarioAuth[]): Record<string, UsuarioAuth> {
  return usuarios.reduce<Record<string, UsuarioAuth>>((acumulador, usuario) => {
    acumulador[normalizeEmail(usuario.email)] = {
      ...usuario,
    }

    return acumulador
  }, {})
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function generateToken(email: string): string {
  return `cinedash.${btoa(email)}.${Math.random().toString(36).slice(2, 10)}`
}

function createSession(email: string): SessaoAuth {
  return {
    token: generateToken(email),
    expiraEm: Date.now() + appSettings.auth.tempoSessaoMs,
  }
}

function isSessionValid(sessao: SessaoAuth | null): boolean {
  return Boolean(sessao && sessao.expiraEm > Date.now())
}

const usuariosSeedPorEmail = mapUsersByEmail(USUARIOS_SEED)

export const useAuthStore = create<EstadoAuth>()(
  persist(
    (set, get) => ({
      sessao: null,
      usuarioLogado: null,
      usuariosCadastrados: usuariosSeedPorEmail,
      registerUser: (dados) => {
        const emailNormalizado = normalizeEmail(dados.email)

        if (get().usuariosCadastrados[emailNormalizado]) {
          return null
        }

        const usuarioCriado: UsuarioAuth = {
          id: generateId(),
          email: emailNormalizado,
          nome: dados.nome,
          perfil: dados.perfil,
        }

        set((state) => ({
          usuariosCadastrados: {
            ...state.usuariosCadastrados,
            [emailNormalizado]: usuarioCriado,
          },
        }))

        return usuarioCriado
      },
      signIn: (email) => {
        const emailNormalizado = normalizeEmail(email)
        const usuarioEncontrado = get().usuariosCadastrados[emailNormalizado]

        if (!usuarioEncontrado) {
          return null
        }

        const sessaoCriada = createSession(emailNormalizado)

        set({
          sessao: sessaoCriada,
          usuarioLogado: {
            ...usuarioEncontrado,
          },
        })

        notifyAuthSessionChanged()

        return usuarioEncontrado
      },
      signOut: () => {
        set({
          sessao: null,
          usuarioLogado: null,
        })

        notifyAuthSessionChanged()
      },
      isLogged: () => {
        const sessaoAtual = get().sessao

        if (!isSessionValid(sessaoAtual)) {
          if (sessaoAtual || get().usuarioLogado) {
            set({
              sessao: null,
              usuarioLogado: null,
            })

            notifyAuthSessionChanged()
          }

          return false
        }

        return Boolean(get().usuarioLogado)
      },
      canUseSystem: () => {
        if (!get().isLogged()) {
          return false
        }

        const perfilUsuario = get().usuarioLogado?.perfil

        return (
          perfilUsuario === PerfilAuth.Operador ||
          perfilUsuario === PerfilAuth.Administrador
        )
      },
      canExport: () => {
        if (!get().canUseSystem()) {
          return false
        }

        const perfilUsuario = get().usuarioLogado?.perfil

        if (!perfilUsuario) {
          return false
        }

        return PERMISSOES_POR_PERFIL[perfilUsuario].includes(
          PermissaoAuth.Exportar,
        )
      },
      hasEmail: (email) => {
        const emailNormalizado = normalizeEmail(email)

        return Boolean(get().usuariosCadastrados[emailNormalizado])
      },
    }),
    {
      name: 'cinedash-auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessao: state.sessao,
        usuarioLogado: state.usuarioLogado,
        usuariosCadastrados: state.usuariosCadastrados,
      }),
    },
  ),
)
