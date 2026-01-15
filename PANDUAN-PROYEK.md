# 🚀 FlowAutomator (N8N Clone) - Project Guide

## 📊 Status Proyek Saat Ini

| Komponen | Status | Keterangan |
|----------|--------|------------|
| ✅ Frontend UI | Selesai | Dark theme, sidebar, canvas, config panel |
| ✅ Node Architecture | Selesai | Interface, BaseNode, Registry |
| ✅ Sample Nodes | Selesai | HTTP, Telegram, WhatsApp |
| ⏳ Backend Execution | Sebagian | WebSocket ada, perlu integrasi node |
| ❌ Database | Perlu Setup | Prisma schema ada, perlu migrate |
| ❌ Auth | Belum | User authentication |

---

## 📁 Struktur Proyek

```
N8N CLONE/
├── apps/
│   ├── web/                    # 🖥️ FRONTEND (Next.js)
│   │   └── src/
│   │       ├── app/            # Pages (layout, page)
│   │       ├── components/     # UI Components
│   │       │   ├── Sidebar.tsx         # Panel node (kiri)
│   │       │   ├── TopBar.tsx          # Toolbar atas
│   │       │   ├── ConfigPanel.tsx     # Konfigurasi node (kanan)
│   │       │   ├── WorkflowCanvas.tsx  # Canvas workflow
│   │       │   └── nodes/              # Komponen node visual
│   │       ├── hooks/          # React hooks
│   │       └── store/          # Zustand state
│   │
│   └── api/                    # 🔧 BACKEND (NestJS)
│       └── src/
│           ├── nodes/          # ⭐ NODE ARCHITECTURE
│           │   ├── Node.interface.ts   # Interface utama
│           │   ├── BaseNode.ts         # Abstract class
│           │   ├── NodeRegistry.ts     # Registry semua node
│           │   └── implementations/    # Node implementations
│           │       ├── HttpRequestNode.ts
│           │       ├── TelegramBotNode.ts
│           │       └── whatsapp/
│           ├── execution/      # Workflow execution engine
│           ├── workflows/      # Workflow CRUD
│           └── prisma/         # Database
│
└── packages/
    └── shared-types/           # 📦 Shared TypeScript types
```

---

## 🎯 LANGKAH SELANJUTNYA (Pilih Salah Satu)

### Opsi A: Jalankan & Test Frontend
Cukup untuk demo visual. UI sudah bisa digunakan.

```bash
cd apps/web
npm run dev
```
Buka: http://localhost:3000

---

### Opsi B: Setup Database (PostgreSQL)
Agar workflow bisa disimpan ke database.

1. **Install PostgreSQL** (jika belum)
2. **Buat database:**
   ```sql
   CREATE DATABASE flowautomator;
   ```
3. **Set environment variable:**
   ```bash
   # apps/api/.env
   DATABASE_URL="postgresql://user:password@localhost:5432/flowautomator"
   ```
4. **Jalankan migrasi:**
   ```bash
   cd apps/api
   npx prisma migrate dev
   ```

---

### Opsi C: Jalankan Backend + Frontend
Full stack development.

**Terminal 1 - Backend:**
```bash
cd apps/api
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/web
npm run dev
```

---

### Opsi D: Tambah Node Baru
Buat integrasi layanan baru (Google Sheets, Slack, dll).

1. Buat folder: `apps/api/src/nodes/implementations/[nama-service]/`
2. Buat file:
   - `[nama].node.ts` - Implementasi node
   - `[nama].types.ts` - Type definitions
   - `index.ts` - Exports
3. Register di `NodeRegistry.ts`

---

## ❓ APA YANG INGIN ANDA LAKUKAN?

Pilih salah satu dan beritahu saya:

1. **"Jalankan saja"** - Saya bantu start dan test
2. **"Setup database"** - Saya bantu konfigurasi PostgreSQL
3. **"Tambah node X"** - Beritahu layanan apa (Gmail, Slack, Discord, dll)
4. **"Lengkapi fitur Y"** - Auth, execution history, dll
5. **"Deploy"** - Saya bantu setup Docker untuk production

---

## 📝 Quick Commands

| Perintah | Deskripsi |
|----------|-----------|
| `cd apps/web && npm run dev` | Jalankan frontend |
| `cd apps/api && npm run start:dev` | Jalankan backend |
| `npx prisma studio` | Buka database GUI |
| `npm run build` | Build untuk production |

---

Beritahu saya apa yang ingin Anda lakukan selanjutnya! 🎯
