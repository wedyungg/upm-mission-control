// server/api/drive-token.get.ts
// Mengambil access token Google Drive pusat yang selalu valid dan segar
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const USER_ID = 'ziyan'

  try {
    const supabase = await serverSupabaseClient(event)
    const { data: userSettings, error: dbError } = await supabase
      .from('user_settings')
      .select('drive_refresh_token')
      .eq('user_id', USER_ID)
      .maybeSingle()

    if (dbError || !userSettings?.drive_refresh_token) {
      return {
        ok: false,
        connected: false,
        error: 'Google Drive pusat belum terhubung. Refresh token tidak ditemukan di database.',
      }
    }

    const refreshToken = userSettings.drive_refresh_token

    // Tukar refresh token dengan access token baru dari Google
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: String(config.public.googleClientId),
        client_secret: String(config.googleClientSecret),
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    const tokens = await tokenResponse.json()

    if (tokens.error) {
      console.error('Gagal refresh Google token:', tokens.error, tokens.error_description)
      return {
        ok: false,
        connected: false,
        error: tokens.error_description || 'Gagal memperbarui access token Google',
      }
    }

    return {
      ok: true,
      connected: true,
      access_token: tokens.access_token,
      expires_in: tokens.expires_in,
    }
  } catch (err: any) {
    console.error('Server error drive-token.get:', err.message)
    return {
      ok: false,
      connected: false,
      error: err.message || 'Terjadi kesalahan saat menghubungi server Google',
    }
  }
})
