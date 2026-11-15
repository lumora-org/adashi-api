# Adashi Implementation Checklist

Master checklist derived from specs 01–15. Status values: `[ ]` not started, `[~]` in progress, `[x]` done.

Source mapping: 15 roadmap phases (doc 15 §5) + backend blueprint phases (doc 10 §27) + admin portal acceptance (doc 13 §20) + security checklist (doc 14 §19).

---

## Phase 1 — Project foundation

Backend (`adashi-api`):

- [x] NestJS application initialised (`package.json`, `nest-cli.json`, `tsconfig.json`)
- [x] Environment validation at startup (doc 10 §25, doc 14 §14)
- [x] PostgreSQL + TypeORM connection, migrations only (no `synchronize` in prod)
- [ ] Redis connection configuration
- [x] Global ValidationPipe (`whitelist`, `forbidNonWhitelisted`, `transform`)
- [x] Global exception filter → envelope `{success, message, error}`
- [x] Response interceptor → envelope `{success, message, data, meta}`
- [x] Swagger at `/api/docs`, versioned prefix `/api/v1`
- [x] Health-check endpoints
- [ ] CI pipeline (lint, typecheck, unit tests, build)

Frontend (`adashi-web`):

- [ ] Next.js + TypeScript initialised
- [ ] Tailwind + shadcn/ui + design tokens (Emerald `#087F5B`, Navy `#142B3B`, Gold `#E7B54A`, Off-white `#F6F8F7`)
- [ ] Layout shell (mobile-first, responsive)
- [ ] API client with envelope types + error codes
- [ ] Auth state provider
- [ ] Reusable form/table components
- [ ] Public landing page shell

Done when: both apps start locally, connect to services, pass basic CI.

## Phase 2 — Authentication and accounts

- [x] `User` entity (UUID, statuses, platform role, verification)
- [x] Register / verify / login / logout / refresh rotation (forgot/reset password pending)
- [x] Argon2id password hashing
- [x] Access token short-lived (15m), refresh token rotated (7d), revocable sessions
- [ ] Rate limiting on login + password reset
- [x] `GET/PATCH /users/me` (no self-service role/status escalation)
- [ ] Frontend: register, login, verification, password reset, profile
- [ ] Tests: invalid credentials, duplicate registration, unverified, suspended, refresh reuse, session revocation

## Phase 3 — Groups, memberships, rounds

- [ ] `Group` entity: `ROTATIONAL|TARGET_BASED`, `ORGANISER_COLLECTION|DIRECT_BENEFICIARY_COLLECTION`, settings JSON
- [ ] Create/list/get/update/close group; group summary
- [ ] `Invitation` + accept/reject (intended invitee only)
- [ ] `Membership` statuses: `INVITED|PENDING|ACTIVE|WITHDRAWAL_PENDING|WITHDRAWN|REMOVED`
- [ ] `GroupRound` statuses: `DRAFT|PENDING_PAYMENT|ACTIVE|IN_PROGRESS|AWAITING_DISTRIBUTION|COMPLETED|CANCELLED`
- [ ] Group-access guard: derive permissions from ownership/membership, never global role
- [ ] Member limit enforced against purchased plan
- [ ] Frontend: create group, list, overview, invite, accept, members, settings
- [ ] Tests: multi-group user, organiser/member separation, cross-group denial (IDOR), invitation expiry, member limit

## Phase 4 — Billing and free entitlement

- [ ] `BillingPlan` entity + admin CRUD (prices configurable, not hard-coded)
- [ ] `GroupPurchase` with plan/amount snapshot at creation, `idempotency_key`
- [ ] `GroupPurchasePayment` attempts; private evidence upload
- [ ] Manual payment verification by `PLATFORM_FINANCE`/admin only
- [ ] `FreeEntitlement`: one per user (unique index), `AVAILABLE|RESERVED|USED` + `free_entitlement_events`
- [ ] Reserve / activate / release endpoints; activation transactional (doc 09 §6.3)
- [ ] Consumed entitlement never restored by group delete / round cancel
- [ ] Upgrade = backend-calculated difference only
- [ ] Round activation only after verified purchase or valid entitlement
- [ ] Frontend: plan selection, purchase summary, payment instructions, evidence upload, status, upgrade screen
- [ ] Tests: one-time free, duplicate activation, expired reservation, duplicate verification, upgrade math, price snapshot, concurrency

## Phase 5 — Contributions and rotational cycles

- [ ] `Contribution` linked to membership + round; statuses `EXPECTED|REPORTED|VERIFIED|REJECTED|OVERDUE|REVERSED`
- [ ] Reported ≠ verified; only organiser/delegate verifies; never self-verify
- [ ] `ContributionEvent` history + `ContributionEvidence` (private storage)
- [ ] Report / evidence / verify / reject / reverse endpoints with transaction + audit + outbox
- [ ] Schedule frequencies `DAILY|WEEKLY|BIWEEKLY|EVERY_THREE_WEEKS|MONTHLY`; due dates stored server-side
- [ ] Cycle generation idempotent; beneficiary order validated against eligible memberships
- [ ] Frontend: report payment, evidence upload, history, organiser verify queue, cycles, beneficiary order, summaries
- [ ] Tests: reported vs verified, duplicate verification, reversal, schedule generation, concurrent verification

## Phase 6 — Payouts and receipts

- [ ] `Payout` statuses `PENDING|SENT|CONFIRMED_BY_MEMBER|CONFIRMED_BY_ORGANISER|DISPUTED|CANCELLED`
- [ ] Mark-sent transaction: lock row → validate → `SENT` → `sentAt` (server clock) → `confirmationDeadline = sentAt + 48h` → unique receipt record → payout event → audit → outbox → commit
- [ ] Unique receipt per payout (`uq_payout_receipt_payout`), receipt number unique
- [ ] Member confirm: beneficiary only, distinct state
- [ ] Organiser confirm-on-behalf: only after deadline, mandatory reason, distinct state, beneficiary notified
- [ ] Dispute: preserves all prior events; blocks unsafe auto-progression
- [ ] Receipt PDF generated async (BullMQ), failure never rolls back payout
- [ ] Receipt download: authorised, short-lived URL; states `GENERATING|AVAILABLE|FAILED|SUPERSEDED`
- [ ] Injectable clock for 48h tests (no real waiting)
- [ ] Frontend: payout detail, mark sent, countdown (informational), override screen (disabled until backend deadline), dispute, receipt view/download
- [ ] Tests: receipt atomicity, double mark-sent, member confirm, early override rejected, late override, dispute after override, PDF retry

## Phase 7 — Target-based Adashi

- [ ] Target config + progress from verified contributions only
- [ ] Eligibility (withdrawals, disputes excluded/resolved)
- [ ] Equal distribution in integer kobo; deterministic remainder (first eligible membership, stable order)
- [ ] `TargetDistribution` + `DistributionItems` with unique (distribution, membership)
- [ ] Calculate → submit → approve (single transaction, prevents double approval) → individual payouts
- [ ] Frontend: target dashboard, progress, distribution preview, approval, payout tracking
- [ ] Tests: equal shares, rounding, withdrawn exclusion, duplicate approval, incomplete target, dispute blocking

## Phase 8 — Withdrawals and settlements

- [ ] `WithdrawalRequest` statuses `PENDING|APPROVED|REJECTED|SETTLEMENT_PENDING|SETTLED|CANCELLED`
- [ ] Backend settlement calculation with `calculation_snapshot` JSONB (doc 09 §11.2)
- [ ] Rotational: account for previous payouts + outstanding obligations (never blind full refund)
- [ ] Target-based: refund verified contributions, exclude from future distributions
- [ ] `Refund` records separate from contributions; no duplicates; ≤ approved settlement
- [ ] Membership stays active until settlement resolved
- [ ] Frontend: request, review, settlement breakdown, approve/reject, refund history
- [ ] Tests: no-payout member, prior-payout member, target refund, duplicate refund, membership transitions

## Phase 9 — Super Admin portal

- [ ] Bootstrap CLI (`npm run admin:bootstrap`): refuses if Super Admin exists; single-use time-limited invitation; no secrets in logs
- [ ] Public registration can never assign platform roles
- [ ] Platform roles: `SUPER_ADMIN|PLATFORM_ADMIN|PLATFORM_SUPPORT|PLATFORM_FINANCE|PLATFORM_AUDITOR` + permission strings
- [ ] MFA required for Super Admin (recovery codes hashed, single-use)
- [ ] Administrator invitations: time-limited, single-use, revocable, logged
- [ ] Dashboard overview metrics (platform revenue strictly separate from group funds)
- [ ] User management (suspend/reactivate with reason, revoke sessions, no credential display)
- [ ] Group/round oversight (suspend, never silent rewrite)
- [ ] Purchase verification + plan management (historical prices untouched)
- [ ] Entitlement oversight (no casual reset of USED)
- [ ] Financial oversight (read-only, no wallet controls, masked evidence access)
- [ ] Dispute queue + resolve/escalate
- [ ] Reports + audit log screen (append-only)
- [ ] Platform settings (high-risk changes audited)
- [ ] Admin routes `/admin/*` in frontend
- [ ] Tests: no public Super Admin, single-use bootstrap, MFA, permission restrictions, invitation, suspension, audit logging, cross-group restrictions

## Phase 10 — Notifications, reports, PWA

- [ ] In-app notifications + preferences + unread count + read-all
- [ ] Email notifications via outbox workers (idempotent)
- [ ] Reminder workers: contribution due/overdue, payout deadline (notify only — never auto-confirm)
- [ ] Financial reports: member/organiser/round summaries from authoritative records; reversed excluded from valid totals
- [ ] Frontend: notification centre, reports, PWA manifest, offline-friendly public pages only
- [ ] Tests: no offline financial ops without server confirmation

## Phase 11 — QA and launch

- [ ] Full E2E suite (doc 12 workflows A–H + super-admin scenarios)
- [ ] Financial integrity table (doc 12 §14) all passing
- [ ] Concurrency suite (doc 12 §15) with real DB locks
- [ ] Security review (doc 14 §19 checklist all checked)
- [ ] Performance + accessibility + mobile testing
- [ ] Backup + restore tested (RPO/RTO documented, not aspirational)
- [ ] Production env, monitoring, alerts, rollback procedure
- [ ] Privacy/terms review (Nigeria Data Protection Act advice)

---

## Cross-cutting (every phase)

- [ ] Money as `NUMERIC` in DB, decimal strings in JSON, no JS float math
- [ ] Transactions + row locks + unique constraints for every financial transition
- [ ] Idempotency-Key header on all retriable financial operations
- [ ] Audit record written in same transaction as financial change
- [ ] Outbox event written in same transaction; workers idempotent
- [ ] No cascade deletes into financial history
- [ ] Group isolation tested with IDOR tests per endpoint
- [ ] Swagger updated with actual DTOs
- [ ] Status enums identical between backend and frontend

## Deferral list (do NOT build in MVP)

Automated collections, automated payouts, internal wallet, pooled custody, escrow, bank reconciliation integrations, multi-currency, native apps, ML fraud detection, white-label, accounting integrations (doc 15 §7).
