# FlowAutomator - Cara Menjalankan

## Prerequisites
1. Node.js 18+ sudah terinstall
2. pnpm sudah terinstall

## Cara Menjalankan

### 1. Install Dependencies (Jika belum)
```bash
pnpm install
```

### 2. Build API (Hanya sekali pertama kali)
```bash
cd apps/api
pnpm build
cd ../..
```

### 3. Jalankan Development Servers

**Terminal 1 - Backend API:**
```bash
cd apps/api
pnpm dev
```
API akan berjalan di: http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd apps/web
pnpm dev
```
Frontend akan berjalan di: http://localhost:3005

## Testing

1. Buka browser: **http://localhost:3005**
2. Klik tombol **"Add Node"** untuk menambah node
3. Isi URL pada node (contoh: `https://api.github.com`)
4. Hubungkan node-node dengan drag & drop
5. Klik tombol **"Execute"** untuk menjalankan workflow
6. Lihat hasil real-time di panel kanan bawah

## Troubleshooting

### Jika API error "Cannot find module dist/main"
```bash
cd apps/api
pnpm build
pnpm dev
```

### Jika port 3005 sudah dipakai
Edit `apps/web/package.json` dan ganti port di script `dev` dan `start`

### Jika ada error database
API akan tetap berjalan meskipun belum ada database PostgreSQL (untuk development tanpa database)
