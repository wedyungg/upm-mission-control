# Dashboard UPM

Aplikasi manajemen kinerja tim produksi konten UPM berbasis **Nuxt 3 + Vue 3**,
terhubung ke **Supabase** (database) dan **Google Drive API** (file storage).

---

## Tech Stack

| Layer       | Teknologi                              |
|-------------|----------------------------------------|
| Framework   | Nuxt 3 + Vue 3 (Composition API)       |
| UI          | Nuxt UI + Tailwind CSS                 |
| State       | Pinia                                  |
| Database    | Supabase (PostgreSQL)                  |
| File Storage| Google Drive API v3 (OAuth 2.0)        |
| Utilities   | VueUse, dayjs                          |
| Fonts       | Plus Jakarta Sans + JetBrains Mono     |

---

## Struktur Folder

```
upm-mission-control/
├── assets/css/           # Global styles
├── components/
│   ├── layout/           # AppHeader, AppBottomNav, DriveStatusBar
│   ├── task/             # TaskCard (universal card)
│   └── ui/               # GradeBadge, StatusBadge, UiCountdownBadge
├── composables/
│   ├── useHijri.ts       # Hijri ↔ Gregorian conversion
│   ├── useDrive.ts       # Google Drive API integration
│   └── useCountdown.ts   # Real-time countdown timer
├── layouts/
│   └── default.vue       # Shell: Header + main + BottomNav
├── middleware/
│   └── auth.ts           # Route guard (redirect to /login)
├── pages/
│   ├── index.vue         # Beranda (Dashboard)
│   ├── login.vue         # IG-style account selector
│   ├── manajemen.vue     # Kinerja Individu + Progja + Action Tabs
│   ├── buat.vue          # Buat Tugas Tim / Administrasi
│   ├── tugas.vue         # Semua Tugas (filter by type + status)
│   ├── profil.vue        # Profil + Drive config + Hijri config
│   └── misi/[id].vue     # Detail Misi (dynamic by status)
├── stores/
│   ├── auth.ts           # User accounts, login/logout, session
│   └── tasks.ts          # Task CRUD + Supabase sync
├── types/
│   └── index.ts          # TypeScript types
├── supabase-schema.sql   # Database schema
├── nuxt.config.ts
└── .env.example
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Buat file `.env`

```bash
cp .env.example .env
```

Isi nilai berikut:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_DRIVE_FOLDER=Dashboard UPM
```

### 3. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** → paste isi file `supabase-schema.sql` → Run
3. Copy **Project URL** dan **anon key** ke `.env`

### 4. Setup Google Drive API

1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Buat project baru
3. Enable **Google Drive API**
4. Buat **OAuth 2.0 Client ID** (Web Application)
5. Tambahkan **Authorized JavaScript Origins**: `http://localhost:3000` (dev) dan domain produksi
6. Tambahkan **Authorized Redirect URIs**: URL yang sama
7. Copy **Client ID** ke `.env`

### 5. Jalankan development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## Demo Login

Semua akun menggunakan kata sandi: **`1234`**

| Nama                | Role                  | Akses     |
|---------------------|-----------------------|-----------|
| Ust. M. Zaim        | Penanggung Jawab      | Read Only |
| Ust. Ahmad Ismail   | Penanggung Jawab      | Read Only |
| Ainur Rofiq         | Ketua UPM             | Full      |
| Faridu Asrih        | Ketua UPM             | Full      |
| Moh. Syihabuddin    | Content Planner       | Full      |
| Ziyan Firdaus       | Production            | Full      |
| Vega Faisal Amri    | Admin & Partnership   | Full      |
| Editor / Crew       | Editor & Crew         | Limited   |

---

## Fitur Utama

### Beranda
- Circular performance chart (% selesai dari total tugas)
- Stat cards reaktif (Belum / Proses / Approval / Selesai)
- Vertical stepper 6 tahap (Planning → QC 1 → Produksi → Edit → QC 2 → Distribusi)
- Horizontal scroll cards di tiap step
- Action tabs berbasis role pengguna
- Month selector yang re-fetch Supabase

### Manajemen
- Healthy bar per anggota (merah = Overload > 80%)
- Sisa Progja per grade S/A/B/C vs target tahunan
- Butuh Tindakan: 5 tab role (Planner / QC / Produksi / Editor / Publisher)

### Halaman Misi `/misi/[id]`
Tampilan dinamis berdasarkan status:

| Status       | Tampilan                                              |
|--------------|-------------------------------------------------------|
| `planning`   | Form konsep, grade, link skrip → kirim ke produksi   |
| `produksi`   | Upload zone → auto-folder Drive → kirim ke editing   |
| `editing`    | Upload zone → auto-folder Drive → kirim ke QC 2      |
| `qc1/qc2`   | Preview file Drive + tombol Setuju/Revisi + komentar |
| `distribusi` | Tombol Tandai Selesai                                |
| `selesai`    | Status final                                         |

### Google Drive Auto-Foldering
Saat file diunggah, otomatis dibuat struktur:
```
Dashboard UPM /
  1447H — 1448H /
    November /
      Grade A /
        Fiqih - Mensucikan Najis /
          video_final.mp4
```

### Hijri Period Logic
- Periode = **12 Syawal HY → 25 Sya'ban (HY+1)**
- Semua filter data mengacu tanggal Masehi yang sesuai
- Configurable dari halaman Profil

---

## Build untuk Production

```bash
npm run build
npm run preview
```

Untuk deploy ke Vercel/Netlify, pastikan environment variables sudah dikonfigurasi.
