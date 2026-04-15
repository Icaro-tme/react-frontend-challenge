import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useMemo } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { PerfilAuth } from '../entities/auth/model/auth.enums'
import { useRegisterUserMutation } from '../features/auth/hooks/use-auth-actions'
import {
  createSignupSchema,
  type FormularioCadastro,
} from '../features/auth/model/auth.schemas'
import { AuthFooter } from '../features/auth/ui/auth-footer'
import { SignupCard } from '../features/auth/ui/signup-card'
import { useLanguageSwitcher } from '../features/locale/hooks/use-language-switcher'
import { useThemeStore } from '../features/theme/model/theme.store'
import type { RouteLanguage } from '../shared/config/language'
import { useToast } from '../shared/ui/toast/use-toast'

export function SignupPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { lang } = useParams({ strict: false }) as { lang: RouteLanguage }

  const tema = useThemeStore((state) => state.theme)
  const alternarTema = useThemeStore((state) => state.toggleTheme)
  const { routeLanguage, toggleLanguage } = useLanguageSwitcher()
  const { showError, showSuccess } = useToast()

  const schema = useMemo(() => createSignupSchema(t), [t])

  const form = useForm<FormularioCadastro>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: '',
      email: '',
      perfil: PerfilAuth.Operador,
    },
  })

  const registerMutation = useRegisterUserMutation()

  const onSubmit: SubmitHandler<FormularioCadastro> = async (dados) => {
    try {
      const usuarioCriado = await registerMutation.mutateAsync(dados)

      if (!usuarioCriado) {
        form.setError('email', {
          message: t('cadastro.erroEmailExistente'),
        })

        return
      }

      showSuccess(t('cadastro.notificacoes.cadastroSucesso'))

      await navigate({
        to: '/$lang/dashboard',
        params: {
          lang,
        },
      })
    } catch {
      showError(t('cadastro.notificacoes.erroCadastro'))
    }
  }

  return (
    <main className="auth-page-shell">
      <div className="auth-page-stack">
        <SignupCard
          form={form}
          onSubmit={onSubmit}
          isSubmitting={registerMutation.isPending}
          onBackToLogin={() => {
            void navigate({
              to: '/$lang/login',
              params: {
                lang,
              },
            })
          }}
        />

        <AuthFooter
          theme={tema}
          onToggleTheme={alternarTema}
          routeLanguage={routeLanguage}
          onToggleLanguage={toggleLanguage}
        />
      </div>
    </main>
  )
}
