// composables/useHijri.ts
import type { HijriPeriod } from '~/types'

export const useHijri = () => {
  /**
   * Convert Hijri date to Gregorian Date
   * Uses Umm al-Qura calendar approximation
   */
  const hijriToGregorian = (hy: number, hm: number, hd: number): Date => {
    const jdn =
      Math.trunc((11 * hy + 3) / 30) +
      354 * hy +
      30 * hm -
      Math.trunc((hm - 1) / 2) +
      hd +
      1948440 -
      385

    let l = jdn + 68569
    const n = Math.trunc((4 * l) / 146097)
    l = l - Math.trunc((146097 * n + 3) / 4)
    const i = Math.trunc((4000 * (l + 1)) / 1461001)
    l = l - Math.trunc((1461 * i) / 4) + 31
    const j = Math.trunc((80 * l) / 2447)
    const gd = l - Math.trunc((2447 * j) / 80)
    l = Math.trunc(j / 11)
    const gm = j + 2 - 12 * l
    const gy = 100 * (n - 49) + i + l

    return new Date(gy, gm - 1, gd)
  }

  /**
   * Get Hijri period:
   * Start = 12 Syawal (month 10) of hijriYear
   * End   = 25 Sya'ban (month 8) of hijriYear + 1
   */
  const getHijriPeriod = (hijriYear: number): HijriPeriod => {
    const start = hijriToGregorian(hijriYear, 10, 12)
    const end   = hijriToGregorian(hijriYear + 1, 8, 25)
    return {
      hijriYear,
      startGregorian: start,
      endGregorian: end,
      label: `${hijriYear}H — ${hijriYear + 1}H`,
    }
  }

  /**
   * Approximate current Hijri year from today's Gregorian date
   * Reference: 1 Muharram 1446H ≈ 7 July 2024
   */
  const approxCurrentHijriYear = (): number => {
    const base = new Date(2024, 6, 7)
    const now  = new Date()
    const diffDays = (now.getTime() - base.getTime()) / 86_400_000
    return 1446 + Math.floor(diffDays / 354.36)
  }

  /**
   * Check if a Gregorian date falls within the Hijri period
   */
  const isInPeriod = (date: Date, period: HijriPeriod): boolean => {
    return date >= period.startGregorian && date <= period.endGregorian
  }

  /**
   * Format Gregorian date as Indonesian string
   */
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const MONTHS_ID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ]
  const HIJRI_MONTHS_ID = [
    'Syawwal', 'Dzulqa’dah', 'Dzulhijjah', 'Muharram', 'Safar', 
    'Rabi’ul Awwal', 'Rabi’ul Akhir', 'Jumadil Ula', 'Jumadil Akhira', 
    'Rajab', 'Sya’ban', 'Ramadhan'
  ]

  /**
   * Mendapatkan nomor bulan Hijriah saat ini (1-12)
   * 1 = Muharram, ..., 10 = Syawwal, 11 = Dzulqa'dah, 12 = Dzulhijjah
   */
const getCurrentHijriMonth = (): number => {
    try {
      // Nggawe standar en-US-u-ca-islamic-umalqura ben dijamin metu angkane thok (1-12)
      // dudu metu jeneng wulan utawa error.
      const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', { month: 'numeric' })
      const monthStr = formatter.format(new Date())
      const monthNum = parseInt(monthStr, 10)
      
      // Nek hasil e valid angka, balekne angkane. Nek ra, balekne 11 (Dzulqa'dah saiki)
      return isNaN(monthNum) ? 11 : monthNum
    } catch (error) {
      console.error('Gagal maca kalender Hijriah:', error)
      return 11 // Fallback darurat ben aplikasi tetep mlaku
    }
  }

  return {
    hijriToGregorian,
    getHijriPeriod,
    approxCurrentHijriYear,
    isInPeriod,
    formatDate,
    MONTHS_ID,
    HIJRI_MONTHS_ID,
    getCurrentHijriMonth,
  }
}
