# 05 — Adashi Platform Backend Architecture

**Document:** Backend Architecture  
**Project:** Adashi Contribution and Savings Management Platform  
**Version:** 1.0  
**Status:** Proposed — Implementation Guide  
**Backend Framework:** NestJS  
**Database:** PostgreSQL  
**ORM:** TypeORM  
**Cache and Queue:** Redis + BullMQ  
**API Style:** REST API  
**Currency:** Nigerian Naira (NGN)

---

## 1. Purpose

This document defines the backend architecture for Adashi.

The backend will manage users, groups, group rounds, memberships, contributions, rotational payouts, target-based savings, purchases, withdrawals, refunds, receipts, notifications, reports, and administrative operations.

The architecture should be modular, secure, maintainable, and scalable without introducing unnecessary microservice complexity during the MVP.

## 2. Architectural Approach

### 2.1 Recommended architecture

Use a **modular monolith** built with NestJS.

The application will run as one backend deployment but will be divided into independent business modules with clear responsibilities.

Benefits:

- Easier development and deployment for the MVP.
- Shared database transactions across financial operations.
- Clear separation of business responsibilities.
- Easier testing and debugging.
- Ability to extract selected modules into independent services later if necessary.

### 2.2 High-level architecture

```text
                    ADASHI PWA
                        |
                        | HTTPS / REST API
                        |
                 NESTJS APPLICATION
                        |
       +----------------+----------------+
       |                |                |
  Authentication    Group Management   Financial Modules
       |                |                |
       |                |          +-----+------+
       |                |          |            |
       |                |     Contributions   Payouts
       |                |          |            |
       |                |          |         Receipts
       |                |          |            |
       +----------------+----------+------------+
                        |
                 PostgreSQL
                        |
              +---------+----------+
              |                    |
             Redis              File Storage
              |                    |
          BullMQ Queues         PDF Receipts
              |
       +------+-------+
       |              |
  Notifications   Background Jobs
```

### 2.3 Important architectural rule

Financial operations must remain within the same PostgreSQL database transaction whenever they modify related financial records.

Do not split contribution verification, payout creation, receipt creation, or refund settlement into independent operations that can leave the database in an inconsistent state.

---

## 3. Technology Stack

| Component | Recommended technology |
|---|---|
| Runtime | Node.js LTS |
| Framework | NestJS |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | TypeORM |
| Authentication | JWT |
| Password hashing | Argon2 or bcrypt |
| Validation | class-validator |
| API documentation | Swagger |
| Cache | Redis |
| Background jobs | BullMQ |
| PDF generation | Puppeteer or a suitable PDF library |
| File storage | S3-compatible object storage |
| Email | SMTP or transactional email provider |
| Push notifications | Web Push |
| Logging | NestJS Logger / structured logger |
| Testing | Jest + Supertest |
| Deployment | Docker-compatible hosting |

Use stable, mutually compatible package versions and pin dependencies in the project lockfile.

---

## 4. Application Structure

Recommended project structure:

```text
api/
│
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── config/
│   │   ├── configuration.ts
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   └── validation.schema.ts
│   │
│   ├── common/
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── filters/
│   │   ├── pipes/
│   │   ├── enums/
│   │   ├── interfaces/
│   │   ├── utils/
│   │   └── constants/
│   │
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeds/
│   │   └── database.module.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── entitlements/
│   │   ├── groups/
│   │   ├── memberships/
│   │   ├── rounds/
│   │   ├── group-purchases/
│   │   ├── contributions/
│   │   ├── cycles/
│   │   ├── beneficiaries/
│   │   ├── payouts/
│   │   ├── target-savings/
│   │   ├── distributions/
│   │   ├── withdrawals/
│   │   ├── refunds/
│   │   ├── receipts/
│   │   ├── notifications/
│   │   ├── reports/
│   │   ├── audit-logs/
│   │   └── admin/
│   │
│   ├── infrastructure/
│   │   ├── queue/
│   │   ├── storage/
│   │   ├── email/
│   │   ├── pdf/
│   │   └── events/
│   │
│   └── health/
│
├── test/
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

Each business module should follow a consistent internal structure.

Example:

```text
modules/contributions/
│
├── contributions.module.ts
├── contributions.controller.ts
├── contributions.service.ts
├── contributions.repository.ts
├── dto/
│   ├── create-contribution.dto.ts
│   ├── report-payment.dto.ts
│   └── verify-contribution.dto.ts
├── entities/
│   └── contribution.entity.ts
├── enums/
│   └── contribution-status.enum.ts
├── policies/
│   └── contribution.policy.ts
└── tests/
```

Controllers should handle HTTP concerns. Services should contain business logic. Repositories or dedicated persistence services should handle database access where that separation adds value.

Avoid placing all business logic inside controllers or creating excessively generic base services.

---

## 5. Module Responsibilities

### 5.1 Authentication Module

Responsibilities:

- User registration.
- Login and logout.
- Password hashing and verification.
- Access-token generation.
- Refresh-token rotation.
- Password reset.
- Email or phone verification.
- Session invalidation.

Recommended components:

```text
auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── strategies/
│   ├── jwt.strategy.ts
│   └── refresh-token.strategy.ts
├── guards/
└── dto/
```

Use short-lived access tokens and securely stored, revocable refresh tokens.

Do not store plaintext passwords or refresh tokens.

### 5.2 Users Module

Responsibilities:

- User profile management.
- Contact information.
- Account status.
- Profile updates.
- Account preferences.

A user has one platform account even if they participate in several groups.

A user can be an organiser in one group and a member in another. Do not use a single global user role to represent group-level responsibilities.

### 5.3 Entitlements Module

This module controls the one-time free Starter entitlement.

Every user receives one free Starter group activation.

Suggested entitlement states:

- AVAILABLE
- RESERVED
- USED

Responsibilities:

- Check whether a user is eligible.
- Reserve an available entitlement.
- Activate the free group round.
- Prevent duplicate activation.
- Preserve entitlement history.

**Important:** Entitlement consumption must be transactional.

When activating a free group:

1. Lock the user's entitlement record.
2. Confirm that it is AVAILABLE or validly RESERVED.
3. Confirm the group satisfies Starter limits.
4. Create the group and initial round records.
5. Mark the entitlement as USED.
6. Commit all changes together.

If activation fails, the transaction must roll back.

A deleted group must not restore a consumed entitlement.

A user must not be able to obtain another free entitlement by deleting a group, leaving a group, or cancelling a round.

### 5.4 Groups Module

Responsibilities:

- Create groups.
- Update group information.
- Configure group settings.
- Configure payment collection method.
- Assign the organiser.
- Manage group status.
- Retrieve group summaries.

A group is a persistent identity.

Do not delete the group when a round finishes. New rounds must be created under the existing group.

### 5.5 Memberships Module

Responsibilities:

- Add members.
- Invite members.
- Accept or reject invitations.
- Track membership status.
- Manage member participation in individual rounds.
- Process membership withdrawal.

Membership should distinguish the long-term group relationship from participation in a particular round.

Recommended membership states:

- INVITED
- ACTIVE
- WITHDRAWAL_REQUESTED
- WITHDRAWN
- SUSPENDED

A withdrawn member must retain access to appropriate historical records, subject to privacy and account policies.

### 5.6 Rounds Module

Responsibilities:

- Create a new group round.
- Configure round settings.
- Start and complete rounds.
- Maintain round history.
- Track round progress.

Each round belongs to one persistent group.

Suggested states:

- DRAFT
- PENDING_PAYMENT
- ACTIVE
- IN_PROGRESS
- AWAITING_DISTRIBUTION
- COMPLETED
- CANCELLED

A completed round should be read-only for ordinary users. Corrections must use authorised adjustment or reversal records with audit history.

### 5.7 Group Purchases and Billing Module

Responsibilities:

- Calculate the plan price.
- Create purchase records.
- Verify payments.
- Activate paid rounds.
- Process plan upgrades.
- Track the payment difference for upgrades.

Initial pricing:

| Plan | Member limit | Illustrative one-time price |
|---|---:|---:|
| Starter | 10 | ₦1,000 |
| Standard | 20 | ₦2,000 |
| Premium | 50 | ₦3,500 |
| Enterprise | Custom | Negotiated |

These are proposed starting prices, not final commercial commitments.

The organiser pays once per group round. A new round requires a new purchase unless the user is activating their unused free Starter entitlement.

**Keep platform revenue separate from group contribution money.**

### 5.8 Contributions Module

Responsibilities:

- Generate expected contributions.
- Record reported payments.
- Verify or reject reported payments.
- Track overdue contributions.
- Calculate member contribution totals.
- Preserve contribution history.

Contribution states:

- EXPECTED
- REPORTED
- VERIFIED
- REJECTED
- OVERDUE
- REVERSED

A member reporting a payment does not mean the payment is verified.

For manual collection, the organiser verifies the payment after checking their bank or other agreed payment evidence.

### 5.9 Cycles Module

This module manages rotational contribution cycles.

Responsibilities:

- Generate cycles from the configured schedule.
- Assign the expected beneficiary.
- Determine contribution deadlines.
- Track cycle collection progress.
- Create the beneficiary payout obligation.
- Determine whether the next cycle can proceed.

Supported frequencies:

- Daily
- Weekly
- Every two weeks
- Every three weeks
- Monthly

Cycle progression must follow the group's configured rules.

### 5.10 Beneficiaries Module

Responsibilities:

- Maintain beneficiary order.
- Assign beneficiaries to rotational cycles.
- Handle approved order changes.
- Preserve the original order and changes.
- Calculate the next eligible beneficiary.

An approved exception to the normal order must include a reason, the approving organiser, and an audit record.

### 5.11 Target Savings Module

Responsibilities:

- Store the savings target.
- Track the target deadline.
- Calculate total verified contributions.
- Track progress.
- Determine when the target is reached.
- Prepare the distribution calculation.

Only verified contributions should count towards the target.

### 5.12 Distributions Module

Responsibilities:

- Calculate equal shares.
- Identify eligible members.
- Record distribution approval.
- Create payout obligations.
- Handle currency rounding.

For equal distribution:

```text
Distributable Amount = Eligible Group Funds

Base Share = Distributable Amount / Number of Eligible Members
```

Use integer minor units or PostgreSQL NUMERIC arithmetic. Never use JavaScript floating-point arithmetic for money.

Any remaining minor units must be allocated according to a documented, deterministic rule and recorded transparently.

### 5.13 Payouts Module

Responsibilities:

- Create payout obligations.
- Record payout transfers.
- Notify beneficiaries.
- Process beneficiary confirmation.
- Process organiser confirmation overrides.
- Handle disputes.

This is a critical financial module and must use database transactions and strict authorisation checks.

### 5.14 Receipts Module

Responsibilities:

- Generate a unique receipt number.
- Create a receipt record when a payout is marked as sent.
- Queue PDF generation.
- Store the PDF securely.
- Allow authorised downloads.
- Maintain receipt versions and audit history.

A receipt confirms that Adashi recorded the payout as sent. It is not independent proof of bank settlement.

### 5.15 Withdrawals and Refunds Modules

Responsibilities:

- Receive withdrawal requests.
- Record withdrawal reasons.
- Calculate settlement amounts.
- Allow organiser approval or rejection.
- Create refund obligations.
- Record refund transfers.
- Preserve membership and financial history.

For a rotational member who has already received a payout, settlement must account for that payout. Do not automatically refund the full contribution total.

For a target-based group, approved withdrawals should be excluded from future distributions according to the documented settlement rules.

### 5.16 Notifications Module

Notification channels may include:

- In-app notifications.
- Email.
- Web push.
- SMS through a suitable provider.

Notifications should cover:

- Group invitations.
- Contribution reminders.
- Payment verification.
- Upcoming beneficiary payouts.
- Payout sent.
- Payout confirmation.
- Payout dispute.
- Withdrawal decisions.
- Refund updates.
- Round completion.

Notification delivery must not be required for a financial transaction to commit successfully.

### 5.17 Reports Module

Responsibilities:

- Member financial summaries.
- Organiser group summaries.
- Contribution reports.
- Payout reports.
- Outstanding obligations.
- Withdrawal and refund reports.
- Round history.

All financial totals must be calculated from transaction records or reliable derived views. Do not let users edit aggregate totals directly.

### 5.18 Audit Logs Module

Record important operations, including:

- Contribution verification.
- Contribution rejection.
- Payout marked as sent.
- Member payout confirmation.
- Organiser payout override.
- Payout dispute.
- Withdrawal approval.
- Refund settlement.
- Beneficiary-order changes.
- Plan upgrades.
- Round activation and completion.

Audit entries should capture the actor, action, affected record, timestamp, and relevant before/after details.

Ordinary users must not be able to modify or delete audit logs.

---

## 6. Roles and Authorisation

Use two layers of authorisation.

### 6.1 Platform-level roles

Suggested roles:

- USER
- SUPER_ADMIN

A normal USER may act as an organiser or member depending on their relationship with a group.

### 6.2 Group-level permissions

Use group membership and ownership to determine permissions.

| Operation | Organiser | Member |
|---|---|---|
| Update group settings | Yes | No |
| Invite members | Yes | No |
| View group financial summary | Yes | Limited |
| Report own contribution | No | Yes |
| Verify contributions | Yes | No |
| View own contribution history | Yes | Yes |
| Mark beneficiary payout as sent | Yes | No |
| Confirm own payout | No | Yes |
| Confirm payout on behalf | Yes, after 48 hours | No |
| Dispute own payout | No | Yes |
| Request withdrawal | No | Yes |
| Review withdrawal request | Yes | No |

Super Admin should have platform-management permissions, not unrestricted permission to silently edit member financial records.

### 6.3 Guards and decorators

Recommended:

```text
common/
├── decorators/
│   ├── current-user.decorator.ts
│   ├── public.decorator.ts
│   ├── roles.decorator.ts
│   └── permissions.decorator.ts
│
├── guards/
│   ├── jwt-auth.guard.ts
│   ├── roles.guard.ts
│   ├── group-access.guard.ts
│   └── permissions.guard.ts
```

Do not rely on frontend role checks for security. Every protected operation must be authorised by the backend.

---

## 7. Financial Transaction Design

### 7.1 Money representation

Use PostgreSQL NUMERIC or integer minor units.

Recommended approach:

- Store currency explicitly.
- Use NGN for the initial product.
- Never use JavaScript `number` for financial calculations.
- Use a decimal library or integer arithmetic in the service layer.
- Validate all amounts on the backend.

### 7.2 Contribution verification transaction

When an organiser verifies a reported contribution:

1. Begin database transaction.
2. Lock the contribution record.
3. Confirm it belongs to the organiser's group and active round.
4. Confirm its current status is REPORTED.
5. Record verification actor and timestamp.
6. Change status to VERIFIED.
7. Update any required derived progress records.
8. Write an audit entry.
9. Commit.

If the contribution is already verified, return an appropriate conflict or idempotent response. Never create a second financial effect.

### 7.3 Payout transaction

When an organiser marks a payout as sent:

1. Begin database transaction.
2. Lock the payout record.
3. Verify organiser permissions.
4. Confirm the payout is eligible to be sent.
5. Record the transfer reference and sent timestamp.
6. Set status to SENT.
7. Calculate the confirmation deadline as `sentAt + 48 hours`.
8. Create the receipt record.
9. Create an outbox event for PDF generation and notification.
10. Write an audit entry.
11. Commit.

The PDF and notification jobs should run after the database transaction commits.

### 7.4 Payout confirmation state machine

Use a clear state model:

| Status | Meaning |
|---|---|
| PENDING | Payout obligation exists but has not been sent |
| SENT | Organiser recorded that the transfer was sent |
| CONFIRMED_BY_MEMBER | Beneficiary confirmed receipt |
| CONFIRMED_BY_ORGANISER | Organiser confirmed receipt on the member's behalf after the deadline |
| DISPUTED | Beneficiary raised a dispute |
| CANCELLED | Payout was cancelled through an authorised process |

The `sentAt` timestamp and `confirmationDeadline` should be immutable once established, except through a formally audited correction process.

### 7.5 Beneficiary confirmation

The beneficiary can confirm receipt after the payout is marked SENT.

The backend must verify:

- The authenticated user is the intended beneficiary.
- The payout is currently SENT.
- The payout has not been cancelled.
- The request is valid and not a duplicate.

Record `confirmedAt` and the confirming user.

### 7.6 Organiser confirmation override

The organiser may confirm receipt on behalf of the beneficiary only after the 48-hour deadline.

The backend must:

- Compare the current server time with `confirmationDeadline`.
- Reject early override attempts.
- Require a reason.
- Allow supporting evidence or transfer reference.
- Record the organiser as the confirming actor.
- Set status to CONFIRMED_BY_ORGANISER.
- Notify the beneficiary.
- Preserve the original SENT event and receipt history.

Never represent an organiser override as a member confirmation.

### 7.7 Disputes

A beneficiary can dispute a payout.

A dispute must preserve the original payout and confirmation events.

Recommended behaviour:

- Record dispute reason and supporting evidence.
- Notify the organiser.
- Mark the payout DISPUTED or attach a dispute record while retaining the previous status in the event history.
- Flag the relevant cycle or distribution for review.
- Prevent automatic progression where the disputed payout affects the next financial step.
- Resolve through a documented review process.

A dispute must not silently reverse a payout or delete a receipt.

---

## 8. Receipt Generation Architecture

Receipt creation should be separated from PDF generation.

### 8.1 Receipt lifecycle

1. Organiser marks payout as sent.
2. Backend creates a receipt record inside the payout transaction.
3. Backend creates a PDF-generation job.
4. Worker generates the PDF.
5. PDF is uploaded to private object storage.
6. Receipt record is updated with the storage reference and status.
7. Beneficiary and organiser receive notifications.

Suggested receipt states:

- GENERATING
- AVAILABLE
- FAILED
- SUPERSEDED

### 8.2 Receipt contents

Each receipt should include:

- Unique receipt number.
- Platform name.
- Group name.
- Group round identifier.
- Beneficiary name.
- Payout amount.
- Currency.
- Payout date.
- Transfer reference, where available.
- Organiser name.
- Payout sent status.
- Confirmation status.
- Confirmation method.
- Confirmation timestamp, if available.
- Dispute status, if applicable.

A receipt should clearly distinguish between “organiser recorded as sent” and “receipt confirmed”.

### 8.3 Access control

Only authorised group participants and the relevant beneficiary should access the receipt.

Use short-lived signed download URLs or an authenticated download endpoint.

Do not expose public object-storage URLs.

---

## 9. Background Jobs and Queues

Use Redis and BullMQ for work that should not block API requests.

Suggested queues:

```text
queues/
├── notifications.queue.ts
├── receipts.queue.ts
├── contribution-reminders.queue.ts
├── payout-deadlines.queue.ts
├── reports.queue.ts
└── maintenance.queue.ts
```

### 9.1 Notification jobs

Examples:

- Send group invitations.
- Send contribution reminders.
- Notify beneficiaries of payouts.
- Notify members of organiser overrides.
- Notify users of withdrawal decisions.

### 9.2 Receipt jobs

Generate and store PDF receipts asynchronously.

Jobs must be retryable and idempotent.

### 9.3 Payout deadline jobs

Schedule a job for each payout confirmation deadline.

At the deadline:

- Check the payout's current status.
- If the member has confirmed, do nothing.
- If the payout is disputed, flag it for review.
- If it remains SENT, notify the organiser that an override is now available.
- Do not automatically confirm the payout.

The organiser must explicitly perform the override.

### 9.4 Contribution reminders

Generate reminders based on group contribution frequency and deadlines.

Avoid duplicate reminders by using unique job identifiers or idempotency keys.

### 9.5 Reliable event delivery

Use a transactional outbox pattern for important events.

The database transaction writes the business changes and an outbox event together. A worker later publishes the event to the relevant queue.

This prevents a situation where a payout is committed but its notification or receipt-generation job is permanently lost because the process crashed.

---

## 10. API Design Standards

Follow the API specification in Document 04.

General rules:

- Use `/api/v1` as the API prefix.
- Use REST conventions.
- Use DTOs for all request validation.
- Use consistent response structures.
- Use pagination for collection endpoints.
- Use ISO 8601 timestamps in UTC.
- Return appropriate HTTP status codes.
- Avoid leaking internal database errors.

Example response:

```json
{
  "success": true,
  "message": "Contribution verified successfully",
  "data": {
    "id": "contribution-id",
    "status": "VERIFIED"
  }
}
```

Example error:

```json
{
  "success": false,
  "message": "This payout cannot be confirmed before the 48-hour deadline",
  "errorCode": "PAYOUT_OVERRIDE_TOO_EARLY"
}
```

Use a global exception filter to standardise error responses.

---

## 11. Database and ORM Rules

Use TypeORM with PostgreSQL.

Important rules:

1. Use migrations for schema changes.
2. Do not use `synchronize: true` in production.
3. Use foreign keys and database constraints.
4. Add indexes for frequently queried fields.
5. Use transactions for financial operations.
6. Use pessimistic row locking for sensitive concurrent operations.
7. Preserve financial records.
8. Use soft deletion only for appropriate non-financial records.
9. Avoid storing manually editable aggregate financial totals.
10. Record timestamps consistently in UTC.

Suggested indexes include:

- Users: email, phone.
- Groups: organiser ID, status.
- Memberships: group ID, user ID, status.
- Rounds: group ID, status.
- Contributions: round ID, member ID, status, due date.
- Payouts: round ID, beneficiary ID, status, confirmation deadline.
- Receipts: receipt number, payout ID.
- Notifications: user ID, read status, created date.
- Audit logs: actor ID, entity type, entity ID, timestamp.

Use unique constraints to prevent duplicate membership records, duplicate receipt numbers, and duplicate financial events where appropriate.

---

## 12. Security Requirements

### Authentication

- Hash passwords securely.
- Use short-lived access tokens.
- Rotate refresh tokens.
- Revoke compromised sessions.
- Rate-limit login and password-reset endpoints.

### Authorisation

- Verify group ownership and membership on the backend.
- Prevent access to records belonging to unrelated groups.
- Check beneficiary identity before payout confirmation.
- Check organiser authority before verification or override.

### Financial integrity

- Use database transactions.
- Use row locks for concurrent financial updates.
- Add idempotency protection to financial endpoints.
- Never silently delete financial transactions.
- Preserve reversal and correction history.
- Record every privileged financial action.

### Data protection

- Validate uploaded files.
- Restrict file types and sizes.
- Store private documents outside public web directories.
- Avoid exposing sensitive personal or bank details.
- Use HTTPS.
- Keep secrets out of source control.

### Auditability

Important financial actions must have immutable audit history.

Application administrators should not be able to silently rewrite transaction history through ordinary application endpoints.

---

## 13. Withdrawal and Refund Processing

Withdrawal processing must be implemented as a workflow, not as a direct deletion of membership.

### Suggested workflow

```text
Member submits withdrawal request
              |
              v
System calculates settlement
              |
              v
Organiser reviews request
              |
        +-----+------+
        |            |
      Reject       Approve
        |            |
        v            v
   Request closed  Refund obligation
                     |
                     v
              Refund transfer recorded
                     |
                     v
              Refund confirmed
                     |
                     v
             Membership withdrawn
```

For rotational groups, calculate the net settlement after accounting for any payout already received.

For target-based groups, calculate the member's verified contribution entitlement and apply the agreed withdrawal rules.

Every approved refund must have a corresponding settlement record and transfer history.

---

## 14. Round Completion Rules

Do not mark a round COMPLETED merely because everyone has contributed.

### Rotational round

A rotational round can complete when:

- All required cycles have been processed.
- All eligible beneficiaries have received their payouts.
- All payout obligations have been settled.
- Approved refunds and other outstanding obligations are resolved.
- No unresolved financial dispute blocks completion.

### Target-based round

A target-based round can complete when:

- The target distribution has been approved.
- All eligible members' payouts have been settled.
- Approved withdrawals and refunds are resolved.
- No unresolved financial dispute blocks completion.

A target being reached is not the same as a round being completed.

---

## 15. Reporting and Financial Calculations

### Member dashboard

Show:

- Total verified contributions.
- Number of verified contributions.
- Pending reported contributions.
- Rejected contributions.
- Outstanding contributions.
- Expected payout.
- Amount received.
- Contribution history.
- Payout history.
- Withdrawal and refund history.

### Organiser dashboard

Show:

- Total verified group contributions.
- Total contributions by member.
- Pending and overdue contributions.
- Current cycle or target progress.
- Payouts sent.
- Payouts awaiting confirmation.
- Disputed payouts.
- Remaining payout obligations.
- Withdrawals and refunds.
- Current round financial position.

### Financial calculation principle

Calculate totals from underlying transaction records.

For example:

```text
Member Verified Contributions =
SUM(all VERIFIED contribution amounts for that member and round)
```

Use the same filters and financial definitions throughout dashboards, reports, and exports.

---

## 16. Testing Strategy

Testing must cover both ordinary functionality and financial edge cases.

### Unit tests

Test:

- Contribution calculations.
- Target progress calculations.
- Equal distribution.
- Payout eligibility.
- 48-hour deadline validation.
- Withdrawal settlement.
- Plan-limit validation.
- Free entitlement activation.
- Round completion rules.

### Integration tests

Test:

- Registration and authentication.
- Group creation.
- Member invitations.
- Contribution reporting and verification.
- Payout sending.
- Receipt record creation.
- Member payout confirmation.
- Organiser override after 48 hours.
- Payout disputes.
- Withdrawal and refund processing.
- Paid group-round activation.

### Critical concurrency tests

Test that:

- Two requests cannot consume the same free entitlement.
- Two requests cannot verify the same contribution twice.
- A payout cannot be sent twice.
- A member cannot confirm another member's payout.
- An organiser cannot override before the deadline.
- Two concurrent payout operations cannot advance a cycle incorrectly.
- Duplicate requests cannot create duplicate receipts or refunds.

### End-to-end scenarios

At minimum, test:

**Scenario A — Rotational Adashi**

1. Organiser creates a group.
2. Organiser activates a round.
3. Members join.
4. Members report contributions.
5. Organiser verifies contributions.
6. Organiser sends the first beneficiary payout.
7. Receipt is generated.
8. Beneficiary confirms receipt.
9. Next cycle proceeds.
10. Round completes after all obligations are settled.

**Scenario B — Organiser override**

1. Organiser sends a payout.
2. System records the 48-hour deadline.
3. Beneficiary does not confirm.
4. Organiser attempts override before the deadline — rejected.
5. Deadline passes.
6. Organiser submits override with a reason.
7. System records CONFIRMED_BY_ORGANISER.
8. Beneficiary is notified.
9. Audit history preserves the action.

**Scenario C — Free Starter entitlement**

1. User registers.
2. User receives AVAILABLE entitlement.
3. User activates a Starter group.
4. Entitlement becomes USED.
5. User deletes or cancels the group.
6. User attempts to activate another free Starter group.
7. System rejects the request.

**Scenario D — Target-based Adashi**

1. Organiser creates a target-based group.
2. Members contribute different permitted amounts.
3. Organiser verifies payments.
4. System calculates target progress.
5. Target is reached.
6. System calculates equal distribution among eligible members.
7. Organiser approves distribution.
8. Payouts are sent and confirmed.
9. Round completes after all obligations are settled.

---

## 17. Deployment Architecture

For the MVP, the backend can be deployed as one application with separate worker processes.

Recommended production arrangement:

```text
                    Internet
                       |
                 HTTPS / Domain
                       |
                NestJS API Service
                       |
             +---------+----------+
             |                    |
         PostgreSQL             Redis
             |                    |
             |              BullMQ Workers
             |                    |
             +--------------------+
                       |
                Private File Storage
```

Separate the API process from background workers when the hosting environment permits it.

This allows receipt generation, notifications, and scheduled jobs to scale without slowing down ordinary API requests.

### Production requirements

- Managed PostgreSQL with backups.
- Redis with persistence appropriate to the workload.
- Private object storage.
- HTTPS.
- Environment-specific configuration.
- Database migrations during deployment.
- Health-check endpoints.
- Error monitoring.
- Structured logs.
- Backup and recovery procedures.

Do not rely on a free-tier deployment for a production financial platform without checking its limits, sleeping behaviour, backup guarantees, and resource constraints.

---

## 18. Environment Variables

Example `.env.example`:

```env
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

DATABASE_URL=postgresql://user:password@localhost:5432/adashi

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

JWT_ACCESS_SECRET=replace_me
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=replace_me
JWT_REFRESH_EXPIRES_IN=7d

STORAGE_ENDPOINT=
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
STORAGE_REGION=

EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=

WEB_PUSH_PUBLIC_KEY=
WEB_PUSH_PRIVATE_KEY=

RECEIPT_STORAGE_PATH=receipts
```

Validate required environment variables during application startup.

Never commit real secrets to GitHub.

---

## 19. Implementation Phases

Build the backend in phases so that each stage can be tested before the next is introduced.

### Phase 1 — Foundation

- NestJS setup.
- PostgreSQL connection.
- TypeORM migrations.
- Global validation.
- Swagger.
- Configuration management.
- Logging and exception handling.

### Phase 2 — Authentication and Users

- Registration.
- Login.
- Refresh tokens.
- Password reset.
- User profiles.
- Platform-level authorisation.

### Phase 3 — Groups and Entitlements

- Group creation.
- Free Starter entitlement.
- Group plan configuration.
- Membership invitations.
- Group-level permissions.

### Phase 4 — Rounds and Purchases

- Group rounds.
- One-time group purchases.
- Purchase verification.
- Plan upgrades.
- Round activation and renewal.

### Phase 5 — Contributions

- Contribution schedules.
- Payment reporting.
- Organiser verification.
- Rejection and reversal.
- Contribution summaries.

### Phase 6 — Rotational Adashi

- Cycle generation.
- Beneficiary order.
- Payout obligations.
- Cycle progression.

### Phase 7 — Target-Based Adashi

- Savings targets.
- Target progress.
- Eligible member calculations.
- Equal distribution.

### Phase 8 — Payouts and Receipts

- Mark payout as sent.
- 48-hour confirmation deadline.
- Member confirmation.
- Organiser override.
- Disputes.
- Receipt creation and PDF generation.

### Phase 9 — Withdrawals and Refunds

- Withdrawal requests.
- Settlement calculations.
- Organiser approval.
- Refund tracking.
- Membership withdrawal.

### Phase 10 — Notifications and Reports

- In-app notifications.
- Email and push notifications.
- Reminders.
- Member and organiser dashboards.
- Financial reports.

### Phase 11 — Administration and Production Readiness

- Super Admin tools.
- Audit logs.
- Security testing.
- Concurrency testing.
- Performance testing.
- Backup and recovery.
- Production deployment.

---

## 20. Important Decisions to Preserve During Implementation

1. Adashi is a modular monolith for the MVP, not a premature microservice architecture.
2. One user can organise multiple groups and join multiple groups.
3. Group identity persists across rounds.
4. Each new paid round requires a one-time purchase.
5. Every user has one free Starter activation, permanently consumed on activation.
6. Contributions and payouts are separate financial records.
7. Contributions can be collected through the organiser or directly by the beneficiary.
8. Manual payment verification is the initial MVP approach.
9. Organisers cannot confirm a payout on behalf of a member before 48 elapsed hours.
10. Organiser overrides must be distinguishable from member confirmations.
11. Payout receipts are created when the organiser marks the payout as sent.
12. Disputed payouts must retain their full history and must not silently advance financial workflows.
13. Withdrawals require settlement calculations and organiser review.
14. Financial records must never be silently deleted.
15. Financial totals must be derived from transaction records.
16. No internal wallet or custody of group funds is required for the MVP.

---

## 21. Future Expansion

The architecture should allow future additions without requiring a complete rewrite:

- Payment gateway integration.
- Automated payment reconciliation.
- Automated payout integrations.
- SMS notifications.
- More advanced analytics.
- Multi-currency support.
- Group-specific configurable rules.
- Additional savings models.
- Mobile applications.
- Dedicated reporting services.
- More sophisticated fraud detection.

Any future automated collection or payout feature must be reviewed against applicable Nigerian payment, financial-services, consumer-protection, and data-protection requirements. Use appropriately licensed providers and avoid holding customer funds unless the required legal and regulatory arrangements are in place.

---

## 22. Final Architecture Recommendation

Build Adashi as a **NestJS modular monolith with PostgreSQL, TypeORM, Redis, BullMQ, and private object storage**.

Prioritise financial integrity, clear group-level permissions, round history, reliable receipts, and transparent contribution and payout records.

The MVP should first make manual Adashi administration reliable and transparent. Automated payment collection and payouts can be introduced later without compromising the core platform architecture.