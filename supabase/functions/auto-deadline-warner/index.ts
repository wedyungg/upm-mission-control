// supabase/functions/auto-deadline-warner/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const USERS = [
  { id: 'rofiq', name: 'Ainur Rofiq', role: 'ketua', phone: '6285290313029' },
  { id: 'faridu', name: 'Faridu Asrih', role: 'ketua', phone: '6281281144772' },
  { id: 'syihab', name: 'Moh. Syihabuddin', role: 'planner', phone: '6285700052112' },
  { id: 'ziyan', name: 'Ziyan Firdaus', role: 'production', phone: '6285162855285' },
  { id: 'vega', name: 'Vega Faisal Amri', role: 'admin_partnership', phone: '6281903975548' },
]

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const now = new Date().toISOString()
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .filter('status', 'not.in', '("distribusi","selesai")')
    .lt('deadline', now)

  if (!tasks || tasks.length === 0) return new Response("Aman.")

  for (const task of tasks) {
    let targetRole = ''
    switch (task.status) {
      case 'planning': targetRole = 'planner'; break;
      case 'qc1': case 'qc2': targetRole = 'ketua'; break;
      case 'produksi': targetRole = 'production'; break;
      case 'editing': targetRole = 'editor_crew'; break;
    }

    const targets = USERS.filter(p => p.role === targetRole)

    if (targets.length > 0) {
      const groupId = Deno.env.get('WA_GROUP_ID') ?? ''
      // Menggunakan Nama, bukan Nomor HP di dalam teks pesan
      const mentionNames = targets.map(t => `*@${t.name}*`).join(' & ')
      
      const message = `*[UPM MISSION CONTROL]*\n\n🚨 *PERINGATAN OTOMATIS:* Proyek *"${task.name}"* terdeteksi *MELEWATI DEADLINE* pada tahap *${task.status.toUpperCase()}*.\n\n📌 *Tugas:* ${task.name}\n⏰ *Batas Waktu:* ${new Date(task.deadline).toLocaleString('id-ID')} WIB\n\nMohon segera ditindaklanjuti ya, ${mentionNames} ‼️`

      await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: { 'Authorization': Deno.env.get('FONNTE_TOKEN') ?? '' },
        body: new URLSearchParams({
          'target': groupId, 
          'message': message,
        })
      })
    }
  }
  return new Response("Done")
})