# Apex Infinite SQL (MySQL)

| File | Purpose |
|------|---------|
| `sql/apex.sql` | Full schema + catalog seed |
| `.env.example` | Copy to `.env.local` for DB credentials |

## Setup

1. Start MySQL
2. Copy `.env.example` → `.env.local` and set `DB_*`
3. Run:

```bash
npm install
npm run db:init
npm run dev
```

Use database **`apex`** in MySQL Workbench.

## Auth tables

- `users` — identity (email / phone / social)
- `credentials` — password hash + salt
- `otp_challenges` — phone / social OTP codes
- `sessions` — login tokens
