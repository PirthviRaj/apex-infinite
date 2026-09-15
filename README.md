# Apex Infinite

Universal AI Super-OS Super-App — Next.js 14, TypeScript, Tailwind, Framer Motion, MySQL.

## Prerequisites

- Node.js 18+
- MySQL 8+ running locally (or reachable host)
- npm

## Complete setup

```bash
# 1. Clone
git clone https://github.com/PirthviRaj/apex-infinite.git
cd apex-infinite

# 2. Install
npm install

# 3. Environment
cp .env.example .env.local
```

Edit `.env.local`:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=apex

# Local phone OTP (MySQL-backed; code shown in Gateway UI)
APEX_ALLOW_DEV_OTP=true
```

```bash
# 4. Create schema + seed catalog (database: apex)
npm run db:init

# 5. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Apex Gateway** (`/gateway`).

> Workbench tip: select schema **`apex`**, not other databases (e.g. `winroom`).

## Auth

| Method | Behavior |
|--------|----------|
| **Email / Username** | Real signup & login — users + hashed passwords in MySQL |
| **Phone OTP** | OTP stored in `otp_challenges`. Local: code shown in UI. Production SMS: set Twilio vars |
| **Social** | Needs OAuth client IDs (not wired yet) |

### Optional Twilio (real SMS)

```env
APEX_ALLOW_DEV_OTP=false
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

## Useful commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run db:init` | Apply `sql/apex.sql` (recreates tables) |
| `npm run db:reset` | Same as `db:init` |

## Stack

- **Frontend:** Next.js 14 App Router, Framer Motion, Tailwind
- **Database:** MySQL (`sql/apex.sql` — 16 tables)
- **Auth:** Session cookies + scrypt password hashes

## Deploy on Vercel

**Live:** [https://apex-infinite.vercel.app](https://apex-infinite.vercel.app)

Vercel cannot reach `127.0.0.1` MySQL on your PC. Use a **cloud MySQL** (free: [TiDB Cloud Starter](https://tidbcloud.com) or Railway MySQL).

1. Create a free TiDB Cloud Starter cluster (MySQL compatible).
2. Set a root password and allow public endpoint.
3. Copy connection details into `.env.vercel` (from `.env.vercel.example`).
4. Push env + init schema:

```powershell
# From project root — fill .env.vercel first
.\scripts\push-vercel-env.ps1

# Init cloud DB (uses .env.vercel vars)
$env:DB_HOST="your-host"; $env:DB_PORT="4000"; $env:DB_USER="..."; $env:DB_PASSWORD="..."; $env:DB_NAME="apex"; $env:DB_SSL="true"; npm run db:init

# Redeploy
npx vercel deploy --prod --yes
```

5. Verify: `https://apex-infinite.vercel.app/api/health` → `{ "ok": true, "db": true }`

Or use Vercel dashboard → **apex-infinite** → Settings → Environment Variables → add `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL=true`, `APEX_ALLOW_DEV_OTP=true` → Redeploy.

## Project layout

```
src/          App routes, components, API
sql/apex.sql  Schema + module seed
scripts/      db:init, push-vercel-env.ps1
.env.example  Env template (copy to .env.local)
```
