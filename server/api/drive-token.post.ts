// server/api/drive-token.post.ts
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  
  // 1. Ambil data dari body (Pastikan nama variabel sesuai dengan frontend)
  // Kita pakai redirect_uri (snake_case) sesuai kiriman confirm-drive.vue
  const { code, redirect_uri } = body
  const USER_ID = 'ziyan' // Mengunci ke ID 'ziyan'

  // 2. Tukar kode otorisasi dari Google dengan token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: String(config.public.googleClientId),
      client_secret: String(config.googleClientSecret),
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirect_uri, // Harus cocok dengan yang didaftarkan di Google Console
    }),
  })

  const tokens = await tokenResponse.json()

  if (tokens.error) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: tokens.error_description || 'Gagal memverifikasi token Google' 
    })
  }

  // 3. Simpan refresh_token ke tabel user_settings di Supabase
  if (tokens.refresh_token) {
    const supabase = await serverSupabaseClient(event)
    const { error } = await supabase
      .from('user_settings')
      .upsert({ 
        user_id: USER_ID, 
        drive_refresh_token: tokens.refresh_token 
      }, { onConflict: 'user_id' })

    if (error) {
      throw createError({ statusCode: 500, statusMessage: 'Gagal menyimpan token ke database' })
    }
  }

  // 4. PENTING: Kembalikan tokens (access_token) agar frontend bisa langsung pakai
  return tokens
})