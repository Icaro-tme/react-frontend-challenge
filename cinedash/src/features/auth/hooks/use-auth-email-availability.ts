import { queryOptions, useQuery } from '@tanstack/react-query'
import { appSettings } from '../../../shared/config/app-settings'
import { checkEmail } from '../api/auth.service'
import { isEmailValido } from '../model/auth.schemas'
import { normalizeEmail } from '../model/auth.store'

export function emailAvailabilityQueryKey(email: string) {
  return ['auth', 'email-availability', normalizeEmail(email)] as const
}

export function emailAvailabilityQueryOptions(email: string) {
  const emailNormalizado = normalizeEmail(email)

  return queryOptions({
    queryKey: emailAvailabilityQueryKey(emailNormalizado),
    queryFn: () => checkEmail(emailNormalizado),
    enabled: isEmailValido(emailNormalizado),
    staleTime: appSettings.query.staleTimeMs,
    gcTime: appSettings.query.gcTimeMs,
  })
}

export function useAuthEmailAvailability(email: string) {
  return useQuery(emailAvailabilityQueryOptions(email))
}
