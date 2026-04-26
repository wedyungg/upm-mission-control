export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const res = await fetch('https://api.fonnte.com/send', {
    method: 'POST',
    headers: {
      // ✅ BENAR: Langsung ambil dari config private, tanpa .public
      'Authorization': config.waToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // ✅ BENAR: Langsung ambil dari config private, tanpa .public
      target: config.waTarget,
      message: body.message,
      countryCode: '62',
    }),
  })

  return await res.json()
})