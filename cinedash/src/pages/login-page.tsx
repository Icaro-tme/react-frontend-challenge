import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from '@tanstack/react-router'
import type { TFunction } from 'i18next'
import { useMemo } from 'react'
import { type SubmitHandler, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useLoginByEmailMutation } from '../features/auth/hooks/use-auth-actions'
import { useAuthEmailAvailability } from '../features/auth/hooks/use-auth-email-availability'
import {
  createLoginSchema,
  isEmailValido,
  type FormularioLogin,
} from '../features/auth/model/auth.schemas'
import { AuthFooter } from '../features/auth/ui/auth-footer'
import { LoginCard } from '../features/auth/ui/login-card'
import { useThemeStore } from '../features/theme/model/theme.store'
import { appSettings } from '../shared/config/app-settings'
import type { RouteLanguage } from '../shared/config/language'
import { useDebouncedValue } from '../shared/hooks/use-debounced-value'

type AvailabilityTone = 'neutral' | 'success' | 'warning'

interface AvailabilityFeedback {
  mensagem: string | null
  tom: AvailabilityTone
}

function getAvailabilityFeedback(
  email: string,
  isFetching: boolean,
  disponivel: boolean | undefined,
  t: TFunction,
): AvailabilityFeedback {
  if (!email) {
    return {
      mensagem: null,
      tom: 'neutral',
    }
  }

  if (!isEmailValido(email)) {
    return {
      mensagem: t('login.statusEmail.invalido'),
      tom: 'warning',
    }
  }

  if (isFetching) {
    return {
      mensagem: t('login.statusEmail.verificando'),
      tom: 'neutral',
    }
  }

  if (disponivel === false) {
    return {
      mensagem: t('login.statusEmail.encontrado'),
      tom: 'success',
    }
  }

  if (disponivel === true) {
    return {
      mensagem: t('login.statusEmail.naoEncontrado'),
      tom: 'warning',
    }
  }

  return {
    mensagem: null,
    tom: 'neutral',
  }
}

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { lang } = useParams({ strict: false }) as { lang: RouteLanguage }

  const tema = useThemeStore((state) => state.theme)
  const alternarTema = useThemeStore((state) => state.toggleTheme)

  const schema = useMemo(() => createLoginSchema(t), [t])

  const form = useForm<FormularioLogin>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      senha: '',
    },
    mode: 'onChange',
  })

  const emailDigitado = useWatch({
    control: form.control,
    name: 'email',
    defaultValue: '',
  })
  const emailDebounced = useDebouncedValue(
    emailDigitado,
    appSettings.auth.tempoDebounceEmailMs,
  )

  const disponibilidadeEmail = useAuthEmailAvailability(emailDebounced)
  const loginMutation = useLoginByEmailMutation()

  const feedbackDisponibilidade = getAvailabilityFeedback(
    emailDebounced,
    disponibilidadeEmail.isFetching,
    disponibilidadeEmail.data?.disponivel,
    t,
  )

  const onSubmit: SubmitHandler<FormularioLogin> = async (dados) => {
    const usuarioLogado = await loginMutation.mutateAsync(dados.email)

    if (usuarioLogado) {
      await navigate({
        to: '/$lang/dashboard',
        params: {
          lang,
        },
      })

      return
    }

    await navigate({
      to: '/$lang/signup',
      params: {
        lang,
      },
    })
  }

  return (
    <main className="auth-page-shell">
      <div className="auth-page-stack">
        <LoginCard
          form={form}
          onSubmit={onSubmit}
          availabilityMessage={feedbackDisponibilidade.mensagem}
          availabilityTone={feedbackDisponibilidade.tom}
          isCheckingEmail={disponibilidadeEmail.isFetching}
          isSubmitting={loginMutation.isPending}
          onSignupLinkClick={() => {
            void navigate({
              to: '/$lang/signup',
              params: {
                lang,
              },
            })
          }}
        />

        <AuthFooter theme={tema} onToggleTheme={alternarTema} />
      </div>
    </main>
  )
}
