# Environment Setup

Local development setup for both repositories. Derived from specs 10 §25, 14 §14, 15 §5, and both READMEs.

---

## Prerequisites

- Node.js LTS (matching each repo's `engines`/Next.js requirement)
- npm (or the package manager declared in the repo)
- PostgreSQL 15+
- Redis 7+
- Git

## Clone

```bash
git clone https://github.com/lumora-org/adashi-api.git
git clone https://github.com/lumora-org/adashi-web.git
```

## Backend (`adashi-api`)

```bash
cd adashi-api
npm install
cp .env.example .env   # fill values
npm run migration:run
npm run start:dev      # → http://localhost:4000/api/v1  (Swagger: /api/docs)
```

### `.env` variables (backend)

```env
# Application
NODE_ENV=development
PORT=4000
APP_NAME=Adashi API
API_PREFIX=api/v1
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000
CORS_ORIGINS=http://localhost:3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=change_me
DATABASE_NAME=adashi
DATABASE_SSL=false

# Authentication
JWT_ACCESS_SECRET=replace_with_secure_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=replace_with_secure_secret
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Storage (local | s3)
STORAGE_PROVIDER=local
STORAGE_BUCKET=
STORAGE_REGION=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=

# Email
MAIL_HOST=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM=

# Bootstrap (Super Admin CLI only — never commit real values)
BOOTSTRAP_OWNER_EMAIL=
BOOTSTRAP_SECRET=

# Ops
LOG_LEVEL=debug
```

Rules:

- Never commit `.env` or real secrets.
- Required variables validated at startup; app refuses to boot with missing production secrets.
- Separate secrets per environment; rotate via controlled procedure.

## Frontend (`adashi-web`)

```bash
cd adashi-web
npm install
cp .env.example .env.local
npm run dev      # → http://localhost:3000
```

### `.env.local` variables (frontend)

```env
NEXT_PUBLIC_APP_NAME=Adashi
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

Only `NEXT_PUBLIC_*` in the browser. No JWT secrets, storage keys, or DB credentials in frontend env.

## First-run verification

1. API responds: `GET http://localhost:4000/api/v1/health` (or configured health path).
2. Swagger loads at `http://localhost:4000/api/docs`.
3. Frontend loads at `http://localhost:3000`.
4. Register a test user; login; `GET /users/me` returns the profile.
5. (After P4) `npm run admin:bootstrap` only when no Super Admin exists.

## Test environments

- Unit/integration tests must never use real customer financial data — use seeded fixtures (spec 12 §2–3).
- Injectable clock for 48-hour payout tests; do not wait real time.
