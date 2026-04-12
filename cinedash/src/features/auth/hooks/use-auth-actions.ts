import { useMutation, useQueryClient } from '@tanstack/react-query'
import { registerUser, signInByEmail } from '../api/auth.service'
import {
  emailAvailabilityQueryKey,
} from './use-auth-email-availability'
import { normalizeEmail } from '../model/auth.store'

export function useLoginByEmailMutation() {
  return useMutation({
    mutationFn: signInByEmail,
  })
}

export function useRegisterUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (usuarioCriado, dados) => {
      if (!usuarioCriado) {
        return
      }

      queryClient.setQueryData(emailAvailabilityQueryKey(dados.email), {
        email: normalizeEmail(dados.email),
        existe: true,
        disponivel: false,
      })
    },
  })
}
