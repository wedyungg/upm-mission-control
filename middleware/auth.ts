// middleware/auth.ts
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  auth.restore()
  if (!auth.isLoggedIn) {
    return navigateTo('/login')
  }
})
