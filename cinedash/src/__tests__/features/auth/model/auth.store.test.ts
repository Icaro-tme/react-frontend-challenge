import { beforeEach, describe, expect, it } from 'vitest'
import { USUARIOS_SEED } from '../../../../entities/auth/model/auth.constants'
import { PerfilAuth } from '../../../../entities/auth/model/auth.enums'
import type { UsuarioAuth } from '../../../../entities/auth/model/auth.types'
import { useAuthStore } from '../../../../features/auth/model/auth.store'

function mapUsuariosPorEmail(usuarios: UsuarioAuth[]): Record<string, UsuarioAuth> {
  return usuarios.reduce<Record<string, UsuarioAuth>>((acumulador, usuario) => {
    acumulador[usuario.email.toLowerCase()] = {
      ...usuario,
    }

    return acumulador
  }, {})
}

function resetAuthStore(): void {
  useAuthStore.setState({
    sessao: null,
    usuarioLogado: null,
    usuariosCadastrados: mapUsuariosPorEmail(USUARIOS_SEED),
  })
}

describe('store de autenticacao', () => {
  beforeEach(() => {
    localStorage.clear()
    resetAuthStore()
  })

  it('deve autenticar usuario seed e persistir sessao', () => {
    const usuarioLogado = useAuthStore.getState().signIn('operador@cinedash.dev')

    expect(usuarioLogado?.email).toBe('operador@cinedash.dev')
    expect(useAuthStore.getState().isLogged()).toBe(true)
    expect(useAuthStore.getState().sessao?.token.startsWith('cinedash.')).toBe(true)

    const valorPersistido = localStorage.getItem('cinedash-auth-store')
    expect(valorPersistido).toContain('operador@cinedash.dev')
  })

  it('nao deve autenticar usuario inexistente', () => {
    const usuarioLogado = useAuthStore.getState().signIn('inexistente@cinedash.dev')

    expect(usuarioLogado).toBeNull()
    expect(useAuthStore.getState().isLogged()).toBe(false)
  })

  it('deve cadastrar administrador e liberar permissao de exportacao', () => {
    const usuarioCriado = useAuthStore.getState().registerUser({
      email: 'admin@cinedash.dev',
      nome: 'Administrador Teste',
      perfil: PerfilAuth.Administrador,
    })

    expect(usuarioCriado?.perfil).toBe(PerfilAuth.Administrador)

    useAuthStore.getState().signIn('admin@cinedash.dev')

    expect(useAuthStore.getState().canUseSystem()).toBe(true)
    expect(useAuthStore.getState().canExport()).toBe(true)
  })

  it('deve invalidar sessao expirada e limpar dados do usuario', () => {
    const usuarioSeed = {
      ...USUARIOS_SEED[0],
    }

    useAuthStore.setState({
      sessao: {
        token: 'token-expirado',
        expiraEm: Date.now() - 5_000,
      },
      usuarioLogado: usuarioSeed,
    })

    const isLogged = useAuthStore.getState().isLogged()

    expect(isLogged).toBe(false)
    expect(useAuthStore.getState().sessao).toBeNull()
    expect(useAuthStore.getState().usuarioLogado).toBeNull()
  })
})
