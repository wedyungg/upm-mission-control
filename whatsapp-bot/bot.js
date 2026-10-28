// whatsapp-bot/bot.js
// Bot WhatsApp AI Mandiri UPM Mathole' (Perguruan Islam Mathali'ul Falah)
// Fitur: Smart Intent Brain + Dual-Memory (memory.json) + Live Supabase Context + Instagram Reels Master
// Khusus Grup: "Unit Pengelolaan Media" (6288228996157-1627563104@g.us)

import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys'
import pino from 'pino'
import qrcodeTerminal from 'qrcode-terminal'
import QRCode from 'qrcode'
import fs from 'fs'
import path from 'path'
import http from 'http'
import https from 'https'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zfngjgcuznqixulfrhec.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_X23l7Hab27PdcB2i8ceEoQ__l49f_6l'

// Kunci khusus hanya untuk Grup "Unit Pengelolaan Media"
const ALLOWED_GROUP_JID = process.env.TARGET_GROUP_ID || '6288228996157-1627563104@g.us'
const MEMORY_FILE = path.resolve('./memory.json')
const MAX_HISTORY_MESSAGES = 16 // 8 pasang tanya-jawab terakhir secara utuh
const MAX_PAST_TOPICS = 40 // 40 riwayat topik konten yang pernah dibahas

// ============================================================================
// 1. SISTEM MEMORI PERCAKAPAN & RIWAYAT TOPIK (memory.json)
// ============================================================================
function loadMemory() {
  try {
    if (fs.existsSync(MEMORY_FILE)) {
      const raw = fs.readFileSync(MEMORY_FILE, 'utf8')
      const parsed = JSON.parse(raw)
      return {
        pastTopics: Array.isArray(parsed.pastTopics) ? parsed.pastTopics : [],
        history: Array.isArray(parsed.history) ? parsed.history : [],
      }
    }
  } catch (err) {
    console.error('Gagal membaca memory.json:', err.message)
  }
  return { pastTopics: [], history: [] }
}

function saveMemory(memory) {
  try {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2), 'utf8')
  } catch (err) {
    console.error('Gagal menyimpan memory.json:', err.message)
  }
}

function extractTopicIfContentRequest(prompt) {
  const isContentRelated =
    /(buatkan|bikin|tuliskan|ide|draft|draf|naskah|skrip|script|konten|hook|caption|dalil|revisi|lanjut|bahas|topik|tema|video|reels)/i.test(
      prompt
    )
  if (!isContentRelated || prompt.length < 8) return null

  const cleaned = prompt
    .replace(/^(tolong\s+|coba\s+|bisa\s+nggak\s+|minta\s+|buatkan\s+|bikinin\s+|bikin\s+|tuliskan\s+|kasih\s+)/i, '')
    .trim()
  return cleaned.length > 90 ? cleaned.slice(0, 90) + '...' : cleaned
}

function recordInteraction(senderName, userPrompt, botReply) {
  const memory = loadMemory()
  const now = new Date()
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
  const dateTimeStr = `${now.toLocaleDateString('id-ID')} ${timeStr}`

  // Catat ke daftar riwayat topik jika membahas konten
  const detectedTopic = extractTopicIfContentRequest(userPrompt)
  if (detectedTopic) {
    const alreadyExists = memory.pastTopics.some(
      (t) => t.topic.toLowerCase() === detectedTopic.toLowerCase()
    )
    if (!alreadyExists) {
      memory.pastTopics.push({
        date: dateTimeStr,
        sender: senderName,
        topic: detectedTopic,
      })
      if (memory.pastTopics.length > MAX_PAST_TOPICS) {
        memory.pastTopics = memory.pastTopics.slice(-MAX_PAST_TOPICS)
      }
    }
  }

  // Simpan percakapan ke sliding window history
  memory.history.push({
    role: 'user',
    sender: senderName,
    time: dateTimeStr,
    text: `[${senderName} - ${timeStr}]: ${userPrompt}`,
  })

  // Simpan jawaban bot (dipotong maks 1200 karakter di memori agar hemat token namun konteks tetap utuh)
  const compactReply =
    botReply.length > 1200 ? botReply.slice(0, 1200) + '\n...(naskah lengkap telah dikirim)' : botReply

  memory.history.push({
    role: 'model',
    time: dateTimeStr,
    text: compactReply,
  })

  if (memory.history.length > MAX_HISTORY_MESSAGES) {
    memory.history = memory.history.slice(-MAX_HISTORY_MESSAGES)
  }

  saveMemory(memory)
}

// ============================================================================
// 2. SNAPSHOT DATA REAL-TIME SUPABASE (DENGAN CACHE 20 DETIK)
// ============================================================================
let cachedDashboardText = ''
let lastDashboardFetch = 0

async function getDashboardSnapshot() {
  const now = Date.now()
  if (cachedDashboardText && now - lastDashboardFetch < 20000) {
    return cachedDashboardText
  }

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3500)

    const res = await fetch(`${SUPABASE_URL}/rest/v1/tasks?select=*&order=created_at.desc`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      signal: controller.signal,
    })
    clearTimeout(timer)

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const tasks = await res.json()
    const timTasks = tasks.filter((t) => t.type === 'tim')

    const selesai = timTasks.filter((t) => t.status === 'selesai').length
    const qc = timTasks.filter((t) => t.status === 'qc').length
    const produksi = timTasks.filter((t) => t.status === 'produksi').length
    const planning = timTasks.filter((t) => t.status === 'planning').length

    const recentList = timTasks
      .slice(0, 8)
      .map((t) => `- [${(t.status || 'planning').toUpperCase()}] "${t.title}" (PIC: ${t.assigned_to || '-'}, Kategori: ${t.category || '-'})`)
      .join('\n')

    cachedDashboardText =
      `Total Tugas Tim: ${timTasks.length} konten | ✅ Tayang/Selesai: ${selesai} | 🔍 Review QC: ${qc} | 🎬 Sedang Produksi: ${produksi} | 📝 Tahap Rencana: ${planning}\n` +
      `Daftar Konten Terbaru di Web Dashboard:\n${recentList || '(Belum ada daftar tugas)'}`
    lastDashboardFetch = now
    return cachedDashboardText
  } catch (err) {
    return cachedDashboardText || 'Data dashboard sedang tidak dapat dimuat saat ini.'
  }
}

// ============================================================================
// 3. OTAK PEMILAH INTENT & SYSTEM PROMPT DINAMIS
// ============================================================================
function buildSystemPrompt(memory, dashboardSnapshot) {
  const topicsList =
    memory.pastTopics.length > 0
      ? memory.pastTopics
          .map((t, idx) => `${idx + 1}. "${t.topic}" (dibahas bersama ${t.sender} pada ${t.date})`)
          .join('\n')
      : '(Belum ada topik konten yang tercatat)'

  return `
Kamu adalah @upm, rekan kerja & asisten AI resmi tim Unit Pengelolaan Media (UPM) Mathole' — Perguruan Islam Mathali'ul Falah Kajen Pati.
Anggota tim UPM:
- Ziyan Firdaus (PIC Rubrik Dawuh & Keagamaan: mutiara dawuh masyayikh, fiqih, dalil/bahtsul masail, adab, kitab kuning)
- Vega Faisal Amri (PIC Rubrik Informasi Kemadrasahan: liputan kegiatan madrasah, prestasi santri, agenda pesantren)
- Moh. Syihabuddin / Aab (PIC Rubrik Tren Sosmed: konten relate santri Kajen, sketsa, vox pop, tren audio santun)
- Ainur Rofiq & Faridu Asrih (Kru produksi & kreatif UPM)

====================================================================
DATA REAL-TIME DASHBOARD WEB UPM SAAT INI:
${dashboardSnapshot}
====================================================================

RIWAYAT TOPIK KONTEN YANG PERNAH KITA BAHAS DI GRUP WA INI:
${topicsList}
====================================================================

CARA BERPIKIR & MEMILAH RESPON (SMART INTENT ROUTING — WAJIB DITAATI):
Analisis dulu maksud (intent) dari pesan anggota tim yang masuk, lalu pilih SALAH SATU gaya respon berikut:

1. KATEGORI A — SAPAAN, BASA-BASI PANJANG, CURHAT TIM, ATAU PERTANYAAN RINGAN:
   (Contoh: menyapa panjang lebar, tanya kabar, bilang lagi capek/bingung cari ide, tanya siapa kamu/cara pakai, atau obrolan santai yang BELUM meminta pembuatan draf konten spesifik)
   -> CARA JAWAB:
      - Jawab SANGAT SINGKAT, hangat, sopan, dan persuasif (cukup 2–4 kalimat pendek dalam 1 paragraf).
      - Sapa nama pengirimnya dengan akrab.
      - Jika relevan, kaitkan secara luwes dengan obrolan/topik sebelumnya (misal: "Oiya, gimana kelanjutan draf [topik sebelumnya] yang kita bahas tadi? Mau dilanjut atau cari bahasan baru?").
      - DILARANG mengeluarkan template Hook / Naskah / Caption panjang jika hanya disapa atau diajak ngobrol ringan!

2. KATEGORI B — TANYA LAPORAN, PROGRES, ATAU DATA DASHBOARD WEB:
   (Contoh: tanya sudah berapa postingan yang dibikin, siapa yang lagi produksi, konten apa yang di QC, atau rekap kerjaan)
   -> CARA JAWAB:
      - Jawab dengan ringkas, rapi, sopan, dan komunikatif berdasarkan "DATA REAL-TIME DASHBOARD WEB UPM" di atas.
      - Sebutkan angka progresnya dan judul konten terbaru bila ditanya detail, lalu beri kalimat penyemangat singkat (*One Day One Post*).

3. KATEGORI C — DISKUSI LANJUTAN / REVISI DARI JAWABAN SEBELUMNYA:
   (Contoh: "kalau hook-nya diganti lebih santai gimana?", "poin kedua tadi kurang pas", "coba kembangkan ide yang tadi")
   -> CARA JAWAB:
      - Nyambung langsung dengan obrolan sebelumnya (contoh: "Siap, menyambung bahasan kita tadi soal [topik]...").
      - Fokus berikan bagian yang diminta direvisi/dikembangkan saja secara tajam tanpa harus mengulang seluruh teks dari nol kecuali diminta.

4. KATEGORI D — DIMINTA MEMBUAT IDE KONTEN, DRAFT VIDEO, NASKAH, HOOK, ATAU CAPTION BARU:
   (Contoh: minta dibuatkan konten, ide video, dalil untuk konten, naskah Reels/TikTok, hook, atau caption)
   -> CARA JAWAB:
      - Jika topiknya berhubungan dengan topik yang pernah dibahas di "RIWAYAT TOPIK KONTEN", sebutkan sekilas di kalimat pembuka (misal: "Menarik! Ini bisa melengkapi saran konten kita sebelumnya tentang [topik lama]...").
      - Terapkan standar penuh master skill INSTAGRAM REELS MASTER (Vyral Content + Ootto Virality):
        1) *Hook Studio (Detik 0.0 - 3.0)*: Tiga Lapisan (Aksi visual nyata di frame 0 tanpa intro statis, kalimat pertama <=0.5 detik tanpa basa-basi klise, dan teks layar mute-proof di tengah layar).
        2) *Naskah Beat-by-Beat (20 - 35 detik)*: Ganti visual tiap 2-3 detik. Gunakan daftar poin per rentang detik (JANGAN gunakan tabel Markdown |---| karena berantakan di HP):
           • *[00:00 - 00:03] (Hook)* — Visual, Teks Layar, Voiceover
           • *[00:03 - 00:10] (Eskalasi)* — Visual, Teks Layar, Voiceover
           • *[00:10 - 00:22] (Inti / Dalil / Solusi)* — Visual, Teks Layar, Voiceover
           • *[00:22 - 00:30] (Payoff & CTA)* — Visual, Teks Layar, Voiceover
        3) *Caption SEO & Sinyal Mosseri*: Baris pertama memikat sebelum '...more', kata kunci SEO natural, CTA pemicu Share (Sends) atau Save, dan 3–5 hashtag relevan (#mathaliulfalah #santrikajen dll).

ATURAN FORMAT WHATSAPP:
- Gunakan format asli WhatsApp: satu bintang *teks tebal* untuk menebalkan teks (JANGAN gunakan dua bintang **teks**).
- Pastikan kalimat selalu tuntas, luwes, tidak kaku seperti robot, dan menjunjung adab pesantren Mathole'.
`
}

function formatForWhatsApp(text) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '*$1*')
    .replace(/^#{1,4}\s+(.+)$/gm, '*$1*')
    .trim()
}

function requestGeminiIPv4(model, systemPrompt, contents, useThinkingZero) {
  return new Promise((resolve, reject) => {
    const generationConfig = {
      temperature: 0.7,
      maxOutputTokens: 8192,
    }
    if (useThinkingZero) {
      generationConfig.thinkingConfig = { thinkingBudget: 0 }
    }

    const body = JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents,
      generationConfig,
    })

    const req = https.request(
      {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
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
            return reject(new Error(`HTTP ${res.statusCode}: ${raw.slice(0, 150)}`))
          }
          try {
            const data = JSON.parse(raw)
            const parts = data?.candidates?.[0]?.content?.parts || []
            const fullText = parts
              .filter((p) => !p.thought && typeof p.text === 'string')
              .map((p) => p.text)
              .join('')
              .trim()

            if (!fullText) {
              return reject(new Error('Respons kosong dari model'))
            }
            resolve(formatForWhatsApp(fullText))
          } catch (err) {
            reject(err)
          }
        })
      }
    )

    req.on('timeout', () => {
      req.destroy()
      reject(new Error(`Timeout 15s pada model ${model}`))
    })

    req.on('error', (err) => reject(err))
    req.write(body)
    req.end()
  })
}

async function callSmartBrain(senderName, userPrompt) {
  if (!GEMINI_API_KEY) {
    return 'Kunci API Gemini belum diatur. Silakan atur GEMINI_API_KEY terlebih dahulu.'
  }

  const memory = loadMemory()
  const dashboardSnapshot = await getDashboardSnapshot()
  const systemPrompt = buildSystemPrompt(memory, dashboardSnapshot)

  const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })

  // Susun multi-turn conversation history agar AI nyambung dengan obrolan sebelumnya
  const contents = memory.history.map((item) => ({
    role: item.role === 'model' ? 'model' : 'user',
    parts: [{ text: item.text }],
  }))

  // Pastikan urutan role valid (dimulai dari 'user' dan bergantian)
  const sanitizedContents = []
  for (const msg of contents) {
    if (sanitizedContents.length === 0 && msg.role !== 'user') continue
    const prev = sanitizedContents[sanitizedContents.length - 1]
    if (prev && prev.role === msg.role) {
      prev.parts[0].text += '\n\n' + msg.parts[0].text
    } else {
      sanitizedContents.push({ role: msg.role, parts: [{ text: msg.parts[0].text }] })
    }
  }

  const currentUserMessage = `[${senderName} - ${nowTime}]: ${userPrompt || 'Halo @upm'}`
  if (sanitizedContents.length > 0 && sanitizedContents[sanitizedContents.length - 1].role === 'user') {
    sanitizedContents[sanitizedContents.length - 1].parts[0].text += '\n\n' + currentUserMessage
  } else {
    sanitizedContents.push({
      role: 'user',
      parts: [{ text: currentUserMessage }],
    })
  }

  const candidates = [
    { model: 'gemini-3.1-flash-lite', thinkingZero: true },
    { model: 'gemini-3.5-flash-lite', thinkingZero: false },
    { model: 'gemini-3.5-flash', thinkingZero: true },
    { model: 'gemini-3.6-flash', thinkingZero: true },
  ]

  for (const item of candidates) {
    try {
      const t0 = Date.now()
      const reply = await requestGeminiIPv4(item.model, systemPrompt, sanitizedContents, item.thinkingZero)
      logActivity(
        `🧠 [Smart Brain] ${item.model} selesai dalam ${((Date.now() - t0) / 1000).toFixed(1)}s (${reply.length} karakter | Memori: ${memory.history.length / 2} turn, ${memory.pastTopics.length} topik)`
      )
      recordInteraction(senderName, userPrompt || 'Halo @upm', reply)
      return reply
    } catch (err) {
      logActivity(`⚠️ [Fallback AI] ${item.model} gagal: ${err.message}`)
    }
  }

  return 'Maaf, koneksi ke otak AI sedang padat. Silakan kirim ulang perintahnya sesaat lagi ya.'
}

// ============================================================================
// 4. LOG AKTIVITAS & KONEKSI WHATSAPP BAILEYS
// ============================================================================
const activityLogs = []
function logActivity(text) {
  const time = new Date().toLocaleTimeString('id-ID', { hour12: false })
  const entry = `[${time}] ${text}`
  console.log(entry)
  activityLogs.unshift(entry)
  if (activityLogs.length > 80) activityLogs.pop()
}

let currentSock = null

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: state,
    browser: ['UPM Mathole Mission Control', 'Chrome', '1.0.0'],
  })

  currentSock = sock

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log('\n======================================================')
      console.log('📌 SCAN QR CODE INI DENGAN WHATSAPP DI HP ANDA:')
      console.log('Buka WA > Perangkat Tertaut > Tautkan Perangkat')
      console.log('======================================================\n')
      qrcodeTerminal.generate(qr, { small: true })

      try {
        const publicDir = path.resolve('../public')
        if (fs.existsSync(publicDir)) {
          QRCode.toFile(path.join(publicDir, 'qr.png'), qr, { width: 400 })
        }
      } catch (e) {
        console.error('Gagal membuat file QR browser:', e.message)
      }
    }

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      logActivity(`⚠️ Koneksi terputus. Mencoba menghubungkan kembali... (${shouldReconnect})`)
      if (shouldReconnect) {
        startBot()
      } else {
        logActivity('❌ Akun logout dari WhatsApp. Jalankan ulang bot untuk scan QR baru.')
      }
    } else if (connection === 'open') {
      const mem = loadMemory()
      logActivity(
        `✅ TERHUBUNG! Grup: "Unit Pengelolaan Media" (${ALLOWED_GROUP_JID}) | Memori aktif: ${mem.pastTopics.length} topik, ${mem.history.length} pesan.`
      )
    }
  })

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return

    for (const msg of messages) {
      if (msg.key.fromMe) continue

      const remoteJid = msg.key.remoteJid

      // 1. FILTER GRUP: Hanya merespons di grup "Unit Pengelolaan Media"
      if (remoteJid !== ALLOWED_GROUP_JID) {
        continue
      }

      const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption ||
        ''

      // 2. FILTER MENTION: Hanya merespons jika ada kata '@upm'
      if (!/@upm\b/i.test(text)) {
        continue
      }

      const senderName = msg.pushName || 'Kru'
      logActivity(`📩 [Mention Grup UPM] Dari: ${senderName}: "${text}"`)

      await sock.sendPresenceUpdate('composing', remoteJid).catch(() => {})

      const cleanPrompt = text.replace(/@upm/gi, '').trim()

      try {
        let reply = ''

        // Perintah khusus reset memori obrolan jika dibutuhkan kru
        if (/^(reset\s+memori|hapus\s+ingatan|clear\s+memory)$/i.test(cleanPrompt)) {
          const currentMem = loadMemory()
          currentMem.history = []
          saveMemory(currentMem)
          reply = `Siap ${senderName}! 🧹 Riwayat percakapan pendek sudah disegarkan, namun catatan daftar topik konten kita sebelumnya tetap tersimpan aman. Mau bahas apa kita sekarang?`
        } else {
          // Seluruh pesan (sapaan pendek/panjang, laporan, revisi, atau buat konten) diproses cerdas oleh Smart Brain
          reply = await callSmartBrain(senderName, cleanPrompt)
        }

        await sock.sendPresenceUpdate('paused', remoteJid).catch(() => {})

        if (reply) {
          try {
            await sock.sendMessage(remoteJid, { text: reply }, { quoted: msg })
          } catch (sendErr) {
            await sock.sendMessage(remoteJid, { text: reply })
          }
          logActivity(`📤 [Balasan Terkirim] ke Grup UPM (${reply.length} karakter)`)
        }
      } catch (err) {
        logActivity(`❌ [Gagal Balas] Error: ${err.message}`)
      }
    }
  })
}

const HTTP_PORT = process.env.BOT_HTTP_PORT || 3001
const httpServer = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.url === '/logs' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ success: true, logs: activityLogs }))
  }

  if (req.url === '/memory' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ success: true, memory: loadMemory() }))
  }

  if (req.url === '/status' && req.method === 'GET') {
    const mem = loadMemory()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(
      JSON.stringify({
        success: true,
        connected: !!currentSock,
        allowedGroup: ALLOWED_GROUP_JID,
        topicsRemembered: mem.pastTopics.length,
        historyTurns: mem.history.length,
        logsCount: activityLogs.length,
        lastLog: activityLogs[0] || null,
      })
    )
  }

  if (req.url === '/groups' && req.method === 'GET') {
    if (!currentSock) {
      res.writeHead(503, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ success: false, message: 'WhatsApp belum terhubung' }))
    }
    try {
      const groups = await currentSock.groupFetchAllParticipating()
      const list = Object.values(groups).map((g) => ({
        id: g.id,
        subject: g.subject,
        participantsCount: g.participants?.length || 0,
      }))
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ success: true, groups: list }))
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ success: false, error: err.message }))
    }
  }

  if (req.url === '/send' && req.method === 'POST') {
    if (!currentSock) {
      res.writeHead(503, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ success: false, message: 'WhatsApp belum terhubung' }))
    }
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}')
        const target = ALLOWED_GROUP_JID
        const message = data.message
        if (!message) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          return res.end(JSON.stringify({ success: false, error: 'Pesan (message) wajib diisi' }))
        }

        const sendPromise = currentSock.sendMessage(target, { text: message })
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Kirim pesan timeout (8 detik). Pastikan bot sudah bergabung di grup target.')),
            8000
          )
        )

        await Promise.race([sendPromise, timeoutPromise])
        logActivity(`📤 [Notifikasi Terkirim ke Grup UPM] "${message.slice(0, 50)}..."`)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ success: true, target }))
      } catch (err) {
        console.error('Gagal mengirim pesan via HTTP:', err.message)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ success: false, error: err.message }))
      }
    })
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Endpoint tidak ditemukan' }))
})

httpServer.listen(HTTP_PORT, () => {
  console.log(`🚀 [API Bot Aktif] Siap menerima notifikasi web di http://localhost:${HTTP_PORT}/send`)
})

startBot().catch(console.error)
