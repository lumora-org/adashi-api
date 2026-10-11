# Database Design Baseline
## Multi-Tenant Tertiary SMS

This is a logical schema baseline, not final ORM migration code. Refine fields and relationships after confirming the pilot institution's workflows.

## 1. General conventions
- Use UUID primary keys for most entities.
- Use `created_at`, `updated_at`, and where relevant `created_by`, `updated_by`.
- Use UTC timestamps in storage and render in institution timezone.
- Use exact decimal types for money; never floating-point values.
- Store monetary currency explicitly (ISO currency code).
- Add `institution_id` to every institution-owned entity unless there is a documented reason not to.
- Use soft deletion only where justified; financial transactions and audit records should not be silently deleted.
- Apply database constraints for uniqueness, valid status transitions where feasible, and tenant-safe relationships.

## 2. Core platform tables
### institutions
- `id`, `name`, `slug`, `institution_type`, `status`
- `timezone`, `locale`, `default_currency`
- `logo_object_key`, `branding_config`
- `contact_email`, `contact_phone`
- `created_at`, `updated_at`

### institution_domains
- `id`, `institution_id`, `hostname`, `domain_type`, `status`, `verified_at`
- Unique normalized hostname; enforce one active owner per hostname.
- MVP supports platform subdomains; custom domains may be added later.

### subscription_plans
- `id`, `name`, `description`, `status`
- `billing_period_options` or related plan-price records
- `feature_entitlements`, configurable limits, timestamps

### subscriptions
- `id`, `institution_id`, `plan_id`, `billing_period`, `status`
- `starts_at`, `current_period_start`, `current_period_end`, `grace_until`, `cancelled_at`
- Provider customer/subscription references where applicable
- Preserve subscription history rather than overwriting all changes.

### users
- `id`, `email_normalized`, `phone_normalized`, `password_hash`, `display_name`, `status`
- Authentication identifiers must be unique according to a clearly chosen global account policy.

### memberships
- `id`, `institution_id`, `user_id`, `status`, `joined_at`
- Unique `(institution_id, user_id)` if one membership per user per institution is the policy.

### roles, permissions, role_permissions, membership_roles
- Roles and permissions should be explicit and auditable.
- Platform roles must be separate from institution roles.
- Avoid a single role field on `users` because users can have different roles in different institutions.

### audit_events
- `id`, nullable `institution_id`, `actor_user_id`, `action`, `target_type`, `target_id`
- `outcome`, `occurred_at`, `request_id`, safe metadata JSON
- Do not store passwords, bearer tokens, payment card data, or unnecessary sensitive payloads.

## 3. Institution setup and academic tables
- `campuses`
- `organizational_units` or separate `faculties`, `schools`, and `departments` if the pilot proves a fixed model is suitable
- `academic_sessions`
- `academic_periods` (semester, term, block, or other period)
- `qualifications`
- `programmes`
- `programme_versions` / `curricula`
- `study_modes` (e.g. full-time, part-time)
- `courses`
- `curriculum_courses` (course requirements, level, credit units, required/elective, prerequisite relationships)
- `course_offerings` (course + academic period + class/group + capacity + lecturer assignments)
- `registration_windows`

Separate reusable course catalogue records from course offerings in a specific period. Store the curriculum/rule version used for a student's academic path where required.

## 4. Admissions and student tables
- `admission_cycles`
- `applications`
- `application_documents` (object storage key, metadata, scan status, access policy)
- `admission_decisions`
- `admission_offers`
- `students`
- `student_identifiers` or institution-scoped matriculation number
- `enrolments` (student, programme, study mode, start session, current status)
- `enrolment_status_history`
- `student_documents`
- `staff_profiles`
- `staff_assignments`

Do not make an applicant a separate human identity from a student by default; support conversion or linking without duplicate records.

## 5. Registration, assessment, and results
- `course_registrations`
- `assessment_schemes`
- `assessment_components`
- `assessment_scores`
- `grade_scales`
- `grade_scale_versions`
- `grade_boundaries`
- `result_batches` or `result_submissions`
- `course_results`
- `semester_results` / academic standing records as needed
- `result_approvals`
- `result_amendments`
- `result_verification_tokens` (hashed token, expiry, revocation, access scope)

Track status transitions and approval actors. Preserve the policy version used to calculate published grades and GPA/CGPA. Keep unpublished results inaccessible to students.

## 6. Finance tables
- `fee_categories`
- `fee_schedule_versions`
- `fee_schedule_items`
- `student_invoices`
- `invoice_lines`
- `payment_attempts`
- `payments` (confirmed payment record)
- `payment_allocations`
- `offline_payment_evidence`
- `receipts`
- `refunds_or_reversals`
- `reconciliation_batches`
- `reconciliation_items`
- `payment_provider_events` (deduplication key and safe processing status)

Recommended separation:
- An invoice describes what is owed.
- A payment attempt describes an attempt to pay.
- A confirmed payment describes money verified as received.
- An allocation links a payment to one or more invoices.
- A reconciliation record documents matching and exceptions.

Use unique provider event/transaction references, idempotency keys, and database transactions to avoid duplicate payment effects.

## 7. Tenant-aware constraints
Examples to implement where applicable:
- Unique `(institution_id, matriculation_number)`.
- Unique `(institution_id, programme_code)`.
- Unique `(institution_id, course_code)` if course codes must be unique per school.
- Ensure course registration's student, course offering, and institution all match.
- Ensure invoice, student, payment allocation, and institution relationships cannot cross tenants.
- Use tenant-aware composite foreign keys or equivalent service/database safeguards.

## 8. Data retention and privacy
Define retention schedules for application documents, student records, financial evidence, audit events, and verification tokens based on applicable law and institutional obligations. Deletion must not break financial records or statutory academic history.
