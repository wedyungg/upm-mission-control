// server/api/wa-webhook.post.ts
// Webhook penerima pesan WhatsApp (Fonnte / WA Gateway)
// Hanya merespons jika di-mention '@upm' di grup WhatsApp

import { askGeminiFlash } from '../utils/gemini'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event).catch(() => ({}))

  const rawMessage = (body.message || body.text || '').trim()
  const fromTarget = body.from || body.target || config.waTarget
  const senderName = body.name || body.pushName || 'Kru'

  // 1. Filter: Jika TIDAK ada kata '@upm', abaikan pesan (diam seribu bahasa)
  if (!/@upm\b/i.test(rawMessage)) {
    return { status: 'ignored', reason: 'No @upm mention' }
  }

  // 2. Bersihkan teks mention untuk mendapatkan perintah sebenarnya
  const prompt = rawMessage.replace(/@upm/gi, '').trim()

  // Jika cuma mention '@upm' tanpa kalimat lanjutan
  if (!prompt) {
    const greeting = `Halo ${senderName}! 👋\nAda yang bisa @upm bantu untuk konten UPM Mathole' hari ini?\n\nContoh perintah:\n• _@upm buatkan draft konten dawuh tentang adab ilmu_\n• _@upm sudah berapa postingan yang dibikin?_\n• _@upm buatkan hook 3 detik untuk video tren santri_`
    await sendWaReply(fromTarget, greeting)
    return { status: 'replied', type: 'greeting' }
  }

  // 3. Cek apakah pengguna menanyakan status / rekap postingan
  const isAskingRecap = /(berapa|rekap|progres|jadwal|status|sudah bikin|konten tayang|posting)/i.test(prompt) &&
                        !/(buatkan|bikin|tuliskan|draft|naskah|ide|skrip)/i.test(prompt)

  let replyText = ''

  if (isAskingRecap) {
    replyText = await handleStatusQuery(senderName, config.public.supabaseUrl)
  } else {
    // 4. Perintah pembuatan konten / ide / konsultasi ➔ Serahkan ke Gemini Flash
    replyText = await askGeminiFlash(prompt)
  }

  // 5. Kirim balasan ke grup WhatsApp yang dituju melalui bot Baileys mandiri
  if (replyText && fromTarget) {
    await sendWaReply(fromTarget, replyText)
  }

  return { status: 'success', replied: true, reply: replyText }
})

// Helper pengirim pesan balasan ke bot Baileys lokal
async function sendWaReply(target: string, message: string) {
  try {
    await fetch('http://localhost:3001/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target,
        message,
      }),
    })
  } catch (err: any) {
    console.error('Gagal mengirim ke bot lokal Baileys:', err.message)
  }
}

// Helper rekap data dari Supabase
async function handleStatusQuery(senderName: string, supabaseUrl: string): Promise<string> {
  const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_X23l7Hab27PdcB2i8ceEoQ__l49f_6l'
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/tasks?select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    })

    if (!res.ok) throw new Error('Gagal mengambil data tasks')

    const tasks: any[] = await res.json()

    const now = new Date()
    const currentMonthTasks = tasks.filter(t => t.type === 'tim')

    const selesai = currentMonthTasks.filter(t => t.status === 'selesai').length
    const qc = currentMonthTasks.filter(t => t.status === 'qc').length
    const produksi = currentMonthTasks.filter(t => t.status === 'produksi').length
    const planning = currentMonthTasks.filter(t => t.status === 'planning').length

    return `📊 *[Laporan Progres Konten]*\n\nHalo ${senderName}, berikut rekap konten yang tercatat di dashboard saat ini:\n\n` +
           `✅ *Tayang/Selesai:* ${selesai} konten\n` +
           `🔍 *Menunggu Review (QC):* ${qc} konten\n` +
           `🎬 *Sedang Produksi:* ${produksi} konten\n` +
           `📝 *Tahap Rencana:* ${planning} konten\n\n` +
           `Target kita: *One Day One Post* (2 konten/pekan per PIC). Semangat semuanya! 💪`
  } catch (e: any) {
    return `Halo ${senderName}, maaf saat ini saya belum bisa membaca database konten: ${e.message}`
  }
}
