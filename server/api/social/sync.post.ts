// server/api/social/sync.post.ts
import fs from 'node:fs'
import path from 'node:path'
import {
  scrapeInstagram,
  scrapeYouTube,
  scrapeTikTok,
  scrapeLatestYouTubeComments,
} from '../../utils/socialScraper'

export default defineEventHandler(async () => {
  const filePath = path.resolve('./server/data/social_data.json')
  let currentData: any = { platforms: [], history: [], comments: [] }

  if (fs.existsSync(filePath)) {
    try {
      currentData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    } catch {}
  }

  // Jalankan scrape untuk 3 platform & komentar terbaru
  const [igData, ytData, ttData, scrapedComments] = await Promise.all([
    scrapeInstagram(),
    scrapeYouTube(),
    scrapeTikTok(),
    scrapeLatestYouTubeComments(),
  ])

  currentData.lastSyncedAt = new Date().toISOString()

  // Update metrik per platform
  currentData.platforms = currentData.platforms.map((p: any) => {
    if (p.platform === 'instagram' && igData.followers) {
      return { ...p, ...igData }
    }
    if (p.platform === 'youtube' && ytData.followers) {
      return { ...p, ...ytData }
    }
    if (p.platform === 'tiktok' && ttData.followers) {
      return { ...p, ...ttData }
    }
    return p
  })

  // Sinkronkan baris terakhir history (Jumadil Ula) dengan metrik terbaru
  if (Array.isArray(currentData.history) && currentData.history.length > 0) {
    const lastIdx = currentData.history.length - 1
    currentData.history[lastIdx] = {
      ...currentData.history[lastIdx],
      instagram: igData.followers || currentData.history[lastIdx].instagram,
      youtube: ytData.followers || currentData.history[lastIdx].youtube,
      tiktok: ttData.followers || currentData.history[lastIdx].tiktok,
    }
  }

  // Gabungkan komentar riil baru yang belum ada di daftar (berdasarkan ID atau authorHandle)
  if (Array.isArray(scrapedComments) && scrapedComments.length > 0) {
    const existingIds = new Set((currentData.comments || []).map((c: any) => String(c.id || '')))
    const existingAuthors = new Set((currentData.comments || []).map((c: any) => `${c.authorHandle}|${c.postUrl}`))
    for (const sc of scrapedComments) {
      const aKey = `${sc.authorHandle}|${sc.postUrl}`
      if (!existingIds.has(sc.id) && !existingAuthors.has(aKey)) {
        currentData.comments.push(sc)
        existingIds.add(sc.id)
        existingAuthors.add(aKey)
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2), 'utf8')
  return { success: true, data: currentData }
})
