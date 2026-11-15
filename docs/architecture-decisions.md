# Architecture Decisions (ADR)

Decisions extracted from specs 01–15. Each ADR states context → decision → consequences.

---

## ADR-001: Modular monolith, not microservices

- **Context:** Spec 10 §1, spec 15 §13. Many domains, small team, financial transactions spanning domains.
- **Decision:** Single NestJS deployable with module boundaries (`auth`, `groups`, `billing`, `contributions`, `payouts`, `receipts`, `distributions`, `withdrawals`, `admin`, …). Modules expose services/interfaces, not internal details. Workers run from the same codebase.
- **Consequences:** Simple deploys; cross-module transactions are trivial; extraction possible later only if measured bottlenecks require it. Avoid circular deps between billing/contributions/payouts/receipts.

## ADR-002: Money representation

- **Context:** Spec 09 §4, spec 14 §6.1.
- **Decision:** PostgreSQL `NUMERIC(18,2)`, currency column `NGN` on every financial record. API JSON money = decimal strings (`"50000.00"`). TypeScript `type Money = string`; arithmetic via decimal library or integer kobo; never IEEE floats.
- **Consequences:** All DTO money fields validated with `@IsNumberString()`; frontend formats only, never computes authoritative totals.

## ADR-003: Backend is sole authority

- **Context:** Specs 04/10/11/14 — never trust client prices, deadlines, ownership, confirmation status.
- **Decision:** Purchase prices read from `billing_plans` server-side; `confirmationDeadline = serverNow(sentAt) + 48h`; acting user from JWT only; group ownership from DB. Frontend countdowns/preview calculations are informational.
- **Consequences:** Every state-transition endpoint re-validates permission + state inside the transaction.

## ADR-004: Group-scoped permissions, not global organiser role

- **Context:** Spec 05 §5.2, spec 02 — a user can organise Group A and be member of Group B.
- **Decision:** Authorisation = JWT identity + membership/ownership lookup for the specific group/round/membership. Platform roles (`SUPER_ADMIN`…`PLATFORM_AUDITOR`) are a separate axis and never imply group powers.
- **Consequences:** Guards: `JwtAuthGuard` → resource resolver → `GroupAccessGuard` / `PlatformRoleGuard`. IDOR tests mandatory per endpoint.

## ADR-005: Financial state machines are transactional + audited

- **Context:** Spec 09 §15, spec 14 §6.
- **Decision:** Every critical transition (verify contribution, mark payout sent, confirm, override, refund, distribution approval, entitlement consumption, purchase activation) runs in one DB transaction: pessimistic row lock → state check → mutate → domain event row → `financial_audit_logs` row → `outbox_events` row → commit.
- **Consequences:** Duplicate/retried requests hit state checks or unique constraints → 409 with stable error code. Audit and outbox are never written outside the financial transaction.

## ADR-006: Transactional outbox + BullMQ workers

- **Context:** Spec 09 §18, spec 14 §17. Notifications/PDF must not be able to roll back money.
- **Decision:** Side effects (receipt PDF, emails, reminders, deadline notices) are rows in `outbox_events` written in the same transaction; a relay dispatches idempotent BullMQ jobs.
- **Consequences:** Workers must tolerate at-least-once delivery; failed notification never reverses a committed financial row.

## ADR-007: Receipts created atomically with mark-sent

- **Context:** Spec 09 §9, spec 10 §13, spec 11 §10.1.
- **Decision:** `payout_receipts` row (`GENERATING`, unique number, unique per payout) inserted in the same transaction as `payouts.status = SENT`; PDF generation async. Receipt wording: "recorded as sent by organiser" — never claims bank settlement proof.
- **Consequences:** One initial receipt per payout enforced by `uq_payout_receipt_payout`; regeneration creates versioned/superseding records only.

## ADR-008: 48-hour confirmation with injectable clock

- **Context:** Spec 08, spec 12 §8, spec 14 §7.
- **Decision:** `confirmationDeadline` computed server-side from authoritative `sentAt`. Override allowed only when `now >= deadline`, requires reason, sets `CONFIRMED_BY_ORGANISER` (never impersonates member). A `Clock` provider is injected so tests advance time instead of waiting.
- **Consequences:** Deadline-job only notifies; endpoint independently re-enforces the deadline.

## ADR-009: One free Starter entitlement per user, never restored

- **Context:** Spec 08, spec 09 §6, README §9.
- **Decision:** `free_entitlements` unique on `user_id`; states `AVAILABLE|RESERVED|USED` with reservation expiry; activation transaction locks the row. Group delete / round cancel / membership leave never flips `USED` back. Events recorded in `free_entitlement_events`.
- **Consequences:** New rounds after free use require paid purchase; admin reset of `USED` needs elevated permission + reason + immutable audit.

## ADR-010: No wallet, no custody

- **Context:** Spec 14 §13, spec 01, deferrals (spec 15 §7).
- **Decision:** MVP records reported/verified contributions, payouts, refunds; money moves outside the platform (organiser or direct beneficiary collection). No internal balance, no pooled funds, no transfer buttons.
- **Consequences:** Financial summaries are derived projections from authoritative rows; ledger extension (spec 09 §13) stays append-only reporting, never a balance.

## ADR-011: Round-scoped financial history

- **Context:** Spec 09 §2.4, spec 02.
- **Decision:** Every contribution/payout/distribution/withdrawal references `group_round_id`. Groups persist; rounds are operational cycles. Completed rounds are read-only for ordinary users; new round = new activation.
- **Consequences:** Reports always filter by round; no cascade from group/round delete into financial rows (`RESTRICT` FKs).

## ADR-012: Super Admin bootstrap is CLI, single-use, MFA

- **Context:** Spec 13 §3, spec 14 §10, spec 12 §13.
- **Decision:** `npm run admin:bootstrap` creates a time-limited single-use owner invitation only when zero Super Admins exist; refuses afterwards. Public registration payload can never carry platform roles. Super Admin requires MFA; recovery codes hashed, single-use.
- **Consequences:** No `POST /admin/bootstrap` public path; secrets never logged.

## ADR-013: API envelope and stable error codes

- **Context:** Spec 10 §20, spec 11 §3.
- **Decision:** Success `{success:true, message, data, meta?}`; error `{success:false, message, error:{code, details?}, meta:{timestamp, path}}`. Pagination meta `{page, limit, total, totalPages}`. Stable codes (e.g. `PAYOUT_CONFIRMATION_WINDOW_OPEN`, `FREE_ENTITLEMENT_ALREADY_USED`, `IDEMPOTENCY_KEY_REUSED`) drive frontend handling.
- **Consequences:** Global interceptor + exception filter implement this once; Swagger documents it.

## ADR-014: Idempotency keys for retriable financial ops

- **Context:** Spec 11 §17, spec 14 §6.3.
- **Decision:** Header `Idempotency-Key` required on activation, verifications, mark-sent, confirmations, refunds, distribution approval. Persist key + actor + operation + request fingerprint + result; reuse with different payload → 409 `IDEMPOTENCY_KEY_REUSED`.
- **Consequences:** Retries are safe; retention policy aligned with financial audit requirements.

## ADR-015: Private object storage for evidence/receipts

- **Context:** Spec 08, spec 14 §8.
- **Decision:** DB stores metadata + storage keys only. Uploads validated by content type/size, server-generated filenames, access checked per request, downloads via short-lived signed URLs. Local disk provider for dev, S3-compatible for prod (`STORAGE_PROVIDER`).
- **Consequences:** No public buckets; file access logged where appropriate.

## ADR-016: Frontend stack and separation

- **Context:** Specs 06/07/15.
- **Decision:** `adashi-web` = Next.js + TS + Tailwind + shadcn/ui + TanStack Query + RHF + Zod + PWA. Feature-folder structure; API layer centralises envelope handling. Admin portal is part of the same app under `/admin` (routes per spec 13 §4) unless later split to `admin.adashi.com`.
- **Consequences:** UI hides buttons by permission for UX only; backend always re-checks.

## ADR-017: Docs live in both repos

- **Context:** Two-repo layout (spec 15 §4).
- **Decision:** The 15 canonical specs + this progress/checklist/contract set are kept in `docs/` of both `adashi-api` and `adashi-web` (identical copies). Code diverges; docs stay mirrored.
- **Consequences:** Update both copies when specs change; md5-check in CI optional.
