export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const message = body?.message

  if (!message) {
    return { status: false, error: 'Pesan kosong' }
  }

  // 1. Prioritaskan Bot WhatsApp Baileys Mandiri (port 3001)
  try {
    const botRes = await fetch('http://localhost:3001/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
      signal: AbortSignal.timeout(9000),
    })
    const botData = await botRes.json().catch(() => null)
    if (botData?.success) {
      return { status: true, via: 'bot', target: botData.target }
    }
    console.warn('[WA-API] Bot lokal port 3001 mengembalikan status tidak sukses:', botData)
  } catch (err: any) {
    console.warn('[WA-API] Bot lokal port 3001 tidak merespon:', err.message)
  }

  // 2. Fallback: Fonnte API jika waToken tersedia
  if (config.waToken) {
    try {
      const res = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          Authorization: config.waToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target: config.waTarget,
          message,
          countryCode: '62',
        }),
      })
      const fonnteData = await res.json()
      return { status: !!fonnteData?.status, via: 'fonnte', ...fonnteData }
    } catch (err: any) {
      console.error('[WA-API] Fonnte fallback gagal:', err.message)
    }
  }

  return { status: false, error: 'Semua gateway WA tidak dapat dihubungi' }
})
