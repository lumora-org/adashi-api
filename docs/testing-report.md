# Testing Report

Strategy from specs 10 §24, 12 (full), README §25. Results are appended here as suites land.

---

## Strategy

| Layer | Tooling | Scope |
|---|---|---|
| Unit | Jest | financial math, state machines, entitlement, upgrades, rounding, settlements, permissions |
| Integration | Jest + real PostgreSQL | transactions, constraints, locks, idempotency, outbox, guards |
| E2E | Supertest (HTTP) | workflows A–H + super-admin (spec 12 §5–13) |
| Security | automated + manual | IDOR per endpoint, role escalation, upload validation, rate limits, session revocation |
| Concurrency | Jest + parallel requests | double activation/verify/mark-sent/approve |

Hard rules:

- No real customer financial data in tests; seeded fixtures only.
- Injectable clock for 48-hour payout rules — never wait real hours.
- No test may rely on floating-point money math.
- Definition of done (spec 12 §18): unit + integration + e2e + negatives for each feature; financial changes auditable; Swagger updated; backend/frontend status enums agree; no duplicateable critical ops.

## Test accounts to seed (spec 12 §3)

Super Admin, Platform Admin, Organiser A, Organiser B, Member A (multi-group), Member B (rotational beneficiary), Member C (target participant), Suspended User, Unverified User.

## Financial integrity matrix (spec 12 §14)

| Test | Expected | Status |
|---|---|---|
| Verify same contribution twice | no duplicate verification | ⬜ |
| Reverse already-reversed contribution | rejected | ⬜ |
| Mark same payout sent twice | no duplicate payout/receipt | ⬜ |
| Duplicate refund | rejected / idempotent return | ⬜ |
| Approve distribution twice | no duplicate distribution | ⬜ |
| Idempotency key reused with different payload | 409 conflict | ⬜ |
| Complete round with unresolved obligations | rejected | ⬜ |
| Change verified amount directly | forbidden | ⬜ |
| Negative contribution amount | validation failure | ⬜ |
| Invalid currency | validation failure | ⬜ |
| Fractional money rounding | deterministic decimal result | ⬜ |

## Concurrency matrix (spec 12 §15)

| Scenario | Status |
|---|---|
| Two organisers activating same group | ⬜ |
| Two admins verifying same purchase | ⬜ |
| Two mark-sent requests same payout | ⬜ |
| Two withdrawal approvals | ⬜ |
| Two distribution approvals | ⬜ |
| Two entitlement consumptions | ⬜ |

## 48-hour payout suite (spec 12 §8)

| Test | Expected | Status |
|---|---|---|
| D1 member confirms before deadline | `CONFIRMED_BY_MEMBER` | ⬜ |
| D2 organiser early override | rejected, stays `SENT`, no event | ⬜ |
| D3 organiser override after deadline + reason | `CONFIRMED_BY_ORGANISER` | ⬜ |
| D4 dispute after override | dispute recorded, history preserved | ⬜ |

## Results log

| Date | Suite | Result | Notes |
|---|---|---|---|
| 2026-11-15 | `npm test` (unit) | ✅ 2 suites, 5 tests passed | env validation (3), AuthController register/login (2) |
| 2026-11-15 | `npm run lint` | ✅ clean | eslint flat config, typescript-eslint recommended |
| 2026-11-15 | `npm run build` | ✅ clean | nest build, strict tsconfig |
| 2026-11-15 | `npm run test:e2e` | ⏸ skipped | requires local PostgreSQL — not available in current dev environment; suite auto-skips when DB unreachable |
