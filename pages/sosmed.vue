<template>
  <div class="px-4 md:px-8 py-5 md:py-7 max-w-7xl mx-auto">

    <!-- Top Row: Title + Segmented Control + Action -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{{ headerTitle }}</h1>
        <p class="text-xs text-[var(--text-secondary)] mt-1">{{ headerSubtitle }}</p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <!-- Segmented Control (Analitik | Respon | Kalender Tayang) -->
        <div class="flex gap-1 bg-[var(--bg-elevated)] p-1 rounded-xl border border-[var(--border-md)]">
          <button
            v-for="t in SOSMED_TABS"
            :key="t.key"
            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5"
            :class="activeTab === t.key
              ? 'bg-[var(--accent)] text-white shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'"
            @click="switchTab(t.key)"
          >
            <span>{{ t.label }}</span>
            <span
              v-if="t.key === 'respon' && pendingCommentsCount > 0"
              class="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold"
              :class="activeTab === 'respon' ? 'bg-white/25 text-white' : 'bg-[var(--accent-soft)] text-[var(--accent)]'"
            >
              {{ pendingCommentsCount }}
            </span>
          </button>
        </div>

        <!-- Contextual Action Buttons -->
        <button
          v-if="activeTab !== 'kalender'"
          class="month-sel flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]"
          :class="{ 'opacity-60 pointer-events-none': isSyncing }"
          @click="syncMetrics"
        >
          <svg class="w-3.5 h-3.5 text-[var(--accent)]" :class="{ 'animate-spin': isSyncing }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          <span>{{ isSyncing ? 'Menyinkronkan...' : 'Sinkronkan' }}</span>
        </button>

        <button
          v-if="activeTab === 'respon'"
          class="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95"
          @click="openAddModal"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          <span>Catat Komentar</span>
        </button>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- TAB 1: ANALITIK (PERTUMBUHAN AKUN)                                -->
    <!-- ================================================================= -->
    <div v-if="activeTab === 'analitik'" class="space-y-6">

      <!-- 3 Platform Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div v-for="p in platforms" :key="p.platform" class="card">
          <!-- Card Top Header -->
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-[var(--border-md)]"
                :style="platformAvatarStyle(p.platform)"
              >
                <!-- IG -->
                <svg v-if="p.platform === 'instagram'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                <!-- YT -->
                <svg v-else-if="p.platform === 'youtube'" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                <!-- TT -->
                <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-[var(--text-primary)] truncate">{{ p.name }}</p>
                <a :href="p.url" target="_blank" rel="noopener" class="text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] hover:underline truncate block">
                  {{ p.handle }}
                </a>
              </div>
            </div>

            <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex-shrink-0">
              {{ p.monthlyGrowthPercent }}
            </span>
          </div>

          <!-- Follower Metric Box -->
          <div class="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] mb-3.5">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-medium text-[var(--text-secondary)]">Total Pengikut</span>
              <span class="text-xs font-semibold text-[var(--green)]">{{ p.monthlyGrowth }} bln {{ currentHijriMonthName }}</span>
            </div>
            <p class="text-2xl font-bold font-mono text-[var(--text-primary)] leading-tight">
              {{ p.followersFormatted }}
            </p>
          </div>

          <!-- Detail Rows -->
          <div class="space-y-2.5 text-xs">
            <div class="flex items-center justify-between py-1 border-b border-[var(--border)]">
              <span class="text-[var(--text-secondary)]">{{ p.secondaryMetricLabel }}</span>
              <span class="font-semibold font-mono text-[var(--text-primary)]">{{ p.secondaryMetricValue }}</span>
            </div>

            <div class="flex items-center justify-between pt-0.5">
              <div>
                <span class="text-[var(--text-secondary)] block">Rekor Penonton Tertinggi</span>
                <span class="text-sm font-bold font-mono text-[var(--text-primary)] mt-0.5 block">{{ p.topPeakViews }}</span>
              </div>
              <a
                :href="p.topPeakUrl || p.url"
                target="_blank"
                rel="noopener"
                class="px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-md)] text-xs font-semibold text-[var(--accent)] hover:border-[var(--accent)] transition-colors flex items-center gap-1"
              >
                <span>Lihat Konten</span>
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M7 7h10v10"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Historical Growth Across Hijri Months -->
      <div class="card">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[var(--border)]">
          <div>
            <h2 class="text-base font-semibold text-[var(--text-primary)] tracking-tight">
              Pertumbuhan Pengikut Lintas Bulan Hijriah
            </h2>
            <p class="text-xs text-[var(--text-secondary)] mt-0.5">
              Periode {{ periodLabel }} · Bulan aktif: {{ currentHijriMonthName }} (Hari ini: {{ currentHijriDay }} {{ currentHijriMonthName }})
            </p>
          </div>
          <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] self-start sm:self-auto">
            Total {{ totalFollowersFormatted }} Pengikut
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-[var(--border)] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                <th class="py-2.5 px-3">Bulan Hijriah</th>
                <th class="py-2.5 px-3">Instagram</th>
                <th class="py-2.5 px-3">YouTube</th>
                <th class="py-2.5 px-3">TikTok</th>
                <th class="py-2.5 px-3 text-right">Total Gabungan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--border)] font-mono">
              <tr
                v-for="row in syncedHistory"
                :key="row.monthLabel"
                class="transition-colors"
                :class="row.isCurrent ? 'bg-[var(--accent-soft)]/50' : 'hover:bg-[var(--bg-elevated)]/50'"
              >
                <td class="py-3 px-3 font-sans font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <span>{{ row.monthLabel }}</span>
                  <span
                    v-if="row.isCurrent"
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent)] text-white"
                  >
                    16 {{ row.monthLabel }} · Bulan Ini
                  </span>
                </td>
                <td class="py-3 px-3 text-[var(--text-secondary)]">{{ row.instagram.toLocaleString('id-ID') }}</td>
                <td class="py-3 px-3 text-[var(--text-secondary)]">{{ row.youtube.toLocaleString('id-ID') }}</td>
                <td class="py-3 px-3 text-[var(--text-secondary)]">{{ row.tiktok.toLocaleString('id-ID') }}</td>
                <td class="py-3 px-3 text-right font-bold text-[var(--text-primary)]">
                  {{ (row.instagram + row.youtube + row.tiktok).toLocaleString('id-ID') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- ================================================================= -->
    <!-- TAB 2: RESPON (LAPORAN KOMENTAR)                                  -->
    <!-- ================================================================= -->
    <div v-else-if="activeTab === 'respon'" class="space-y-5">

      <!-- Card Container matching manajemen.vue "Butuh Tindakan" -->
      <div class="card">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--border)]">
          <div>
            <h2 class="text-base font-semibold text-[var(--text-primary)] tracking-tight">Daftar Komentar Publik</h2>
            <p class="text-xs text-[var(--text-secondary)] mt-0.5">
              Pertanyaan seputar madrasah otomatis diteruskan ke grup WhatsApp UPM beserta tautan konten
            </p>
          </div>

          <div class="flex gap-1.5 overflow-x-auto scrollbar-none">
            <button
              v-for="f in COMMENT_FILTERS"
              :key="f.key"
              class="flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold border outline-none flex items-center gap-1.5 transition-all"
              :class="selectedFilter === f.key
                ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm'
                : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'"
              @click="selectedFilter = f.key"
            >
              <span>{{ f.label }}</span>
            </button>
          </div>
        </div>

        <!-- Comments List -->
        <div v-if="filteredComments.length > 0" class="divide-y divide-[var(--border)]">
          <div
            v-for="c in filteredComments"
            :key="c.id"
            class="py-4 first:pt-1 last:pb-1 space-y-3"
          >
            <!-- Top Row: Author + Badges + Direct Link -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div class="flex items-center gap-3 min-w-0">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 border border-[var(--border-md)]"
                  :style="platformAvatarStyle(c.platform)"
                >
                  {{ c.authorName.slice(0, 2).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <p class="text-sm font-semibold text-[var(--text-primary)] truncate">{{ c.authorName }}</p>
                    <span class="text-xs text-[var(--text-muted)] truncate">{{ c.authorHandle }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-0.5">
                    <span class="capitalize font-medium">{{ c.platform }}</span>
                    <span>·</span>
                    <span class="font-mono text-[var(--text-muted)]">{{ formatDate(c.createdAt) }}</span>
                  </div>
                </div>
              </div>

              <!-- Right Badges & Link "Lihat Konten" -->
              <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
                <span
                  v-if="c.isImportant"
                  class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]"
                >
                  Info Madrasah
                </span>

                <span
                  class="text-xs font-bold px-2.5 py-0.5 rounded-full"
                  :class="c.status === 'perlu_respon'
                    ? 'bg-amber-500/12 text-[var(--orange)] border border-amber-500/25'
                    : 'bg-emerald-500/12 text-[var(--green)] border border-emerald-500/25'"
                >
                  {{ c.status === 'perlu_respon' ? 'Perlu Respon' : 'Selesai' }}
                </span>

                <a
                  :href="c.postUrl || defaultUrl(c.platform)"
                  target="_blank"
                  rel="noopener"
                  class="px-3 py-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-md)] text-xs font-semibold text-[var(--accent)] hover:border-[var(--accent)] transition-colors flex items-center gap-1"
                >
                  <span>Lihat Konten</span>
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M7 7h10v10"/></svg>
                </a>
              </div>
            </div>

            <!-- Comment Bubble -->
            <div class="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
              <p class="text-sm text-[var(--text-primary)] leading-relaxed">
                "{{ c.commentText }}"
              </p>
            </div>

            <!-- AI Draft Reply Box -->
            <div
              v-if="c.aiDraftReply"
              class="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-md)] space-y-2"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="slabel !mb-0 !text-[var(--accent)]">Saran Balasan AI</span>
                <div class="flex items-center gap-3">
                  <button
                    class="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1"
                    @click="copyText(c.aiDraftReply)"
                  >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    <span>Salin Balasan</span>
                  </button>
                </div>
              </div>
              <p class="text-xs text-[var(--text-secondary)] leading-relaxed">
                {{ c.aiDraftReply }}
              </p>
            </div>

            <!-- Action Row -->
            <div class="flex items-center justify-end gap-2">
              <a
                :href="c.postUrl || defaultUrl(c.platform)"
                target="_blank"
                rel="noopener"
                class="px-3.5 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-md)] text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
              >
                Balas di {{ platformLabel(c.platform) }} ↗
              </a>

              <button
                v-if="c.status === 'perlu_respon'"
                class="px-3.5 py-1.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold transition-colors shadow-sm"
                @click="resolveComment(c.id)"
              >
                Tandai Selesai
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-10">
          <p class="text-sm font-medium text-[var(--text-secondary)]">Tidak ada komentar pada filter ini</p>
          <p class="text-xs text-[var(--text-muted)] mt-1">Semua komentar pada kategori ini telah ditindaklanjuti</p>
        </div>
      </div>

    </div>

    <!-- ================================================================= -->
    <!-- TAB 3: KALENDER TAYANG                                            -->
    <!-- ================================================================= -->
    <div v-else-if="activeTab === 'kalender'" class="space-y-5">
      <!-- Status Legend Bar matching kalender.vue -->
      <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
        <div class="flex flex-wrap items-center gap-3.5">
          <span class="text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase mr-1">Status:</span>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-slate-500/30 border border-slate-500"></span>
            <span class="text-xs font-medium text-[var(--text-secondary)]">Planning</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/30 border border-emerald-500"></span>
            <span class="text-xs font-medium text-[var(--text-secondary)]">Produksi</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500/30 border border-amber-500"></span>
            <span class="text-xs font-medium text-[var(--text-secondary)]">QC</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-teal-500/30 border border-teal-500"></span>
            <span class="text-xs font-medium text-[var(--text-secondary)]">Selesai</span>
          </div>
        </div>

        <button
          class="flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95"
          @click="navigateTo('/buat')"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          <span>Buat Jadwal Konten</span>
        </button>
      </div>

      <MonthlyCalendar
        :tasks="tasksStore.tasks"
        @task-click="handleTaskClick"
      />
    </div>

    <!-- Modal Catat Komentar (iOS Sheet on Mobile, Centered Modal on Desktop — matching progja.vue) -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="isAddModalOpen"
          class="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-6"
          style="background:rgba(0,0,0,0.55); backdrop-filter: blur(5px);"
          @click.self="isAddModalOpen = false"
        >
          <div class="w-full max-w-[460px] bg-[var(--bg-surface)] rounded-t-3xl md:rounded-2xl px-6 pt-5 pb-8 md:pb-6 border border-[var(--border-md)] shadow-2xl">
            <div class="w-12 h-1.5 bg-[var(--border-md)] rounded-full mx-auto mb-4 md:hidden" />
            <div class="flex items-center justify-between mb-5 pb-3 border-b border-[var(--border)]">
              <h3 class="text-base font-bold text-[var(--text-primary)]">Catat Komentar Medsos</h3>
              <button class="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)]" @click="isAddModalOpen = false">Batal</button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="fl">Platform</label>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    v-for="pf in (['instagram', 'youtube', 'tiktok'] as const)"
                    :key="pf"
                    type="button"
                    class="py-2 rounded-xl text-xs font-semibold border capitalize transition-colors"
                    :class="newForm.platform === pf
                      ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                      : 'bg-[var(--bg-elevated)] border-[var(--border-md)] text-[var(--text-secondary)]'"
                    @click="newForm.platform = pf"
                  >
                    {{ pf }}
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="fl">Nama Penanya</label>
                  <input v-model="newForm.authorName" type="text" class="fi" placeholder="Contoh: Ahmad" />
                </div>
                <div>
                  <label class="fl">Username</label>
                  <input v-model="newForm.authorHandle" type="text" class="fi" placeholder="@username" />
                </div>
              </div>

              <div>
                <label class="fl">Tautan / Link Konten Asli</label>
                <input v-model="newForm.postUrl" type="url" class="fi" placeholder="https://www.instagram.com/reel/..." />
              </div>

              <div>
                <label class="fl">Isi Komentar</label>
                <textarea
                  v-model="newForm.commentText"
                  rows="3"
                  class="fi"
                  placeholder="Masukkan teks komentar (pertanyaan seputar madrasah otomatis dikirim ke WA grup UPM)..."
                ></textarea>
              </div>
            </div>

            <div class="flex gap-2.5 mt-6">
              <button class="btn-outline" @click="isAddModalOpen = false">Batal</button>
              <button class="btn-primary" :disabled="isSubmitting" @click="submitNewComment">
                {{ isSubmitting ? 'Memproses AI...' : 'Simpan & Analisis' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { useHijri } from '~/composables/useHijri'
import { useTasksStore } from '~/stores/tasks'
import type { Task } from '~/types'
import MonthlyCalendar from '~/components/calendar/MonthlyCalendar.vue'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const toast = useToast()
const tasksStore = useTasksStore()
const { approxCurrentHijriYear, HIJRI_MONTHS_ID, getCurrentHijriMonth, getCurrentHijriDay, getTodayHijriFormatted } = useHijri()

// Sinkronisasi Bulan Hijriah persis dengan index.vue & manajemen.vue
const hy = approxCurrentHijriYear()
const currentHm = getCurrentHijriMonth()
const currentHijriDay = getCurrentHijriDay()
const activeHijriIdx = (currentHm - 10 + 12) % 12 // 7 = Jumadil Ula
const currentHijriMonthName = computed(() => HIJRI_MONTHS_ID[activeHijriIdx] || 'Jumadil Ula')
const periodLabel = `${hy}H — ${hy + 1}H`

const SOSMED_TABS = [
  { key: 'analitik', label: 'Analitik' },
  { key: 'respon',   label: 'Respon' },
  { key: 'kalender', label: 'Kalender Tayang' },
] as const

type SosmedTab = 'analitik' | 'respon' | 'kalender'

const activeTab = ref<SosmedTab>('analitik')

const applyQueryTab = () => {
  const q = String(route.query.tab || '').toLowerCase()
  if (q === 'respon' || q === 'comments') activeTab.value = 'respon'
  else if (q === 'kalender' || q === 'calendar') activeTab.value = 'kalender'
  else activeTab.value = 'analitik'
}

onMounted(() => {
  applyQueryTab()
  if (!tasksStore.tasks.length) tasksStore.fetchTasks()
})

watch(() => route.query.tab, () => applyQueryTab())

const switchTab = (key: SosmedTab) => {
  activeTab.value = key
  router.replace({ path: '/sosmed', query: { tab: key } })
}

const headerTitle = computed(() => {
  if (activeTab.value === 'respon') return 'Respon Komentar'
  if (activeTab.value === 'kalender') return 'Kalender Tayang'
  return 'Analitik Media Sosial'
})

const headerSubtitle = computed(() => {
  if (activeTab.value === 'respon') return 'Kelola pertanyaan publik & tanggapan otomatis tim UPM'
  if (activeTab.value === 'kalender') return 'Jadwal tayang & target publikasi konten bulanan'
  return `Pertumbuhan akun resmi Mathali'ul Falah · Bulan ${currentHijriMonthName.value}`
})

const { data: socialData, refresh } = await useFetch('/api/social/data')

const platforms = computed(() => socialData.value?.platforms || [])
const comments = computed(() => socialData.value?.comments || [])

const totalFollowersFormatted = computed(() => {
  const total = platforms.value.reduce((acc: number, p: any) => acc + (p.followers || 0), 0)
  return total > 0 ? total.toLocaleString('id-ID') : '188.900'
})

// Sinkronisasi tabel riwayat bulan Hijriah dari Syawwal s/d bulan berjalan (Jumadil Ula)
const syncedHistory = computed(() => {
  const rawHistory: any[] = socialData.value?.history || []
  const maxIdx = activeHijriIdx // 7 = Jumadil Ula
  const rows = []
  for (let i = 0; i <= maxIdx; i++) {
    const label = HIJRI_MONTHS_ID[i]
    const found = rawHistory.find((h: any) => h.monthIndex === i || h.monthLabel === label)
    const isCurrent = i === maxIdx
    rows.push({
      monthIndex: i,
      monthLabel: label,
      isCurrent,
      instagram: isCurrent
        ? (platforms.value.find((p: any) => p.platform === 'instagram')?.followers || found?.instagram || 42000)
        : (found?.instagram || 39800 + i * 300),
      youtube: isCurrent
        ? (platforms.value.find((p: any) => p.platform === 'youtube')?.followers || found?.youtube || 120000)
        : (found?.youtube || 113500 + i * 900),
      tiktok: isCurrent
        ? (platforms.value.find((p: any) => p.platform === 'tiktok')?.followers || found?.tiktok || 26900)
        : (found?.tiktok || 21800 + i * 700),
    })
  }
  return rows
})

const pendingCommentsCount = computed(() =>
  comments.value.filter((c: any) => c.status === 'perlu_respon' && c.isImportant).length
)

const selectedFilter = ref('all')
const COMMENT_FILTERS = [
  { key: 'all',       label: 'Semua' },
  { key: 'pending',   label: 'Perlu Respon' },
  { key: 'madrasah',  label: 'Info Madrasah' },
  { key: 'youtube',   label: 'YouTube' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'tiktok',    label: 'TikTok' },
]

const filteredComments = computed(() => {
  return comments.value.filter((c: any) => {
    if (selectedFilter.value === 'pending') return c.status === 'perlu_respon'
    if (selectedFilter.value === 'madrasah') return c.category === 'madrasah'
    if (['instagram', 'youtube', 'tiktok'].includes(selectedFilter.value)) return c.platform === selectedFilter.value
    return true
  })
})

const platformAvatarStyle = (p: string) => {
  if (p === 'instagram') return { background: 'rgba(244, 63, 94, 0.12)', color: '#f43f5e' }
  if (p === 'youtube') return { background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }
  return { background: 'rgba(20, 184, 166, 0.12)', color: '#14b8a6' }
}

const platformLabel = (p: string) => {
  if (p === 'youtube') return 'YouTube'
  if (p === 'tiktok') return 'TikTok'
  return 'Instagram'
}

const defaultUrl = (p: string) => {
  if (p === 'youtube') return 'https://www.youtube.com/@mathaliulfalahofficial'
  if (p === 'tiktok') return 'https://www.tiktok.com/@mathaliulfalah'
  return 'https://www.instagram.com/mathaliulfalahofficial/'
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const copyText = (text: string) => {
  navigator.clipboard.writeText(text)
  toast.add({ title: 'Balasan disalin ✓', color: 'green' })
}

const isSyncing = ref(false)
const syncMetrics = async () => {
  isSyncing.value = true
  try {
    const res: any = await $fetch('/api/social/sync', { method: 'POST' })
    if (res?.success) {
      await refresh()
      toast.add({ title: 'Data & komentar berhasil disinkronkan ✓', color: 'green' })
    }
  } catch (err: any) {
    toast.add({ title: 'Gagal menyinkronkan data', description: err.message, color: 'red' })
  } finally {
    isSyncing.value = false
  }
}

const resolveComment = async (id: string) => {
  try {
    await $fetch('/api/social/comments', {
      method: 'POST',
      body: { action: 'resolve', id },
    })
    await refresh()
    toast.add({ title: 'Komentar ditandai selesai ✓', color: 'green' })
  } catch {
    toast.add({ title: 'Gagal memperbarui status', color: 'red' })
  }
}

const handleTaskClick = (task: Task) => {
  navigateTo('/misi/' + task.id)
}

// Modal Catat Komentar
const isAddModalOpen = ref(false)
const isSubmitting = ref(false)
const newForm = reactive({
  platform: 'instagram',
  authorName: '',
  authorHandle: '',
  postUrl: '',
  commentText: '',
})

const openAddModal = () => {
  newForm.platform = 'instagram'
  newForm.authorName = ''
  newForm.authorHandle = ''
  newForm.postUrl = ''
  newForm.commentText = ''
  isAddModalOpen.value = true
}

const submitNewComment = async () => {
  if (!newForm.commentText.trim()) {
    toast.add({ title: 'Isi komentar tidak boleh kosong', color: 'red' })
    return
  }
  isSubmitting.value = true
  try {
    const res: any = await $fetch('/api/social/comments', {
      method: 'POST',
      body: { action: 'add', ...newForm },
    })
    if (res?.success) {
      isAddModalOpen.value = false
      await refresh()
      toast.add({
        title: res.comment?.isImportant
          ? 'Komentar madrasah dicatat & dikirim ke WA UPM ✓'
          : 'Komentar berhasil dicatat ✓',
        color: 'green',
      })
    }
  } catch (err: any) {
    toast.add({ title: 'Gagal mencatat komentar', description: err.message, color: 'red' })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
}
.slabel {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  color: var(--text-muted);
  margin-bottom: 10px;
}
.month-sel {
  background: var(--bg-card);
  border: 1px solid var(--border-md);
  border-radius: 12px;
  padding: 8px 14px;
  cursor: pointer;
  outline: none;
  flex-shrink: 0;
  transition: transform 0.15s, border-color 0.2s, background 0.2s;
  box-shadow: var(--card-shadow);
}
.month-sel:hover { border-color: var(--accent); }
.month-sel:active { transform: scale(0.97); }

.fl { font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block; }
.fi { width: 100%; background: var(--bg-elevated); border: 1px solid var(--border-md); border-radius: 10px; padding: 10px 14px; color: var(--text-primary); font-size: 13px; font-family: inherit; outline: none; transition: border-color .2s; }
.fi:focus { border-color: var(--accent); }
.btn-primary { display: flex; align-items: center; justify-content: center; width: 100%; padding: 10px 16px; border-radius: 11px; border: none; font-size: 13px; font-weight: 600; background: var(--accent); color: #fff; cursor: pointer; font-family: inherit; transition: background .15s, transform .12s; }
.btn-primary:hover { background: var(--accent-hover); }
.btn-outline { display: flex; align-items: center; justify-content: center; width: 100%; padding: 10px 16px; border-radius: 11px; font-size: 13px; font-weight: 600; background: var(--bg-elevated); border: 1px solid var(--border-md); color: var(--text-primary); cursor: pointer; font-family: inherit; transition: border-color .15s, transform .12s; }
.btn-outline:hover { border-color: var(--accent); color: var(--accent); }
.btn-primary:active, .btn-outline:active { transform: scale(0.985); }

.scrollbar-none { scrollbar-width: none; }
.scrollbar-none::-webkit-scrollbar { display: none; }
.modal-enter-active, .modal-leave-active { transition: opacity .22s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
