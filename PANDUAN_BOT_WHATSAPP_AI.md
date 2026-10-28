# Panduan Integrasi Bot WhatsApp AI (@upm)
**Sistem Otomasi Konten UPM Mathole' (Perguruan Islam Mathali'ul Falah)**

Dokumen ini menjelaskan cara kerja dan operasional Bot WhatsApp mandiri **`@upm`** yang berjalan 100% gratis menggunakan **Baileys Multi-Device**, skill **Instagram Reels Master**, **Google Gemini Flash (IPv4 Fast Engine)**, dan database **Supabase**.

---

## 1. Cara Kerja Bot di Grup WhatsApp

Bot ini bertindak sebagai asisten media di dalam grup WhatsApp UPM Mathole':
* **Hening Otomatis**: Jika pesan di grup **tidak mengandung kata `@upm`**, bot **100% diam** dan tidak mengganggu percakapan anggota tim.
* **Fast-Greeting (< 0.1 detik)**: Sapaan singkat seperti `@upm halo` langsung dibalas seketika dengan menu panduan perintah.
* **Tanya Status / Progres**: Jika di-mention `@upm sudah berapa postingan yang dibikin?`, bot membaca data *real-time* dari Supabase dan melaporkan jumlah konten yang tayang, sedang review QC, sedang produksi, dan tahap rencana.
* **Drafting Konten Ber-skill (`instagram-reels-master`)**: Jika di-mention `@upm buatkan konten [topik]`, bot meracik draf naskah utuh (Hook 3 detik 3-Lapisan, Naskah Beat-by-Beat per detik, serta Caption SEO + CTA Share/Save) dengan karakter khas pesantren Mathole' dalam waktu ~3–4 detik.

---

## 2. Cara Menjalankan & Memantau Bot

1. **Menjalankan Bot**:
   ```bash
   cd whatsapp-bot
   node bot.js
   ```
2. **Scan QR Code (Hanya Sekali di Awal)**:
   Buka **[http://localhost:3000/qr.html](http://localhost:3000/qr.html)** untuk memindai QR Code WhatsApp. Sesi login tersimpan permanen di `whatsapp-bot/auth_info_baileys`.
3. **Live Monitor Aktivitas**:
   Buka **[http://localhost:3000/bot-logs.html](http://localhost:3000/bot-logs.html)** untuk memantau pesan masuk, waktu respons AI, dan status pengiriman secara *real-time*.

---

## 3. Contoh Perintah di Grup WhatsApp

| Perintah yang Diketik Kru | Respon Bot `@upm` |
| :--- | :--- |
| `Halo teman-teman besok rapat jam berapa?` | *(Diam / Tidak merespon)* |
| `@upm halo` | Menyapa pengirim secara instan dan memberikan panduan contoh perintah. |
| `@upm sudah berapa postingan yang dibikin?` | Melaporkan rekap konten dari database Supabase (Tayang, Review QC, Produksi, Rencana). |
| `@upm buatkan konten tentang dalil mbg` | Menuliskan draf naskah utuh (Hook 3 detik, Naskah Beat-by-Beat, Caption SEO & Hashtag) khas pesantren Mathole'. |
| `@upm buatkan 3 ide hook reels untuk rubrik tren santri` | Memberikan 3 variasi hook viral ramah santri berbasis visual + audio + teks layar. |
