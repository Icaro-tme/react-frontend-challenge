const AUTH_STORAGE_KEY = 'cinedash-auth-store'
const AUTH_SESSION_CHANGED_EVENT = 'cinedash:auth-session-changed'

export const USUARIO_CONVIDADO_KEY = '__guest__'

interface AuthPersistedState {
  state?: {
    usuarioLogado?: {
      id?: string
    } | null
    sessao?: {
      expiraEm?: number
    } | null
  }
}

function getAuthPersistedState(): AuthPersistedState['state'] | null {
  if (typeof window === 'undefined') {
    return null
  }

  const rawAuthState = window.localStorage.getItem(AUTH_STORAGE_KEY)

  if (!rawAuthState) {
    return null
  }

  try {
    const authState = JSON.parse(rawAuthState) as AuthPersistedState
    return authState.state ?? null
  } catch {
    return null
  }
}

function hasSessaoAtiva(expiraEm?: number): boolean {
  if (!expiraEm || !Number.isFinite(expiraEm)) {
    return false
  }

  return expiraEm > Date.now()
}

export function getUsuarioAtualKey(): string {
  const authState = getAuthPersistedState()

  if (!authState) {
    return USUARIO_CONVIDADO_KEY
  }

  const usuarioId = authState.usuarioLogado?.id
  const sessaoExpiraEm = authState.sessao?.expiraEm

  if (!usuarioId || !hasSessaoAtiva(sessaoExpiraEm)) {
    return USUARIO_CONVIDADO_KEY
  }

  return usuarioId
}

export function notifyAuthSessionChanged(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT))
}

export function subscribeAuthSessionChange(
  callback: (usuarioAtualKey: string, usuarioAnteriorKey: string) => void,
): () => void {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  let usuarioAtualKey = getUsuarioAtualKey()

  const handleAuthSync = () => {
    const proximoUsuarioKey = getUsuarioAtualKey()

    if (proximoUsuarioKey === usuarioAtualKey) {
      return
    }

    const usuarioAnteriorKey = usuarioAtualKey
    usuarioAtualKey = proximoUsuarioKey
    callback(proximoUsuarioKey, usuarioAnteriorKey)
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === AUTH_STORAGE_KEY) {
      handleAuthSync()
    }
  }

  window.addEventListener('storage', handleStorage)
  window.addEventListener(AUTH_SESSION_CHANGED_EVENT, handleAuthSync)

  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, handleAuthSync)
  }
}
