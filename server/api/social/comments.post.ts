// server/api/social/comments.post.ts
import fs from 'node:fs'
import path from 'node:path'
import { askGeminiFlash } from '../../utils/gemini'

const DEFAULT_URLS: Record<string, string> = {
  instagram: 'https://www.instagram.com/mathaliulfalahofficial/',
  youtube: 'https://www.youtube.com/@mathaliulfalahofficial',
  tiktok: 'https://www.tiktok.com/@mathaliulfalah',
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}))
  const filePath = path.resolve('./server/data/social_data.json')
  let currentData: any = { platforms: [], history: [], comments: [] }

  if (fs.existsSync(filePath)) {
    try {
      currentData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    } catch {}
  }

  const action = body.action || 'add'

  // 1. Tambah komentar baru (manual atau dari scraper)
  if (action === 'add') {
    const { platform, authorName, authorHandle, commentText, postUrl } = body

    if (!commentText) {
      throw createError({ statusCode: 400, message: 'Teks komentar wajib diisi' })
    }

    const pf = platform || 'instagram'
    const targetUrl = (postUrl && String(postUrl).trim()) || DEFAULT_URLS[pf] || DEFAULT_URLS.instagram

    // Klasifikasikan komentar menggunakan AI Gemini
    const classifyPrompt = `
Klasifikasikan komentar media sosial berikut ke dalam SALAH SATU kategori:
- "madrasah" (jika bertanya informasi akademik madrasah, ekstrakurikuler, pendaftaran santri baru, biaya/sewa/kontak, kurikulum, sejarah/masyayikh Mathole', atau layanan wali santri)
- "apresiasi" (jika sekadar memuji video bagus, masyaAllah, doa umum, semangat min, atau emoji)
- "umum" (jika komentar santai, bercanda, mencari anaknya/temannya di video, atau di luar info resmi madrasah)

Komentar: "${commentText}"

Jawab HANYA 1 kata: "madrasah" atau "apresiasi" atau "umum".
`
    let category = 'umum'
    try {
      const catRes = await askGeminiFlash(classifyPrompt)
      if (/madrasah/i.test(catRes)) category = 'madrasah'
      else if (/apresiasi/i.test(catRes)) category = 'apresiasi'
    } catch {}

    const isImportant = category === 'madrasah'

    // Buat draf balasan AI jika penting
    let aiDraftReply = ''
    if (isImportant) {
      const draftPrompt = `
Tuliskan 1 draf balasan resmi, santun, takzim, dan informatif ala pesantren Perguruan Islam Mathali'ul Falah (Mathole' Kajen) untuk komentar penonton berikut:
Komentar: "${commentText}"

Aturan:
- Awali dengan salam yang hangat ("Assalamu'alaikum..." atau "Wa'alaikumsalam...")
- Jawab langsung intinya dengan jelas dan ramah.
- Cukup 2–3 kalimat padat.
`
      try {
        aiDraftReply = await askGeminiFlash(draftPrompt)
      } catch {}
    }

    const newComment = {
      id: `c-${Date.now()}`,
      platform: pf,
      authorName: authorName || 'Penonton',
      authorHandle: authorHandle || '',
      commentText,
      postUrl: targetUrl,
      category,
      isImportant,
      status: 'perlu_respon',
      createdAt: new Date().toISOString(),
      aiDraftReply,
    }

    currentData.comments.unshift(newComment)
    fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2), 'utf8')

    // Jika komentar penting (info madrasah), kirim notifikasi ke grup WhatsApp UPM!
    if (isImportant) {
      try {
        const platformName = pf === 'youtube' ? 'YouTube' : pf === 'tiktok' ? 'TikTok' : 'Instagram'
        const waMessage =
          `🔔 *Ada komentar yang perlu ditanggapi di ${platformName}, mohon untuk segera direspon/ditindaklanjuti:*\n\n` +
          `👤 *Penanya:* ${authorName || 'Penonton'} (${authorHandle || '-'})\n` +
          `💬 *Komentar:* _"${commentText}"_\n\n` +
          `💡 *Rekomendasi Balasan AI:*\n${aiDraftReply}\n\n` +
          `🔗 *Lihat Konten:* ${targetUrl}`

        await fetch('http://localhost:3001/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: waMessage }),
        })
      } catch (err: any) {
        console.error('Gagal kirim notif komentar ke WA:', err.message)
      }
    }

    return { success: true, comment: newComment }
  }

  // 2. Tandai selesai / ubah status
  if (action === 'resolve') {
    const { id, replyText } = body
    currentData.comments = currentData.comments.map((c: any) => {
      if (c.id === id) {
        return {
          ...c,
          status: 'selesai',
          respondedAt: new Date().toISOString(),
          finalReply: replyText || c.aiDraftReply,
        }
      }
      return c
    })
    fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2), 'utf8')
    return { success: true }
  }

  // 3. Generate ulang saran balasan AI
  if (action === 'generate-reply') {
    const { commentText } = body
    const draftPrompt = `
Tuliskan 1 draf balasan resmi, santun, takzim, dan informatif khas tim media Perguruan Islam Mathali'ul Falah (Mathole' Kajen) untuk membalas komentar ini:
Komentar: "${commentText}"
Cukup 2-3 kalimat padat.
`
    const reply = await askGeminiFlash(draftPrompt)
    return { success: true, reply }
  }

  return { success: false, message: 'Action tidak dikenal' }
})
