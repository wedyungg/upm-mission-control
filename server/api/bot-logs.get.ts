// server/api/bot-logs.get.ts
// Mengambil log live dari bot Baileys di port 3001

export default defineEventHandler(async () => {
  try {
    const res = await fetch('http://localhost:3001/logs')
    if (!res.ok) {
      return { success: false, message: 'Bot belum aktif' }
    }
    const data = await res.json()
    return data
  } catch (err: any) {
    return {
      success: false,
      message: `Tidak dapat menghubungi bot lokal: ${err.message}`
    }
  }
})
