# Product Requirements Document (PRD)
## Multi-Tenant Tertiary School Management System

**Status:** Baseline specification for MVP planning  
**Product model:** Hosted SaaS  
**Initial rollout:** One pilot institution, followed by staged expansion  
**Target institutions:** Universities (full-time and part-time degree programmes), Colleges of Education, Colleges of Nursing

## 1. Product vision
Deliver a secure, mobile-first platform through which tertiary institutions manage admissions, students, staff, academic operations, results, fees, payments, and reporting from a dedicated school workspace.

Each institution uses a school-specific subdomain, for example `school-slug.platform-domain.example`. All institutions share the platform's application and core infrastructure, but institution-owned data must remain isolated.

## 2. Business objectives
- Reduce fragmented manual administration and duplicate records.
- Give students secure access to admissions, course registration, results, invoices, and receipts.
- Give academic and finance teams auditable workflows.
- Enable the platform operator to onboard and support multiple institutions.
- Monetize the service through monthly and annual institutional subscriptions.
- Allow institution-specific academic rules without maintaining a separate codebase per school.

## 3. User groups
### Platform-level
- **Platform Super Admin:** manages institution onboarding, subscriptions, platform configuration, and operational health.
- **Platform Support Agent:** limited support capabilities; access to institution records must be explicitly authorized, time-limited where practical, and audited.
- **Billing/Operations Staff:** manages subscription invoices, subscription status, and support workflows as separately permissioned.

### Institution-level
- **Institution Owner/Administrator:** manages school configuration, users, academic setup, and operational oversight.
- **Registry/Admissions Officer:** manages applications, screening, offers, and enrolment.
- **Academic Administrator / HOD:** manages programmes, courses, offerings, registration rules, and academic approvals as authorized.
- **Lecturer:** views assigned course rosters, records assessments, and submits grades.
- **Examinations/Results Officer:** reviews and processes results within delegated permissions.
- **Bursary/Finance Officer:** manages fee schedules, invoices, offline payment records, reconciliation, and financial reports.
- **Student:** manages their permitted profile actions, applications, course registration, invoices, payments, receipts, and published results.
- **Auditor/Read-only User:** reads explicitly authorized records and reports without mutation rights.

A person may have memberships at more than one institution. Roles and permissions are granted within a membership; access at one institution does not imply access at another.

## 4. Product principles
- Mobile-first, responsive, and accessible.
- Secure tenant isolation is mandatory, not a subscription feature.
- Academic, grading, fee, and approval policies are configurable and versioned where historical interpretation matters.
- Important financial and academic actions are auditable.
- Use a modular monolith for the initial implementation; do not start with microservices without a demonstrated need.
- Do not silently rewrite approved financial transactions or published results; use controlled reversal/amendment workflows.

## 5. MVP functional requirements
### 5.1 Platform and tenancy
- Create, review, activate, suspend, and archive institutions.
- Maintain institution type, display name, unique slug, active subdomain, branding, timezone, locale, and contact details.
- Reserve platform-owned slugs such as `admin`, `api`, `www`, `support`, and `billing`.
- Support subscription plans with monthly and annual billing periods, status, feature entitlements, and limits.
- Resolve requests from a school subdomain to an active institution.
- Reject unknown, reserved, suspended, or unverified tenant domains.
- Maintain platform-level audit events and operational status.
- Do not allow platform support to browse private records without an authorized, audited support workflow.

### 5.2 Identity and authorization
- Secure sign-in, sign-out, password reset, and account recovery.
- Role-based access control plus permission checks at action and resource level.
- Institution memberships, invitation/activation flows, and account status management.
- Secure session/refresh-token handling; privileged accounts should support MFA.
- Enforce authorization on the server for every protected operation.
- Optional SSO may be added after MVP.

### 5.3 Institution setup
- Configure campuses and organizational units.
- Configure academic year/session and term/semester naming.
- Configure faculties/schools, departments, programmes, qualifications, study modes, and duration.
- Configure grading scales, GPA rules, pass thresholds, and result approval workflow.
- Configure fee categories, due dates, payment channels, and receipt details.
- Configure institution logo, colors, announcements, and contact information.

### 5.4 Admissions
- Publish admission cycles and application forms.
- Accept application data and required document uploads.
- Track statuses such as Draft, Submitted, Under Review, Awaiting Information, Accepted, Rejected, Offer Issued, Offer Accepted, and Withdrawn.
- Record screening decisions, authorized notes, and timestamps.
- Generate application reference numbers and admission offer documents.
- Convert an accepted offer into an enrolled student without duplicating identity records.
- Support import of approved legacy data through validated import workflows.

### 5.5 Student records
- Maintain student identity, contact details, emergency/next-of-kin details where required, documents, and status.
- Assign unique student/matriculation numbers within the institution according to its configured format.
- Track programme enrolment, study mode, academic level, session, status, deferment, withdrawal, transfer, completion, and graduation.
- Restrict sensitive fields to users with a legitimate permission.
- Keep history of important changes.

### 5.6 Staff and academic organization
- Manage staff profiles and institution memberships.
- Assign staff to organizational units and permitted roles.
- Maintain faculties/schools, departments, programmes, qualifications, curricula, and courses.
- Separate a course catalogue entry from its scheduled course offering in a particular academic period.
- Assign lecturers and class groups to course offerings.

### 5.7 Course registration
- Define registration periods and permitted student cohorts.
- Register students against course offerings for a defined academic period.
- Validate prerequisites, credit-unit limits, duplicate registration, programme curriculum rules, and registration status where configured.
- Support add/drop and approval workflows with deadlines.
- Provide student registration history and printable/exportable registration summaries.

### 5.8 Assessments and results
- Configure assessment components and weighting for a course offering.
- Allow assigned lecturers to save drafts and submit grades.
- Validate score ranges and required components.
- Support review/moderation and authorized approval before publication.
- Calculate grades and GPA/CGPA using institution-configured rules.
- Preserve the rule version used to calculate a historical result.
- Publish results only after the required approval steps.
- Handle corrections through a reasoned amendment process with old/new values, actor, timestamp, and approvals.
- Provide private student result views and a controlled result verification option if enabled.
- Public verification must use unguessable, revocable tokens, rate limits, and minimal disclosure; never expose records through predictable student numbers.

### 5.9 Fees, payments, and reconciliation
- Configure fee schedules by institution, programme, study mode, cohort/session, and other permitted dimensions.
- Generate student invoices with line items, due dates, balances, and statuses.
- Support online gateway payments and institution-recorded offline payments.
- Verify online payments server-side using provider verification APIs or authenticated signed callbacks.
- Make payment processing idempotent so repeated callbacks cannot duplicate a transaction.
- Record offline payment channel, reference, amount, date, receiving officer, evidence where appropriate, and approval status.
- Separate payment attempts, confirmed payments, invoice balances, and payment allocations.
- Issue receipts only according to the configured confirmation policy.
- Support reconciliation reports showing matched, unmatched, underpaid, overpaid, reversed, and pending transactions.
- Support controlled refunds/reversals and audit them; do not delete confirmed transactions.
- Do not mark an invoice paid solely because a browser redirects to a success page.

### 5.10 Reporting and communication
- Provide role-restricted dashboards and paginated reports.
- MVP reports: applications by status, enrolment, registration, result processing, invoices, collection, outstanding balances, and reconciliation exceptions.
- Export authorized reports to CSV/XLSX/PDF where needed.
- Send email and/or SMS notifications for important events, with retry handling and delivery status where available.
- Notifications must not disclose sensitive results or financial data in message previews.

### 5.11 Audit and administration
- Record actor, institution context, action, target type/id, timestamp, outcome, and suitable metadata for important actions.
- Audit permissions changes, user management, financial mutations, result approvals/publication, tenant configuration, and support access.
- Restrict audit log access and prevent ordinary users from editing audit records.
- Avoid storing passwords, access tokens, card data, or unnecessary sensitive payloads in logs.

## 6. Non-functional requirements
- **Security:** least privilege, secure secrets management, input validation, rate limiting, secure headers, dependency updates, and tested tenant boundaries.
- **Isolation:** no cross-tenant data access through API, exports, files, search, jobs, caches, or reports.
- **Performance:** establish measurable targets after expected user counts and traffic are confirmed; load-test peak registration, result publication, and payment events.
- **Availability:** deploy with health checks, error monitoring, database backups, and documented recovery procedures.
- **Recovery:** define recovery point objective (RPO) and recovery time objective (RTO) before production launch; test restore procedures.
- **Maintainability:** type-safe code, automated tests, documented APIs, versioned migrations, code review, and CI.
- **Accessibility:** responsive design, keyboard navigation, clear validation errors, and appropriate contrast.
- **Privacy:** data minimization, access controls, retention/deletion policy, and jurisdiction-appropriate privacy review.
- **Localization:** store timestamps consistently and render using institution-configured timezone; support local currency configuration rather than hardcoding a currency.

## 7. MVP exclusions
Unless a pilot institution makes one essential, defer full payroll, accounting ledger, library, hostel, LMS, alumni, parent portal, biometric attendance, advanced research management, and regulator-specific integrations.

## 8. Acceptance criteria for pilot readiness
- A platform admin can onboard and activate an institution and reserve its subdomain.
- A user at one institution cannot read or modify another institution's data, even by changing identifiers or request parameters.
- An institution admin can configure an academic session, programme, course, fee schedule, and authorized users.
- An applicant can apply and an authorized officer can process the application and enrol an accepted applicant.
- A student can register eligible courses within the configured registration window.
- A lecturer can submit grades and authorized staff can approve and publish them.
- A student can see only their own published results.
- Online payment confirmation is verified server-side and duplicate events do not duplicate payments.
- Authorized finance staff can record offline payments and reconcile them.
- Sensitive actions are auditable and backups can be restored in a tested environment.
- Core workflows are usable on mobile devices.
