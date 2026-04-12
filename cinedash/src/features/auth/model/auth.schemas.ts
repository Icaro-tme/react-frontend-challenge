import type { TFunction } from 'i18next'
import { z } from 'zod'
import { PerfilAuth } from '../../../entities/auth/model/auth.enums'

const emailSchemaSemMensagem = z.string().trim().email()

function createEmailSchema(t: TFunction) {
  return z.string().trim().email(t('validacao.emailInvalido'))
}

export function isEmailValido(email: string): boolean {
  return emailSchemaSemMensagem.safeParse(email).success
}

export function createLoginSchema(t: TFunction) {
  return z.object({
    email: createEmailSchema(t),
    senha: z.string().min(7, t('validacao.senhaMinima')),
  })
}

export function createSignupSchema(t: TFunction) {
  return z.object({
    email: createEmailSchema(t),
    nome: z.string().trim().min(2, t('validacao.nomeMinimo')),
    perfil: z.enum([PerfilAuth.Administrador, PerfilAuth.Operador]),
  })
}

export type FormularioLogin = z.infer<ReturnType<typeof createLoginSchema>>
export type FormularioCadastro = z.infer<ReturnType<typeof createSignupSchema>>
