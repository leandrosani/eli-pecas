// Arquivo: server/api/auth/logout.post.ts
import { clearUserSession } from '../../utils/session' // Caminho relativo seguro

export default defineEventHandler(async (event) => {
  await clearUserSession(event)
  return { success: true }
})