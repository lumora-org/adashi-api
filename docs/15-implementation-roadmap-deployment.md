# 15 — Implementation Roadmap, Development Tasks and Deployment Guide

**Project:** Adashi Contribution and Savings Management Platform  
**Document:** Implementation Roadmap, Development Tasks and Deployment Guide  
**Audience:** Project owner, frontend developers, backend developers, QA engineers, DevOps  
**Status:** Implementation plan

---

## 1. Purpose

This document converts the Adashi specifications into an actionable development and launch plan.

The goal is to deliver a reliable MVP first, validate it with real groups and then introduce advanced functionality without compromising financial integrity.

## 2. Recommended technology stack

### Frontend

- Next.js.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- TanStack Query.
- React Hook Form.
- Zod.
- Progressive Web App support.

### Backend

- NestJS.
- TypeScript.
- PostgreSQL.
- TypeORM.
- Redis.
- BullMQ.
- Swagger/OpenAPI.
- PDF generation library.
- Private object storage.

### Infrastructure

- Managed PostgreSQL.
- Managed Redis.
- Frontend hosting supporting Next.js.
- Backend hosting supporting persistent API processes and workers.
- Private object storage for evidence and receipts.
- Transactional email provider.
- Monitoring and error reporting.

Exact providers should be selected after comparing reliability, regional availability, cost, backup support and operational requirements.

## 3. Development principles

1. Build the financial foundation before building advanced dashboards.
2. Keep backend business logic authoritative.
3. Keep financial records immutable.
4. Implement permission checks from the beginning.
5. Test critical workflows before adding visual polish.
6. Build reusable frontend components.
7. Keep the architecture modular.
8. Maintain API and frontend documentation.
9. Deploy to staging continuously.
10. Launch with a controlled pilot.

## 4. Recommended repository structure

The project can use two repositories or a monorepo. If separate repositories are used:

```text
adashi-web/
├── docs/
├── public/
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── types/
│   └── styles/
├── tests/
└── package.json
```

```text
adashi-api/
├── docs/
├── src/
│   ├── common/
│   ├── config/
│   ├── database/
│   ├── modules/
│   ├── workers/
│   ├── integrations/
│   └── main.ts
├── test/
├── migrations/
├── scripts/
└── package.json
```

Both repositories should include the relevant product and technical documentation.

## 5. Development phases

### Phase 1 — Project foundation

**Backend tasks**

- Initialise NestJS application.
- Configure environment validation.
- Configure PostgreSQL.
- Configure TypeORM migrations.
- Configure Redis.
- Configure logging.
- Configure global exception handling.
- Configure request validation.
- Configure Swagger.
- Create health-check endpoints.
- Configure CI pipeline.

**Frontend tasks**

- Initialise Next.js.
- Configure TypeScript.
- Configure Tailwind and shadcn/ui.
- Configure application layout.
- Configure responsive design system.
- Configure API client.
- Configure authentication state.
- Create reusable form and table components.
- Create public landing page shell.

**Completion criteria**

Both applications start locally, connect to required services and pass basic CI checks.

### Phase 2 — Authentication and account management

Backend:

- User entity.
- Registration.
- Verification.
- Login.
- Refresh sessions.
- Logout.
- Password reset.
- Session revocation.
- Account status management.

Frontend:

- Registration.
- Login.
- Verification.
- Forgot password.
- Reset password.
- Profile.
- Account settings.

Tests:

- Invalid credentials.
- Duplicate registration.
- Unverified account.
- Suspended account.
- Refresh token reuse.
- Session revocation.

### Phase 3 — Group and membership management

Backend:

- Group creation.
- Group updates.
- Invitations.
- Invitation acceptance.
- Membership management.
- Group-level permission checks.
- Group collection methods.

Frontend:

- Create group.
- Group list.
- Group overview.
- Invite members.
- Accept invitations.
- Member list.
- Group settings.

Tests:

- User in multiple groups.
- Organiser/member relationship separation.
- Cross-group access prevention.
- Invitation expiry.
- Member limit validation.

### Phase 4 — Billing and free entitlement

Backend:

- Plan management.
- Group purchase.
- Payment evidence.
- Purchase verification.
- Free entitlement reservation.
- Free entitlement activation.
- Upgrade calculation.
- Purchase audit history.

Frontend:

- Plan selection.
- Purchase summary.
- Payment instructions.
- Evidence upload.
- Purchase status.
- Upgrade screen.

Tests:

- One-time free entitlement.
- Duplicate activation.
- Expired reservation.
- Payment verification.
- Duplicate verification.
- Upgrade difference calculation.
- Price snapshot preservation.

Do not add an automated payment gateway until the manual purchase workflow is stable.

### Phase 5 — Contributions and rotational cycles

Backend:

- Contribution records.
- Contribution evidence.
- Contribution verification.
- Rejection.
- Reversal.
- Contribution summaries.
- Cycle generation.
- Beneficiary order.
- Schedule calculations.

Frontend:

- Contribution reporting.
- Evidence upload.
- Contribution history.
- Organiser verification queue.
- Cycle list.
- Beneficiary order management.
- Financial summaries.

Tests:

- Reported versus verified amounts.
- Duplicate verification.
- Reversal.
- Schedule generation.
- Beneficiary validation.
- Concurrent contribution verification.

### Phase 6 — Payouts and receipts

Backend:

- Payout records.
- Payout state machine.
- Mark payout as sent.
- 48-hour confirmation deadline.
- Member confirmation.
- Organiser confirmation after deadline.
- Disputes.
- Receipt record creation.
- PDF generation.
- Notification jobs.

Frontend:

- Payout details.
- Mark as sent.
- Beneficiary confirmation.
- Confirmation countdown.
- Organiser override screen.
- Dispute submission.
- Receipt viewing and downloading.

Tests:

- Receipt created when payout is marked sent.
- One initial receipt per payout.
- Member confirmation.
- Early override rejection.
- Late override.
- Dispute after override.
- Failed PDF generation retry.

### Phase 7 — Target-based Adashi

Backend:

- Target configuration.
- Verified contribution progress.
- Eligibility rules.
- Equal distribution calculation.
- Distribution approval.
- Individual payout generation.

Frontend:

- Target dashboard.
- Contribution progress.
- Distribution preview.
- Approval screen.
- Individual payout tracking.

Tests:

- Equal distribution.
- Eligibility.
- Rounding remainder.
- Withdrawn member exclusion.
- Duplicate approval.
- Incomplete target handling.

### Phase 8 — Withdrawals and settlements

Backend:

- Withdrawal requests.
- Settlement calculation.
- Approval and rejection.
- Refund records.
- Membership withdrawal transition.
- Outstanding balance handling.

Frontend:

- Request withdrawal.
- Review request.
- Settlement breakdown.
- Approve or reject.
- Refund history.

Tests:

- Member with no previous payout.
- Member who already received payout.
- Target-based refund.
- Duplicate refund.
- Settlement not yet complete.
- Membership status transitions.

### Phase 9 — Super Admin portal

Build the Super Admin portal as a complete platform feature.

Backend:

- Initial owner bootstrap.
- Platform roles.
- Permissions.
- Administrator invitations.
- Dashboard metrics.
- User management.
- Group and round oversight.
- Billing administration.
- Plan management.
- Entitlement oversight.
- Financial oversight.
- Dispute management.
- Reports.
- Audit logs.
- Platform settings.

Frontend:

- Admin login.
- Initial owner setup.
- Admin dashboard.
- User management.
- Group management.
- Round management.
- Purchase verification.
- Plan management.
- Financial oversight.
- Dispute management.
- Administrator management.
- Reports.
- Audit logs.
- Settings.

Tests:

- Public registration cannot create Super Admin.
- Bootstrap is single-use.
- MFA enforcement.
- Permission restrictions.
- Administrator invitation.
- Account suspension.
- Audit logging.
- Cross-group oversight restrictions.

### Phase 10 — Notifications, reports and PWA

Backend:

- Email notifications.
- In-app notifications.
- Notification preferences.
- Background jobs.
- Scheduled reminders.
- Report generation.
- Queue monitoring.

Frontend:

- Notification centre.
- Notification preferences.
- Reports.
- PWA manifest.
- Install prompt.
- Offline-friendly public pages.
- Appropriate loading and error states.

Do not allow offline mode to perform financial operations without server confirmation.

### Phase 11 — Quality assurance and launch preparation

- Full end-to-end testing.
- Financial integrity testing.
- Permission testing.
- Security review.
- Performance testing.
- Accessibility review.
- Mobile device testing.
- Backup and restore testing.
- Production environment setup.
- Support process setup.
- Privacy and terms review.

## 6. MVP scope

The first release should prioritise:

- Registration and authentication.
- User profiles.
- Group creation.
- Invitations and memberships.
- Rotational Adashi.
- Target-based Adashi.
- Group round lifecycle.
- Free Starter entitlement.
- One-time group purchase.
- Manual payment evidence and verification.
- Contribution reporting and verification.
- Payout tracking.
- 48-hour payout confirmation.
- Automatic receipt records and PDF generation.
- Withdrawals and settlement.
- Financial summaries.
- Notifications.
- Super Admin portal.
- Audit logs.
- Responsive mobile-first interface.

## 7. Features to defer

Unless essential to the pilot, defer:

- Automated collection from members' bank accounts.
- Automated beneficiary payouts.
- Internal wallets.
- Holding pooled customer funds.
- Escrow.
- Advanced bank reconciliation integrations.
- Complex multi-currency support.
- Native Android and iOS applications.
- Advanced machine-learning fraud detection.
- White-label deployments.
- Complex third-party accounting integrations.

These features should only be added after business validation and appropriate legal, operational and technical review.

## 8. Suggested implementation order

```text
Foundation
   |
Authentication
   |
Groups and Memberships
   |
Billing and Entitlements
   |
Contributions and Cycles
   |
Payouts and Receipts
   |
Target Distributions
   |
Withdrawals and Settlements
   |
Super Admin Portal
   |
Notifications and Reports
   |
Security and QA
   |
Pilot Launch
```

Some work can proceed in parallel after the underlying APIs and permission contracts are stable.

## 9. Deployment architecture

Recommended logical production layout:

```text
Users
  |
  v
Frontend Hosting
  |
  v
API / Load Balancer
  |
  +-------------------+
  |                   |
  v                   v
NestJS API         Redis / Queue
  |                   |
  v                   v
PostgreSQL         Background Workers
  |                   |
  |                   +--> Receipt PDFs
  |                   +--> Notifications
  |                   +--> Scheduled jobs
  |
  +--> Private Object Storage
```

The frontend, API and worker processes may be deployed separately.

Workers should use the same validated application configuration and database schema as the API.

## 10. Production deployment checklist

### Frontend

- Configure production environment variables.
- Configure API base URL.
- Configure approved domains.
- Configure secure authentication.
- Configure error reporting.
- Configure PWA assets.
- Test mobile layouts.
- Test protected routes.

### Backend

- Configure production database.
- Run migrations.
- Configure Redis.
- Configure private object storage.
- Configure email delivery.
- Configure worker processes.
- Configure logging.
- Configure monitoring.
- Configure rate limits.
- Configure CORS.
- Configure secure cookies.
- Configure health checks.

### Database

- Use managed PostgreSQL where practical.
- Enable automated backups.
- Configure connection pooling appropriately.
- Apply migrations through controlled deployment steps.
- Avoid production schema synchronization.
- Test database restoration.

### Security

- Remove development secrets.
- Rotate deployment secrets.
- Enable HTTPS.
- Enable MFA for Super Admin.
- Verify bootstrap has been disabled.
- Review admin permissions.
- Test private evidence access.
- Review security headers.

## 11. CI/CD pipeline

Recommended pipeline:

1. Developer creates a branch.
2. Pull request is opened.
3. Run formatting and linting.
4. Run type checking.
5. Run unit tests.
6. Run integration tests.
7. Build the application.
8. Run dependency and security checks.
9. Require code review.
10. Merge to the deployment branch.
11. Deploy to staging.
12. Run staging smoke tests.
13. Approve production deployment.
14. Run production migrations safely.
15. Deploy application and workers.
16. Run health checks.
17. Monitor for errors.

Do not automatically deploy unreviewed financial logic directly to production.

## 12. Database migration strategy

Use migrations for every production schema change.

Rules:

- Do not use automatic schema synchronization in production.
- Back up before high-risk migrations.
- Prefer backward-compatible migrations.
- Separate data migrations from schema migrations where appropriate.
- Test migrations against staging data.
- Document rollback or forward-fix procedures.
- Avoid dropping financial columns or records without an approved retention and migration plan.

## 13. Performance and scaling

Start with a modular monolith.

Scale in this order:

1. Optimise database queries and indexes.
2. Use pagination for large datasets.
3. Cache safe read-heavy data.
4. Move PDF generation and notifications to workers.
5. Add database connection pooling.
6. Monitor slow queries.
7. Add API instances behind a load balancer.
8. Scale worker concurrency.
9. Introduce read replicas only when justified.
10. Consider service extraction only when measurable bottlenecks require it.

Do not introduce microservices prematurely.

Financial operations must continue to use reliable database transactions and concurrency protection even as the platform scales.

## 14. Pilot launch plan

### Pilot preparation

- Select one or more trusted groups.
- Verify organisers understand the collection methods.
- Explain reported versus verified contributions.
- Explain payout confirmation and the 48-hour rule.
- Explain receipt meaning.
- Explain withdrawal and settlement rules.
- Prepare support and dispute procedures.

### Pilot operation

Monitor:

- Registration completion.
- Group activation.
- Invitation acceptance.
- Contribution reporting.
- Verification time.
- Payout confirmation.
- Dispute volume.
- Receipt generation failures.
- User support requests.

### Pilot review

After the first completed rounds:

- Review financial reconciliation.
- Interview organisers.
- Interview members.
- Identify confusing screens.
- Review support issues.
- Review performance.
- Review security events.
- Prioritise improvements.

Do not scale aggressively before validating the complete contribution-to-payout workflow.

## 15. Definition of MVP completion

The MVP is ready for pilot when:

1. Users can register and securely access accounts.
2. Organisers can create and manage multiple groups.
3. Members can participate in multiple groups.
4. Groups can run independent rounds.
5. Free and paid group activation works correctly.
6. Contributions can be reported and verified.
7. Rotational cycles can be generated.
8. Target-based distributions can be calculated and approved.
9. Payouts can be recorded and confirmed.
10. The 48-hour organiser override works correctly.
11. Receipts are automatically created when payouts are marked sent.
12. Withdrawals and settlements preserve financial integrity.
13. Financial summaries reconcile with underlying transaction records.
14. The Super Admin can securely administer the platform.
15. Permissions and audit logs are active.
16. Critical workflows pass automated tests.
17. Backups and restoration have been tested.
18. Production monitoring is active.
19. Privacy and operational documentation is available.
20. The pilot has a support and incident response process.

## 16. Final implementation guidance

Build Adashi as a secure, mobile-first financial coordination platform—not simply a group chat with contribution records.

The most important technical priorities are:

- Correct financial calculations.
- Reliable transaction history.
- Strong group-level permissions.
- Safe payout confirmation.
- Transparent receipts.
- Secure Super Admin control.
- Reliable backups and operational monitoring.

The MVP should be simple enough to launch and robust enough to preserve the trust of the groups using it.

**End of Document 15.**