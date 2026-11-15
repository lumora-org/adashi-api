# 14 — Security, Permissions, Audit and Platform Operations

**Project:** Adashi Contribution and Savings Management Platform  
**Document:** Security, Permissions, Audit and Platform Operations  
**Audience:** Backend developers, frontend developers, DevOps, QA engineers  
**Status:** Security and operational specification

---

## 1. Purpose

This document defines the security, authorisation, audit and operational requirements for Adashi.

The platform handles personal information and financial records. Security must be built into the architecture and development process rather than added at the end.

## 2. Security principles

1. Least privilege.
2. Deny access by default.
3. Server-side authorisation.
4. Secure authentication and session management.
5. Financial transaction immutability.
6. Data minimisation.
7. Encryption in transit and at rest.
8. Auditable administrative actions.
9. Secure file handling.
10. Resilient backup and recovery.

## 3. Identity and authentication

### 3.1 User accounts

Support:

- Email and/or phone-based registration.
- Email or phone verification.
- Secure login.
- Password reset.
- Session refresh.
- Logout.
- Session revocation.

The exact verification requirements should be configurable.

### 3.2 Password policy

Require:

- Strong passwords.
- Secure password hashing using Argon2id or an appropriately configured bcrypt implementation.
- Password reset tokens with short expiry.
- Single-use reset tokens.
- Rate limiting on login and reset endpoints.
- No password storage in plaintext.
- No password values in logs.

### 3.3 Session management

Recommended:

- Short-lived access tokens.
- Rotating refresh tokens.
- Refresh token reuse detection.
- Server-side session revocation.
- Secure, HTTP-only cookies where applicable.
- `Secure` and appropriate `SameSite` cookie attributes.
- CSRF protection when cookie-based authentication requires it.

Do not place long-lived authentication tokens in localStorage.

### 3.4 Multi-factor authentication

Require MFA for Super Admin accounts.

Support MFA for other platform administrators and optionally for users.

Recovery codes must be securely generated, stored as hashes and usable only once.

## 4. Authorisation architecture

Use role-based access control combined with resource-level permissions.

### Platform permissions

Examples:

```text
users.read
users.manage
groups.read
groups.manage
rounds.read
rounds.manage
billing.read
billing.verify
plans.manage
entitlements.read
financial.read
disputes.read
disputes.manage
reports.read
administrators.manage
settings.manage
audit.read
```

### Group permissions

Examples:

```text
group.read
group.update
members.invite
members.manage
contributions.read
contributions.verify
contributions.reject
cycles.manage
payouts.mark_sent
payouts.review
withdrawals.review
reports.read
```

### Member permissions

Examples:

```text
profile.read
profile.update
group.read
contributions.report
contributions.read_own
payouts.confirm_own
payouts.dispute_own
withdrawals.request
receipts.read_own
```

### Authorisation checks

Every protected operation must verify:

1. The user is authenticated.
2. The account is active.
3. The user has the required permission.
4. The user is authorised for the requested resource.
5. The resource is in a valid state for the operation.

A valid UUID is not proof of permission.

## 5. Group isolation

A user must only access groups where they have an authorised relationship or an explicitly permitted platform-level role.

Every group-scoped query must include the relevant group or round context.

Prevent:

- Viewing another group's members.
- Reading another group's contributions.
- Modifying another group's payouts.
- Downloading another group's evidence.
- Accessing private receipts belonging to unrelated users.

Add automated IDOR tests for every resource endpoint.

## 6. Financial integrity

### 6.1 Monetary representation

Use:

- PostgreSQL `NUMERIC` with appropriate precision and scale, or
- Integer minor units with a clearly defined currency conversion policy.

Do not use JavaScript floating-point arithmetic for financial calculations.

Return monetary amounts as strings in JSON.

### 6.2 Transaction safety

Use database transactions for:

- Purchase activation.
- Free entitlement consumption.
- Contribution verification.
- Contribution reversal.
- Payout marking as sent.
- Receipt record creation.
- Payout confirmation.
- Organiser confirmation.
- Refund creation.
- Target distribution approval.
- Round completion.

### 6.3 Concurrency protection

Use:

- Unique constraints.
- Row-level locking.
- Idempotency keys.
- Optimistic or pessimistic concurrency controls where appropriate.
- Transaction isolation appropriate to each operation.

Do not rely only on frontend button disabling to prevent duplicate actions.

### 6.4 Financial record history

Never silently delete or rewrite:

- Contributions.
- Contribution verification events.
- Payouts.
- Payout confirmation events.
- Receipts.
- Refunds.
- Settlements.
- Group purchases.
- Entitlement consumption events.

Corrections must be represented by explicit reversal, adjustment or dispute events with an actor, reason and timestamp.

## 7. Payout security and 48-hour rule

The payout confirmation deadline is:

`confirmationDeadline = sentAt + 48 hours`

Requirements:

- The server generates or validates the authoritative `sentAt`.
- The backend calculates the deadline.
- The frontend countdown is informational only.
- The organiser cannot confirm on behalf before the deadline.
- The beneficiary can confirm receipt.
- Organiser confirmation must use a separate state.
- Organiser override requires a reason and evidence/reference where available.
- The beneficiary is notified of organiser confirmation.
- The beneficiary can still dispute a payout.
- Disputed payouts preserve all earlier events.

Never let a client submit an arbitrary confirmation timestamp to bypass the deadline.

## 8. File upload security

Files may include:

- Contribution evidence.
- Payout evidence.
- Withdrawal evidence.
- Dispute evidence.
- Profile images.

Requirements:

1. Allow only explicitly approved file types.
2. Validate actual file content, not just extension.
3. Apply file-size limits.
4. Generate server-side filenames.
5. Scan files where a malware scanning service is available.
6. Store private evidence outside public web roots.
7. Use short-lived signed download links.
8. Verify resource ownership and permission before download.
9. Record file access where appropriate.
10. Never trust user-supplied storage paths.

Do not allow uploaded files to execute as application code.

## 9. Application security

Protect against:

- SQL injection.
- Cross-site scripting.
- Cross-site request forgery.
- Broken access control.
- Insecure direct object references.
- Server-side request forgery.
- Insecure deserialisation.
- Brute-force attacks.
- Credential stuffing.
- Sensitive information exposure.
- Dependency vulnerabilities.

Implementation requirements:

- Use DTO validation.
- Use parameterised database queries.
- Escape user-controlled output.
- Apply a restrictive Content Security Policy where feasible.
- Configure CORS to known frontend origins.
- Apply rate limiting.
- Set secure HTTP headers.
- Keep dependencies patched.
- Validate environment variables at startup.
- Avoid exposing stack traces in production.

## 10. Platform administrator security

Super Admin accounts require:

- MFA.
- Verified email.
- Strong password.
- Session management.
- Login notifications.
- Recovery procedures.

For sensitive operations, consider step-up authentication:

- Changing administrator permissions.
- Creating another Super Admin.
- Changing platform security settings.
- Suspending a large number of accounts.
- Resolving high-impact disputes.
- Exporting sensitive reports.

No administrator should be able to silently grant themselves greater authority.

## 11. Audit logging

### Events to record

Authentication:

- Login success.
- Login failure.
- Logout.
- Password reset.
- MFA changes.
- Session revocation.

Platform administration:

- User suspension/reactivation.
- Group suspension/reactivation.
- Plan changes.
- Purchase verification.
- Administrator invitation.
- Permission changes.
- Settings changes.

Financial operations:

- Contribution report.
- Contribution verification.
- Contribution rejection.
- Contribution reversal.
- Payout marked sent.
- Payout confirmation.
- Organiser override.
- Dispute submission and resolution.
- Withdrawal approval.
- Refund creation.
- Target distribution approval.
- Round completion.

### Audit record fields

```text
id
actorUserId
actorType
actorRole
action
resourceType
resourceId
groupId
roundId
reason
beforeState
afterState
ipAddress
userAgent
correlationId
createdAt
```

Use JSON snapshots carefully. Do not store passwords, tokens, MFA secrets or unnecessary sensitive information in audit records.

Audit records should be append-only to application users. Restrict direct database access and monitor privileged infrastructure access.

## 12. Privacy and data protection

The platform should:

- Collect only information needed for its functions.
- Explain why personal data is collected.
- Provide an appropriate privacy notice.
- Restrict access to personal information.
- Define data retention periods.
- Support lawful correction requests.
- Support appropriate account closure procedures.
- Preserve financial records where legally or operationally required.
- Avoid exposing members' personal data to unrelated group members.

Before launch, obtain appropriate Nigerian legal and data protection advice, including review of applicable Nigeria Data Protection Act obligations and any other relevant requirements.

This document is an engineering specification, not legal advice.

## 13. Financial and regulatory boundaries

The MVP should not operate an internal wallet or hold member funds.

Members pay through the collection method selected by the group:

- Organiser collection.
- Direct beneficiary collection.

The platform records reported and verified transactions and provides group administration tools.

Before adding automated collections, pooled custody, escrow, automated payouts or other regulated payment functionality, obtain legal and regulatory advice and work with appropriately licensed payment providers.

Do not imply that a recorded contribution or payout is an independently verified bank settlement unless the evidence supports that claim.

## 14. Secrets and environment configuration

Store secrets in environment variables or a managed secret store.

Example:

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

APP_BASE_URL=
API_BASE_URL=
ADMIN_BASE_URL=

REDIS_URL=

STORAGE_PROVIDER=
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=

EMAIL_PROVIDER=
EMAIL_API_KEY=

MFA_ENCRYPTION_KEY=
BOOTSTRAP_OWNER_EMAIL=
BOOTSTRAP_SECRET=
```

This is illustrative. Never commit actual secrets.

Validate required configuration during application startup. Use separate credentials and secrets for development, staging and production.

Rotate secrets using a controlled procedure.

## 15. Backup and disaster recovery

Recommended baseline:

- Automated database backups.
- Point-in-time recovery where supported.
- Encrypted backup storage.
- Separate backup credentials.
- Backup retention policy.
- Private evidence storage backups or documented recovery.
- Periodic restore tests.

Define recovery objectives:

- **RPO:** Maximum acceptable data loss measured in time.
- **RTO:** Maximum acceptable service restoration time.

Choose actual RPO and RTO targets based on hosting capability, cost and business requirements. Do not claim a recovery target that has not been tested.

A backup is not proven until restoration has been tested.

## 16. Monitoring and alerting

Monitor:

- API uptime.
- Response latency.
- Error rates.
- Database connection usage.
- Database storage.
- Redis health.
- Queue depth.
- Failed background jobs.
- Receipt generation failures.
- Notification failures.
- Repeated login failures.
- Unusual administrative activity.
- Backup failures.

Set alerts for:

- Database unavailable.
- Sustained high error rate.
- Queue backlog.
- Failed critical financial job.
- Backup failure.
- Unusual privileged account activity.

Do not automatically retry non-idempotent financial operations without idempotency protection.

## 17. Background job reliability

Use an outbox pattern for critical side effects.

Examples:

- Receipt PDF generation.
- Notifications.
- Scheduled reminders.
- Payout deadline notifications.
- Report generation.

A job should be safe to retry.

Failed jobs must have:

- Retry policy.
- Attempt count.
- Error details.
- Correlation ID.
- Dead-letter or failed-job handling.
- Administrative monitoring.

A failed notification must not reverse a successfully committed financial transaction.

## 18. Operational procedures

Document procedures for:

- Initial Super Admin setup.
- Administrator onboarding.
- Administrator offboarding.
- Password and MFA recovery.
- Account suspension.
- Dispute escalation.
- Purchase verification.
- Financial correction.
- Database restoration.
- Security incident response.
- Deployment rollback.
- Maintenance announcements.

## 19. Security acceptance checklist

Before production:

- [ ] No public Super Admin registration.
- [ ] Initial owner bootstrap is single-use.
- [ ] Super Admin MFA is enabled.
- [ ] Backend permissions are enforced.
- [ ] Group data isolation is tested.
- [ ] Critical financial operations are transactional.
- [ ] Idempotency is implemented.
- [ ] Audit logging is active.
- [ ] Private files cannot be accessed without authorisation.
- [ ] Secrets are not committed.
- [ ] Production error responses do not expose stack traces.
- [ ] Rate limiting is configured.
- [ ] Database backups are configured.
- [ ] Restore procedure is tested.
- [ ] Monitoring and alerts are configured.
- [ ] Privacy notices and legal review are completed.
- [ ] Production deployment has a rollback procedure.

**End of Document 14.**