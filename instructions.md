Instruction Manual: Peningkatan Fitur "Lanjutkan Aktivitas" (Frontend)
Tujuan Utama
Mengintegrasikan alur "Lanjutkan Sesi" (untuk Roleplay) dan "Lanjutkan Belajar" (untuk Learning) yang lebih lancar ke dalam frontend (React dengan Zustand dan Material-UI), berdasarkan perubahan backend yang telah disiapkan.

Konteks Kode Frontend Saat Ini
State Management: Aplikasi menggunakan Zustand untuk state management global.

store/practiceStore.ts untuk fitur Roleplay (Practice).

store/learningStore.ts untuk fitur Learning.

Struktur Halaman: Halaman utama fitur berada di src/pages.

Roleplay: src/pages/PracticePage.tsx.

Learning: src/pages/LearningPage.tsx.

Komponen Relevan:

src/components/dashboard/ContinueLearning.tsx: Komponen ini sudah ada dan berfungsi untuk melanjutkan modul belajar di halaman dashboard. Logikanya sangat mirip dengan yang dibutuhkan di halaman Learning.

API Service: Semua panggilan API diatur melalui src/services/api.ts dan konstanta endpoint ada di src/utils/constants.ts.

Tahap 1: Penyempurnaan Frontend Fitur Roleplay (Practice)
Tujuan: Memungkinkan pengguna melanjutkan sesi roleplay yang aktif langsung dari halaman utama fitur (PracticePage.tsx).

Langkah 1.1: Buat Komponen ContinueSessionCard
Buat sebuah komponen UI baru yang akan muncul di bagian atas halaman PracticePage.tsx jika ada sesi roleplay yang aktif.

Buat File Komponen Baru:

Buat file di src/components/practice/ContinueSessionCard.tsx.

Komponen ini akan menerima activeSession sebagai prop.

Rancang UI Komponen:

Gunakan Card dari Material-UI.

Tampilkan judul skenario dari activeSession.scenarioTitle (asumsi properti ini ada).

Tampilkan informasi seperti "Sesi aktif dimulai pada [timestamp]".

Buat Button utama dengan teks "Lanjutkan Sesi". Tombol ini akan mengarahkan pengguna ke halaman sesi.

Langkah 1.2: Integrasi ke Halaman Practice (PracticePage.tsx)
State Management di usePracticeStore (store/practiceStore.ts):

Tambahkan state baru untuk menyimpan sesi aktif: activeRoleplaySession: RoleplaySession | null = null;.

Tambahkan action baru fetchActiveSession:

TypeScript

fetchActiveSession: async () => {
  try {
    // Asumsi endpoint baru ini ada, sesuai instruksi awal
    const response = await apiClient.get('/api/roleplay/sessions/active');
    if (response.success && response.data.session) {
      set({ activeRoleplaySession: response.data.session });
    } else {
      set({ activeRoleplaySession: null });
    }
  } catch (error) {
    console.error('Failed to fetch active roleplay session:', error);
    set({ activeRoleplaySession: null });
  }
},
Panggil fetchActiveSession di PracticePage.tsx:

Di dalam useEffect pada PracticePage.tsx, panggil action fetchActiveSession yang baru dibuat saat komponen dimuat.

TypeScript

const { fetchScenarios, fetchActiveSession, activeRoleplaySession } = usePracticeStore();

useEffect(() => {
  fetchScenarios();
  fetchActiveSession(); // Panggil di sini
}, [fetchScenarios, fetchActiveSession]);
Render Komponen secara Kondisional:

Di dalam PracticePage.tsx, impor ContinueSessionCard.

Render komponen ini di bagian atas halaman, hanya jika activeRoleplaySession tidak null.

TypeScript

{activeRoleplaySession && (
  <ContinueSessionCard activeSession={activeRoleplaySession} />
)}
Langkah 1.3: Modifikasi Alur "Mulai Sesi"
Perbarui logika pada startSession di store/practiceStore.ts untuk menangani jika sesi sudah ada.

Update startSession di usePracticeStore:

Backend POST /api/roleplay/scenarios/:scenarioId/start sekarang akan mengembalikan isOngoing: true jika ada sesi aktif.

Modifikasi action startSession untuk menangani respons ini.

TypeScript

startSession: async (scenarioId: string) => {
  try {
    // ... (logika loading state)
    const response = await practiceService.startSession(scenarioId);

    // Jika backend mengembalikan sesi yang sudah ada
    if (response.success && response.data.isOngoing) {
      const session: RoleplaySession = {
        id: response.data.sessionId,
        // ... (sisa data sesi)
      };
      set({
        currentSession: session,
        isSessionActive: true,
        // ...
      });
      // Langsung arahkan ke halaman sesi
      // (Navigasi akan ditangani di komponen/halaman yang memanggil action ini)
      return session.id;
    }

    // ... (logika untuk memulai sesi baru seperti biasa)

  } catch (error) {
    // ... (error handling)
  }
},
Tahap 2: Penyempurnaan Frontend Fitur Learning
Tujuan: Menyediakan bagian "Sedang Dipelajari" (In Progress) di halaman LearningPage.tsx.

Langkah 2.1: Adaptasi dan Pindahkan Logika ContinueLearning
Komponen src/components/dashboard/ContinueLearning.tsx sudah memiliki logika yang hampir sempurna. Kita akan memodifikasinya menjadi komponen yang lebih umum dan menampilkannya di LearningPage.tsx.

State Management di useLearningStore (store/learningStore.ts):

Buat state baru: ongoingModules: UserProgress[] = [];.

Buat action baru fetchOngoingModules untuk memanggil endpoint GET /api/learning/progress/ongoing.

TypeScript

fetchOngoingModules: async () => {
  try {
    const response = await apiClient.get('/api/learning/progress/ongoing');
    if (response.success) {
      set({ ongoingModules: response.data.progressList });
    }
  } catch (error) {
    console.error('Failed to fetch ongoing modules:', error);
  }
},
Buat Komponen OngoingModulesSection:

Buat file baru src/components/learning/OngoingModulesSection.tsx.

Pindahkan dan adaptasi logika dari ContinueLearning.tsx. Komponen ini akan menerima ongoingModules sebagai prop.

Render setiap item sebagai card yang menampilkan:

Judul modul.

LinearProgress dari Material-UI untuk visualisasi progres (completionPercentage).

Teks "Terakhir diakses: [timestamp]".

Tombol "Lanjutkan Belajar" yang mengarahkan ke halaman detail modul.

Integrasi ke LearningPage.tsx:

Panggil fetchOngoingModules dari useEffect di LearningPage.tsx.

TypeScript

const { modules, fetchModules, ongoingModules, fetchOngoingModules } = useLearningStore();

useEffect(() => {
  fetchModules();
  fetchOngoingModules();
}, [fetchModules, fetchOngoingModules]);
Render OngoingModulesSection di bagian atas halaman jika ongoingModules.length > 0.

Langkah 2.2: Pastikan lastAccessedAt Selalu Terbaru
Pastikan interaksi pengguna di dalam halaman detail modul (ModuleDetailPage.tsx) memicu pembaruan lastAccessedAt.

Verifikasi updateProgress di ModuleDetailPage.tsx:

File src/pages/ModuleDetailPage.tsx sudah memiliki useEffect yang memanggil updateProgress secara berkala.

Pastikan panggilan ke updateProgress di dalam handleSectionComplete dan useEffect sudah mengirim semua data yang diperlukan agar backend dapat memperbarui lastAccessedAt. Logika yang ada saat ini sudah memadai.

Tahap 3: (Opsional) Notifikasi Global
Tujuan: Memberi tahu pengguna tentang aktivitas yang belum selesai setelah mereka login.

Pemeriksaan Saat Aplikasi Dimuat:

Di komponen App.tsx, di dalam hook useWebSocket atau useEffect utama, setelah pengguna terautentikasi (isAuthenticated adalah true).

Panggil action fetchActiveSession dari usePracticeStore dan fetchOngoingModules dari useLearningStore.

Manajemen State Notifikasi:

Buat store Zustand baru (misal: store/notificationStore.ts) atau tambahkan ke store yang sudah ada.

State ini akan menyimpan informasi apakah ada sesi/modul yang aktif, contoh: hasPendingActivities: boolean.

Tampilkan Notifikasi:

Gunakan react-hot-toast yang sudah terintegrasi di App.tsx.

Buat useEffect yang memantau perubahan pada activeRoleplaySession dan ongoingModules.

Jika salah satunya berisi data, panggil toast.custom() atau toast.success() dengan pesan: "Anda memiliki aktivitas yang belum selesai. Lanjutkan?"

Buat agar notifikasi tersebut bisa diklik dan mengarahkan pengguna ke halaman yang relevan (/practice atau /learning).