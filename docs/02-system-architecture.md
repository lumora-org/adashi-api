# System Architecture
## Hosted Multi-Tenant Tertiary SMS

## 1. Architecture decision
Start with a **modular monolith**: one NestJS API, one web application, a shared PostgreSQL database, and optional background workers. Organize code around bounded business modules and explicit interfaces. Extract services only when measured scale, deployment independence, or team ownership justifies it.

## 2. Proposed stack
- Frontend: Next.js, React, TypeScript.
- Backend: NestJS, TypeScript.
- Database: PostgreSQL.
- ORM: choose Prisma or TypeORM after a small technical spike; use one consistently.
- Background jobs: Redis + BullMQ when asynchronous workloads require them.
- File storage: managed S3-compatible/object storage.
- API contracts: Swagger/OpenAPI.
- CI/CD: automated lint, typecheck, unit/integration tests, migration checks, and deployment.
- Observability: structured logs, error tracking, metrics, health checks, and alerts.

## 3. Logical components
1. Web experience: public website, admissions portal, student portal, staff portal, institution administration, platform administration.
2. Edge/routing: TLS, hostname validation, request size limits, rate limiting, and reverse proxy/load balancer.
3. Identity and access: users, sessions, memberships, roles, permissions, MFA for privileged users.
4. Tenant resolution: map validated hostname to active institution; pass immutable tenant context through the request lifecycle.
5. Domain modules: institutions, subscriptions, admissions, students, staff, academics, course registration, assessments, results, finance, notifications, reporting, audit, integrations.
6. Persistence: PostgreSQL with tenant-aware constraints and optional Row-Level Security.
7. Supporting services: object storage, payment provider, email/SMS provider, queue workers, monitoring, backup service.

## 4. Tenant resolution flow
- Parse the request hostname using trusted proxy/host configuration.
- Normalize and validate the hostname against an institution-domain registry.
- Reject unknown, reserved, unverified, or inactive domains.
- Resolve an institution identifier from the domain registry.
- Authenticate the user.
- Confirm active membership and permissions for that institution.
- Establish immutable request tenant context.
- Scope all queries, writes, caches, exports, files, and jobs to that context.
- Record relevant security failures without leaking whether another tenant's record exists.

The hostname identifies the requested tenant; it is not proof of authorization. Never trust a client-supplied tenant ID as an authorization mechanism. Avoid mutable global tenant state in a concurrent NestJS process.

## 5. Data isolation strategy
Initial strategy: shared PostgreSQL database and shared tables with `institution_id` on institution-owned records. Use:
- Tenant-scoped repository/service APIs.
- Composite unique constraints where appropriate, e.g. `(institution_id, matriculation_number)`.
- Composite foreign keys or equivalent constraints where necessary to prevent cross-tenant relationships.
- PostgreSQL Row-Level Security as defense in depth if the operational design can set and clear transaction-local tenant context safely.
- Separate platform-owned tables from tenant-owned tables.
- Automated negative tests for every tenant-sensitive endpoint.

Never assume that putting `institution_id` in a table alone creates isolation. All queries and relationships must be scoped and tested.

## 6. Subdomains and routing
- Use `school-slug.platform-domain.tld`.
- Use wildcard DNS and TLS where supported by the host.
- Keep a domain registry table and reserve platform slugs (`admin`, `api`, `www`, `support`, `billing`, `status`, etc.).
- Normalize hostnames and reject unknown hosts.
- Keep authentication cookie scope as narrow as possible; avoid a broad parent-domain cookie unless required and threat-reviewed.
- Consider separate app/API origins and explicit CORS rules.
- Allow branding to load from tenant configuration, but never allow user-provided HTML/JS as branding content.
- Custom domains are out of MVP scope unless a pilot requirement changes this.

## 7. Module boundaries
- Platform: platform users, institutions, subscriptions, entitlements, support access.
- Identity: authentication, password recovery, sessions, MFA.
- Memberships/authorization: tenant membership, roles, permissions, policy checks.
- Admissions: cycles, applications, documents, decisions, offers.
- Students: profiles, identifiers, enrolments, status history.
- Staff: staff profiles, assignments.
- Academics: academic periods, organizational units, programmes, curricula, courses, course offerings.
- Registration: registration windows, registered courses, add/drop.
- Assessments/results: assessment components, marks, grade calculations, moderation, approvals, publication, amendments.
- Finance: fee schedules, invoices, payment attempts, confirmed payments, allocations, receipts, refunds/reversals, reconciliation.
- Notifications: templates, delivery attempts, queues.
- Reporting: permission-aware reports and exports.
- Audit: security and business event records.
- Integrations: payment gateways, SMS/email providers, future external academic systems.

## 8. Scaling path
1. Begin with a horizontally scalable stateless API and managed PostgreSQL.
2. Add indexes, query optimization, connection pooling, and load tests based on observed usage.
3. Move expensive reports, bulk notifications, and document generation to workers.
4. Introduce read replicas or caching only where measurement supports them.
5. Consider partitioning large tables and separate tenant databases for institutions with specific needs.
6. Extract a module into a service only when independent scaling, reliability, or release ownership makes the added complexity worthwhile.

## 9. Architecture quality gates
- No unscoped tenant-owned repository operation.
- No secrets in source control or frontend bundles.
- Migrations tested against a representative database.
- API contracts documented and versioned where breaking changes are possible.
- Tenant isolation, payment idempotency, result approval, backup restore, and load tests are release gates.
