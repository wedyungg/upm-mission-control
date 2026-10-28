// server/utils/gemini.ts
// Helper pemanggil Google Gemini API dengan keahlian MASTER SKILL: Instagram Reels Master khusus UPM Mathole'

import https from 'node:https'

export const UPM_SYSTEM_PROMPT = `
Kamu adalah @upm, asisten AI resmi tim Unit Pengelolaan Media (UPM) Mathole' — Perguruan Islam Mathali'ul Falah Kajen Pati.
Anggota tim UPM: Ziyan Firdaus (PIC Dawuh & Keagamaan), Vega Faisal Amri (PIC Informasi Kemadrasahan), Moh. Syihabuddin / Aab (PIC Tren Sosmed), Ainur Rofiq, dan Faridu Asrih.

ATURAN UTAMA PANJANG & GAYA JAWABAN (WAJIB DITAATI):
1. JIKA HANYA SAPAAN, PERTANYAAN UMUM, DISKUSI SINGKAT, ATAU TANYA IDENTITAS/CARA PAKAI:
   - Jawab dengan SANGAT PENDEK, sopan, hangat, dan persuasif (cukup 2–4 kalimat singkat, maksimal 1 paragraf pendek).
   - JANGAN menyusun naskah video atau daftar panjang jika tidak diminta membuat konten!
2. JIKA DIMINTA MEMBUAT IDE KONTEN, DRAFT, NASKAH, HOOK, ATAU CAPTION:
   - Gunakan keahlian master skill INSTAGRAM REELS MASTER (Vyral Content + Ootto Virality) secara utuh dan terstruktur:
     a) *Hook Studio (Detik 0.0 - 3.0)*: Tiga Lapisan (Aksi visual frame 0 tanpa intro statis, kalimat pertama <=0.5 detik tanpa basa-basi klise, dan teks layar mute-proof di tengah layar).
     b) *Naskah Beat-by-Beat (20 - 35 detik)*: Ganti visual tiap 2-3 detik. Gunakan daftar poin per rentang detik (bukan tabel Markdown):
        • *[00:00 - 00:03] (Hook)* — Visual, Teks Layar, Voiceover
        • *[00:03 - 00:10] (Eskalasi)* — Visual, Teks Layar, Voiceover
        • *[00:10 - 00:22] (Inti / Isi)* — Visual, Teks Layar, Voiceover
        • *[00:22 - 00:30] (Payoff & CTA)* — Visual, Teks Layar, Voiceover
     c) *Caption SEO & Sinyal Mosseri*: Baris pertama memikat sebelum '...more', kata kunci SEO natural, CTA pemicu Share (Sends) atau Save, dan 3–5 hashtag relevan (#mathaliulfalah #santrikajen dll).

KARAKTER RUBRIK UPM MATHOLE':
- Dawuh & Keagamaan (PIC: Ziyan): Santun, takzim, tawadhu', ilmiah, sarat nilai pesantren & kitab kuning.
- Informasi Kemadrasahan (PIC: Vega): Jelas, informatif, ramah wali santri & alumni.
- Tren Sosmed (PIC: Aab): Akrab, asyik, santai, relate kehidupan santri Kajen, tetap beradab.

ATURAN FORMAT WHATSAPP:
- Gunakan satu bintang *teks tebal* untuk menebalkan teks (bukan dua bintang **teks**).
`

function requestGeminiIPv4(apiKey: string, model: string, prompt: string, systemInstruction: string, useThinkingZero: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    const generationConfig: Record<string, any> = {
      temperature: 0.7,
      maxOutputTokens: 8192,
    }
    if (useThinkingZero) {
      generationConfig.thinkingConfig = { thinkingBudget: 0 }
    }

    const body = JSON.stringify({
      system_instruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    })

    const req = https.request(
      {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
        method: 'POST',
        family: 4,
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let raw = ''
        res.on('data', (chunk) => (raw += chunk))
        res.on('end', () => {
          if (res.statusCode !== 200) {
            return reject(new Error(`HTTP ${res.statusCode}`))
          }
          try {
            const data = JSON.parse(raw)
            const parts = data?.candidates?.[0]?.content?.parts || []
            const fullText = parts
              .filter((p: any) => !p.thought && typeof p.text === 'string')
              .map((p: any) => p.text)
              .join('')
              .trim()

            if (!fullText) return reject(new Error('Empty response'))
            resolve(
              fullText
                .replace(/\*\*([^*]+)\*\*/g, '*$1*')
                .replace(/^#{1,4}\s+(.+)$/gm, '*$1*')
                .trim()
            )
          } catch (e) {
            reject(e)
          }
        })
      }
    )

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Timeout 15s'))
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

export async function askGeminiFlash(prompt: string, customSystemPrompt?: string): Promise<string> {
  const config = useRuntimeConfig()
  const apiKey = (config.geminiApiKey as string) || (process.env.GEMINI_API_KEY as string) || ''

  if (!apiKey) {
    return 'Halo! Kunci API Gemini belum dipasang di sistem (GEMINI_API_KEY).'
  }

  const systemInstruction = customSystemPrompt || UPM_SYSTEM_PROMPT
  const candidates = [
    { model: 'gemini-3.1-flash-lite', thinkingZero: true },
    { model: 'gemini-3.5-flash-lite', thinkingZero: false },
    { model: 'gemini-3.5-flash', thinkingZero: true },
    { model: 'gemini-3.6-flash', thinkingZero: true },
  ]

  for (const item of candidates) {
    try {
      return await requestGeminiIPv4(apiKey, item.model, prompt, systemInstruction, item.thinkingZero)
    } catch (e: any) {
      console.error(`Error calling ${item.model}:`, e.message)
    }
  }

  return 'Maaf, sambungan ke AI Gemini sedang padat. Silakan coba kembali sesaat lagi.'
}
