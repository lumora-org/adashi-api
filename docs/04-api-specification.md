# API Specification Baseline
## Multi-Tenant Tertiary SMS

Use REST APIs with JSON payloads and document them in Swagger/OpenAPI. Exact request and response schemas should be created alongside each implementation issue.

## 1. API conventions
- Base path: `/api/v1`.
- Use HTTPS in all non-local environments.
- Use a consistent error envelope: `statusCode`, `code`, `message`, `requestId`, and optional safe `details`.
- Validate DTOs and reject unexpected/invalid input.
- Use pagination for collection endpoints.
- Never expose internal stack traces or cross-tenant record existence.
- Define idempotency behavior for payment and other retry-sensitive endpoints.
- Tenant context is resolved from the validated hostname and authenticated membership; a request body tenant ID is not sufficient.

## 2. Public/platform endpoints
- `GET /health/live`
- `GET /health/ready`
- `GET /public/institution` — public-safe tenant profile resolved by hostname.
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh` if refresh-token sessions are used
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

Platform-admin examples:
- `POST /platform/institutions`
- `GET /platform/institutions`
- `GET /platform/institutions/:institutionId`
- `PATCH /platform/institutions/:institutionId`
- `POST /platform/institutions/:institutionId/activate`
- `POST /platform/institutions/:institutionId/suspend`
- `POST /platform/institutions/:institutionId/domains`
- `POST /platform/subscriptions`
- `GET /platform/subscriptions`
- `POST /platform/support-access-grants` (only if a controlled support access workflow is approved)

## 3. Institution administration
- `GET /institution/settings`
- `PATCH /institution/settings`
- `GET/POST/PATCH /institution/campuses`
- `GET/POST/PATCH /institution/organizational-units`
- `GET/POST/PATCH /institution/academic-sessions`
- `GET/POST/PATCH /institution/academic-periods`
- `GET/POST/PATCH /institution/programmes`
- `GET/POST/PATCH /institution/courses`
- `GET/POST/PATCH /institution/course-offerings`
- `GET/POST/PATCH /institution/users`
- `POST /institution/users/:userId/invitations`
- `GET/PATCH /institution/roles`

## 4. Admissions and students
- `GET/POST /admissions/cycles`
- `GET/POST /admissions/applications`
- `GET /admissions/applications/:applicationId`
- `POST /admissions/applications/:applicationId/submit`
- `POST /admissions/applications/:applicationId/decision`
- `POST /admissions/applications/:applicationId/offer`
- `POST /admissions/offers/:offerId/accept`
- `GET/POST /students`
- `GET/PATCH /students/:studentId`
- `GET /students/:studentId/enrolments`
- `POST /students/:studentId/enrolments`
- `GET/POST /staff`

## 5. Course registration and results
- `GET /students/me/registration-eligibility`
- `GET /students/me/course-offerings`
- `GET/POST /students/me/course-registrations`
- `POST /students/me/course-registrations/:registrationId/drop`
- `GET /lecturer/course-offerings`
- `GET/POST /course-offerings/:offeringId/assessments`
- `POST /course-offerings/:offeringId/grades/submit`
- `POST /course-offerings/:offeringId/results/review`
- `POST /course-offerings/:offeringId/results/approve`
- `POST /course-offerings/:offeringId/results/publish`
- `GET /students/me/results`
- `POST /public/result-verifications` only if public verification is enabled and designed safely.

Result workflow transitions must be permission-checked and validated server-side. Publishing must not be a general-purpose update to a status field.

## 6. Fees and payments
- `GET /students/me/invoices`
- `GET /students/me/payments`
- `POST /students/me/invoices/:invoiceId/payment-attempts`
- `GET /students/me/payment-attempts/:attemptId`
- `POST /integrations/payments/:provider/webhook`
- `POST /finance/offline-payments`
- `POST /finance/offline-payments/:paymentId/approve`
- `GET /finance/reconciliation`
- `POST /finance/reconciliation/batches`
- `POST /finance/payments/:paymentId/refunds` subject to provider support and permissions.
- `GET /finance/reports/collections`
- `GET /finance/reports/outstanding-balances`

Webhooks must verify provider authenticity, store provider event IDs, handle retries idempotently, and not trust browser redirects as proof of payment. Do not log secrets or complete payment payloads containing sensitive information.

## 7. API authorization matrix
- Public: only explicitly public institution profile, published public notices, and approved verification flows.
- Student: own profile, enrolment, eligible course registration, own invoices/payments/receipts, published results.
- Lecturer: assigned offerings, class roster fields needed for teaching, assigned assessments and grade submissions.
- Registry: admissions and student records according to permission.
- Academic admin/examinations: academic setup and result workflow according to permission.
- Finance: invoices, payments, reconciliation, and finance reports.
- Institution admin: institution configuration and user administration, excluding platform-wide privileges.
- Platform admin: tenant and subscription administration; private academic/financial record access is not implied.
- Support agent: only granted, scoped, time-bound access with audit trail if that feature is implemented.

## 8. Testing requirements
For each endpoint test:
- unauthenticated request,
- authenticated but insufficient role,
- wrong institution membership,
- altered resource ID from another tenant,
- invalid state transition,
- invalid or unexpected input,
- duplicate/retried request where relevant,
- expected successful path.
