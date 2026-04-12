import type { SubmitHandler, UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { FormularioLogin } from '../model/auth.schemas'

type AvailabilityTone = 'neutral' | 'success' | 'warning'

interface LoginCardProps {
  form: UseFormReturn<FormularioLogin>
  onSubmit: SubmitHandler<FormularioLogin>
  availabilityMessage: string | null
  availabilityTone: AvailabilityTone
  isCheckingEmail: boolean
  isSubmitting: boolean
  onSignupLinkClick: () => void
}

export function LoginCard({
  form,
  onSubmit,
  availabilityMessage,
  availabilityTone,
  isCheckingEmail,
  isSubmitting,
  onSignupLinkClick,
}: LoginCardProps) {
  const { t } = useTranslation()

  const availabilityStyles: Record<AvailabilityTone, string> = {
    neutral: 'form-feedback form-feedback--neutral',
    success: 'form-feedback form-feedback--success',
    warning: 'form-feedback form-feedback--warning',
  }

  return (
    <section className="surface-card">
      <span className="badge-chip badge-chip--cyan">
        {t('login.seloAcesso')}
      </span>

      <h1 className="card-title">{t('login.titulo')}</h1>
      <p className="card-description">{t('login.descricao')}</p>

      <form className="mt-8 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <label>
          {t('login.emailRotulo')}
          <input
            type="email"
            placeholder={t('login.emailPlaceholder')}
            autoComplete="email"
            {...form.register('email')}
            className="field-accent-cyan"
          />
        </label>

        {form.formState.errors.email?.message ? (
          <p className="form-feedback form-feedback--error">
            {String(form.formState.errors.email.message)}
          </p>
        ) : null}

        <label>
          {t('login.senhaRotulo')}
          <input
            type="password"
            placeholder={t('login.senhaPlaceholder')}
            autoComplete="current-password"
            {...form.register('senha')}
            className="field-accent-cyan"
          />
        </label>

        {form.formState.errors.senha?.message ? (
          <p className="form-feedback form-feedback--error">
            {String(form.formState.errors.senha.message)}
          </p>
        ) : null}

        {availabilityMessage ? (
          <p className={availabilityStyles[availabilityTone]} aria-live="polite">
            {availabilityMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || isCheckingEmail}
          className="btn btn--slate w-full"
        >
          {isSubmitting
            ? `${t('login.botaoEntrar')}...`
            : t('login.botaoEntrar')}
        </button>
      </form>

      <button
        type="button"
        onClick={onSignupLinkClick}
        className="btn-link btn-link--cyan"
      >
        {t('login.cadastrarUsuario')}
      </button>
    </section>
  )
}
