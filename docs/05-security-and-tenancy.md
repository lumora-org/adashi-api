# Security and Tenant Isolation Requirements

## 1. Security objectives
Prevent one institution, student, staff member, or platform support user from accessing data beyond their explicit authorization. Protect academic records, identity documents, and financial transactions from unauthorized disclosure or alteration.

## 2. Authentication
- Store passwords using a current password hashing algorithm supported by a maintained library.
- Use secure, HTTP-only, Secure cookies for browser sessions where practical; evaluate CSRF protections based on the chosen authentication design.
- If JWTs are used, use short-lived access tokens and carefully controlled refresh-token rotation/revocation.
- Add MFA for platform administrators and consider it for institution administrators.
- Apply rate limits to login, password reset, public verification, and other abuse-prone endpoints.
- Never put secrets in browser bundles or source control.

## 3. Tenant resolution
- Normalize the requested hostname and match it to a verified active domain.
- Treat forwarded host headers as trustworthy only when correctly configured behind a trusted proxy.
- Reject unknown, inactive, reserved, or ambiguous hostnames.
- Resolve the institution server-side; do not trust a body/query/header tenant identifier by itself.
- Confirm active membership for the requested institution on every protected request.
- Propagate tenant context explicitly into workers and scheduled jobs.

## 4. Data access
- Require tenant-scoped repository/service methods for tenant-owned data.
- Use database constraints to prevent cross-tenant references.
- Consider PostgreSQL Row-Level Security as defense in depth. If used, set tenant context transaction-locally and ensure connection pooling cannot leak context between requests.
- Scope caches by institution and authorization context.
- Scope object storage access using server-authorized object keys or short-lived signed URLs.
- Scope search, exports, analytics, and bulk operations by tenant.
- Use generic not-found/forbidden behavior where revealing another tenant's record existence would be unsafe.

## 5. Privileged access and audit
- Separate platform roles from institution roles.
- Require explicit support-access grants for sensitive support tasks, with reason, scope, expiry, and audit events.
- Log role/permission changes, tenant configuration changes, financial actions, result publication/amendment, and support access.
- Do not store passwords, session tokens, provider secrets, card data, or unnecessary sensitive payloads in logs.
- Restrict audit-log viewing and protect logs from alteration by ordinary users.

## 6. Payments
- Verify gateway webhooks using the provider's supported signature/authentication method.
- Verify transaction status server-side with the provider where supported.
- Enforce unique provider transaction/event IDs and idempotent processing.
- Keep payment attempts distinct from confirmed payments.
- Require approval and evidence for offline payment recording based on the institution's policy.
- Use explicit reversal/refund records rather than deleting confirmed transactions.
- Do not store raw card data.

## 7. Results and academic integrity
- Only authorized lecturers can enter grades for assigned offerings.
- Use explicit submit/review/approve/publish states.
- Lock or version published results and require a reason and approval for amendment.
- Store the grading rule version used for calculations.
- Protect unpublished results from student and public endpoints.
- Use hashed, revocable, expiring verification tokens for any public checker.

## 8. Uploads and documents
- Validate file type, size, and content where feasible.
- Use randomized object keys and private buckets/containers.
- Scan uploaded files for malware where practical.
- Do not use user-supplied filenames as storage paths.
- Authorize every download and use expiring signed links where appropriate.

## 9. Release security gates
- Automated cross-tenant negative tests for API, database, exports, files, queues, and caches.
- Dependency and secret scanning in CI.
- Review privileged access and audit coverage.
- Restore a database backup in a non-production environment.
- Conduct a security review before the pilot stores real student data.
