# 🚂 Railway Deployment Guide for OsonPrava

Bu qo'llanma OsonPrava loyihasini Railway platformasida ishga tushirish uchun.

## 📋 Arxitektura (Railway'da)

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│  OsonPrava Backend  │     │   EasyPrava Bot     │     │  OsonPrava Web      │
│  (NestJS API)       │     │  (Telegram Bot)     │     │  (Next.js)          │
│  Port: 3001         │     │  Port: 3002         │     │  Port: 3000         │
└──────────┬──────────┘     └──────────┬──────────┘     └─────────────────────┘
           │                           │
           ├──────────────┬────────────┘
           │              │
    ┌──────▼──────┐ ┌────▼────────┐
    │   Postgres  │ │    Redis    │
    │   (Railway) │ │  (Railway)  │
    └─────────────┘ └─────────────┘
```

**Eslatma:** `apps/app` (React SPA/PWA) alohida deploy qilinadi yoki backend orqali serve qilinadi.

---

## 🎯 Deployment Qadamlari

### 1️⃣ Railway'da Yangi Project Yarating

1. [Railway](https://railway.app/) ga kiring
2. "New Project" bosing
3. GitHub repozitoriyangizni ulang

### 2️⃣ Database'larni Qo'shing

#### PostgreSQL qo'shish:
1. Project dashboard'da "+ New" → "Database" → "Add PostgreSQL"
2. Railway avtomatik `DATABASE_URL` environment variable yaratadi
3. Database connection string'ni eslab qoling

#### Redis qo'shish:
1. "+ New" → "Database" → "Add Redis"
2. Railway avtomatik `REDIS_URL` environment variable yaratadi

### 3️⃣ Backend (API) Deploy Qilish

1. Root repozitoriyangizni Railway'ga ulang (agar hali ulanmagan bo'lsa)
2. Services bo'limidan `apps/api` ni ajratib deploy qiling:
   - Railway Dashboard → Settings → Root Directory: `apps/api`
   - Build Command: `pnpm install && pnpm --filter @osonprava/api build`
   - Start Command: `npx prisma migrate deploy && pnpm --filter @osonprava/api start`

3. **Environment Variables** ni qo'shing:
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=<Railway'dan avtomatik>
   REDIS_URL=<Railway'dan avtomatik>
   JWT_ACCESS_SECRET=<kuchli random string>
   JWT_REFRESH_SECRET=<kuchli random string>
   JWT_ACCESS_EXPIRES=15m
   JWT_REFRESH_EXPIRES=7d
   WEB_APP_URL=<web-frontend URL (keyinroq qo'shiladi)>
   ```

4. **Domain** qo'shing (ixtiyoriy):
   - Settings → Domains → Generate Domain yoki Custom Domain

5. **Database Migration** ishga tushiring:
   ```bash
   # Railway'dagi PostgreSQL URL'ni oling
   # Settings → Variables → DATABASE_URL
   ```
   Migration avtomatik start command orqali ishlaydi.

### 4️⃣ Telegram Bot Deploy Qilish

1. Services bo'limidan `apps/bot` ni deploy qiling:
   - Railway Dashboard → Settings → Root Directory: `apps/bot`
   - Build Command: `pnpm install && pnpm --filter @osonprava/bot build`
   - Start Command: `pnpm --filter @osonprava/bot start`

2. **Environment Variables** ni qo'shing:
   ```
   BOT_TOKEN=<Telegram BotFather'dan olingan token>
   BOT_API_KEY=<backend'dagi bot api key bilan bir xil>
   BOT_MODE=polling  # yoki webhook
   API_URL=<backend-ingiz URL>/api/v1
   # Masalan: https://backend-production-xxxx.up.railway.app/api/v1
   ```

3. **Agar webhook mode ishlatmoqchi bo'lsangiz:**
   ```
   BOT_MODE=webhook
   WEBHOOK_DOMAIN=<bot-domainingiz>.railway.app
   WEBHOOK_PATH=/bot/webhook
   WEBHOOK_SECRET=<random secret>
   ```

### 5️⃣ Frontend (Web) Deploy Qilish

1. Services bo'limidan `apps/web` ni deploy qiling:
   - Railway Dashboard → Settings → Root Directory: `apps/web`
   - Build Command: `pnpm install && pnpm --filter @osonprava/web build`
   - Start Command: `pnpm --filter @osonprava/web start`

2. **Environment Variables** ni qo'shing:
   ```
   NEXT_PUBLIC_API_URL=<backend-ingiz URL>/api/v1
   NEXT_PUBLIC_WEB_URL=<web-ingiz URL>
   ```

3. **Domain** qo'shing:
   - `web-production-xxxx.up.railway.app`

### 6️⃣ React SPA (App) Deploy Qilish (Ixtiyoriy)

`apps/app` Vite bilan build qilingan va nginx orqali serve qilinadi. Uni ikki xil usulda deploy qilishingiz mumkin:

#### Variant A: Backend orqali serve qilish (Tavsiya etiladi)
Backend API'ga static fayllarni serve qilish qo'shing:
```typescript
// apps/api/src/main.ts
import { join } from 'path';
app.useStaticAssets(join(__dirname, '..', '..', 'app', 'dist'));
```

#### Variant B: Alohida static hosting
1. `apps/app` ni build qiling:
   ```bash
   pnpm --filter @osonprava/app build
   ```
2. `apps/app/dist` ni Vercel, Netlify yoki Railway'dagi nginx service'ga joylashtiring

### 7️⃣ Service'lar Bog'lash

Barcha service'larni bog'lash uchun:
1. Railway Dashboard → Canvas view
2. Backend'ni Postgres va Redis'ga bog'lang (drag & drop)
3. Bot'ni Backend va Redis'ga bog'lang
4. Web'ni Backend'ga bog'lang

Railway avtomatik internal DNS yaratadi:
- Postgres: `postgres.railway.internal`
- Redis: `redis.railway.internal`
- Backend: `backend-production-xxxx.up.railway.app`

---

## 🔧 Muhim Sozlamalar

### Environment Variables Xulosasi

#### Backend (API):
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...  # Railway'dan
REDIS_URL=redis://...          # Railway'dan
JWT_ACCESS_SECRET=<random>
JWT_REFRESH_SECRET=<random>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
WEB_APP_URL=<frontend URL>
AWS_S3_BUCKET=<agar S3 ishlatilsa>
AWS_ACCESS_KEY_ID=<agar S3 ishlatilsa>
AWS_SECRET_ACCESS_KEY=<agar S3 ishlatilsa>
EMAIL_HOST=<agar email ishlatilsa>
EMAIL_USER=<agar email ishlatilsa>
EMAIL_PASSWORD=<agar email ishlatilsa>
```

#### Bot:
```env
BOT_TOKEN=<Telegram token>
BOT_API_KEY=<backend bilan bir xil>
BOT_MODE=polling
API_URL=<backend URL>/api/v1
```

#### Web (Next.js):
```env
NEXT_PUBLIC_API_URL=<backend URL>/api/v1
```

---

## 🚨 Troubleshooting

### ❌ "Database connection failed"
- Railway'da PostgreSQL plugin qo'shilganligini tekshiring
- `DATABASE_URL` environment variable to'g'riligini tekshiring

### ❌ "Redis connection failed"
- Railway'da Redis plugin qo'shilganligini tekshiring
- `REDIS_URL` environment variable to'g'riligini tekshiring

### ❌ "Prisma migration failed"
- `DATABASE_URL` to'g'riligini tekshiring
- Backend logs'da migration xatolarini ko'ring
- Qo'lda migration ishga tushiring: `pnpm prisma migrate deploy`

### ❌ "Bot ishlamayapti"
- `BOT_TOKEN` to'g'riligini tekshiring (BotFather'dan)
- `API_URL` backend'ga to'g'ri yo'naltirilganligini tekshiring
- Bot logs'da error xabarlarini ko'ring

### ❌ "CORS error"
- Backend'da `WEB_APP_URL` environment variable'ni yangilang
- `apps/api/src/main.ts` da CORS sozlamalarini tekshiring

---

## 📊 Monitoring va Logs

### Railway Logs ko'rish:
1. Railway Dashboard → Service → Deployments → View Logs
2. Real-time logs va error'larni ko'ring

### Health Check:
- Backend: `https://<backend-url>/api/v1/health`
- Bot: Polling mode'da health endpoint yo'q
- Web: `https://<web-url>/`

---

## 🔄 CI/CD (Avtomatik Deployment)

Railway avtomatik GitHub'dan deploy qiladi:
1. GitHub repository'ni Railway'ga ulang
2. Push qilganda avtomatik build va deploy boshlanadi
3. Branch qoidalarini sozlang: Settings → Deployments → Deploy Branches

---

## 💰 Railway Pricing

Railway **usage-based pricing** ishlatadi:
- PostgreSQL: $0.17/GB per month
- Redis: $0.17/GB per month
- Compute: $0.000231/GB-second
- Egress: $0.10/GB

Tahminiy oylik narx (small project): **$5-15/oy**

---

## 🎯 Quick Start Checklist

- [ ] Railway project yaratildi
- [ ] PostgreSQL plugin qo'shildi
- [ ] Redis plugin qo'shildi
- [ ] Backend (API) deploy qilindi
- [ ] Bot deploy qilindi
- [ ] Web deploy qilindi
- [ ] Barcha environment variables to'ldirildi
- [ ] Service'lar bog'landi (Canvas view)
- [ ] Database migration ishga tushdi
- [ ] Health check'lar ishlayapti
- [ ] Bot Telegram'da javob bermoqda
- [ ] Frontend ochilmoqda

---

## 📞 Yordam

Savollar uchun:
- Telegram: @OsonPravaSupport
- GitHub Issues: https://github.com/<your-repo>/issues
