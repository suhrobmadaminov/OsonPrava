# OsonPrava — PDD Platform

OsonPrava is an educational platform for learning traffic rules (PDD) of Uzbekistan. It features exam simulation, spaced repetition learning, and 1v1 battles.

## Architecture

Monorepo powered by **pnpm + Turborepo**:

| Package | Tech | Port | Description |
|---------|------|------|-------------|
| `apps/api` | NestJS + Prisma + PostgreSQL | 3001 | REST API backend |
| `apps/app` | React + Vite + Zustand + PWA | 5173 | Web application (app.osonprava.uz) |
| `apps/web` | Next.js 14 | 3000 | Marketing site (osonprava.uz) |
| `apps/bot` | grammY (Telegram bot) | — | Telegram bot integration |

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL 15+
- Redis 7+

### Setup

```bash
# Install dependencies
pnpm install

# Set up environment files
cp apps/api/.env.example apps/api/.env
cp apps/app/.env.example apps/app/.env  # if exists
cp apps/bot/.env.example apps/bot/.env

# Run database migrations
cd apps/api && npx prisma migrate dev

# Seed database
cd apps/api && npx prisma db seed

# Start all apps
pnpm dev
```

## API Endpoints

### Authentication

#### Telegram Auth (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/telegram` | Login via Telegram WebApp widget |
| `POST` | `/auth/telegram-bot` | Login via Telegram bot (initData) |

#### Email/Password Auth (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register with email + password |
| `POST` | `/auth/login` | Login with email + password |
| `POST` | `/auth/verify-email` | Verify email with token |
| `POST` | `/auth/resend-verify` | Resend verification email |
| `POST` | `/auth/forgot-password` | Request password reset |
| `POST` | `/auth/reset-password` | Reset password with token |

#### Token Management (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/refresh` | Refresh access token |
| `POST` | `/auth/logout` | Logout and invalidate token |
| `GET` | `/auth/me` | Get current user profile |
| `POST` | `/auth/link-email` | Link email to Telegram account |

### Registration Payload
```json
{
  "email": "user@example.com",
  "password": "StrongPass123",
  "confirmPassword": "StrongPass123"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

### Login Payload
```json
{
  "email": "user@example.com",
  "password": "StrongPass123"
}
```

### Response Format
```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "a1b2c3d4...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "emailVerified": true,
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "language": "UZ_LATIN"
  }
}
```

### Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `/auth/register` | 5 requests/hour per IP |
| `/auth/login` | 10 requests/15 min per IP |
| `/auth/forgot-password` | 3 requests/hour per email |
| `/auth/resend-verify` | 3 requests/hour per email |
| Global | 100 requests/minute |

### Security Features

- **Brute-force protection**: Account locked for 15 minutes after 5 failed login attempts
- **Password hashing**: bcrypt with 10 rounds
- **Token rotation**: Refresh tokens are single-use
- **Email verification**: Required before accessing protected routes
- **Banned user check**: Banned users cannot login or refresh tokens

## Environment Variables

### Backend (apps/api/.env)

```env
# Server
NODE_ENV=development
PORT=3001
CORS_ORIGINS=http://localhost:5173

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/osonprava

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=your-secret
JWT_REFRESH_EXPIRES=7d
JWT_ACCESS_EXPIRES=15m

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_BOT_USERNAME=YourBot

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@osonprava.uz
FRONTEND_URL=https://app.osonprava.uz
```

## Database

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name description

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## Testing

```bash
# Unit tests
cd apps/api && npm test

# E2E tests (requires running DB)
cd apps/api && npm run test:e2e
```

## Internationalization

The frontend supports 3 languages:
- **uz** — Uzbek (Latin) — default
- **uz-cyr** — Uzbek (Cyrillic / kr)
- **ru** — Russian

Email templates are also localized to all 3 languages.

## Telegram Bot

Commands:
| Command | Description |
|---------|-------------|
| `/start` | Start bot, select language |
| `/help` | Show help |
| `/test` | Quick test (5 questions) |
| `/tickets` | Browse tickets |
| `/stats` | User statistics |
| `/settings` | Language settings |
| `/premium` | Premium subscription |
| `/link_email` | Link email to Telegram account |

## License

MIT
