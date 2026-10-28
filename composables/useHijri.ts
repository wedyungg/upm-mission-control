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
   * Mendapatkan Tahun Akademik Hijriah saat ini di Matholek/UPM
   * Periode kepengurusan/akademik UPM dimulai 12 Syawwal s/d 25 Sya'ban tahun berikutnya.
   * - Jika saat ini berada di bulan Syawwal (10), Dzulqa'dah (11), atau Dzulhijjah (12), tahun akademik = kalender Hijriah saat itu.
   * - Jika saat ini berada di Muharram (1) s/d Ramadhan (9) (contoh: Jumadil Ula 1448H), periode aktif adalah yang dimulai sejak Syawwal tahun lalu,
   *   sehingga tahun akademik dasar adalah (Tahun Kalender - 1) = 1447H.
   * Menghasilkan rentang akademik: 1447H — 1448H (2026-2027 Masehi).
   */
  const approxCurrentHijriYear = (): number => {
    try {
      const d = new Date()
      const yearFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', { year: 'numeric' })
      const monthFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', { month: 'numeric' })
      const calYear = parseInt(yearFormatter.format(d).replace(/[^0-9]/g, ''), 10) || 1448
      const calMonth = parseInt(monthFormatter.format(d).replace(/[^0-9]/g, ''), 10) || 5
      return calMonth >= 10 ? calYear : calYear - 1
    } catch {
      return 1447
    }
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

  /**
   * Mendapatkan tanggal hari Hijriah saat ini (1-30) secara otomatis dan dinamis
   */
  const getCurrentHijriDay = (): number => {
    try {
      const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-civil', { day: 'numeric' })
      const dayNum = parseInt(formatter.format(new Date()), 10)
      return isNaN(dayNum) ? 16 : dayNum
    } catch {
      return 16
    }
  }

  /**
   * Format tanggal Hijriah hari ini secara dinamis dan bergerak (contoh: "16 Jumadil Ula 1448 H")
   */
  const getTodayHijriFormatted = (): string => {
    const day = getCurrentHijriDay()
    const hm = getCurrentHijriMonth()
    const monthIdx = (hm - 10 + 12) % 12
    const monthName = HIJRI_MONTHS_ID[monthIdx] || 'Jumadil Ula'
    let calYear = 1448
    try {
      const yearFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', { year: 'numeric' })
      calYear = parseInt(yearFormatter.format(new Date()).replace(/[^0-9]/g, ''), 10) || 1448
    } catch {}
    return `${day} ${monthName} ${calYear} H`
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
    getCurrentHijriDay,
    getTodayHijriFormatted,
  }
}
