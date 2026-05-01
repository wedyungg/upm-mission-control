import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const { code, userId, redirectUri } = body

  // 1. Tukar kode otorisasi dari Google dengan token akses dan refresh token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: String(config.public.googleClientId),
      client_secret: String(config.googleClientSecret),
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  })

  const tokens = await tokenResponse.json()

  if (tokens.error) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: tokens.error_description || 'Gagal memverifikasi token Google' 
    })
  }

  // 2. Simpan refresh_token ke tabel user_settings di Supabase
  // Catatan: Google hanya mengirimkan refresh_token pada saat pengguna pertama kali memberikan izin
  if (tokens.refresh_token) {
    const supabase = await serverSupabaseClient(event)
    const { error } = await supabase
      .from('user_settings')
      .upsert({ 
        user_id: userId, 
        drive_refresh_token: tokens.refresh_token 
      })

    if (error) {
      throw createError({ statusCode: 500, statusMessage: 'Gagal menyimpan token ke database' })
    }
  }

  return { success: true, message: 'Google Drive berhasil dihubungkan secara permanen' }
})