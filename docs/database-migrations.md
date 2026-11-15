# Database Migrations

Strategy from specs 02 (core schema), 09 (financial model), 15 §12 (migration rules).

---

## Rules

1. TypeORM migrations only; `synchronize: false` in every non-test environment.
2. One migration = one reviewed schema change; never edit a migration that has run in staging/prod — write a follow-up.
3. Money columns: `NUMERIC(18,2)` with `CHECK (col >= 0)` (or `> 0` where strictly positive).
4. All PKs `UUID` (gen via app or `gen_random_uuid()`); timestamps `TIMESTAMPTZ` stored UTC.
5. Financial FKs use `RESTRICT` (no cascade delete into history). No `ON DELETE CASCADE` from users/groups/rounds to financial rows.
6. Unique constraints (not just app checks) guard: one free entitlement per user, receipt number, one receipt per payout, distribution item per (distribution, membership), provider payment reference, idempotency key per scope.
7. Back up before high-risk migrations; prefer backward-compatible column adds; separate data migrations from schema migrations.
8. Rollback: each migration provides `down()`; document forward-fix when down is unsafe for financial data.

## Planned migration sequence

| # | Migration | Contents |
|---|---|---|
| 1 | `CreateUsersAndSessions` | `users` (uuid, full_name, email unique, phone unique nullable, password_hash, account_status `ACTIVE\|SUSPENDED\|CLOSED`, verification fields, platform_role default `USER`, mfa fields, timestamps), `sessions`/`refresh_tokens` (hashed token, expiry, revoked_at) |
| 2 | `CreateAuditAndOutbox` | `audit_logs` (append-only auth/admin events), `financial_audit_logs`, `outbox_events` (status, attempts, available_at, processed_at) |
| 3 | `CreateGroupsMembershipsRounds` | `groups`, `memberships`, `invitations`, `group_rounds` (round status enum, unique activation constraints) |
| 4 | `CreateBilling` | `billing_plans` (code unique, price, member_limit, is_active), `group_purchases` (amount snapshot, idempotency_key unique in scope, status enum), `group_purchase_payments` (evidence_file_key, unique provider ref) |
| 5 | `CreateEntitlements` | `free_entitlements` (`uq_free_entitlement_user`, status, reservation cols), `free_entitlement_events` |
| 6 | `CreateContributions` | `contributions` (membership_id, round_id, amounts expected/reported/verified, status enum, verified_by/at, rejection cols), `contribution_events`, `contribution_evidence` |
| 7 | `CreateCycles` | `contribution_cycles` (round, sequence, due dates, beneficiary membership, status), `beneficiary_assignments` if separate |
| 8 | `CreatePayoutsReceipts` | `payouts` (amounts, status enum, sent_by/at, confirmation_deadline, confirmations, override cols), `payout_events`, `payout_disputes`, `payout_receipts` (`uq_payout_receipt_number`, `uq_payout_receipt_payout`, generation_status) |
| 9 | `CreateDistributions` | `target_distributions`, `distribution_items` (`uq_distribution_member`) |
| 10 | `CreateWithdrawalsRefunds` | `withdrawal_requests`, `settlements` (direction enum, calculation_snapshot JSONB), `refunds` (unique per settlement where required, amount ≤ settlement) |
| 11 | `CreateNotifications` | `notifications`, `notification_preferences` |
| 12 | `CreateIdempotencyAndIndexes` | `idempotency_keys` (key, actor, operation, fingerprint, response snapshot, unique (actor, operation, key)); partial indexes per doc 09 §14.4: contributions (round,status), payouts (round,status), payouts(confirmation_deadline) WHERE status='SENT', purchases (user, created), withdrawals (round,status), financial_audit (entity_type, entity_id, created_at DESC) |

## Indexes (from doc 09 §14.4)

```sql
CREATE INDEX idx_contributions_round_status ON contributions(group_round_id, status);
CREATE INDEX idx_contributions_membership ON contributions(membership_id, created_at DESC);
CREATE INDEX idx_payouts_round_status ON payouts(group_round_id, status);
CREATE INDEX idx_payouts_membership ON payouts(membership_id, created_at DESC);
CREATE INDEX idx_payouts_confirmation_deadline ON payouts(confirmation_deadline) WHERE status = 'SENT';
CREATE INDEX idx_purchase_user ON group_purchases(user_id, created_at DESC);
CREATE INDEX idx_purchase_round ON group_purchases(group_round_id);
CREATE INDEX idx_withdrawal_round_status ON withdrawal_requests(group_round_id, status);
CREATE INDEX idx_financial_audit_entity ON financial_audit_logs(entity_type, entity_id, created_at DESC);
```

## Entity → table map (TypeORM)

Entities live per module under `src/modules/<module>/entities/`. Conventions: explicit `@Entity('table_name')`, `@PrimaryGeneratedColumn('uuid')`, `@CreateDateColumn`/`@UpdateCreateDateColumn` as timestamptz, `@Column({type:'numeric', precision:18, scale:2})` for money returned as string, enums as `enum` columns or checked strings (decide once in migration 1 and keep consistent).

## Operational commands

```bash
npm run migration:run      # apply pending
npm run migration:revert   # revert last (test/staging only)
npm run migration:generate # generate from entity diff (review before commit)
```

Never run generate/apply against production without review + backup.
