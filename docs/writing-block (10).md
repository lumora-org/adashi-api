# 11 — API Request and Response Examples

**Project:** Adashi Contribution and Savings Management Platform  
**Document:** API Request and Response Examples  
**Audience:** Backend developers, frontend developers, QA engineers  
**Status:** Implementation specification

---

## 1. Purpose

This document provides practical request and response examples for implementing and testing the Adashi API.

All sample IDs, names, dates, amounts and tokens are illustrative. The backend remains the source of truth for financial calculations, permissions, deadlines and transaction statuses.

## 2. API conventions

### Base URL

Development:

`http://localhost:3000/api/v1`

Production:

`https://api.example.com/api/v1`

The production domain is a placeholder and must be replaced with the actual deployment domain.

### Authentication

Protected endpoints use:

`Authorization: Bearer <access_token>`

Use secure HTTP-only cookies where the frontend authentication architecture supports them. Do not expose refresh tokens to browser JavaScript or store long-lived credentials in localStorage.

### Common headers

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <access_token>
```

For critical financial operations:

```http
Idempotency-Key: <unique-client-generated-key>
```

Use a new idempotency key for each distinct operation. Reusing a key with a different payload must return a conflict.

## 3. Response conventions

### Successful response

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {
    "id": "7d4e6a1b-6b4d-4f20-9f0e-9b4c8f5e1234"
  },
  "meta": {
    "timestamp": "2026-10-01T10:30:00.000Z"
  }
}
```

### Paginated response

```json
{
  "success": true,
  "message": "Records retrieved successfully",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 125,
    "totalPages": 7
  }
}
```

### Error response

```json
{
  "success": false,
  "message": "You are not authorised to perform this action",
  "error": {
    "code": "FORBIDDEN",
    "details": []
  },
  "meta": {
    "timestamp": "2026-10-01T10:30:00.000Z",
    "path": "/api/v1/groups"
  }
}
```

Stable error codes should be used instead of requiring frontend developers to parse human-readable messages.

## 4. Authentication examples

### 4.1 Register

`POST /auth/register`

```json
{
  "fullName": "Amina Yusuf",
  "email": "amina@example.com",
  "phoneNumber": "+2348012345678",
  "password": "ExampleStrongPassword123!"
}
```

Expected result:

- Create a normal user account.
- Verify the email or phone number according to the configured verification policy.
- Do not allow public registration to assign `SUPER_ADMIN`.
- Do not accept platform roles from public registration payloads.

### 4.2 Login

`POST /auth/login`

```json
{
  "email": "amina@example.com",
  "password": "ExampleStrongPassword123!"
}
```

Illustrative response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-uuid",
      "fullName": "Amina Yusuf",
      "email": "amina@example.com",
      "accountStatus": "ACTIVE"
    },
    "accessToken": "<short-lived-access-token>",
    "expiresIn": 900
  }
}
```

In production, use a secure cookie or the selected secure token-delivery strategy. Never return password hashes.

### 4.3 Refresh session

`POST /auth/refresh`

The refresh credential should be supplied through the secure cookie or other approved secure mechanism.

```json
{}
```

The server validates the refresh session, rotates credentials where applicable and issues a new access token.

### 4.4 Logout

`POST /auth/logout`

Revoke the active refresh session and clear authentication cookies.

## 5. User profile examples

### Get profile

`GET /users/me`

### Update profile

`PATCH /users/me`

```json
{
  "fullName": "Amina Yusuf",
  "phoneNumber": "+2348012345678"
}
```

Users must not update their own account status, platform role, verification status or administrative permissions through this endpoint.

## 6. Group examples

### 6.1 Create a group

`POST /groups`

```json
{
  "name": "Unity Community Adashi",
  "description": "Monthly contribution group",
  "groupType": "ROTATIONAL",
  "currency": "NGN",
  "collectionMethod": "ORGANISER_COLLECTION",
  "settings": {
    "scheduleFrequency": "MONTHLY",
    "contributionAmount": "50000.00",
    "startDate": "2026-11-01",
    "memberLimit": 10
  }
}
```

Expected result:

- Validate group configuration.
- Create a group record.
- Create the initial round in the appropriate pre-activation state.
- Require a valid group purchase or free entitlement before activating the round.
- Do not assume that creating a group automatically starts contributions.

For a direct beneficiary collection group, use:

`DIRECT_BENEFICIARY_COLLECTION`

### 6.2 Invite a member

`POST /groups/{groupId}/invitations`

```json
{
  "phoneNumber": "+2348098765432",
  "email": "member@example.com",
  "message": "You are invited to join Unity Community Adashi."
}
```

The invitation must be linked to the group and its active or pending round as appropriate.

### 6.3 Accept an invitation

`POST /groups/{groupId}/invitations/{invitationId}/accept`

```json
{}
```

The authenticated user must be the intended invitee or satisfy the configured invitation acceptance process.

### 6.4 List group members

`GET /groups/{groupId}/members?page=1&limit=20`

Only authorised group participants and administrators may access the relevant information.

## 7. Round and billing examples

### 7.1 Reserve free entitlement

`POST /entitlements/reserve`

```json
{
  "groupId": "group-uuid",
  "planCode": "STARTER"
}
```

Illustrative response:

```json
{
  "success": true,
  "data": {
    "reservationId": "reservation-uuid",
    "status": "RESERVED",
    "memberLimit": 10,
    "expiresAt": "2026-10-01T11:00:00.000Z"
  }
}
```

Reservation alone does not consume the free entitlement.

### 7.2 Activate free entitlement

`POST /entitlements/activate`

```json
{
  "reservationId": "reservation-uuid"
}
```

Activation must run transactionally. The entitlement transitions from `AVAILABLE` to `RESERVED` to `USED`. A successful activation permanently consumes the one-time free entitlement.

Deleting a group or cancelling a round must not restore it.

### 7.3 Initiate a paid group purchase

`POST /billing/group-purchases`

```json
{
  "groupId": "group-uuid",
  "roundId": "round-uuid",
  "planCode": "STANDARD",
  "paymentMethod": "BANK_TRANSFER"
}
```

Illustrative response:

```json
{
  "success": true,
  "data": {
    "purchaseId": "purchase-uuid",
    "amount": "2000.00",
    "currency": "NGN",
    "status": "PENDING_PAYMENT",
    "paymentReference": "ADASHI-2026-000001"
  }
}
```

This is a platform purchase, not a group contribution.

### 7.4 Submit payment evidence

`POST /billing/group-purchases/{purchaseId}/payment-evidence`

Use `multipart/form-data` with:

- `proof`: image or PDF file.
- `paymentReference`: bank transfer reference, if available.
- `paymentDate`: ISO 8601 timestamp.
- `notes`: optional explanation.

The backend must validate file type, size and ownership.

### 7.5 Verify a purchase

`POST /admin/billing/group-purchases/{purchaseId}/verify`

```json
{
  "decision": "APPROVE",
  "verificationReference": "BANK-REF-12345",
  "notes": "Transfer confirmed."
}
```

Only authorised platform administrators may verify platform purchases. Record the administrator, time, evidence and decision.

A rejected payment must retain its history and reason.

## 8. Contribution examples

### 8.1 Report a contribution

`POST /groups/{groupId}/contributions`

```json
{
  "roundId": "round-uuid",
  "cycleId": "cycle-uuid",
  "amount": "50000.00",
  "paymentDate": "2026-11-01T09:30:00.000Z",
  "paymentReference": "BANK-TRANSFER-123",
  "notes": "November contribution"
}
```

Expected initial status:

`REPORTED`

Reporting a payment does not mean the organiser has verified it.

### 8.2 Verify a contribution

`POST /contributions/{contributionId}/verify`

```json
{
  "decision": "VERIFY",
  "verificationReference": "BANK-REF-123",
  "notes": "Payment confirmed."
}
```

Only an authorised organiser or delegated group officer may verify contributions.

### 8.3 Reject a contribution

`POST /contributions/{contributionId}/verify`

```json
{
  "decision": "REJECT",
  "reason": "The payment reference could not be confirmed."
}
```

### 8.4 Reverse a verified contribution

`POST /contributions/{contributionId}/reverse`

```json
{
  "reason": "The original transfer was reversed by the bank.",
  "evidenceReference": "BANK-REV-456"
}
```

Reversal must create a new financial event. Do not delete or overwrite the original contribution record.

## 9. Rotational cycle examples

### Generate cycles

`POST /rounds/{roundId}/cycles/generate`

```json
{
  "firstCycleDate": "2026-11-01",
  "frequency": "MONTHLY",
  "beneficiaryOrder": [
    "member-uuid-1",
    "member-uuid-2",
    "member-uuid-3"
  ]
}
```

Supported frequencies:

- `DAILY`
- `WEEKLY`
- `EVERY_TWO_WEEKS`
- `EVERY_THREE_WEEKS`
- `MONTHLY`

The backend must validate that every beneficiary belongs to the eligible membership set and that the order satisfies the group's rules.

Cycle generation must be idempotent or protected against duplicate cycles.

## 10. Payout examples

### 10.1 Mark payout as sent

`POST /payouts/{payoutId}/mark-sent`

```json
{
  "sentAt": "2026-11-01T15:00:00.000Z",
  "paymentReference": "TRANSFER-REF-789",
  "notes": "Payout transferred to beneficiary."
}
```

Use the server timestamp as the authoritative `sentAt` unless a controlled reconciliation workflow explicitly permits a recorded external event time.

In one database transaction, the backend must:

1. Validate the payout and actor's permission.
2. Change payout status to `SENT`.
3. Create the payout event.
4. Create a uniquely numbered receipt record.
5. Set the confirmation deadline to `sentAt + 48 hours`.
6. Write notification and receipt-generation jobs to the outbox.

Illustrative response:

```json
{
  "success": true,
  "data": {
    "payoutId": "payout-uuid",
    "status": "SENT",
    "sentAt": "2026-11-01T15:00:00.000Z",
    "confirmationDeadline": "2026-11-03T15:00:00.000Z",
    "receipt": {
      "receiptId": "receipt-uuid",
      "receiptNumber": "ADS-PAY-2026-000001",
      "status": "GENERATING"
    }
  }
}
```

### 10.2 Member confirms receipt

`POST /payouts/{payoutId}/confirm-received`

```json
{
  "confirmationNote": "I have received the payout."
}
```

The authenticated user must be the beneficiary.

The backend records `CONFIRMED_BY_MEMBER`, the actor and timestamp.

### 10.3 Organiser confirms on behalf

`POST /payouts/{payoutId}/confirm-on-behalf`

```json
{
  "reason": "The beneficiary did not respond within the 48-hour confirmation period.",
  "evidenceReference": "TRANSFER-REF-789"
}
```

This operation is only permitted after the 48-hour deadline.

The backend must reject an early attempt with:

```json
{
  "success": false,
  "error": {
    "code": "PAYOUT_CONFIRMATION_WINDOW_OPEN",
    "message": "The beneficiary confirmation period has not expired."
  }
}
```

The resulting status is:

`CONFIRMED_BY_ORGANISER`

Never record an organiser override as a member confirmation.

### 10.4 Dispute a payout

`POST /payouts/{payoutId}/dispute`

```json
{
  "reason": "I have not received the reported transfer.",
  "evidenceReference": "DISPUTE-EVIDENCE-001"
}
```

A dispute must preserve the previous payout events and flag the relevant cycle or distribution for investigation.

Do not automatically advance a disputed payout.

## 11. Target-based distribution examples

### Calculate proposed distribution

`POST /rounds/{roundId}/target-distributions/calculate`

```json
{
  "calculationNote": "Target reached; prepare equal distribution."
}
```

The backend calculates the distributable amount and equal share using eligible members and approved financial records.

### Approve distribution

`POST /target-distributions/{distributionId}/approve`

```json
{
  "approvalNote": "Distribution reviewed and approved."
}
```

Distribution approval must be distinct from payment execution. Create separate payout records for each recipient and track each payout independently.

## 12. Withdrawal and refund examples

### Request withdrawal

`POST /groups/{groupId}/withdrawals`

```json
{
  "roundId": "round-uuid",
  "reason": "I can no longer participate in the group."
}
```

### Approve withdrawal

`POST /withdrawals/{withdrawalId}/approve`

```json
{
  "settlementNote": "Settlement reviewed and approved."
}
```

The backend must calculate the settlement using verified contributions, previous payouts, outstanding obligations and group rules.

For rotational members who already received a payout, the system must not blindly refund all contributions.

### Reject withdrawal

`POST /withdrawals/{withdrawalId}/reject`

```json
{
  "reason": "The submitted request requires further clarification."
}
```

### Record refund

`POST /withdrawals/{withdrawalId}/refunds`

```json
{
  "amount": "25000.00",
  "paymentReference": "REFUND-123",
  "paymentDate": "2026-11-10T12:00:00.000Z"
}
```

The backend must prevent duplicate refunds and retain all settlement events.

## 13. Financial summaries

### Member summary

`GET /groups/{groupId}/rounds/{roundId}/financial-summary/me`

Illustrative response:

```json
{
  "success": true,
  "data": {
    "currency": "NGN",
    "verifiedContributions": "150000.00",
    "verifiedContributionCount": 3,
    "pendingContributions": "50000.00",
    "rejectedContributions": "0.00",
    "amountReceived": "0.00",
    "expectedPayout": "500000.00",
    "transactions": []
  }
}
```

### Organiser summary

`GET /groups/{groupId}/rounds/{roundId}/financial-summary`

Return authorised group-level information, including:

- Verified contribution totals.
- Pending and rejected contributions.
- Outstanding expected contributions.
- Payouts marked sent.
- Payouts confirmed by members.
- Payouts confirmed by organisers.
- Disputed payouts.
- Outstanding payout obligations.
- Approved refunds and settlements.

Do not treat pending or reported contributions as verified money.

## 14. Receipt examples

### Get receipt

`GET /receipts/{receiptId}`

### Download PDF

`GET /receipts/{receiptId}/download`

The API should return an authorised download response or a short-lived signed URL.

The receipt must distinguish:

- Payout marked sent.
- Member-confirmed receipt.
- Organiser-confirmed receipt.
- Disputed payout.
- Confirmation timestamp.
- Receipt generation status.

A receipt records the platform's transaction status. It does not independently prove bank settlement.

## 15. Common status codes

| HTTP status | Meaning |
|---|---|
| 200 | Successful read or update |
| 201 | Resource created |
| 202 | Accepted for asynchronous processing |
| 204 | Successful operation with no response body |
| 400 | Invalid request |
| 401 | Unauthenticated |
| 403 | Authenticated but not authorised |
| 404 | Resource not found |
| 409 | Conflict, duplicate operation or invalid state transition |
| 422 | Business validation failure |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |
| 503 | Temporarily unavailable |

Suggested stable error codes include:

- `INVALID_CREDENTIALS`
- `ACCOUNT_NOT_VERIFIED`
- `ACCOUNT_SUSPENDED`
- `FORBIDDEN`
- `GROUP_MEMBER_LIMIT_EXCEEDED`
- `FREE_ENTITLEMENT_ALREADY_USED`
- `PURCHASE_NOT_VERIFIED`
- `CONTRIBUTION_ALREADY_VERIFIED`
- `PAYOUT_CONFIRMATION_WINDOW_OPEN`
- `PAYOUT_ALREADY_DISPUTED`
- `INVALID_PAYOUT_STATE`
- `WITHDRAWAL_SETTLEMENT_PENDING`
- `IDEMPOTENCY_KEY_REUSED`
- `ROUND_ALREADY_COMPLETED`

## 16. Monetary and date conventions

- Represent monetary values in JSON as decimal strings, for example `"50000.00"`.
- Never calculate money using JavaScript floating-point arithmetic.
- Use PostgreSQL `NUMERIC` or integer minor units.
- Currency is `NGN` for the initial Nigerian deployment.
- Use ISO 8601 timestamps with timezone information.
- Store timestamps consistently in UTC.
- Apply local Nigerian display formatting in the frontend.
- Use server-generated timestamps for financial events and deadline calculations.

## 17. Idempotency requirements

Require idempotency protection for:

- Group purchase activation.
- Payment verification.
- Contribution verification.
- Contribution reversal.
- Payout marking as sent.
- Payout confirmation.
- Organiser payout override.
- Refund creation.
- Target distribution approval.

Persist the idempotency key, actor, operation, request fingerprint and result. Define a retention policy suitable for financial audit requirements.

## 18. Implementation notes

1. Swagger documentation must reflect the actual DTOs and response structures.
2. Never trust group IDs or user IDs supplied by the client without checking ownership and membership.
3. Enforce permissions in the backend, not only through hidden frontend buttons.
4. Validate every state transition against the current database state.
5. Use database transactions for financial operations.
6. Use an outbox for notifications, PDF jobs and other asynchronous side effects.
7. Do not expose private evidence files through public URLs.
8. Return stable error codes for frontend handling.

**End of Document 11.**