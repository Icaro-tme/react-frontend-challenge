export const PerfilAuth = {
  Administrador: 'administrador',
  Operador: 'operador',
} as const

export type PerfilAuth = (typeof PerfilAuth)[keyof typeof PerfilAuth]

export const PermissaoAuth = {
  Exportar: 'exportar',
} as const

export type PermissaoAuth = (typeof PermissaoAuth)[keyof typeof PermissaoAuth]
