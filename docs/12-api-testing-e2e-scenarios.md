# 12 — API Testing Collection and End-to-End Workflow Scenarios

**Project:** Adashi Contribution and Savings Management Platform  
**Document:** API Testing Collection and End-to-End Workflow Scenarios  
**Audience:** Backend developers, frontend developers, QA engineers  
**Status:** Testing specification

---

## 1. Purpose

This document defines the test strategy and practical end-to-end scenarios for validating the Adashi platform.

Testing must cover normal user journeys, financial integrity, permissions, failure cases, concurrency and administrative operations.

## 2. Testing environments

Maintain separate environments:

- Local development.
- Automated test environment.
- Staging.
- Production.

Never use real customer financial records in automated tests.

Use seeded test users and test groups with predictable identifiers.

## 3. Test accounts

Create fixtures for:

| Account | Purpose |
|---|---|
| Super Admin | Platform-wide management |
| Platform Admin | Restricted platform administration |
| Organiser A | Creates and manages groups |
| Organiser B | Manages a separate group |
| Member A | Participates in multiple groups |
| Member B | Beneficiary in a rotational group |
| Member C | Target-based participant |
| Suspended User | Access restriction tests |
| Unverified User | Account verification tests |

A user may organise one group and participate in another. Tests must confirm that permissions are determined by the user's relationship to each group, not by a single global organiser/member role.

## 4. Test layers

### Unit tests

Test:

- Contribution calculations.
- Equal target distribution calculations.
- Payout deadline calculations.
- Withdrawal settlement calculations.
- Plan limits and upgrade differences.
- Entitlement state transitions.
- Role and permission policies.
- Financial rounding rules.

### Integration tests

Test:

- Database transactions.
- Entity relationships.
- Repository queries.
- Authentication guards.
- Group membership authorisation.
- Idempotency behaviour.
- Outbox processing.
- Receipt generation.
- Notification delivery adapters.

### End-to-end tests

Test complete workflows through the HTTP API or browser interface.

### Security tests

Test:

- Unauthorised access.
- Cross-group data access.
- Role escalation.
- IDOR vulnerabilities.
- Upload validation.
- Rate limiting.
- Session revocation.
- Sensitive information exposure.

## 5. Core workflow A — Registration and onboarding

**Scenario:** A new user registers and becomes an organiser.

Steps:

1. Register a new account.
2. Verify the account using the configured verification process.
3. Log in.
4. Retrieve the user profile.
5. Create a group.
6. Check the user's entitlement.
7. Reserve the free Starter entitlement.
8. Activate it.
9. Verify that the group round becomes active.
10. Attempt to use the free entitlement again.

Expected results:

- The user can register without a platform administrator role.
- The free entitlement is consumed exactly once after successful activation.
- A second attempt is rejected.
- The entitlement cannot be restored by deleting the group.

## 6. Core workflow B — Paid group activation

Steps:

1. Create a group requiring a paid plan.
2. Select the appropriate plan.
3. Initiate a group purchase.
4. Upload payment evidence.
5. Sign in as an authorised platform billing administrator.
6. Verify the payment.
7. Confirm that the round activates.
8. Attempt to verify the same purchase again.

Expected results:

- Purchase status starts as pending.
- Payment evidence is stored privately.
- Only authorised administrators can verify.
- Activation occurs only after successful verification.
- Duplicate verification does not create another purchase activation.
- Platform purchase revenue remains separate from group contributions.

## 7. Core workflow C — Rotational Adashi

**Example:** Five members contribute ₦20,000 monthly.

Steps:

1. Organiser creates a rotational group.
2. Invite five members.
3. Members accept invitations.
4. Organiser sets the contribution schedule.
5. Organiser defines the beneficiary order.
6. Generate the round's cycles.
7. Members report their contributions.
8. Organiser verifies each contribution.
9. System updates financial summaries.
10. Organiser marks the first beneficiary's payout as sent.
11. System creates a receipt record.
12. Beneficiary receives a notification.
13. Beneficiary confirms receipt.
14. Verify the payout history and cycle status.
15. Continue with the next eligible cycle.

Expected results:

- Every member has the correct contribution records.
- Pending contributions are not counted as verified collections.
- Beneficiary order is preserved.
- A payout cannot be sent twice.
- Each payout creates exactly one initial receipt.
- The next cycle cannot progress if a financial integrity issue blocks it.

## 8. Core workflow D — Payout confirmation deadline

Test the 48-hour rule.

### Test D1: Member confirms before deadline

1. Mark payout as sent.
2. Confirm that the deadline is set to `sentAt + 48 hours`.
3. Sign in as the beneficiary.
4. Confirm receipt before the deadline.

Expected: `CONFIRMED_BY_MEMBER`.

### Test D2: Organiser attempts early override

1. Mark payout as sent.
2. Attempt organiser confirmation before 48 hours have elapsed.

Expected:

- Request rejected.
- Status remains `SENT`.
- No organiser confirmation event is created.

### Test D3: Organiser confirms after deadline

1. Mark payout as sent.
2. Advance the test clock beyond the deadline.
3. Organiser confirms on behalf.
4. Supply a reason and evidence/reference.

Expected: `CONFIRMED_BY_ORGANISER`.

### Test D4: Member disputes after organiser override

1. Complete Test D3.
2. Sign in as beneficiary.
3. Submit a dispute.

Expected:

- Dispute is recorded.
- Previous organiser confirmation remains in history.
- Status becomes or is represented as `DISPUTED`.
- Relevant cycle or distribution is flagged for investigation.
- The system does not erase the earlier receipt or confirmation.

Use an injectable clock in automated tests. Do not wait 48 real hours.

## 9. Core workflow E — Target-Based Adashi

**Example:** Ten eligible members contribute towards a shared target.

Steps:

1. Organiser creates a target-based group.
2. Members join.
3. Organiser defines the target and contribution rules.
4. Members report contributions.
5. Organiser verifies contributions.
6. System calculates progress from verified contributions.
7. When target conditions are met, calculate a proposed distribution.
8. Review equal shares.
9. Approve distribution.
10. Create individual payout records.
11. Mark each payout as sent.
12. Beneficiaries confirm receipt.
13. Reconcile all distributions.

Expected results:

- Distribution shares are equal among eligible members.
- Different contribution amounts do not silently change equal distribution rules.
- Ineligible or withdrawn members are excluded according to approved rules.
- Rounding remainder is handled deterministically and transparently.
- Every payout is independently tracked.

## 10. Core workflow F — Member withdrawal

Steps:

1. Member submits a withdrawal request.
2. Organiser reviews the request.
3. System calculates settlement.
4. Organiser approves or rejects.
5. If approved, refund or outstanding balance is recorded.
6. Settlement is completed.
7. Membership becomes withdrawn.

Expected results:

- Withdrawal does not immediately erase membership history.
- Refunds cannot exceed the approved settlement.
- A member who already received a rotational payout is not automatically refunded all contributions.
- No duplicate refund can be created.
- Withdrawn members are handled correctly in future distributions.

## 11. Core workflow G — Multiple groups per user

Steps:

1. User creates Group A.
2. User joins Group B as a member.
3. User creates Group C.
4. User switches between group dashboards.
5. User attempts to access Group B's organiser-only actions.

Expected:

- User sees each group according to their relationship.
- User can manage Group A and C.
- User cannot manage Group B unless separately authorised.
- No data leaks between groups.

## 12. Core workflow H — Group round renewal

Steps:

1. Complete all cycles and payouts in Round 1.
2. Resolve approved withdrawals and refunds.
3. Confirm Round 1 is completed.
4. Attempt to modify financial records in Round 1.
5. Create Round 2 under the same group.
6. Complete the required new group purchase.
7. Invite or retain eligible members according to group rules.
8. Start Round 2.

Expected:

- Group identity remains unchanged.
- Round 1 history remains available and read-only for ordinary users.
- Round 2 has independent financial records.
- The new round requires a valid purchase.
- The one-time free entitlement cannot be reused.

## 13. Super Admin test scenarios

### Account provisioning

- Public registration cannot assign `SUPER_ADMIN`.
- Initial bootstrap can create the first owner account only when no Super Admin exists.
- Bootstrap becomes unusable after successful setup.
- Bootstrap secret cannot be reused.
- Super Admin can invite another authorised administrator.
- Invitation expiry and revocation work correctly.
- Two-factor authentication is required according to the platform policy.

### Platform oversight

- View all users.
- View all groups and rounds.
- View platform purchases and revenue.
- View operational contribution and payout records.
- Investigate disputes.
- Suspend and reactivate accounts with reasons.
- Review audit logs.
- Manage plans and platform settings.

### Restrictions

- A platform admin cannot silently edit a member's contribution.
- A platform admin cannot silently alter a payout.
- An administrator cannot view private data beyond their permissions.
- Sensitive interventions create audit records.
- Platform administrators cannot use group-owner powers merely because they have a platform role.

## 14. Financial integrity tests

| Test | Expected result |
|---|---|
| Verify the same contribution twice | No duplicate verification |
| Reverse an already reversed contribution | Rejected |
| Mark the same payout sent twice | No duplicate payout or receipt |
| Submit duplicate refund request | Rejected or idempotently returned |
| Approve distribution twice | No duplicate distribution |
| Use same idempotency key with different payload | Conflict |
| Complete round with unresolved payout obligations | Rejected |
| Change a verified amount directly | Forbidden |
| Submit negative contribution amount | Validation failure |
| Submit invalid currency | Validation failure |
| Round monetary calculation with fractions | Deterministic decimal result |

## 15. Concurrency tests

Simulate two requests occurring simultaneously.

Test:

- Two organisers trying to activate the same group.
- Two administrators verifying the same purchase.
- Two requests marking the same payout as sent.
- Two requests approving the same withdrawal.
- Two requests approving the same target distribution.
- Two requests consuming the same free entitlement.

Use database constraints, row-level locks and transactions. Application-level checks alone are insufficient.

## 16. API test file structure

Recommended structure:

```text
tests/
├── unit/
│   ├── entitlements/
│   ├── contributions/
│   ├── payouts/
│   ├── distributions/
│   └── withdrawals/
├── integration/
│   ├── auth/
│   ├── groups/
│   ├── billing/
│   ├── financial-records/
│   └── admin/
└── e2e/
    ├── onboarding.e2e-spec.ts
    ├── rotational-adashi.e2e-spec.ts
    ├── target-adashi.e2e-spec.ts
    ├── payout-confirmation.e2e-spec.ts
    ├── withdrawals.e2e-spec.ts
    └── super-admin.e2e-spec.ts
```

## 17. Example httpyac request file

```http
@baseUrl = http://localhost:3000/api/v1
@accessToken = YOUR_ACCESS_TOKEN
@groupId = YOUR_GROUP_UUID

### Get profile
GET {{baseUrl}}/users/me
Authorization: Bearer {{accessToken}}

### Create group
POST {{baseUrl}}/groups
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Unity Community Adashi",
  "description": "Monthly group",
  "groupType": "ROTATIONAL",
  "currency": "NGN",
  "collectionMethod": "ORGANISER_COLLECTION",
  "settings": {
    "scheduleFrequency": "MONTHLY",
    "contributionAmount": "20000.00",
    "startDate": "2026-11-01",
    "memberLimit": 10
  }
}

### Get group
GET {{baseUrl}}/groups/{{groupId}}
Authorization: Bearer {{accessToken}}
```

Keep separate request files for organiser, member, billing admin and Super Admin workflows. Do not commit real tokens, passwords or private evidence.

## 18. Definition of done

A feature is not complete until:

- Unit tests cover its business rules.
- Integration tests cover persistence and authorisation.
- E2E tests cover its principal workflow.
- Negative and concurrency cases are tested where applicable.
- Financial changes are auditable.
- API documentation is updated.
- Frontend and backend status definitions agree.
- No test relies on floating-point money calculations.
- No critical operation can be duplicated through retries.

**End of Document 12.**