import type { SubmitHandler, UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { PerfilAuth } from '../../../entities/auth/model/auth.enums'
import type { FormularioCadastro } from '../model/auth.schemas'

interface SignupCardProps {
  form: UseFormReturn<FormularioCadastro>
  onSubmit: SubmitHandler<FormularioCadastro>
  isSubmitting: boolean
  onBackToLogin: () => void
}

export function SignupCard({
  form,
  onSubmit,
  isSubmitting,
  onBackToLogin,
}: SignupCardProps) {
  const { t } = useTranslation()

  return (
    <section className="surface-card">
      <span className="badge-chip badge-chip--emerald">
        {t('cadastro.seloAcesso')}
      </span>

      <h1 className="card-title">{t('cadastro.titulo')}</h1>
      <p className="card-description">{t('cadastro.descricao')}</p>

      <form className="mt-8 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <label>
          {t('cadastro.nomeRotulo')}
          <input
            type="text"
            placeholder={t('cadastro.nomePlaceholder')}
            autoComplete="name"
            {...form.register('nome')}
            className="field-accent-emerald"
          />
          {form.formState.errors.nome?.message ? (
            <span className="form-feedback form-feedback--error mt-1 block">
              {String(form.formState.errors.nome.message)}
            </span>
          ) : null}
        </label>

        <label>
          {t('cadastro.emailRotulo')}
          <input
            type="email"
            placeholder={t('cadastro.emailPlaceholder')}
            autoComplete="email"
            {...form.register('email')}
            className="field-accent-emerald"
          />
          {form.formState.errors.email?.message ? (
            <span className="form-feedback form-feedback--error mt-1 block">
              {String(form.formState.errors.email.message)}
            </span>
          ) : null}
        </label>

        <label>
          {t('cadastro.perfilRotulo')}
          <select
            {...form.register('perfil')}
            className="field-accent-emerald"
          >
            <option value={PerfilAuth.Operador}>{t('perfis.operador')}</option>
            <option value={PerfilAuth.Administrador}>
              {t('perfis.administrador')}
            </option>
          </select>
          {form.formState.errors.perfil?.message ? (
            <span className="form-feedback form-feedback--error mt-1 block">
              {String(form.formState.errors.perfil.message)}
            </span>
          ) : null}
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn--emerald w-full"
        >
          {isSubmitting
            ? `${t('cadastro.botaoCadastrar')}...`
            : t('cadastro.botaoCadastrar')}
        </button>
      </form>

      <button
        type="button"
        onClick={onBackToLogin}
        className="btn-link btn-link--emerald"
      >
        {t('cadastro.voltarLogin')}
      </button>
    </section>
  )
}
