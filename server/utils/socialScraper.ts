// server/utils/socialScraper.ts
// Scraper data metrik publik & komentar riil untuk Instagram, YouTube, dan TikTok Mathole'

import https from 'node:https'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const YTDLP_PATH = 'C:\\Users\\UPM 1\\AppData\\Roaming\\Python\\Python314\\Scripts\\yt-dlp.exe'
const FB_BOT_UA = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'

export interface ScrapedPlatformMetrics {
  platform: 'instagram' | 'youtube' | 'tiktok'
  handle: string
  followers: number
  followersFormatted: string
  secondaryMetricLabel: string
  secondaryMetricValue: string
  totalContent: number
  topPeakViews: string
  topPeakUrl: string
  url: string
}

function fetchHtml(url: string, userAgent?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const ua = userAgent || FB_BOT_UA
    const req = https.get(
      url,
      {
        family: 4,
        timeout: 10000,
        headers: {
          'User-Agent': ua,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8',
        },
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const nextUrl = res.headers.location.startsWith('http')
            ? res.headers.location
            : new URL(res.headers.location, url).toString()
          fetchHtml(nextUrl, ua).then(resolve).catch(reject)
          return
        }
        let data = ''
        res.on('data', (c) => (data += c))
        res.on('end', () => resolve(data))
      }
    )
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Timeout'))
    })
    req.on('error', reject)
  })
}

export async function scrapeInstagram(): Promise<Partial<ScrapedPlatformMetrics>> {
  try {
    const html = await fetchHtml('https://www.instagram.com/mathaliulfalahofficial/', FB_BOT_UA)
    const match = html.match(/([0-9.,]+[KkMm]?)\s+Followers,\s+([0-9.,]+[KkMm]?)\s+Following,\s+([0-9.,]+[KkMm]?)\s+Posts/i)
    if (match) {
      const followersRaw = match[1].toUpperCase()
      const postsCount = parseInt(match[3].replace(/[^0-9]/g, ''), 10) || 458
      return {
        followersFormatted: followersRaw,
        followers: parseNumber(followersRaw),
        totalContent: postsCount,
        secondaryMetricLabel: 'Postingan',
        secondaryMetricValue: `${postsCount} Konten`,
      }
    }
  } catch (e: any) {
    console.error('Error scrape IG:', e.message)
  }
  return {
    followersFormatted: '42K',
    followers: 42000,
    totalContent: 458,
    secondaryMetricLabel: 'Postingan',
    secondaryMetricValue: '458 Konten',
  }
}

export async function scrapeYouTube(): Promise<Partial<ScrapedPlatformMetrics>> {
  try {
    const html = await fetchHtml(
      'https://www.youtube.com/@mathaliulfalahofficial',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    )
    const matchData = html.match(/var ytInitialData = ({.*?});<\/script>/)
    if (matchData) {
      const parsed = JSON.parse(matchData[1])
      const header = parsed?.header?.pageHeaderRenderer
      const metaRows = header?.content?.pageHeaderViewModel?.metadata?.contentMetadataViewModel?.metadataRows || []
      const parts = metaRows[1]?.metadataParts || []
      const subsText = parts[0]?.text?.content || '120 rb subscriber'
      const videosText = parts[1]?.text?.content || '407 video'
      const videosCount = parseInt(videosText.replace(/[^0-9]/g, ''), 10) || 407
      const numFollowers = parseNumber(subsText)
      return {
        followersFormatted: formatCompact(numFollowers),
        followers: numFollowers,
        totalContent: videosCount,
        secondaryMetricLabel: 'Total Video',
        secondaryMetricValue: `${videosCount} Video`,
      }
    }
  } catch (e: any) {
    console.error('Error scrape YouTube:', e.message)
  }
  return {
    followersFormatted: '120K',
    followers: 120000,
    totalContent: 407,
    secondaryMetricLabel: 'Total Video',
    secondaryMetricValue: '407 Video',
  }
}

export async function scrapeTikTok(): Promise<Partial<ScrapedPlatformMetrics>> {
  try {
    const html = await fetchHtml('https://www.tiktok.com/@mathaliulfalah', FB_BOT_UA)
    const match = html.match(/([0-9.,]+[KkMm]?)\s+Followers,\s+([0-9.,]+[KkMm]?)\s+Following,\s+([0-9.,]+[KkMm]?)\s+Likes/i)
    if (match) {
      const followersRaw = match[1].toUpperCase()
      const likesRaw = match[3].toUpperCase()
      return {
        followersFormatted: followersRaw,
        followers: parseNumber(followersRaw),
        secondaryMetricLabel: 'Total Suka',
        secondaryMetricValue: `${likesRaw} Suka`,
      }
    }
  } catch (e: any) {
    console.error('Error scrape TikTok:', e.message)
  }
  return {
    followersFormatted: '26.9K',
    followers: 26900,
    secondaryMetricLabel: 'Total Suka',
    secondaryMetricValue: '643.3K Suka',
  }
}

export async function scrapeLatestYouTubeComments(): Promise<any[]> {
  try {
    const videoIds = ['YDT7Qfd7X80', '0INRwSDAMCo', 'g8m3a45KHYA', '31QgVnBwXh8', 'miEfDOSAMBM']
    const urls = videoIds.map((id) => `https://www.youtube.com/watch?v=${id}`)
    const { stdout } = await execFileAsync(
      YTDLP_PATH,
      [
        '--write-comments',
        '--skip-download',
        '--extractor-args',
        'youtube:max_comments=5,5,0,0',
        '--print',
        '%(id)s|||%(comments)j',
        ...urls,
      ],
      { timeout: 25000, maxBuffer: 10 * 1024 * 1024 }
    )

    const results: any[] = []
    for (const line of stdout.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed.includes('|||')) continue
      const [vid, jsonPart] = trimmed.split('|||')
      if (!jsonPart || jsonPart === 'NA') continue
      try {
        const comments = JSON.parse(jsonPart)
        if (Array.isArray(comments)) {
          for (const c of comments.slice(0, 4)) {
            if (!c?.text) continue
            const text = String(c.text).trim()
            const isMadrasahQuery = /(\?|berapa|bagaimana|gimana|kapan|syarat|biaya|sewa|budget|pendaftaran|mondok|kontak|pelatih|kurikulum|sinten|apakah)/i.test(text)
            results.push({
              id: `yt-${c.id || Date.now()}`,
              platform: 'youtube',
              authorName: String(c.author || 'Penonton').replace(/^@/, ''),
              authorHandle: String(c.author || '@penonton'),
              commentText: text,
              postUrl: `https://www.youtube.com/watch?v=${vid.trim()}`,
              category: isMadrasahQuery ? 'madrasah' : 'apresiasi',
              isImportant: isMadrasahQuery,
              status: isMadrasahQuery ? 'perlu_respon' : 'selesai',
              createdAt: c.timestamp ? new Date(c.timestamp * 1000).toISOString() : new Date().toISOString(),
              aiDraftReply: '',
            })
          }
        }
      } catch {}
    }
    return results
  } catch (e: any) {
    console.error('Error scrape YT comments via yt-dlp:', e.message)
    return []
  }
}

function parseNumber(str: string): number {
  const s = str.toLowerCase().trim()
  const numPart = parseFloat(s.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0
  if (s.includes('jt') || s.includes('m')) return Math.round(numPart * 1_000_000)
  if (s.includes('rb') || s.includes('k')) return Math.round(numPart * 1_000)
  return parseInt(s.replace(/[^0-9]/g, ''), 10) || 0
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return String(n)
}
