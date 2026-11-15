# Known Limitations

Current constraints, deliberate deferrals, and open risks. Update as implementation progresses.

---

## Deliberately out of MVP scope (spec 15 §7)

- Automated debit/collection from members' bank accounts
- Automated beneficiary payouts / payout execution rails
- Internal wallet or any platform custody of member funds
- Escrow / pooled customer funds
- Automated bank reconciliation integrations
- Multi-currency (schema carries `currency` column for future NGN+)
- Native Android/iOS apps (PWA only)
- ML fraud detection
- White-label deployments
- Complex third-party accounting integrations

Adding any of the custody/payment-automation items requires legal + regulatory review with licensed providers (spec 14 §13) before implementation.

## Known limitations of current implementation state

- **No application code yet (as of 2026-11-15):** both repositories contain documentation only; all checklist phases are pending scaffold.
- **Manual payment verification only:** group activation relies on organiser-submitted evidence verified by platform finance/admin; no gateway until this workflow is stable (spec 15 Phase 4).
- **Receipts are platform records, not bank proof:** receipt wording must never imply independent settlement verification.
- **Deadline notifications only:** the 48-hour job notifies the organiser; it never auto-confirms a payout.
- **Reporting projections:** financial summaries are computed from authoritative rows; cached projections (if added later) must be rebuildable.
- **Email/push channels:** MVP focuses on in-app notifications; email depends on configured provider; push deferred.
- **MFA recovery:** recovery process must not create a permanent MFA bypass — design still to be implemented in Phase 9.
- **Data retention/anonymisation:** controlled anonymisation preserving financial/audit integrity not yet designed beyond requirements (spec 09 §20, spec 14 §12).

## Open questions / decisions deferred

- Exact verification channel at registration (email vs phone) is configurable — default to be chosen at Phase 2.
- Admin portal: same Next.js app under `/admin` vs separate `admin.adashi.com` deploy — ADR-016 assumes same app first; split later if needed.
- Storage provider for production (S3-compatible vs regional provider) — selected at deploy time via `STORAGE_PROVIDER`.
- Whether `BIWEEKLY` (docs) and `EVERY_TWO_WEEKS` (examples) naming is unified to one enum value at implementation — will standardise in migration 7 and mirror in frontend.

## Risk register (top)

| Risk | Mitigation |
|---|---|
| Floating-point money bugs | ADR-002: NUMERIC + decimal strings + tests forbid float math |
| Duplicate financial operations | transactions + row locks + unique constraints + idempotency keys |
| Cross-group data leaks | group-scoped guards + mandatory IDOR tests per endpoint |
| Entitlement double-consume | unique index + pessimistic lock in activation txn |
| Payout deadline bypass | server-side `sentAt`/deadline only; injectable clock tests |
| Silent financial history edits | append-only events + audit rows + no cascade deletes |
| Bootstrap abuse | CLI-only, refuses when Super Admin exists, single-use invitation |
