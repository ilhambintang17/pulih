# Pulih - Chatbot Psikolog AI 🌿

**Pulih** adalah platform chatbot berbasis AI yang dirancang untuk memberikan dukungan psikologis awal dan ruang aman bagi pengguna, khususnya korban kekerasan seksual. Aplikasi ini menyediakan teman bicara yang empatik, non-judgmental, dan tersedia 24/7.

![Tampilan Aplikasi](public/img/preview.png)

![Chat Interface](public/img/chat_preview.png)

## ✨ Fitur Utama

### 💬 Chatbot AI Empatik
- **Respons Humanis**: AI yang merespons seperti teman baik, bukan robot. Menggunakan bahasa sehari-hari yang hangat dan validatif.
- **Trauma-Informed**: Didesain khusus untuk korban kekerasan seksual dengan pendekatan yang sensitif dan non-judgmental.
- **Mode Krisis**: Deteksi otomatis kondisi krisis dengan respons yang lebih intens dan empati mendalam sebelum menawarkan resources.
- **Context-Aware**: AI mengingat riwayat percakapan, mood terkini, dan catatan jurnal untuk memberikan respons yang lebih personal.
- **Real-time Streaming**: Respons AI muncul secara bertahap seperti mengetik, memberikan pengalaman yang lebih natural.

### 📊 Mood Tracker
- **Log Mood Harian**: Catat perasaanmu dengan 5 level emoji ekspresif.
- **Catatan Opsional**: Tambahkan catatan singkat untuk setiap mood yang dicatat.
- **Grafik 7 Hari**: Visualisasi mood mingguan dengan Chart.js.
- **Weekly Summary**: Ringkasan mood mingguan dengan insight otomatis.
- **Integrasi AI**: Mood terbaru digunakan AI untuk memberikan respons yang lebih relevan.

### 📓 Journal / Catatan Harian
- **Ruang Aman**: Catat perasaan dan perjalanan pemulihanmu dalam jurnal pribadi.
- **Dashboard Modern**: Tampilan jurnal dengan sidebar dan list entry yang elegan.
- **Edit Entry**: Edit catatan jurnal yang sudah ada.
- **Hapus Entry**: Hapus catatan yang tidak diinginkan.
- **Integrasi AI**: AI membaca 5 jurnal terakhir untuk memberikan saran yang lebih personal.

### 🧘 Latihan Pernapasan (Breathing Exercise)
- **Guided Breathing**: Latihan napas 4-7-8 yang terpandu dengan animasi visual.
- **Animasi Interaktif**: Lingkaran yang mengembang dan mengecil mengikuti ritme napas.
- **Progress Text**: Panduan teks real-time (Tarik Napas → Tahan → Hembuskan).

### 🚨 Emergency / Crisis Support
- **Deteksi Otomatis**: AI mendeteksi kata-kata krisis dan menampilkan modal darurat.
- **Akses Cepat 119**: Tombol langsung untuk menghubungi hotline darurat nasional.
- **Non-Judgmental**: Opsi untuk tetap curhat jika pengguna belum siap bicara dengan profesional.

### 👤 Manajemen Profil & Autentikasi
- **Register & Login**: Sistem autentikasi lengkap dengan validasi.
- **Mode Anonim**: Opsi chat tanpa registrasi untuk privasi maksimal.
- **Profil Pengguna**: Ubah nama panggilan dan lihat status keanggotaan.
- **Session Management**: Login aman dengan session yang terenkripsi.

### 🎨 User Experience
- **Dark Mode & Light Mode**: Toggle manual dengan tampilan yang nyaman di mata.
- **Glassmorphism Design**: Desain premium dengan efek kaca modern.
- **Responsive Design**: Optimal di Desktop maupun Mobile (termasuk fix viewport Android).
- **Smart Suggestions**: Tombol saran cepat saat tidak tahu harus mulai dari mana.
- **Riwayat Chat**: Simpan dan akses kembali sesi percakapan sebelumnya.

### 🎤 Voice-to-Text
- **Speech Recognition**: Fitur input suara menggunakan Web Speech API native.
- **Bahasa Indonesia**: Dioptimalkan untuk pengenalan bahasa Indonesia (id-ID).
- **Toggle Recording**: Klik tombol mic untuk mulai/stop merekam.
- **Visual Feedback**: Animasi heartbeat saat merekam aktif.

### 🌿 Grounding Exercise (5-4-3-2-1)
- **Teknik Grounding**: Latihan grounding 5-4-3-2-1 untuk mengatasi kecemasan dan flashback.
- **Step-by-Step Guide**: Panduan interaktif melalui 5 indera (lihat, sentuh, dengar, cium, rasa).
- **Progress Tracking**: Indikator progress untuk setiap langkah.
- **Input Fleksibel**: User bisa memasukkan beberapa hal sekaligus atau satu per satu.

### 📋 Self-Assessment (PHQ-9 & GAD-7)
- **PHQ-9**: Kuesioner standar untuk mengukur tingkat depresi (9 pertanyaan).
- **GAD-7**: Kuesioner standar untuk mengukur tingkat kecemasan (7 pertanyaan).
- **Hasil Otomatis**: Interpretasi skor dengan kategori (minimal, ringan, sedang, berat).
- **Riwayat Assessment**: Simpan dan lihat riwayat assessment sebelumnya.

### 📈 Progress Dashboard
- **Mood Analytics**: Grafik mood dengan rentang 7, 30, atau 90 hari.
- **Mood Statistics**: Rata-rata mood, tren, dan distribusi mood.
- **Achievement Gallery**: Lihat semua achievement yang sudah dan belum diraih.
- **Assessment History**: Riwayat hasil PHQ-9 dan GAD-7 dengan grafik.
- **Streak Tracking**: Visualisasi streak login dan aktivitas.

### 🏆 Gamification & Achievements
- **Achievement System**: Unlock achievement melalui berbagai aktivitas.
- **Streak Counter**: Hitung hari berturut-turut menggunakan aplikasi.
- **Progress Badges**: Dapatkan badge untuk milestone tertentu (first chat, 7-day streak, dll).
- **Toast Notifications**: Pemberitahuan saat unlock achievement baru.

### 🛡️ Safety Plan Builder
- **Personal Safety Plan**: Buat rencana keselamatan pribadi untuk saat krisis.
- **Warning Signs**: Identifikasi tanda-tanda peringatan dini.
- **Coping Strategies**: Catat strategi koping yang berhasil.
- **Support Network**: Daftar kontak dan tempat aman.
- **Export Plan**: Ekspor safety plan untuk dicetak atau disimpan.

### 💬 Daily Affirmations
- **Rotating Affirmations**: Kata-kata positif yang berganti setiap kunjungan.
- **Curated Content**: Koleksi afirmasi yang relevan untuk pemulihan.
- **Sidebar Display**: Ditampilkan di sidebar untuk reminder positif.

### 🔐 Admin Panel
- **Secure Authentication**: Login admin dengan rate limiting dan exponential backoff.
- **Dashboard Analytics**: Statistik pengguna, sesi chat, dan aktivitas counseling.
- **User Management**: Lihat, cari, dan kelola akun pengguna.
- **Chat Monitoring**: Pantau sesi chat terbaru untuk quality assurance.
- **Mood Statistics**: Agregasi data mood seluruh pengguna.
- **Journal Monitoring**: Akses jurnal terbaru untuk deteksi krisis.

#### Admin Roles
| Role | Permissions |
|------|-------------|
| **super_admin** | Full access: user management, chat monitoring, analytics, system settings |

### 📱 Mobile-First Responsive Design
- **Optimized Mobile UI**: Sidebar compact dengan tombol hamburger.
- **Touch-Friendly**: Tombol dan area scroll yang mudah disentuh.
- **Light Mode Default**: Default theme light dengan opsi dark mode.
- **Auto-Close Sidebar**: Sidebar otomatis tertutup setelah memilih menu di mobile.

## 📊 Application Flowchart

### User Flow

```mermaid
flowchart TB
    subgraph Entry["🚀 Entry Point"]
        A[("👤 User")] --> B["🏠 Landing Page"]
    end

    subgraph Auth["🔐 Authentication"]
        B --> C{Login Method?}
        C -->|Register| D["📝 Create Account"]
        C -->|Login| E["🔑 Enter Credentials"]
        C -->|Anonymous| F["👻 Skip Auth"]
        D --> G["✅ Authenticated"]
        E --> G
        F --> G
    end

    subgraph MainApp["💬 Main Application"]
        G --> H["💭 Chat Interface"]
        
        H --> I["📊 Mood Tracker"]
        H --> J["📓 Journal"]
        H --> K["🧘 Breathing"]
        H --> L["🌿 Grounding"]
        H --> M["📋 Self-Test"]
        H --> N["📈 Progress"]
        H --> O["👤 Profile"]
    end

    subgraph Features["⚙️ Feature Details"]
        I --> I1["Log Mood 1-5"] --> I2["View 7-Day Graph"]
        J --> J1["Write Entry"] --> J2["AI Feedback"]
        K --> K1["4-7-8 Breathing"] --> K2["Guided Animation"]
        L --> L1["5-4-3-2-1 Senses"] --> L2["Step-by-Step Guide"]
        M --> M1["PHQ-9 / GAD-7"] --> M2["Score & Severity"]
        N --> N1["Analytics Dashboard"] --> N2["Achievements"]
    end

    subgraph AIEngine["🤖 AI Processing"]
        H -->|User Message| P["🧠 AI Context Engine"]
        I2 -.->|Mood Data| P
        J2 -.->|Journal Data| P
        M2 -.->|Assessment Data| P
        
        P --> Q["🎯 AI Counselor LLM"]
        Q --> R{Crisis Detection?}
        R -->|No| S["💚 Empathic Response"]
        R -->|Yes| T["🚨 Crisis Response"]
        T --> U["📞 Hotline 119 Access"]
        S --> H
        T --> H
    end

    subgraph Database["💾 Data Storage"]
        I1 --> DB[("🗄️ MySQL Database")]
        J1 --> DB
        M1 --> DB
        O --> DB
    end

    style Entry fill:#1a1a2e,stroke:#16213e,color:#fff
    style Auth fill:#16213e,stroke:#0f3460,color:#fff
    style MainApp fill:#0f3460,stroke:#e94560,color:#fff
    style AIEngine fill:#533483,stroke:#e94560,color:#fff
    style Database fill:#1a1a2e,stroke:#16213e,color:#fff
```

### Admin Panel Flow

```mermaid
flowchart TB
    subgraph AdminAuth["🔐 Admin Authentication"]
        AA[("🔑 Admin")] --> AB["📄 /admin/login.html"]
        AB --> AC{Valid Credentials?}
        AC -->|No| AD["❌ Rate Limited"]
        AD -->|Retry| AB
        AC -->|Yes| AE["🎫 Generate Token"]
        AE --> AF["✅ Authenticated"]
    end

    subgraph Dashboard["📊 Admin Dashboard"]
        AF --> AG["🏠 Dashboard Home"]
        
        AG --> AH["📈 Statistics Overview"]
        AH --> AH1["Total Users"]
        AH --> AH2["Active Sessions"]
        AH --> AH3["Mood Distribution"]
        AH --> AH4["Chat Activity Graph"]
    end

    subgraph UserMgmt["👥 User Management"]
        AG --> AI["👥 /admin/users.html"]
        AI --> AI1["🔍 Search Users"]
        AI --> AI2["📋 View User List"]
        AI2 --> AI3["👁️ View Details"]
        AI2 --> AI4["⏸️ Suspend User"]
        AI2 --> AI5["🗑️ Delete User"]
    end

    subgraph Monitoring["📡 Monitoring"]
        AG --> AJ["💬 Chat Monitoring"]
        AJ --> AJ1["Recent Chats"]
        AJ --> AJ2["View Chat Details"]
        
        AG --> AK["📓 Journal Monitoring"]
        AK --> AK1["Recent Entries"]
        AK --> AK2["Crisis Detection Review"]
    end

    subgraph DataFlow["🔄 Data Flow"]
        AI3 --> DB2[("🗄️ MySQL")]
        AJ2 --> DB2
        AK1 --> DB2
        AH1 --> DB2
    end

    style AdminAuth fill:#1a1a2e,stroke:#e94560,color:#fff
    style Dashboard fill:#16213e,stroke:#0f3460,color:#fff
    style UserMgmt fill:#0f3460,stroke:#533483,color:#fff
    style Monitoring fill:#533483,stroke:#e94560,color:#fff
    style DataFlow fill:#1a1a2e,stroke:#16213e,color:#fff
```

### Penjelasan Alur User

| Step | Proses | Deskripsi |
|------|--------|-----------|
| 1 | **Entry** | User membuka aplikasi via Landing Page |
| 2 | **Auth** | Login/Register atau Mode Anonim |
| 3 | **Chat** | Antarmuka utama untuk berkomunikasi dengan AI |
| 4 | **Features** | Akses Mood Tracker, Journal, Breathing, Grounding, Self-Test, Progress |
| 5 | **AI Context** | Data user (mood, jurnal, assessment) digunakan untuk personalisasi |
| 6 | **AI Response** | LLM memproses pesan dengan crisis detection |
| 7 | **Crisis Path** | Jika terdeteksi krisis → respons khusus + akses hotline 119 |

### Penjelasan Alur Admin

| Step | Proses | Deskripsi |
|------|--------|-----------|
| 1 | **Login** | Admin akses `/admin/login.html` dengan credentials dari env |
| 2 | **Rate Limit** | Proteksi brute-force dengan exponential backoff |
| 3 | **Dashboard** | Statistik: total users, sessions, mood distribution, activity |
| 4 | **User Mgmt** | Search, view, suspend, delete users |
| 5 | **Monitoring** | Pantau chat sessions dan journal entries untuk QA |

## 🛠️ Teknologi yang Digunakan

| Kategori | Teknologi |
|----------|-----------|
| **Frontend** | HTML5, Vanilla JavaScript (ES Modules), Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL (JawsDB di Heroku) |
| **AI Engine** | Heroku Inference API (Server-side Streaming) |
| **Charts** | Chart.js |
| **Icons** | Google Material Symbols |
| **Deployment** | Heroku |

## 🚀 Cara Menjalankan Project (Lokal)

### Prasyarat
- Node.js (v18 atau lebih baru)
- npm (Node Package Manager)
- MySQL Database (Lokal atau Cloud)

### Instalasi

1. **Clone Repository**
   ```bash
   git clone https://github.com/ilhambintang17/pulih.git
   cd pulih
   ```

2. **Install Dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variable**
   Buat file `.env` di direktori utama (lihat `.env.example`):
   ```env
   PORT=3000
   
   # Database
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=password_db_kamu
   DB_NAME=pisikologchatbot
   # JAWSDB_URL=mysql://user:pass@host:port/dbname  # For Heroku

   # AI Configuration
   INFERENCE_URL=https://us.inference.heroku.com
   INFERENCE_KEY=your_inference_key
   INFERENCE_MODEL_ID=your_model_id

   # Admin Panel
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_secure_password
   ```

4. **Jalankan Server**
   ```bash
   npm start
   ```
   Akses aplikasi di `http://localhost:3000`

## 📦 Deployment (Heroku)

1. Login ke Heroku:
   ```bash
   heroku login
   heroku container:login
   ```

2. Tambahkan Addon JawsDB (MySQL):
   ```bash
   heroku addons:create jawsdb:kitefin
   ```

3. Set Environment Variables di Dashboard Heroku atau via CLI.

4. Push ke Heroku:
   ```bash
   git push heroku main
   ```

## 📁 Struktur Project

```
pulih/
├── public/
│   ├── index.html          # Landing & Login Page
│   ├── chat.html           # Main Chat Interface
│   ├── profile.html        # User Profile Page
│   ├── admin/              # Admin Panel
│   │   ├── index.html      # Admin Dashboard
│   │   ├── login.html      # Admin Login
│   │   ├── users.html      # User Management
│   │   ├── css/            # Admin Styles
│   │   └── js/             # Admin Scripts
│   ├── css/                # Main Stylesheets
│   ├── js/
│   │   ├── auth.js         # Authentication Logic
│   │   ├── chat.js         # Chat UI & Events
│   │   ├── chat-logic.js   # Chat Business Logic
│   │   ├── config.js       # Tailwind Config & Theme
│   │   ├── dashboard.js    # Dashboard Controller
│   │   ├── profile.js      # Profile Page Logic
│   │   ├── components/     # Reusable Components
│   │   ├── services/       # API Services
│   │   └── modules/
│   │       ├── achievements.js  # Achievement System
│   │       ├── affirmations.js  # Daily Affirmations
│   │       ├── assessment.js    # PHQ-9/GAD-7 Assessment
│   │       ├── breathing.js     # Breathing Exercise
│   │       ├── grounding.js     # Grounding 5-4-3-2-1
│   │       ├── journal.js       # Journal CRUD
│   │       ├── mood.js          # Mood Tracker
│   │       ├── progress.js      # Progress Dashboard
│   │       ├── safetyplan.js    # Safety Plan Builder
│   │       ├── ui.js            # UI Utilities
│   │       └── VoiceRecorder.js # Voice-to-Text
│   ├── img/                # Images & Assets
│   └── legacy/             # Legacy Files
├── server/
│   ├── routes/
│   │   ├── achievements.js # Achievements API
│   │   ├── admin.js        # Admin Panel API
│   │   ├── assessment.js   # Assessment API
│   │   ├── auth.js         # Auth Endpoints
│   │   ├── chat.js         # Chat & AI Endpoint
│   │   ├── grounding.js    # Grounding API
│   │   ├── journal.js      # Journal CRUD API
│   │   ├── mood.js         # Mood Tracker API
│   │   ├── profile.js      # Profile API
│   │   ├── safetyplan.js   # Safety Plan API
│   │   └── utils.js        # Utility Endpoints
│   ├── utils/
│   │   ├── adminDb.js      # Admin Database Queries
│   │   ├── db.js           # Database Connection
│   │   ├── systemPrompt.js # AI System Prompts
│   │   ├── manual_migrate.js # DB Migration Script
│   │   └── resetDb.js      # DB Reset Utility
│   └── config/
│       └── schema.sql      # Database Schema
├── data/
│   ├── achievements-config.json  # Achievement Definitions
│   ├── affirmations.json         # Affirmation Collection
│   ├── chats.json                # Chat Data (dev)
│   └── users.json                # User Data (dev)
├── docs/
│   └── flowchart.png       # Application Flowchart
├── server.js               # Main Server Entry
├── package.json
└── README.md
```

## 🤝 Kontribusi

1. **Fork** repository ini.
2. Buat branch fitur baru (`git checkout -b fitur-keren`).
3. Commit perubahan Anda (`git commit -m 'Menambahkan fitur keren'`).
4. Push ke branch (`git push origin fitur-keren`).
5. Buat **Pull Request**.

## 📄 Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

---
*Dibuat dengan ❤️ untuk kesehatan mental Indonesia.*
