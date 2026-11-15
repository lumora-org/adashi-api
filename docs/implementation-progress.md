# Implementation Progress

Living log of what has been done. Newest entries at top of each section.

---

## Current status (2026-11-15)

| Area | Status |
|---|---|
| Spec reading (docs 01–15, both READMEs) | ✅ complete |
| Canonical doc renames (`writing-block*` → `01-…`–`15-…`) | ✅ done, staged in both repos |
| Extraction docs (checklist, ADRs, contract, migrations, env, deploy, testing, limitations) | ✅ written + mirrored to `adashi-web/docs` |
| Backend Phase 1 scaffold | ✅ done — build/lint/unit tests green |
| Frontend scaffold (Phase 1) | ⬜ not started |
| Feature phases 2–11 | ⬜ not started (auth partially landed in Phase 1) |

## Log

### 2026-11-15 (backend scaffold)

- Scaffolded NestJS app in `adashi-api`:
  - `package.json` scripts (build/start/test/migrations/admin:bootstrap), strict `tsconfig`, `nest-cli.json`, `.env.example`, `.gitignore`, eslint flat config.
  - Config: `configuration.ts` + Joi `env.validation.ts` (prod requires ≥32-char JWT secrets).
  - Global: `ValidationPipe` (whitelist/forbid/transform), `TransformInterceptor` (envelope), `AllExceptionsFilter` (stable error codes), `/api/v1` prefix, Swagger at `/api/docs`, cookie-parser, CORS from env.
  - `JwtAuthGuard` global with `@Public()` bypass; `@CurrentUser()` decorator.
  - Migration `1731600000000-CreateUsersAndSessions` (users + refresh_tokens, unique email/phone, hashed refresh tokens).
  - Modules: `health` (public), `users` (`GET/PATCH /users/me`), `auth` (register/login/refresh/logout/verify/session) with Argon2id hashing, opaque rotating refresh tokens in HTTP-only cookie (`adashi_refresh`, path-scoped), reuse detection revokes all sessions.
- Verification: `npm run build` ✅, `npm run lint` ✅, `npm test` ✅ (5 tests). E2E present but auto-skips without PostgreSQL (none available in this environment).

### 2026-11-15 (docs)

- Read all 15 specification documents in full (`adashi-api/docs/01-…`–`15-…`) plus both repository READMEs.
- Confirmed both repos were docs-only; both on `main` except staged doc renames.
- Wrote extraction artifacts (checklist, 17 ADRs, API contract, migrations plan, env setup, deployment guide, testing report, known limitations) and mirrored to `adashi-web/docs`.

## Decisions taken during implementation

- (none beyond ADRs yet)

## Known gaps / follow-ups

- No CI workflows yet (planned with Phase 1 scaffold).
- Test results pending until scaffold + first tests exist (`testing-report.md`).
