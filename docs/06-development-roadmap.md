# Development Roadmap and Delivery Plan

## 1. Delivery approach
Build in vertical slices: each milestone should include database changes, API, UI, permissions, automated tests, and documentation for a complete user workflow. Avoid building all backend modules first and postponing security or frontend integration until later.

## 2. Milestones

### Milestone 0 — Discovery and pilot validation
Deliverables:
- Interview pilot institution stakeholders: registry, academic office, finance, lecturers, students, IT/management.
- Map current admissions, course registration, result approval, fee collection, and reconciliation workflows.
- Confirm academic calendar terminology, grading/GPA rules, study modes, fee policies, payment providers, and required reports.
- Define data migration sources, privacy obligations, and success metrics.
Exit criteria: signed-off PRD and acceptance criteria; unresolved policy questions recorded.

### Milestone 1 — Repository and engineering foundation
Deliverables:
- Separate `web` and `api` repositories, each with a `docs/` directory.
- Formatting, linting, type checking, test runner, environment validation, CI pipeline.
- Local development setup, seed data, migration workflow, API error conventions, Swagger.
- Initial deployment environments and secret management.
Exit criteria: clean install/build/test from documented instructions.

### Milestone 2 — Tenant and identity foundation
Deliverables:
- Institution registry, domain registry, subdomain routing, platform admin.
- Users, memberships, roles, permissions, authentication, recovery, session handling.
- Tenant context middleware/guard and scoped data access patterns.
- Audit events and institution onboarding workflow.
- Cross-tenant negative tests.
Exit criteria: a test user in Tenant A cannot read or mutate Tenant B records through any implemented endpoint.

### Milestone 3 — Institution setup and admissions
Deliverables:
- Institution profile/branding, campuses and organizational units.
- Academic sessions/periods, programmes, study modes, course catalogue.
- Admission cycles, applications, document uploads, screening, decisions, offers.
- Student creation/enrolment and matriculation-number rules.
Exit criteria: application-to-enrolment journey works on mobile and is auditable.

### Milestone 4 — Academic operations
Deliverables:
- Curriculum and course requirements.
- Course offerings and lecturer assignments.
- Registration windows and course registration.
- Prerequisite, credit limit, duplicate-registration, and deadline validations.
Exit criteria: eligible student can register courses and ineligible registration is rejected with clear feedback.

### Milestone 5 — Assessments and results
Deliverables:
- Assessment components, score entry, validation, submission, review, approval, publication.
- Versioned grading rules and GPA/CGPA calculations.
- Student result views and controlled amendments.
Exit criteria: results cannot be seen before publication; all approvals and changes are traceable.

### Milestone 6 — Finance and reconciliation
Deliverables:
- Fee schedules, invoices, line items, balances.
- Online payment provider integration selected for the pilot.
- Offline payment recording and approval workflow.
- Receipts, allocations, reconciliation exceptions, refunds/reversals where required.
Exit criteria: duplicate callbacks cannot duplicate a payment; online and offline records reconcile against invoices and provider/bank records.

### Milestone 7 — Pilot hardening
Deliverables:
- Import/migration rehearsal using sanitized pilot data.
- Role and tenant security review.
- Load testing for registration, results release, and payment events.
- Backup restore drill, monitoring, alerting, incident runbook.
- User acceptance testing, training material, support process.
Exit criteria: institution signs off core workflows; critical/high-severity issues are resolved or explicitly risk-accepted.

### Milestone 8 — Controlled expansion
Deliverables:
- Institution onboarding checklist and support playbook.
- Subscription plans and billing operations.
- Tenant provisioning automation, per-tenant health/usage reporting.
- Feedback-driven improvements and staged onboarding.
Exit criteria: repeatable onboarding without manual database edits or unsafe deployment shortcuts.

## 3. Suggested issue breakdown
Create one issue per vertical feature:
- API/database contract
- UI workflow
- authorization and tenant boundary
- tests
- documentation
- acceptance criteria
Keep tasks small enough for review and avoid multiple developers editing the same core tenancy/auth files concurrently without coordination.

## 4. Required automated test categories
- Unit tests: grading rules, fee calculations, state transitions, permission policies.
- Integration tests: repository constraints, tenant scoping, payment idempotency, result publication.
- End-to-end tests: admissions, registration, result approval, online payment, offline payment and reconciliation.
- Security tests: cross-tenant IDOR attempts, role escalation, hostname manipulation, upload authorization.
- Load tests: registration-window traffic, bulk results publication, payment webhook bursts.
- Recovery tests: database restore and queue recovery.

## 5. Pilot success measures
Agree numerical targets with the pilot institution before launch. Suggested measures:
- Percentage of pilot workflows completed without manual workarounds.
- Application processing time.
- Course registration completion and error rates.
- Result approval/publication time.
- Payment reconciliation exception rate and time to resolve.
- Support requests per active user.
- No unresolved critical tenant-isolation vulnerabilities.
- Successful backup restoration within agreed recovery objectives.

## 6. Risks and mitigations
- **Unclear academic rules:** validate with each pilot department before implementing grading logic.
- **Tenant data leakage:** test negative paths from the start; use database constraints and optional RLS.
- **Payment duplication/mismatch:** idempotency, provider verification, reconciliation, and audit.
- **Overlarge MVP:** gate nonessential modules behind later releases.
- **Poor legacy data:** perform sample imports and data-quality checks before migration.
- **Subdomain/account confusion:** make institution identity visible at login and verify membership.
- **Operational burden:** automate onboarding, migrations, backups, and monitoring early.
