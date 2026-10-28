// server/api/social/data.get.ts
import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(() => {
  const filePath = path.resolve('./server/data/social_data.json')
  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, 'utf8')
      return JSON.parse(raw)
    } catch (e: any) {
      console.error('Failed reading social_data.json:', e.message)
    }
  }
  return { platforms: [], history: [], comments: [] }
})
