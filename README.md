# Adashi Platform — Backend API

The backend service for Adashi, a multi-tenant group savings and contribution management platform designed for the Nigerian market.

Built around a modular NestJS architecture, the backend manages authentication, users, groups, memberships, group rounds, billing, entitlements, contributions, payout workflows, target-based distributions, receipts, withdrawals, notifications, reports, and platform administration.

It is the central source of truth for all business rules and financial operations.

---

## 1. Project Overview

Adashi digitises traditional group savings arrangements and provides structured financial tracking for organisers and members.

The platform supports two primary savings models:

### Rotational Adashi

Members contribute according to a configured schedule. Each contribution cycle has a designated beneficiary who receives the contributions for that cycle.

Supported schedules:

- Daily
- Weekly
- Every two weeks
- Every three weeks
- Monthly

### Target-Based Adashi

Members contribute towards a shared group savings target. Once the required distribution conditions are satisfied, the accumulated funds are distributed equally among eligible members.

The backend is responsible for enforcing eligibility, validating financial records, calculating distribution amounts, and preserving transaction history.

---

## 2. Core Responsibilities

The backend must:

- Authenticate users and manage sessions.
- Enforce group-level permissions.
- Manage groups, memberships, and invitations.
- Manage persistent groups and their operational rounds.
- Enforce group billing and entitlement rules.
- Record and verify member contributions.
- Generate rotational contribution cycles.
- Manage beneficiary order.
- Track payout operations.
- Enforce the 48-hour payout confirmation rule.
- Generate payout receipt records and PDFs.
- Manage target-based savings and distributions.
- Process withdrawal and refund workflows.
- Deliver notifications.
- Generate financial reports.
- Provide secure Super Admin functionality.
- Maintain audit logs and immutable financial history.
- Protect against duplicate financial operations and inconsistent balances.

---

## 3. Technology Stack

| Technology | Purpose |
|---|---|
| NestJS | Backend framework |
| TypeScript | Application language |
| PostgreSQL | Primary relational database |
| TypeORM | ORM and database migrations |
| Redis | Caching and background-job infrastructure |
| BullMQ | Background jobs and scheduled tasks |
| Swagger / OpenAPI | API documentation |
| Private object storage | Payment evidence and generated receipts |
| PDF generation library | Receipt generation |
| Jest | Unit and integration testing |

Use the dependency versions already established in the repository unless an upgrade is necessary and properly tested.

---

## 4. Architecture

Adashi uses a **modular monolith** architecture.

The backend is one deployable application divided into independent business modules with clear responsibilities.

This approach provides:

- Simpler initial deployment.
- Clear separation of business domains.
- Easier transactional financial operations.
- Consistent authentication and authorisation.
- Independent module testing.
- A practical path towards future service extraction if required.

Modules should communicate through well-defined services, interfaces, and domain events rather than depending on each other's internal implementation details.

### Main architectural components

1. REST API layer.
2. Authentication and authorisation layer.
3. Business modules.
4. Financial transaction and persistence layer.
5. Background job processing.
6. Notification delivery.
7. File and receipt storage.
8. Audit and monitoring infrastructure.

---

## 5. Suggested Backend Structure

Adapt this structure to the existing repository while maintaining consistent module boundaries.

```text
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── common/
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── filters/
│   │   ├── pipes/
│   │   ├── enums/
│   │   ├── interfaces/
│   │   ├── exceptions/
│   │   └── utils/
│   │
│   ├── config/
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
│   │   ├── invitations/
│   │   ├── rounds/
│   │   ├── billing/
│   │   ├── contributions/
│   │   ├── cycles/
│   │   ├── beneficiaries/
│   │   ├── payouts/
│   │   ├── receipts/
│   │   ├── target-savings/
│   │   ├── distributions/
│   │   ├── withdrawals/
│   │   ├── refunds/
│   │   ├── notifications/
│   │   ├── reports/
│   │   ├── audit-logs/
│   │   └── administration/
│   │
│   ├── infrastructure/
│   │   ├── queue/
│   │   ├── storage/
│   │   ├── email/
│   │   └── pdf/
│   │
│   └── workers/
│
├── test/
├── docs/
├── .env.example
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

Each module should contain its own controller, service, DTOs, entities where appropriate, and tests.

Avoid creating one oversized service responsible for unrelated business operations.

---

## 6. Authentication and User Management

### Authentication features

- User registration.
- Login.
- Logout.
- Access token management.
- Refresh token management.
- Forgot password.
- Password reset.
- Session invalidation.
- Profile management.

Use secure password hashing and appropriate session/token expiry policies.

### User relationship model

Organiser and member are not mutually exclusive global roles.

A user may:

- Organise several groups.
- Join several groups.
- Organise one group while participating as a member in another.

Permissions must therefore be derived from the authenticated user and their relationship with the specific group or resource.

### Platform roles

Proposed platform roles:

- `SUPER_ADMIN`
- `PLATFORM_ADMIN`
- `PLATFORM_SUPPORT`
- `PLATFORM_FINANCE`
- `PLATFORM_AUDITOR`

Platform roles are separate from group membership permissions.

Super Admin accounts must be created through a secure bootstrap command or protected one-time owner invitation. Public registration must never create a Super Admin account.

Require MFA for Super Admin access.

---

## 7. Group and Membership Management

### Group management

The backend supports:

- Group creation.
- Group updates.
- Group configuration.
- Group type selection.
- Collection method selection.
- Group invitations.
- Group member management.
- Group suspension and closure.
- Group financial summaries.

### Group types

```text
ROTATIONAL
TARGET_BASED
```

### Collection methods

```text
ORGANISER_COLLECTION
DIRECT_BENEFICIARY_COLLECTION
```

Every group selects a collection method according to its rules.

The backend must enforce the selected method and expose the correct payment instructions to members.

### Membership

Membership must be stored as a group-specific relationship.

Suggested membership information:

- User ID.
- Group ID.
- Membership status.
- Membership type or group-specific permissions.
- Join date.
- Contribution configuration.
- Beneficiary position where relevant.
- Withdrawal status.
- Created and updated timestamps.

A user must not gain access to another group's financial records merely because they belong to a different group.

---

## 8. Group Rounds

A group is a persistent entity. A group round represents one operational savings cycle.

This distinction allows a group to complete one round and begin another without recreating the group or inviting every member again.

### Proposed group statuses

```text
DRAFT
PENDING_PAYMENT
ACTIVE
COMPLETED
SUSPENDED
CLOSED
```

### Proposed round statuses

```text
DRAFT
PENDING_PAYMENT
ACTIVE
IN_PROGRESS
AWAITING_DISTRIBUTION
COMPLETED
CANCELLED
```

### Round rules

- A round must have a valid activation entitlement or paid purchase.
- Completed rounds must retain their full history.
- A new round requires a new activation.
- Completed rounds must not be reopened through ordinary user actions.
- Round completion must account for all required payouts and approved refunds or settlements.
- Financial history must remain available after completion.

The exact cancellation and closure policy for incomplete target-based rounds must be implemented according to the approved business rules, not assumed by individual modules.

---

## 9. Billing and Entitlements

Adashi uses a one-time group-round billing model.

An organiser pays for a group activation, not a recurring monthly or annual subscription.

### Proposed pricing

| Plan | Member limit | Price |
|---|---:|---:|
| Starter | 10 | ₦1,000 |
| Standard | 20 | ₦2,000 |
| Premium | 50 | ₦3,500 |
| Enterprise | Custom | Custom |

These prices should be configurable through platform administration rather than hard-coded into business logic.

### Free Starter entitlement

Each user receives one free Starter group activation, up to 10 members, once per user.

Suggested entitlement states:

```text
AVAILABLE
RESERVED
USED
```

Rules:

- Eligibility is tracked per user.
- Reserving an entitlement does not consume it.
- Successful activation permanently consumes it.
- Activation and consumption must happen transactionally.
- Deleting a group does not restore the entitlement.
- Leaving a group does not restore the entitlement.
- Cancelling a round does not restore the entitlement.
- Creating another group does not restore the entitlement.
- A new round after the free activation requires a paid purchase.

### Plan upgrades

When the group exceeds its current plan limit, the organiser must upgrade.

The backend calculates the upgrade difference and returns the authoritative amount.

The frontend must never determine the amount payable independently.

### Billing records

Keep separate records for:

- Group purchases.
- Payment attempts.
- Payment verification.
- Entitlement reservations.
- Entitlement activation.
- Upgrade transactions.

Platform revenue must remain separate from group contribution and payout records.

---

## 10. Contribution Management

Contribution management must distinguish expected contributions from payments actually reported and verified.

### Contribution statuses

```text
EXPECTED
REPORTED
VERIFIED
REJECTED
OVERDUE
REVERSED
```

### Member workflow

1. Member views an expected contribution.
2. Member makes a transfer using the group's configured collection method.
3. Member reports the payment.
4. Member supplies the required transaction information or evidence.
5. The contribution enters the reported state.
6. Organiser reviews the report.
7. Organiser verifies or rejects it.
8. The verified contribution is included in applicable financial calculations.

### Organiser workflow

- View expected contributions.
- View reported contributions.
- Verify payments.
- Reject invalid reports with reasons.
- Review outstanding contributions.
- Review contribution histories.
- Reverse a verified contribution only through an authorised, audited operation.

A payment report must never automatically become a verified contribution.

### Financial record requirements

Every financial operation must preserve:

- Amount.
- Currency.
- Group ID.
- Round ID.
- Member ID.
- Related cycle or distribution where applicable.
- Status.
- Transaction reference.
- Evidence reference where applicable.
- Created timestamp.
- Updated timestamp.
- Actor responsible for the operation.

Do not silently delete or overwrite financial records.

---

## 11. Rotational Adashi and Cycles

The rotational module is responsible for generating and managing contribution cycles.

### Supported schedules

```text
DAILY
WEEKLY
BIWEEKLY
EVERY_THREE_WEEKS
MONTHLY
```

### Cycle responsibilities

- Generate cycle dates.
- Assign beneficiaries.
- Calculate expected contributions.
- Track verified contributions.
- Track outstanding contributions.
- Determine payout readiness.
- Preserve cycle history.
- Track cycle progression.

Cycle generation must be deterministic and protected against duplicate generation.

The backend must validate that a cycle is eligible for payout before allowing the payout workflow to begin.

Beneficiary order changes and exceptions must be authorised and audited.

---

## 12. Payout Management

Payouts are separate financial records from contributions.

The backend must control all payout state transitions.

### Payout statuses

```text
PENDING
SENT
CONFIRMED_BY_MEMBER
CONFIRMED_BY_ORGANISER
DISPUTED
CANCELLED
```

### Marking a payout as sent

When an organiser marks a payout as sent:

1. Validate the organiser's group permissions.
2. Validate payout eligibility.
3. Validate that the payout has not already been sent or cancelled.
4. Record the payout details and `sentAt` timestamp.
5. Calculate the confirmation deadline.
6. Create the receipt record in the same database transaction.
7. Record the payout event.
8. Write required notification and background-job events to the outbox.
9. Commit the transaction.

Receipt generation and notification delivery should happen asynchronously.

### 48-hour confirmation rule

The beneficiary has 48 elapsed hours from the payout's `sentAt` timestamp to confirm receipt.

The backend must calculate:

```text
confirmationDeadline = sentAt + 48 hours
```

### Member confirmation

The beneficiary can confirm receipt through an authenticated endpoint.

The backend must:

- Verify the beneficiary is authorised.
- Verify the payout is in the correct state.
- Record the member confirmation timestamp.
- Record the event.
- Notify relevant parties.

### Organiser confirmation on behalf

If the member has not confirmed within 48 hours, the organiser may confirm on their behalf.

Requirements:

- The deadline must have passed according to server time.
- The organiser must have permission for the relevant group.
- A reason is mandatory.
- Supporting evidence or reference should be recorded where available.
- The status must be `CONFIRMED_BY_ORGANISER`.
- The system must not impersonate the beneficiary.
- The beneficiary must receive a notification.
- The event must be included in the audit history.

### Disputes

A member can dispute a payout if the funds were not received.

Disputes must:

- Preserve the original payout history.
- Record the member's reason.
- Record timestamps and actors.
- Notify authorised organisers and administrators.
- Flag affected financial records.
- Prevent unsafe automatic progression where the dispute affects financial integrity.
- Remain available for review even if the organiser previously confirmed on behalf.

### Deadline jobs

A background job may notify the organiser when the 48-hour deadline expires.

It must not automatically confirm the payout.

The organiser must explicitly perform the confirmation-on-behalf action.

All deadline enforcement must happen on the backend, not through frontend timers.

---

## 13. Receipt Management

Every payout marked as sent automatically creates a receipt record.

Receipt creation must occur in the same database transaction as the payout's transition to `SENT`.

### Receipt responsibilities

- Generate a unique receipt number.
- Associate the receipt with the payout.
- Store the receipt generation status.
- Generate the PDF asynchronously.
- Store the PDF in private object storage.
- Provide authorised download access.
- Preserve receipt history and versions.

### Receipt generation statuses

```text
GENERATING
AVAILABLE
FAILED
SUPERSEDED
```

### Receipt contents

A receipt should include:

- Platform name and branding.
- Receipt number.
- Group name.
- Group round.
- Beneficiary information.
- Payout amount.
- Currency.
- Payout date.
- Payout reference where available.
- Payout status.
- Confirmation method.
- Confirmation timestamp where available.
- Dispute status where applicable.

A receipt confirms that the platform recorded the payout as sent. It is not independent proof of bank settlement.

---

## 14. Target-Based Savings and Distributions

The target-based module manages shared savings targets and equal distributions.

### Responsibilities

- Configure savings targets.
- Record member contributions.
- Calculate total verified contributions.
- Track target progress.
- Determine distribution eligibility.
- Calculate equal distribution amounts.
- Create distribution records.
- Create individual distribution items.
- Track payout completion.
- Preserve distribution history.

The backend must calculate distribution amounts from verified financial records and the approved group rules.

Do not rely on frontend-calculated totals.

Each eligible member must have at most one distribution item per distribution event, enforced by database constraints.

---

## 15. Withdrawals and Refunds

Withdrawal requests must be processed through an auditable settlement workflow.

### Member workflow

1. Member submits a withdrawal request.
2. Member provides a reason.
3. Backend calculates the applicable settlement.
4. Organiser reviews the request.
5. Organiser approves or rejects it.
6. If approved, the refund or settlement is processed.
7. Membership withdrawal is finalised only when required financial obligations are resolved.

### Rotational Adashi settlement

A member leaving an active rotational group is generally entitled to have their own contributions considered in the settlement and may normally move to the last beneficiary position.

However, if the member has already received a payout, the settlement must account for the amount received and any outstanding obligations.

Do not automatically refund all historical contributions without calculating the net position.

### Target-Based Adashi settlement

The recommended default is to refund verified contributions and exclude the withdrawn member from future equal distributions, subject to approved group rules and documented exceptions.

### Refund safeguards

- Prevent duplicate refunds.
- Prevent refunded contributions from being counted again.
- Preserve the original contribution records.
- Record the settlement calculation.
- Record approval and payout events.
- Keep membership active until the settlement is resolved.

---

## 16. Financial Data Integrity

Financial integrity is a core backend requirement.

### Monetary values

- Use PostgreSQL `NUMERIC` or integer minor units.
- Never use JavaScript floating-point arithmetic for authoritative financial calculations.
- Store currency explicitly.
- Validate amount precision and acceptable ranges.
- Centralise financial calculations in backend services.

### Database transactions

Use database transactions for operations that affect multiple related financial records.

Examples:

- Free entitlement activation.
- Paid group activation.
- Plan upgrades.
- Contribution verification.
- Contribution reversal.
- Payout marked as sent and receipt creation.
- Payout confirmation.
- Distribution creation.
- Refund processing.

### Concurrency protection

Use:

- Database constraints.
- Unique indexes.
- Transaction isolation where appropriate.
- Row-level locking for sensitive state transitions.
- Idempotency keys for repeatable client operations.
- Atomic status changes.

### Auditability

Record:

- Who initiated the operation.
- Who verified or approved it.
- Previous status.
- New status.
- Reason for overrides.
- Relevant references.
- Timestamp.
- Related group, round, and financial record IDs.

Financial records must not be silently deleted or modified.

---

## 17. Background Jobs and Event Processing

Use Redis and BullMQ for asynchronous work.

Potential queues:

```text
notifications
receipt-generation
payout-deadlines
email-delivery
report-generation
```

### Examples of background jobs

- Generate payout PDF receipts.
- Send contribution reminders.
- Notify members of contribution verification.
- Notify beneficiaries when payouts are marked as sent.
- Notify organisers after the 48-hour deadline.
- Send organiser override notifications.
- Deliver withdrawal and refund updates.
- Generate large reports.

### Reliability requirements

Use an outbox pattern for important events that must not be lost when a database transaction succeeds but a queue operation fails.

Workers should be idempotent.

A failed notification or PDF generation must not silently reverse an otherwise successful financial transaction.

---

## 18. Notifications

Notification events include:

- Group invitations.
- Membership changes.
- Contribution reminders.
- Contribution reports.
- Contribution verification and rejection.
- Payout readiness.
- Payout marked as sent.
- Member payout confirmation.
- Organiser confirmation on behalf.
- Payout disputes.
- 48-hour deadlines.
- Withdrawal requests.
- Refund updates.
- Round completion.
- Billing and entitlement updates.

Support in-app notifications initially. Email and other delivery channels may be added based on configured infrastructure.

---

## 19. Reporting and Financial Summaries

### Member summaries

Provide:

- Total verified contributions.
- Number of verified contributions.
- Pending contributions.
- Rejected contributions.
- Outstanding contributions.
- Amount received.
- Expected payout where relevant.
- Contribution history.
- Payout history.

### Organiser summaries

Provide:

- Total verified contributions.
- Total outstanding contributions.
- Contributions by member.
- Contributions by cycle.
- Total payouts.
- Remaining payout obligations.
- Refunds and withdrawals.
- Group financial position.
- Round financial history.

All summaries must be derived from underlying financial records.

Do not treat manually editable aggregate columns as the authoritative source of financial truth.

### Platform summaries

Super Admin reporting should distinguish:

- Platform revenue from group purchases.
- Free entitlement activations.
- Paid activations.
- Plan upgrades.
- Group contributions.
- Payouts.
- Refunds.
- Disputed financial operations.

Platform purchase revenue must never be mixed with group contribution money.

---

## 20. Super Admin and Platform Administration

The backend provides secure administrative endpoints for:

- Platform dashboard data.
- User management.
- Group management.
- Round management.
- Pricing and plan management.
- Group purchase verification.
- Entitlement oversight.
- Platform revenue reporting.
- Financial oversight.
- Dispute management.
- Administrator management.
- Role and permission management.
- Audit log access.
- Platform configuration.

### Administrative security

- No public Super Admin registration.
- Secure initial owner bootstrap.
- MFA for Super Admin access.
- Permission-based administrator operations.
- Audit all sensitive administrative actions.
- Restrict financial overrides.
- Prevent silent financial record modification.

---

## 21. API Conventions

Use a versioned REST API.

Suggested base path:

```text
/api/v1
```

### Main endpoint groups

| Module | Example base path |
|---|---|
| Authentication | `/auth` |
| Users | `/users` |
| Groups | `/groups` |
| Memberships | `/groups/:groupId/members` |
| Invitations | `/invitations` |
| Rounds | `/groups/:groupId/rounds` |
| Entitlements | `/entitlements` |
| Billing | `/billing` |
| Contributions | `/contributions` |
| Cycles | `/cycles` |
| Payouts | `/payouts` |
| Receipts | `/receipts` |
| Target savings | `/target-savings` |
| Distributions | `/distributions` |
| Withdrawals | `/withdrawals` |
| Refunds | `/refunds` |
| Notifications | `/notifications` |
| Reports | `/reports` |
| Administration | `/admin` |

Detailed endpoint definitions and request/response examples are maintained in the API specification documents.

### API requirements

- Use DTOs for request validation.
- Use consistent response structures.
- Apply authentication and group-level authorisation.
- Support pagination and filtering for list endpoints.
- Return meaningful HTTP status codes.
- Avoid exposing sensitive entity fields.
- Use Swagger for API documentation.
- Keep API responses consistent with the frontend contract.

---

## 22. Environment Variables

Create a local `.env` file using `.env.example`.

Example configuration:

```env
# Application
NODE_ENV=development
PORT=4000
APP_NAME=Adashi API
API_PREFIX=api/v1
APP_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000

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

# Storage
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

# Frontend
FRONTEND_URL=http://localhost:3000
```

This is an illustrative template. Match the variable names to the actual configuration implementation and document every required variable.

Never commit real secrets, production credentials, or private keys.

---

## 23. Local Development

### Requirements

- Node.js LTS compatible with the repository.
- PostgreSQL.
- Redis.
- npm, pnpm, or the repository's existing package manager.
- Git.

### Clone repository

```bash
git clone <backend-repository-url>
cd <backend-project-folder>
```

### Install dependencies

```bash
npm install
```

### Configure environment

```bash
cp .env.example .env
```

Update the database, Redis, authentication, storage, and email settings.

### Run database migrations

Use the migration scripts configured in `package.json`.

Example:

```bash
npm run migration:run
```

Do not use automatic schema synchronization in production.

### Start development server

```bash
npm run start:dev
```

The API should be available at:

```text
http://localhost:4000/api/v1
```

### Swagger documentation

If enabled in the application configuration, Swagger should be available at the configured documentation route, for example:

```text
http://localhost:4000/api/docs
```

### Production build

```bash
npm run build
```

### Production start

```bash
npm run start:prod
```

Use the actual scripts defined in `package.json` where they differ from these examples.

---

## 24. Database Management

PostgreSQL is the primary relational database.

### Database principles

- Use migrations for schema changes.
- Keep financial entities relational and traceable.
- Use foreign keys and appropriate indexes.
- Add unique constraints for operations that must occur only once.
- Avoid cascading deletes for financial history.
- Store timestamps consistently.
- Store monetary values using precise numeric types.
- Keep group and round relationships explicit.
- Use transactions for multi-record financial operations.

### Important entities

The full database design is defined in `03-database-design.md` and `09-financial-data-model-and-transaction-ledger-design.md`.

The implementation is expected to cover:

- Users
- Sessions
- Groups
- Memberships
- Invitations
- Group rounds
- Billing plans
- Group purchases
- Payment attempts
- Entitlements
- Entitlement events
- Contributions
- Contribution events
- Cycles
- Beneficiary assignments
- Payouts
- Payout events
- Payout disputes
- Receipts
- Target distributions
- Distribution items
- Withdrawal requests
- Settlements
- Refunds
- Notifications
- Audit logs
- Outbox events

The exact entity and migration names should follow the approved database design and existing codebase conventions.

---

## 25. Testing

Testing is essential because the platform handles financial records and group savings workflows.

### Unit tests

Test:

- Financial calculations.
- Entitlement eligibility.
- Group permission checks.
- Contribution verification rules.
- Payout state transitions.
- 48-hour deadline calculations.
- Target distribution calculations.
- Withdrawal settlements.
- Refund validation.
- Receipt creation rules.

### Integration tests

Test:

- Authentication and authorisation.
- Group creation.
- Membership management.
- Free group activation.
- Paid group activation.
- Plan upgrades.
- Contribution reporting and verification.
- Rotational cycle progression.
- Payout confirmation.
- Organiser confirmation on behalf.
- Payout disputes.
- Receipt generation.
- Target distributions.
- Withdrawal and refund workflows.
- Super Admin permissions.

### Critical financial tests

Verify that:

- A free entitlement cannot be consumed more than once.
- Two simultaneous activation requests cannot activate the same entitlement twice.
- Duplicate contribution verification cannot create duplicate financial effects.
- A payout cannot be marked as sent twice.
- A member cannot confirm another member's payout.
- An organiser cannot confirm on behalf before the 48-hour deadline.
- An organiser override always records the organiser as the actor.
- A disputed payout is not silently treated as resolved.
- A payout and its initial receipt record are created atomically.
- A member cannot receive a duplicate refund.
- A withdrawn member's contributions are not counted twice.
- A target distribution cannot create duplicate member items.
- A user cannot access another group's financial information without permission.

### Run tests

```bash
npm run test
```

```bash
npm run test:e2e
```

```bash
npm run test:cov
```

Use the actual repository scripts where they differ.

---

## 26. Security Requirements

The backend must implement:

- Password hashing.
- Secure JWT/session handling.
- Refresh token rotation or equivalent secure session renewal.
- Rate limiting.
- DTO validation.
- Input sanitisation where appropriate.
- Secure CORS configuration.
- Group-level authorisation.
- Role and permission guards.
- Secure file uploads.
- Private receipt and evidence storage.
- Audit logging.
- Secrets management.
- Secure error responses.
- Database backups.
- MFA for Super Admin accounts.

Never trust the frontend to enforce financial rules or access permissions.

All sensitive actions must be validated by the backend.

---

## 27. Privacy and Regulatory Considerations

The platform processes personal information and financial activity records.

The implementation should follow applicable Nigerian data protection requirements, including the Nigeria Data Protection Act, and receive appropriate legal and regulatory review before production use.

The MVP is designed for recordkeeping and coordination of group savings.

It does not include an internal wallet or platform custody of customer funds.

Any future integration involving automated collection, custody, transfers, or payouts must undergo appropriate legal, regulatory, provider, and security review before implementation.

---

## 28. Deployment and Operations

The backend can be deployed to a managed Node.js hosting environment or container-based infrastructure.

Production deployment should include:

1. Production PostgreSQL database.
2. Production Redis instance.
3. Secure environment variables.
4. Database migrations.
5. Private object storage.
6. Background workers.
7. HTTPS.
8. CORS configuration.
9. Logging and monitoring.
10. Automated backups.
11. Health checks.
12. Error tracking.
13. Queue failure monitoring.

### Operational requirements

- Run database migrations as a controlled deployment step.
- Keep API and worker processes properly supervised.
- Monitor queue failures.
- Monitor database performance.
- Monitor failed receipt generation.
- Monitor failed notifications.
- Maintain backup and restore procedures.
- Keep audit logs accessible to authorised administrators.
- Avoid logging passwords, tokens, or sensitive payment information.

---


## 33. Project Status

This repository contains the backend API and business logic for the Adashi platform.

The backend is the authoritative source for all financial calculations, contribution verification, payout transitions, entitlement eligibility, billing, distributions, refunds, and group permissions.

**Adashi — Bringing transparency, structure, and trust to group savings.**
