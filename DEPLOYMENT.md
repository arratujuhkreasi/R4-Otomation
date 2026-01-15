# FlowAutomator Deployment Guide
## Vercel + Deta.space + Neon (100% FREE)

---

# 📋 PHASE 1: Setup Database (Neon)

## Langkah 1.1: Buat Akun Neon
1. Buka **https://neon.tech**
2. Klik **Sign Up** (bisa pakai GitHub/Google)
3. Tidak perlu kartu kredit!

## Langkah 1.2: Buat Database
1. Klik **Create Project**
2. Project name: `flowautomator`
3. Region: **Singapore** (pilih terdekat)
4. Klik **Create**

## Langkah 1.3: Copy Connection String
1. Di dashboard, klik **Connection Details**
2. Copy **Connection string** (format pooled):
```
postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```
3. **SIMPAN** string ini! Akan dipakai nanti.

---

# 📋 PHASE 2: Setup Backend (Deta.space)

## Langkah 2.1: Buat Akun Deta.space
1. Buka **https://deta.space**
2. Klik **Join Waitlist** atau **Login**
3. Buat akun (gratis, tanpa CC)

## Langkah 2.2: Install Space CLI
```bash
# Windows (PowerShell as Admin)
iwr https://deta.space/assets/space-cli.ps1 -useb | iex

# Mac/Linux
curl -fsSL https://deta.space/assets/space-cli.sh | sh

# Verify
space --version
```

## Langkah 2.3: Login CLI
```bash
space login
# Browser akan terbuka, klik Authorize
```

## Langkah 2.4: Deploy Backend
```bash
cd apps/api

# Initialize Space app
space new

# Deploy
space push
```

## Langkah 2.5: Set Environment Variables
Di Deta.space dashboard:
1. Buka app **flowautomator-api**
2. Klik **Settings** → **Configuration**
3. Tambahkan:
   - `DATABASE_URL` = (dari Neon)
   - `JWT_SECRET` = (dari .env)
   - `ENCRYPTION_KEY` = (dari .env)
   - `NODE_ENV` = production

---

# 📋 PHASE 3: Setup Frontend (Vercel)

## Langkah 3.1: Push ke GitHub
```bash
# Di root folder project
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/flowautomator.git
git push -u origin main
```

## Langkah 3.2: Deploy ke Vercel
1. Buka **https://vercel.com**
2. Klik **Sign Up** (pakai GitHub)
3. Klik **Add New** → **Project**
4. Import repo **flowautomator**
5. Configure:
   - **Root Directory**: `apps/web`
   - **Framework**: Next.js
6. Environment Variables:
   - `NEXT_PUBLIC_API_URL` = `https://your-deta-app.deta.app`
7. Klik **Deploy**

---

# � PHASE 4: SSL Certificate

## ✅ OTOMATIS!
- **Vercel**: SSL otomatis untuk semua domain
- **Deta.space**: SSL otomatis untuk semua apps
- **Neon**: SSL untuk database connections

**Tidak perlu setup SSL manual!** 🎉

---

# 📋 PHASE 5: Custom Domain (Opsional)

## Vercel Custom Domain
1. Di Vercel Dashboard, buka project
2. **Settings** → **Domains**
3. Tambahkan domain: `flowautomator.com`
4. Update DNS di provider domain Anda

## Deta.space Custom Domain
1. Di Space Dashboard, buka app
2. **Settings** → **Custom Domain**
3. Tambahkan: `api.flowautomator.com`

---

# ✅ Final Checklist

- [ ] Neon database created
- [ ] Connection string saved
- [ ] Backend deployed to Deta.space
- [ ] Environment variables set
- [ ] Frontend deployed to Vercel
- [ ] API URL configured
- [ ] SSL working (automatic)
- [ ] Test login/register
