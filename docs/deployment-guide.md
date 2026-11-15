# Deployment Guide

Derived from spec 15 §9–12, spec 14 §15–18, spec 13 §4.

---

## Logical production layout

```
Users → Frontend hosting (Next.js)
      → API / load balancer (HTTPS)
         ├─ NestJS API  → PostgreSQL (managed, backups, pooling)
         ├─ Redis / BullMQ → background workers
         │      ├─ receipt PDFs → private object storage
         │      ├─ notifications → email provider
         │      └─ scheduled jobs (reminders, deadline notices)
         └─ private object storage (evidence, receipts)
```

Proposed domains (spec 13 §4): `adashi.com` (public), `app.adashi.com` (user app), `admin.adashi.com` (admin portal), `api.adashi.com` (API). API always under `/api/v1`.

## Deployment steps (backend)

1. Provision managed PostgreSQL + Redis + private object storage + email provider.
2. Set production environment variables in a secret store (see `environment-setup.md`); rotate any deploy-time secrets.
3. Run migrations as a controlled step: `npm run migration:run` (never `synchronize`).
4. Deploy API process and worker process(es) with same config/schema; supervise both (restart policies).
5. Configure CORS to approved frontend origins; secure cookies (`Secure`, `SameSite`); HTTPS only.
6. Configure rate limits, health checks, structured logging, error reporting.
7. Verify Swagger is disabled or access-restricted in production if policy requires.
8. Bootstrap: run `npm run admin:bootstrap` once from the trusted environment when zero Super Admins exist; confirm the command refuses to run afterwards; complete owner invitation + MFA.
9. Verify bootstrap secret/invitation can no longer be used.

## Deployment steps (frontend)

1. Set `NEXT_PUBLIC_API_URL` to the production API base; approved domain/redirects.
2. Configure error reporting + PWA assets.
3. Production build + smoke tests: auth, protected routes, upload, receipt download, mobile layouts.

## Database

- Managed PostgreSQL, automated backups, point-in-time recovery where available.
- Connection pooling sized for API + workers.
- Test restore quarterly; a backup is not proven until restored (spec 14 §15).
- Define real RPO/RTO from tested capability — do not claim untested targets.

## Security gate before production (spec 14 §19)

- [ ] No public Super Admin registration
- [ ] Bootstrap single-use and already disabled
- [ ] Super Admin MFA enabled
- [ ] Backend permissions enforced; group isolation IDOR-tested
- [ ] Critical financial ops transactional + idempotent
- [ ] Audit logging active
- [ ] Private files inaccessible without authorisation
- [ ] Secrets not in git; production error responses leak nothing
- [ ] Rate limiting configured
- [ ] Backups configured + restore tested
- [ ] Monitoring/alerts configured
- [ ] Privacy/legal review done (Nigeria Data Protection Act advice)
- [ ] Rollback procedure documented and rehearsed

## CI/CD (spec 15 §11)

Branch → PR → lint/format → typecheck → unit → integration → build → dependency/security scan → review → merge → staging deploy → staging smoke tests → approved prod deploy → migrations → app+workers → health checks → monitor.

Never auto-deploy unreviewed financial logic to production.

## Monitoring & alerting (spec 14 §16)

Watch: API uptime/latency/error rate, DB connections/storage, Redis health, queue depth, failed jobs, receipt/notification failures, repeated login failures, unusual admin activity, backup failures.

Alert on: DB unavailable, sustained error rate, queue backlog, failed critical financial job, backup failure, privileged-account anomalies.

Do not auto-retry non-idempotent financial operations without idempotency protection.

## Operational runbooks (spec 14 §18)

Document and keep current: Super Admin setup, admin onboarding/offboarding, password/MFA recovery, account suspension, dispute escalation, purchase verification, financial correction, DB restore, security incident response, deployment rollback, maintenance announcements.

## Scaling order (spec 15 §13)

Query/index optimisation → pagination → safe caching → workers for PDF/notifications → connection pooling → slow-query monitoring → API replicas → worker concurrency → read replicas only if justified → service extraction only with measured need. Financial transactions keep row locks + constraints at every stage.
