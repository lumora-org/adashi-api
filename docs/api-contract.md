# API Contract

Consolidated from specs 04 (API specification), 10 (backend blueprint), 11 (examples), 13 (admin). This file is the working contract between `adashi-api` and `adashi-web`. When code and this file disagree, fix both and note it in `implementation-progress.md`.

---

## Conventions

- Base path: `/api/v1` (Swagger UI at `/api/docs`)
- Auth: `Authorization: Bearer <access_token>` (HTTP-only cookies preferred for browser refresh flow)
- Critical financial ops also require: `Idempotency-Key: <uuid>`
- Money: decimal strings (`"50000.00"`), currency `NGN`
- Timestamps: ISO 8601 UTC
- IDs: UUID v4

### Success envelope

```json
{ "success": true, "message": "…", "data": { }, "meta": { "timestamp": "…" } }
```

### Error envelope

```json
{
  "success": false,
  "message": "…",
  "error": { "code": "STABLE_CODE", "details": [] },
  "meta": { "timestamp": "…", "path": "/api/v1/…" }
}
```

### Pagination meta

```json
{ "page": 1, "limit": 20, "total": 125, "totalPages": 7 }
```

### HTTP codes

| Code | Use |
|---|---|
| 200/201/202/204 | success / created / async accepted / no body |
| 400 | validation |
| 401 | unauthenticated |
| 403 | authenticated, not authorised |
| 404 | not found |
| 409 | conflict, duplicate op, invalid state transition |
| 422 | business validation failure |
| 429 | rate limited |
| 500 | unexpected (never leaks stack traces in prod) |

### Stable error codes

`INVALID_CREDENTIALS`, `ACCOUNT_NOT_VERIFIED`, `ACCOUNT_SUSPENDED`, `FORBIDDEN`, `GROUP_MEMBER_LIMIT_EXCEEDED`, `FREE_ENTITLEMENT_ALREADY_USED`, `PURCHASE_NOT_VERIFIED`, `CONTRIBUTION_ALREADY_VERIFIED`, `PAYOUT_CONFIRMATION_WINDOW_OPEN`, `PAYOUT_ALREADY_DISPUTED`, `INVALID_PAYOUT_STATE`, `WITHDRAWAL_SETTLEMENT_PENDING`, `IDEMPOTENCY_KEY_REUSED`, `ROUND_ALREADY_COMPLETED`, `INSUFFICIENT_GROUP_PLAN_LIMIT`, `PAYOUT_NOT_ELIGIBLE`, `PAYOUT_ALREADY_CONFIRMED`, `DUPLICATE_REFUND`, `SETTLEMENT_NOT_APPROVED`, `ROUND_ALREADY_ACTIVATED`.

---

## Endpoints

Status legend: `P1`…`P11` = build phase (see implementation-checklist).

### Auth & users — P2

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/register` | never accepts platform roles |
| POST | `/auth/login` | rate-limited |
| POST | `/auth/logout` | revokes refresh session |
| POST | `/auth/refresh` | rotates refresh credential |
| POST | `/auth/verify` | email/phone verification |
| POST | `/auth/forgot-password` | rate-limited, single-use token |
| POST | `/auth/reset-password` | |
| GET | `/users/me` | |
| PATCH | `/users/me` | name/phone only — no role/status escalation |

### Groups & memberships — P3

| Method | Path | Notes |
|---|---|---|
| POST | `/groups` | creates group + initial round in `DRAFT` |
| GET | `/groups` | accessible to caller |
| GET | `/groups/:groupId` | |
| PATCH | `/groups/:groupId` | organiser only |
| POST | `/groups/:groupId/close` | |
| GET | `/groups/:groupId/summary` | |
| POST | `/groups/:groupId/invitations` | member limit enforced |
| GET | `/groups/:groupId/invitations` | |
| POST | `/invitations/:invitationId/accept` | intended invitee |
| POST | `/invitations/:invitationId/reject` | |
| GET | `/groups/:groupId/members` | |
| GET | `/groups/:groupId/members/:membershipId` | |
| PATCH | `/groups/:groupId/members/:membershipId` | permitted fields only |

### Rounds — P3/P4

| Method | Path | Notes |
|---|---|---|
| POST | `/groups/:groupId/rounds` | |
| GET | `/groups/:groupId/rounds` | |
| GET | `/rounds/:roundId` | |
| POST | `/rounds/:roundId/activate` | only via billing/entitlement path |
| POST | `/rounds/:roundId/complete` | blocks if unresolved obligations |
| POST | `/rounds/:roundId/cancel` | never restores entitlement |
| GET | `/rounds/:roundId/summary` | |

### Billing & entitlements — P4

| Method | Path | Notes |
|---|---|---|
| GET | `/billing/plans` | |
| GET | `/billing/plans/:planId` | |
| POST | `/billing/purchases` | price from plan, never client |
| GET | `/billing/purchases` | organiser history |
| GET | `/billing/purchases/:purchaseId` | |
| POST | `/billing/purchases/:purchaseId/payments` | evidence multipart |
| POST | `/admin/billing/group-purchases/:purchaseId/verify` | PLATFORM_FINANCE/admin |
| POST | `/billing/purchases/:purchaseId/upgrade` | backend computes difference |
| GET | `/entitlements/me` | |
| POST | `/entitlements/reserve` | `{groupId, planCode}` |
| POST | `/entitlements/activate` | `{reservationId}` — transactional |
| POST | `/entitlements/release` | expired/failed reservations only |

### Contributions & cycles — P5

| Method | Path | Notes |
|---|---|---|
| GET | `/rounds/:roundId/contributions` | |
| GET | `/contributions/:contributionId` | |
| POST | `/groups/:groupId/contributions` | member reports payment → `REPORTED` |
| POST | `/contributions/:contributionId/report` | alternate report path |
| POST | `/contributions/:contributionId/evidence` | multipart |
| POST | `/contributions/:contributionId/verify` | organiser; `{decision: VERIFY\|REJECT}` |
| POST | `/contributions/:contributionId/reverse` | reason mandatory, audited |
| GET | `/memberships/:membershipId/contributions` | |
| GET | `/rounds/:roundId/cycles` | |
| GET | `/cycles/:cycleId` | |
| POST | `/rounds/:roundId/cycles/generate` | idempotent |
| GET | `/cycles/:cycleId/contributions` | |
| POST | `/cycles/:cycleId/complete` | |

### Payouts & receipts — P6

| Method | Path | Notes |
|---|---|---|
| GET | `/rounds/:roundId/payouts` | |
| GET | `/payouts/:payoutId` | |
| POST | `/payouts/:payoutId/mark-sent` | server `sentAt`; receipt in same txn |
| POST | `/payouts/:payoutId/confirm-received` | beneficiary only |
| POST | `/payouts/:payoutId/confirm-on-behalf` | only after deadline; reason required |
| POST | `/payouts/:payoutId/dispute` | beneficiary; preserves history |
| GET | `/payouts/:payoutId/events` | |
| POST | `/payouts/:payoutId/resolve-dispute` | authorised |
| GET | `/payouts/:payoutId/receipt` | |
| GET | `/receipts/:receiptId` | |
| GET | `/receipts/:receiptId/download` | authorised / signed URL |
| POST | `/receipts/:receiptId/regenerate` | versioned |

### Target distributions — P7

| Method | Path | Notes |
|---|---|---|
| GET | `/rounds/:roundId/distribution` | summary |
| POST | `/rounds/:roundId/distribution/calculate` | preview (recomputed on approve) |
| POST | `/rounds/:roundId/distribution/submit` | |
| POST | `/rounds/:roundId/distribution/approve` | idempotent, transactional |
| GET | `/distributions/:distributionId` | |
| GET | `/distributions/:distributionId/items` | |

### Withdrawals & refunds — P8

| Method | Path | Notes |
|---|---|---|
| POST | `/groups/:groupId/withdrawals` (or `/memberships/:id/withdrawals`) | |
| GET | `/memberships/:membershipId/withdrawals` | |
| GET | `/rounds/:roundId/withdrawals` | organiser |
| GET | `/withdrawals/:withdrawalId` | |
| POST | `/withdrawals/:withdrawalId/approve` | settlement calculated backend |
| POST | `/withdrawals/:withdrawalId/reject` | reason |
| GET | `/withdrawals/:withdrawalId/settlement` | snapshot |
| GET | `/settlements/:settlementId` | |
| POST | `/settlements/:settlementId/approve` | |
| POST | `/settlements/:settlementId/refunds` (or `/withdrawals/:id/refunds`) | ≤ approved, no duplicates |
| POST | `/refunds/:refundId/mark-sent` | |
| POST | `/refunds/:refundId/confirm` | |

### Notifications — P10

| Method | Path |
|---|---|
| GET | `/notifications` |
| GET | `/notifications/unread-count` |
| PATCH | `/notifications/:notificationId/read` |
| PATCH | `/notifications/read-all` |
| GET | `/notifications/preferences` |
| PATCH | `/notifications/preferences` |

### Financial reports — P9/P10

| Method | Path | Audience |
|---|---|---|
| GET | `/memberships/:membershipId/financial-summary` | member |
| GET | `/memberships/:membershipId/transactions` | member |
| GET | `/groups/:groupId/financial-summary` | organiser |
| GET | `/rounds/:roundId/financial-summary` | organiser |
| GET | `/rounds/:roundId/contribution-report` | organiser |
| GET | `/rounds/:roundId/payout-report` | organiser |
| GET | `/rounds/:roundId/outstanding-report` | organiser |
| GET | `/rounds/:roundId/withdrawal-report` | organiser |
| GET | `/rounds/:roundId/reconciliation` | organiser |
| GET | `/groups/:groupId/rounds/:roundId/financial-summary/me` | member (doc 11 §13) |

### Admin / Super Admin — P9

Bootstrap is CLI-only (`npm run admin:bootstrap`); no public registration path.

| Method | Path | Permission |
|---|---|---|
| GET | `/admin/dashboard/overview` | dashboard.read |
| GET | `/admin/users` | users.read |
| GET | `/admin/users/:userId` | users.read |
| POST | `/admin/users/:userId/suspend` | users.manage (reason) |
| POST | `/admin/users/:userId/reactivate` | users.manage |
| POST | `/admin/users/:userId/revoke-sessions` | users.manage |
| GET | `/admin/groups` | groups.read |
| GET | `/admin/groups/:groupId` | groups.read |
| POST | `/admin/groups/:groupId/suspend` | groups.manage |
| POST | `/admin/groups/:groupId/reactivate` | groups.manage |
| GET | `/admin/rounds` | rounds.read |
| GET | `/admin/rounds/:roundId` | rounds.read |
| GET | `/admin/billing/group-purchases` | billing.read |
| GET | `/admin/billing/group-purchases/:purchaseId` | billing.read |
| POST | `/admin/billing/group-purchases/:purchaseId/verify` | billing.verify |
| POST | `/admin/billing/group-purchases/:purchaseId/reject` | billing.verify |
| GET | `/admin/plans` | billing.read |
| POST | `/admin/plans` | plans.manage |
| PATCH | `/admin/plans/:planId` | plans.manage (no history rewrite) |
| GET | `/admin/entitlements` | entitlements.read |
| GET | `/admin/financial-oversight` | financial.read |
| GET | `/admin/disputes` | disputes.read |
| GET | `/admin/disputes/:disputeId` | disputes.read |
| POST | `/admin/disputes/:disputeId/resolve` | disputes.manage |
| POST | `/admin/disputes/:disputeId/escalate` | disputes.manage |
| POST | `/admin/administrators/invitations` | administrators.manage |
| GET | `/admin/administrators` | administrators.manage |
| PATCH | `/admin/administrators/:adminId/permissions` | administrators.manage |
| POST | `/admin/administrators/:adminId/suspend` | administrators.manage |
| POST | `/admin/administrators/:adminId/revoke-sessions` | administrators.manage |
| GET | `/admin/reports` | reports.read |
| GET | `/admin/audit-logs` | audit.read |
| GET | `/admin/settings` | settings.manage |
| PATCH | `/admin/settings` | settings.manage |

### Platform permissions list

`users.read`, `users.manage`, `groups.read`, `groups.manage`, `rounds.read`, `rounds.manage`, `billing.read`, `billing.verify`, `plans.manage`, `entitlements.read`, `financial.read`, `disputes.read`, `disputes.manage`, `reports.read`, `administrators.manage`, `settings.manage`, `audit.read`, `dashboard.read`.

### Group permission list

`group.read`, `group.update`, `members.invite`, `members.manage`, `contributions.read`, `contributions.verify`, `contributions.reject`, `cycles.manage`, `payouts.mark_sent`, `payouts.review`, `withdrawals.review`, `reports.read`.

### Member permission list

`profile.read`, `profile.update`, `group.read`, `contributions.report`, `contributions.read_own`, `payouts.confirm_own`, `payouts.dispute_own`, `withdrawals.request`, `receipts.read_own`.

---

## Key request/response examples

See `docs/11-api-request-response-examples.md` for full payloads. Invariants:

1. `POST /payouts/:id/mark-sent` response includes `confirmationDeadline` and `receipt: {receiptId, receiptNumber, status: "GENERATING"}`.
2. Early `confirm-on-behalf` → 409 `PAYOUT_CONFIRMATION_WINDOW_OPEN`.
3. `POST /entitlements/activate` consumes entitlement exactly once; second attempt → 409 `FREE_ENTITLEMENT_ALREADY_USED`.
4. Contribution report initial status is always `REPORTED`, never `VERIFIED`.
5. Reusing an `Idempotency-Key` with a different body → 409 `IDEMPOTENCY_KEY_REUSED`.
