# Adashi Platform — API Specification

**Document:** 04 — API Specification  
**Platform:** Adashi  
**API Architecture:** REST  
**API Version:** v1  
**Base Path:** `/api/v1`  
**Backend:** NestJS  
**Database:** PostgreSQL  
**Authentication:** JWT  
**Currency:** NGN

---

# 1. Introduction

## 1.1 Purpose

This document defines the REST API contract for the Adashi platform.

It specifies:

- API endpoints.
- HTTP methods.
- Request payloads.
- Response structures.
- Authentication requirements.
- Group-level permissions.
- Validation rules.
- Error handling.
- Financial transaction rules.
- Integration requirements.

The frontend application will consume these APIs.

The backend must enforce all business rules independently of the frontend.

## 1.2 API conventions

Base URL:

```text
/api/v1
```

Example:

```text
GET /api/v1/groups
```

### HTTP methods

| Method | Purpose |
|---|---|
| GET | Retrieve records |
| POST | Create records or execute an action |
| PATCH | Update specific fields or status |
| PUT | Replace a resource where appropriate |
| DELETE | Remove non-financial resources where permitted |

Financial records must not be physically deleted.

## 1.3 Response format

All successful responses should follow a consistent structure.

Example:

```json
{
  "success": true,
  "message": "Group retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "Community Adashi"
  },
  "meta": null
}
```

For paginated results:

```json
{
  "success": true,
  "message": "Groups retrieved successfully",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

## 1.4 Error format

```json
{
  "success": false,
  "message": "You have already used your free Starter access",
  "error": {
    "code": "FREE_ENTITLEMENT_ALREADY_USED",
    "details": null
  }
}
```

The backend should return appropriate HTTP status codes.

| Status | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Resource created |
| 204 | Successful request without response body |
| 400 | Invalid request |
| 401 | Unauthenticated |
| 403 | Not authorised |
| 404 | Resource not found |
| 409 | Conflict or duplicate operation |
| 422 | Business rule validation failure |
| 429 | Too many requests |
| 500 | Internal server error |

---

# 2. Authentication and User APIs

Base path:

`/api/v1/auth`

## 2.1 Register user

**POST** `/auth/register`

Public endpoint.

Request:

```json
{
  "firstName": "Ahmad",
  "lastName": "Abdulkareem",
  "email": "ahmad@example.com",
  "phoneNumber": "+2348012345678",
  "password": "StrongPassword123!"
}
```

Response:

```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "Ahmad",
      "lastName": "Abdulkareem",
      "email": "ahmad@example.com",
      "accountStatus": "ACTIVE"
    },
    "freeStarterEntitlement": {
      "status": "AVAILABLE",
      "memberLimit": 10
    }
  }
}
```

Business rules:

- Email must be unique.
- Phone number must be unique where supplied.
- Password must meet security requirements.
- Password must be hashed.
- A free Starter entitlement must be created exactly once for the new user.
- The entitlement must not be consumed during registration.
- Registration must not automatically create an active group.

User creation and initial entitlement creation should be transactional.

## 2.2 Login

**POST** `/auth/login`

Request:

```json
{
  "email": "ahmad@example.com",
  "password": "StrongPassword123!"
}
```

Response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "Ahmad",
      "lastName": "Abdulkareem",
      "email": "ahmad@example.com"
    },
    "accessToken": "access-token",
    "expiresIn": 900
  }
}
```

The refresh token should be issued through a secure HttpOnly cookie for browser clients.

## 2.3 Refresh session

**POST** `/auth/refresh`

Uses the secure refresh-token cookie.

Response:

```json
{
  "success": true,
  "message": "Session refreshed successfully",
  "data": {
    "accessToken": "new-access-token",
    "expiresIn": 900
  }
}
```

Rotate refresh tokens and revoke the previous session token.

## 2.4 Logout

**POST** `/auth/logout`

Authentication required.

Response:

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

Revoke the current session and clear its refresh cookie.

## 2.5 Forgot password

**POST** `/auth/forgot-password`

Request:

```json
{
  "email": "ahmad@example.com"
}
```

Return a generic success message to avoid revealing whether an email belongs to an account.

## 2.6 Reset password

**POST** `/auth/reset-password`

Request:

```json
{
  "token": "reset-token",
  "newPassword": "NewStrongPassword123!"
}
```

Invalidate the reset token after successful use.

## 2.7 Get current user

**GET** `/auth/me`

Authentication required.

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "Ahmad",
    "lastName": "Abdulkareem",
    "email": "ahmad@example.com",
    "phoneNumber": "+2348012345678",
    "accountStatus": "ACTIVE"
  }
}
```

## 2.8 User profile

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/users/me` | Retrieve profile |
| PATCH | `/users/me` | Update profile |
| POST | `/users/me/profile-image` | Upload profile image |
| PATCH | `/users/me/password` | Change password |

---

# 3. Plans and Free Starter Entitlement APIs

Base paths:

- `/api/v1/plans`
- `/api/v1/entitlements`

These endpoints are central to Adashi's commercial model.

## 3.1 Get available plans

**GET** `/plans`

Public endpoint.

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "starter-plan-id",
      "name": "Starter",
      "memberLimit": 10,
      "price": 1000,
      "currency": "NGN",
      "billingType": "ONE_TIME"
    },
    {
      "id": "standard-plan-id",
      "name": "Standard",
      "memberLimit": 20,
      "price": 2000,
      "currency": "NGN",
      "billingType": "ONE_TIME"
    },
    {
      "id": "premium-plan-id",
      "name": "Premium",
      "memberLimit": 50,
      "price": 3500,
      "currency": "NGN",
      "billingType": "ONE_TIME"
    }
  ]
}
```

The prices above are initial configurable examples.

The backend must retrieve prices from the database rather than hardcoding them.

## 3.2 Get my free entitlement

**GET** `/entitlements/me`

Authentication required.

Response when available:

```json
{
  "success": true,
  "data": {
    "entitlementType": "FREE_STARTER",
    "status": "AVAILABLE",
    "memberLimit": 10,
    "usedAt": null
  }
}
```

Response when already used:

```json
{
  "success": true,
  "data": {
    "entitlementType": "FREE_STARTER",
    "status": "USED",
    "memberLimit": 10,
    "usedAt": "2026-11-07T10:00:00Z"
  }
}
```

## 3.3 Reserve free Starter entitlement

**POST** `/entitlements/reserve`

Authentication required.

Request:

```json
{
  "groupRoundId": "uuid"
}
```

Response:

```json
{
  "success": true,
  "message": "Free Starter access reserved successfully",
  "data": {
    "entitlementId": "uuid",
    "groupRoundId": "uuid",
    "status": "RESERVED",
    "memberLimit": 10
  }
}
```

Rules:

- User must have an available entitlement.
- User must own the group.
- The group round must be eligible.
- The group must not exceed 10 members.
- A reservation must not consume the entitlement.
- A user cannot reserve the same entitlement for multiple rounds simultaneously.
- Reservation expiry and release rules must be enforced.

## 3.4 Activate free Starter round

**POST** `/entitlements/activate`

Authentication required.

Request:

```json
{
  "groupRoundId": "uuid"
}
```

Response:

```json
{
  "success": true,
  "message": "Your free Starter group round has been activated",
  "data": {
    "groupRoundId": "uuid",
    "entitlementStatus": "USED",
    "roundStatus": "ACTIVE",
    "memberLimit": 10
  }
}
```

Rules:

- Validate the entitlement reservation.
- Validate group ownership.
- Validate the member limit.
- Validate required group configuration.
- Activate the round.
- Consume the entitlement permanently.
- Record the activation in the audit log.

All steps must happen in a database transaction.

A user must not be able to activate two free rounds through simultaneous requests.

---

# 4. Group Management APIs

Base path:

`/api/v1/groups`

Authentication required unless explicitly stated otherwise.

## 4.1 Create group

**POST** `/groups`

Request:

```json
{
  "name": "Community Adashi",
  "description": "Monthly community savings group",
  "groupType": "ROTATIONAL",
  "paymentCollectionMethod": "ORGANISER"
}
```

Response:

```json
{
  "success": true,
  "message": "Group created successfully",
  "data": {
    "id": "group-uuid",
    "name": "Community Adashi",
    "groupCode": "ADS-ABC123",
    "groupType": "ROTATIONAL",
    "status": "DRAFT"
  }
}
```

Creating a group does not automatically activate a round or consume free access.

## 4.2 List my groups

**GET** `/groups?page=1&limit=20`

Returns groups in which the authenticated user participates.

The response must indicate the user's role in each group.

Example:

```json
{
  "success": true,
  "data": [
    {
      "id": "group-uuid",
      "name": "Community Adashi",
      "myRole": "ORGANISER",
      "groupType": "ROTATIONAL",
      "status": "ACTIVE",
      "activeRound": {
        "id": "round-uuid",
        "roundNumber": 1
      }
    },
    {
      "id": "another-group-uuid",
      "name": "Family Savings",
      "myRole": "MEMBER",
      "groupType": "TARGET_BASED",
      "status": "ACTIVE"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

## 4.3 Get group details

**GET** `/groups/:groupId`

Returns group details and the authenticated user's membership information.

## 4.4 Update group

**PATCH** `/groups/:groupId`

Organiser permission required.

Request:

```json
{
  "name": "Updated Community Adashi",
  "description": "Updated group description"
}
```

Sensitive configuration changes must be restricted once a round is active, or require a documented change-approval process.

## 4.5 Close group

**POST** `/groups/:groupId/close`

Organiser permission required.

The group cannot be closed while unresolved financial obligations remain unless a controlled cancellation and settlement process is used.

---

# 5. Group Membership APIs

Base path:

`/api/v1/groups/:groupId/members`

## 5.1 Invite member

**POST** `/groups/:groupId/members/invite`

Organiser permission required.

Request:

```json
{
  "email": "member@example.com",
  "firstName": "Aisha",
  "lastName": "Lawal"
}
```

The system should support invitations for registered and unregistered users.

Response:

```json
{
  "success": true,
  "message": "Invitation sent successfully",
  "data": {
    "invitationId": "uuid",
    "status": "INVITED"
  }
}
```

## 5.2 Join using invitation code

**POST** `/groups/join`

Authentication required.

Request:

```json
{
  "groupCode": "ADS-ABC123"
}
```

The backend validates the invitation, group status and available member capacity.

## 5.3 Accept invitation

**POST** `/groups/invitations/:invitationId/accept`

## 5.4 Reject invitation

**POST** `/groups/invitations/:invitationId/reject`

## 5.5 List group members

**GET** `/groups/:groupId/members`

Organiser permission required for the full membership list.

Member access should expose only information allowed by group privacy settings.

## 5.6 Remove member

**POST** `/groups/:groupId/members/:membershipId/remove`

Organiser permission required.

Removal must not erase historical contributions or payouts.

A member with outstanding financial obligations must go through the withdrawal or settlement process.

---

# 6. Group Round APIs

Base path:

`/api/v1/groups/:groupId/rounds`

## 6.1 Create group round

**POST** `/groups/:groupId/rounds`

Organiser permission required.

Rotational example:

```json
{
  "groupType": "ROTATIONAL",
  "contributionAmount": 10000,
  "contributionFrequency": "MONTHLY",
  "startDate": "2026-12-01",
  "expectedEndDate": "2027-11-30",
  "payoutOrder": [
    {
      "groupMembershipId": "membership-1",
      "position": 1
    },
    {
      "groupMembershipId": "membership-2",
      "position": 2
    }
  ]
}
```

Target-based example:

```json
{
  "groupType": "TARGET_BASED",
  "targetAmount": 1000000,
  "allowVariableContributions": true,
  "startDate": "2026-12-01",
  "targetDeadline": "2027-06-30"
}
```

The backend validates the round type and required configuration.

## 6.2 List rounds

**GET** `/groups/:groupId/rounds`

## 6.3 Get round details

**GET** `/rounds/:roundId`

## 6.4 Update draft round

**PATCH** `/rounds/:roundId`

Only draft rounds can be freely reconfigured.

Changes to active rounds must follow controlled configuration-change rules.

## 6.5 Activate a paid round

**POST** `/rounds/:roundId/activate`

This endpoint should only be used when the round has a valid successful purchase.

For free Starter activation, use the entitlement activation endpoint.

## 6.6 Complete round

**POST** `/rounds/:roundId/complete`

Organiser permission required.

The backend must independently verify all completion requirements.

The frontend cannot directly force a round to `COMPLETED`.

## 6.7 Cancel round

**POST** `/rounds/:roundId/cancel`

Requires a reason.

If the round has already started financial operations, the backend must require a settlement process before final cancellation.

---

# 7. Billing and Purchase APIs

Base path:

`/api/v1/billing`

## 7.1 Create new round purchase

**POST** `/billing/purchases`

Request:

```json
{
  "groupRoundId": "round-uuid",
  "planId": "standard-plan-uuid",
  "purchaseType": "NEW_ROUND"
}
```

Response:

```json
{
  "success": true,
  "message": "Purchase initiated",
  "data": {
    "purchaseId": "purchase-uuid",
    "amount": 2000,
    "currency": "NGN",
    "paymentStatus": "PENDING",
    "paymentUrl": "https://payment-provider.example/checkout"
  }
}
```

The actual payment URL must come from the configured provider.

## 7.2 Verify purchase payment

**POST** `/billing/purchases/:purchaseId/verify`

The backend verifies the transaction directly with the provider.

The frontend must not be able to mark a purchase successful by submitting its own success status.

## 7.3 Get purchase history

**GET** `/billing/purchases?page=1&limit=20`

## 7.4 Get purchase details

**GET** `/billing/purchases/:purchaseId`

## 7.5 Upgrade group plan

**POST** `/billing/groups/:groupId/upgrade`

Request:

```json
{
  "groupRoundId": "round-uuid",
  "newPlanId": "premium-plan-uuid"
}
```

Response:

```json
{
  "success": true,
  "message": "Upgrade payment initiated",
  "data": {
    "currentPlan": "STARTER",
    "newPlan": "PREMIUM",
    "previousPrice": 1000,
    "newPrice": 3500,
    "upgradeAmount": 2500,
    "currency": "NGN",
    "paymentStatus": "PENDING"
  }
}
```

The amount must be calculated on the backend using the applicable historical purchase price and new plan price.

## 7.6 Payment webhook

**POST** `/webhooks/payments/:provider`

Public endpoint with provider signature verification.

The backend must:

- Validate the signature.
- Validate provider reference.
- Validate amount and currency.
- Prevent duplicate processing.
- Update the purchase status.
- Activate the round only after verified successful payment.
- Record the event in the audit trail.

Webhook delivery must be idempotent.

---

# 8. Contribution APIs

Base path:

`/api/v1/contributions`

## 8.1 Create contribution record

**POST** `/contributions`

Organiser or member permission, depending on the reporting flow.

Member report example:

```json
{
  "groupRoundId": "round-uuid",
  "contributionCycleId": "cycle-uuid",
  "amount": 10000,
  "paymentMethod": "BANK_TRANSFER",
  "transactionReference": "TRF123456",
  "paymentDate": "2026-12-05T10:00:00Z"
}
```

Response:

```json
{
  "success": true,
  "message": "Contribution reported successfully",
  "data": {
    "id": "contribution-uuid",
    "amount": 10000,
    "status": "REPORTED"
  }
}
```

A member-submitted payment must not automatically become verified.

An organiser-recorded payment may be verified through a separate authorised action. The system must record the organiser as the actor.

## 8.2 List contributions

**GET** `/contributions?groupRoundId=uuid&page=1&limit=20`

Organisers can view group contributions.

Members can retrieve only their authorised contribution records.

## 8.3 Get contribution details

**GET** `/contributions/:contributionId`

## 8.4 Verify contribution

**POST** `/contributions/:contributionId/verify`

Organiser permission required.

Request:

```json
{
  "note": "Bank transfer confirmed"
}
```

## 8.5 Reject contribution

**POST** `/contributions/:contributionId/reject`

Request:

```json
{
  "reason": "Payment could not be confirmed"
}
```

## 8.6 Reverse contribution

**POST** `/contributions/:contributionId/reverse`

Requires an authorised actor and reason.

Never physically delete a verified contribution.

## 8.7 Upload contribution evidence

**POST** `/contributions/:contributionId/evidence`

Use multipart form data.

## 8.8 Member contribution summary

**GET** `/contributions/my-summary?groupRoundId=uuid`

Example:

```json
{
  "success": true,
  "data": {
    "totalVerifiedContributions": 150000,
    "verifiedPaymentCount": 15,
    "reportedAmount": 10000,
    "outstandingAmount": 10000,
    "totalPayoutsReceived": 100000,
    "currency": "NGN"
  }
}
```

All figures must be calculated from authoritative financial records.

---

# 9. Contribution Cycle APIs

Base path:

`/api/v1/contribution-cycles`

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/contribution-cycles` | Create contribution cycle |
| GET | `/contribution-cycles` | List cycles |
| GET | `/contribution-cycles/:id` | Get cycle details |
| PATCH | `/contribution-cycles/:id` | Update permitted cycle details |
| POST | `/contribution-cycles/:id/close` | Close cycle |

Cycle creation and closure must validate round configuration and permissions.

For rotational groups, cycles must reference the relevant beneficiary.

---

# 10. Payout APIs

Base path:

`/api/v1/payouts`

This module manages payouts for both Rotational and Target-Based Adashi.

## 10.1 Create payout

**POST** `/payouts`

Organiser permission required.

Request:

```json
{
  "groupRoundId": "round-uuid",
  "contributionCycleId": "cycle-uuid",
  "beneficiaryRoundMemberId": "round-member-uuid",
  "amount": 150000,
  "paymentMethod": "BANK_TRANSFER"
}
```

The backend validates:

- Beneficiary belongs to the round.
- Payout amount is valid.
- Payout is permitted by the round's rules.
- The payout is not a duplicate.
- The organiser is authorised.

## 10.2 List payouts

**GET** `/payouts?groupRoundId=uuid&page=1&limit=20`

Organisers see the group's payouts.

Members see only payouts they are authorised to access.

## 10.3 Get payout details

**GET** `/payouts/:payoutId`

## 10.4 Approve payout

**POST** `/payouts/:payoutId/approve`

Organiser permission required.

## 10.5 Mark payout as sent

**POST** `/payouts/:payoutId/mark-sent`

Organiser permission required.

Request:

```json
{
  "paymentMethod": "BANK_TRANSFER",
  "paymentReference": "BANKREF123456",
  "paymentDate": "2026-12-10T12:00:00Z",
  "note": "Transferred to beneficiary"
}
```

Response:

```json
{
  "success": true,
  "message": "Payout marked as sent successfully",
  "data": {
    "payoutId": "payout-uuid",
    "status": "SENT",
    "amount": 150000,
    "sentAt": "2026-12-10T12:00:00Z",
    "confirmationDeadline": "2026-12-12T12:00:00Z",
    "receipt": {
      "id": "receipt-uuid",
      "receiptNumber": "AD-PAY-2026-000001",
      "status": "GENERATING"
    }
  }
}
```

Important backend operations:

1. Verify organiser permission.
2. Verify payout approval.
3. Record payout as sent.
4. Record sending user and timestamp.
5. Set deadline to exactly 48 elapsed hours after the recorded sent timestamp.
6. Create a unique receipt record.
7. Queue PDF generation.
8. Queue notification delivery.
9. Record an audit event.

The financial status change and receipt creation must be transaction-safe.

The PDF generation and notifications may complete asynchronously.

## 10.6 Confirm payout received

**POST** `/payouts/:payoutId/confirm-received`

Beneficiary permission required.

Request:

```json
{
  "confirmationNote": "I have received the payment"
}
```

Response:

```json
{
  "success": true,
  "message": "Payout receipt confirmed successfully",
  "data": {
    "payoutId": "payout-uuid",
    "status": "CONFIRMED_BY_MEMBER",
    "confirmedAt": "2026-12-11T09:00:00Z",
    "confirmationMethod": "MEMBER"
  }
}
```

Rules:

- Only the beneficiary can confirm their own payout.
- Payout must be in `SENT` status.
- Confirmation must not already exist.
- Confirmation is recorded with the authenticated user and timestamp.
- The organiser receives a notification.

The member can confirm after the 48-hour period as long as the organiser has not already performed an override and the payout has not entered a conflicting state.

## 10.7 Organiser confirms receipt on behalf of member

**POST** `/payouts/:payoutId/confirm-on-behalf`

Organiser permission required.

Request:

```json
{
  "reason": "Member has not responded after the 48-hour confirmation period",
  "evidenceReference": "BANKREF123456"
}
```

Response:

```json
{
  "success": true,
  "message": "Payout recorded as received by organiser",
  "data": {
    "payoutId": "payout-uuid",
    "status": "CONFIRMED_BY_ORGANISER",
    "confirmedAt": "2026-12-12T12:30:00Z",
    "confirmationMethod": "ORGANISER"
  }
}
```

Rules:

- Only the organiser of the relevant group can perform this action.
- The 48-hour deadline must have passed.
- Payout must still be `SENT`.
- A reason is mandatory.
- Supporting evidence should be provided where available.
- The action must be audited.
- The member must be notified.
- The system must not impersonate the member.

## 10.8 Dispute payout

**POST** `/payouts/:payoutId/dispute`

Beneficiary permission required.

Request:

```json
{
  "reason": "I have not received this payment"
}
```

Response:

```json
{
  "success": true,
  "message": "Payout dispute submitted successfully",
  "data": {
    "payoutId": "payout-uuid",
    "status": "DISPUTED"
  }
}
```

A dispute must preserve the original payout and confirmation history.

## 10.9 Resolve payout dispute

**POST** `/payouts/:payoutId/resolve-dispute`

Organiser or authorised dispute-resolution administrator permission required.

Request:

```json
{
  "resolution": "RESOLVED",
  "resolutionNotes": "Bank transfer evidence reviewed and member confirmed receipt"
}
```

Resolution must be audited.

Do not automatically change the payout to a confirmed state without a documented resolution outcome.

## 10.10 Payout confirmation status

**GET** `/payouts/:payoutId/confirmation-status`

Response:

```json
{
  "success": true,
  "data": {
    "status": "SENT",
    "sentAt": "2026-12-10T12:00:00Z",
    "confirmationDeadline": "2026-12-12T12:00:00Z",
    "hoursRemaining": 18,
    "canMemberConfirm": true,
    "canOrganiserOverride": false
  }
}
```

The backend calculates eligibility using the server's current time.

The frontend must not calculate whether an organiser is allowed to override.

---

# 11. Receipt APIs

Base path:

`/api/v1/receipts`

## 11.1 Get receipt

**GET** `/receipts/:receiptId`

Returns receipt details to authorised users.

## 11.2 Get receipt by payout

**GET** `/receipts/by-payout/:payoutId`

## 11.3 List my receipts

**GET** `/receipts/my?page=1&limit=20`

Returns receipts accessible to the authenticated user.

## 11.4 Download receipt

**GET** `/receipts/:receiptId/download`

Returns an authorised PDF download or a short-lived signed download URL.

## 11.5 Regenerate receipt

**POST** `/receipts/:receiptId/regenerate`

Restricted to authorised administrative or system operations.

Regeneration must preserve previous receipt versions.

## 11.6 Receipt response example

```json
{
  "success": true,
  "data": {
    "id": "receipt-uuid",
    "receiptNumber": "AD-PAY-2026-000001",
    "groupName": "Community Adashi",
    "roundNumber": 1,
    "beneficiary": "Member A",
    "amount": 150000,
    "currency": "NGN",
    "paymentMethod": "BANK_TRANSFER",
    "paymentReference": "BANKREF123456",
    "paymentStatus": "CONFIRMED_BY_MEMBER",
    "sentAt": "2026-12-10T12:00:00Z",
    "confirmedAt": "2026-12-11T09:00:00Z",
    "confirmationMethod": "MEMBER",
    "downloadAvailable": true
  }
}
```

The receipt must distinguish payment recorded as sent from beneficiary-confirmed receipt.

---

# 12. Target-Based Distribution APIs

Base path:

`/api/v1/target-distributions`

## 12.1 Get target progress

**GET** `/target-distributions/progress/:roundId`

Response:

```json
{
  "success": true,
  "data": {
    "targetAmount": 1000000,
    "totalVerifiedContributions": 750000,
    "remainingAmount": 250000,
    "progressPercentage": 75,
    "eligibleMemberCount": 10,
    "status": "IN_PROGRESS"
  }
}
```

## 12.2 Calculate distribution

**POST** `/target-distributions/:roundId/calculate`

Organiser permission required.

The backend calculates:

- Total distributable amount.
- Eligible members.
- Equal share.
- Currency rounding remainder.

Calculation must not itself issue payouts.

## 12.3 Get calculated distribution

**GET** `/target-distributions/:distributionId`

## 12.4 Approve distribution

**POST** `/target-distributions/:distributionId/approve`

Organiser permission required.

The backend validates the distribution calculation and creates individual payout obligations.

## 12.5 List distribution items

**GET** `/target-distributions/:distributionId/items`

## 12.6 Get member distribution share

**GET** `/target-distributions/:distributionId/my-share`

Returns only the authenticated member's authorised share.

All actual disbursements must use the common payout and receipt workflow.

---

# 13. Withdrawal APIs

Base path:

`/api/v1/withdrawals`

## 13.1 Request withdrawal

**POST** `/withdrawals`

Member permission required.

Request:

```json
{
  "groupRoundId": "round-uuid",
  "reason": "I need to withdraw due to personal circumstances"
}
```

The backend calculates the preliminary settlement.

Response:

```json
{
  "success": true,
  "message": "Withdrawal request submitted successfully",
  "data": {
    "id": "withdrawal-uuid",
    "status": "PENDING",
    "verifiedContributionTotal": 100000,
    "amountAlreadyReceived": 0,
    "proposedRefundAmount": 100000
  }
}
```

This is a proposed settlement, not an automatic refund approval.

## 13.2 List withdrawal requests

**GET** `/withdrawals?groupRoundId=uuid`

Organiser can view group requests.

Member can view only their own requests.

## 13.3 Get withdrawal details

**GET** `/withdrawals/:withdrawalId`

## 13.4 Approve withdrawal

**POST** `/withdrawals/:withdrawalId/approve`

Organiser permission required.

Request:

```json
{
  "approvedRefundAmount": 100000,
  "reason": "Request approved"
}
```

## 13.5 Reject withdrawal

**POST** `/withdrawals/:withdrawalId/reject`

Request:

```json
{
  "reason": "Withdrawal cannot be approved under the current settlement conditions"
}
```

## 13.6 Cancel withdrawal request

**POST** `/withdrawals/:withdrawalId/cancel`

Allowed only when the request is still eligible for cancellation.

---

# 14. Refund APIs

Base path:

`/api/v1/refunds`

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/refunds/:withdrawalId/record-sent` | Record refund as sent |
| POST | `/refunds/:refundId/confirm-received` | Member confirms refund |
| POST | `/refunds/:refundId/dispute` | Member disputes refund |
| GET | `/refunds` | List authorised refunds |
| GET | `/refunds/:refundId` | Get refund details |
| GET | `/refunds/my` | Member refund history |

Refunds must reference an approved withdrawal obligation.

Do not create multiple active refund records for the same approved obligation.

---

# 15. Notification APIs

Base path:

`/api/v1/notifications`

## 15.1 List notifications

**GET** `/notifications?page=1&limit=20`

## 15.2 Get notification

**GET** `/notifications/:notificationId`

## 15.3 Mark as read

**PATCH** `/notifications/:notificationId/read`

## 15.4 Mark all as read

**PATCH** `/notifications/read-all`

## 15.5 Get unread count

**GET** `/notifications/unread-count`

Example:

```json
{
  "success": true,
  "data": {
    "unreadCount": 4
  }
}
```

Users must only access their own notifications.

---

# 16. Dashboard and Reporting APIs

Base path:

`/api/v1/reports`

## 16.1 Unified dashboard

**GET** `/reports/dashboard`

Returns groups in which the user participates, separated into organiser and member contexts.

Example:

```json
{
  "success": true,
  "data": {
    "organiserGroupsCount": 2,
    "memberGroupsCount": 3,
    "pendingConfirmations": 1,
    "pendingContributions": 5,
    "unreadNotifications": 4
  }
}
```

## 16.2 Organiser group summary

**GET** `/reports/groups/:groupId/summary?roundId=uuid`

Returns:

- Total verified contributions.
- Outstanding contributions.
- Total payouts.
- Confirmed payouts.
- Payouts awaiting confirmation.
- Disputed payouts.
- Refund obligations.
- Remaining payout obligations.
- Current round status.

## 16.3 Member group summary

**GET** `/reports/groups/:groupId/my-summary?roundId=uuid`

Returns:

- Member's verified contributions.
- Pending contributions.
- Outstanding contributions.
- Payouts received.
- Expected payout.
- Refund history.
- Personal transaction history.

## 16.4 Contribution report

**GET** `/reports/groups/:groupId/contributions`

Supports pagination, date filters, member filters and status filters.

## 16.5 Payout report

**GET** `/reports/groups/:groupId/payouts`

Supports filters for:

- Beneficiary.
- Payout status.
- Date range.
- Confirmation method.
- Dispute status.

## 16.6 Financial report export

**POST** `/reports/groups/:groupId/export`

Request:

```json
{
  "roundId": "round-uuid",
  "reportType": "FINANCIAL_SUMMARY",
  "format": "PDF"
}
```

The backend can process large exports asynchronously.

---

# 17. Super Admin APIs

Base path:

`/api/v1/admin`

Super Admin permission required.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/admin/dashboard` | Platform overview |
| GET | `/admin/users` | List users |
| GET | `/admin/users/:userId` | User details |
| PATCH | `/admin/users/:userId/status` | Suspend or reactivate user |
| GET | `/admin/groups` | List groups |
| GET | `/admin/purchases` | Platform purchase records |
| GET | `/admin/plans` | Manage plans |
| POST | `/admin/plans` | Create plan |
| PATCH | `/admin/plans/:planId` | Update plan |
| GET | `/admin/audit-logs` | Review audit history |
| GET | `/admin/disputes` | Review authorised disputes |

Super Admin actions must be audited.

Super Admin access must not provide silent editing of member contributions or payout records.

---

# 18. API Authentication and Authorisation

Protected endpoints require a valid access token.

Example:

```http
Authorization: Bearer ACCESS_TOKEN
```

The backend must validate:

- Token validity.
- User account status.
- Session validity where applicable.
- Resource ownership or group membership.
- Group-level permissions.
- Round-level permissions.

Use guards and permission decorators, but do not rely on global roles alone.

Example permission decorators:

```typescript
@UseGuards(JwtAuthGuard, GroupPermissionGuard)
@RequireGroupPermission('PAYOUT_MARK_SENT')
```

Permissions must be evaluated using the authenticated user and the actual group/round record.

---

# 19. Idempotency and Duplicate Protection

Financial endpoints must be protected against duplicate submissions.

For important financial operations, support an `Idempotency-Key` request header.

Example:

```http
Idempotency-Key: 6f8e2c1a-unique-operation-id
```

Recommended endpoints:

- Create group purchase.
- Verify purchase.
- Verify contribution.
- Mark payout as sent.
- Confirm payout.
- Confirm payout on behalf.
- Approve target distribution.
- Record refund.

The backend should store and validate idempotency keys with their operation scope.

A repeated request with the same key and same payload should return the original result.

A repeated key with a different payload should return a conflict error.

Also use database constraints and transactions. Idempotency keys do not replace database-level duplicate protection.

---

# 20. Validation and Business Rules

The following rules must be enforced server-side.

## Authentication

- Unique email.
- Unique phone number where supplied.
- Secure password hashing.
- Valid session refresh.
- Account status checks.

## Groups

- Only an organiser can manage their group.
- Group capacity cannot exceed the applicable plan limit.
- Users cannot join the same group twice.
- Historical group records must remain intact.

## Free Starter entitlement

- One entitlement per user.
- One-time use only.
- Maximum of 10 members.
- Reservation must not be confused with consumption.
- A consumed entitlement cannot be restored through ordinary group deletion or cancellation.
- Entitlement activation must be transaction-safe.

## Billing

- One-time purchase per paid group round.
- No monthly or annual recurring subscription in the MVP.
- Upgrades charge the applicable difference.
- Payment must be verified server-side.
- Platform revenue is separate from group funds.

## Contributions

- Only authorised users can record or verify contributions.
- Member-reported payments remain unverified until approved.
- Verified records cannot be silently edited.
- Financial summaries must be calculated from transaction records.

## Payouts

- Only an authorised organiser can mark a payout as sent.
- Only the beneficiary can confirm their payout.
- The confirmation deadline is 48 elapsed hours.
- Organiser override is allowed only after the deadline.
- An organiser override requires a reason.
- The member must be notified.
- The member can dispute the organiser's confirmation.
- Payout receipt generation must be triggered when payment is marked as sent.

## Round completion

A round must not become completed while there are:

- Unresolved payout disputes.
- Unsettled payout obligations.
- Outstanding approved refund obligations.
- Other unresolved financial liabilities.

The backend must calculate completion eligibility.

---

# 21. Standard Error Codes

| Error code | Meaning |
|---|---|
| `INVALID_CREDENTIALS` | Incorrect login details |
| `ACCOUNT_SUSPENDED` | Account suspended |
| `GROUP_NOT_FOUND` | Group does not exist or is inaccessible |
| `GROUP_ACCESS_DENIED` | User lacks group permission |
| `GROUP_CAPACITY_EXCEEDED` | Member limit reached |
| `ROUND_NOT_FOUND` | Round does not exist |
| `ROUND_NOT_ACTIVE` | Operation not allowed for round status |
| `FREE_ENTITLEMENT_NOT_AVAILABLE` | No free access available |
| `FREE_ENTITLEMENT_ALREADY_USED` | Free access already consumed |
| `FREE_ENTITLEMENT_RESERVED` | Entitlement already reserved |
| `PLAN_LIMIT_EXCEEDED` | Current plan limit exceeded |
| `PURCHASE_PAYMENT_REQUIRED` | Successful purchase required |
| `PAYMENT_VERIFICATION_FAILED` | Payment could not be verified |
| `CONTRIBUTION_ALREADY_VERIFIED` | Contribution already verified |
| `CONTRIBUTION_NOT_FOUND` | Contribution not found |
| `PAYOUT_NOT_FOUND` | Payout not found |
| `PAYOUT_NOT_SENT` | Payout has not been marked as sent |
| `PAYOUT_ALREADY_CONFIRMED` | Payout already confirmed |
| `PAYOUT_CONFIRMATION_DEADLINE_NOT_REACHED` | Organiser override attempted too early |
| `PAYOUT_CONFIRMATION_EXPIRED` | Confirmation deadline passed |
| `PAYOUT_NOT_BENEFICIARY` | User is not the beneficiary |
| `PAYOUT_DISPUTED` | Payout is under dispute |
| `RECEIPT_NOT_FOUND` | Receipt not found |
| `WITHDRAWAL_NOT_ALLOWED` | Withdrawal not allowed |
| `REFUND_ALREADY_RECORDED` | Refund already exists |
| `ROUND_HAS_OUTSTANDING_OBLIGATIONS` | Round cannot be completed |
| `DUPLICATE_REQUEST` | Duplicate operation |
| `VALIDATION_ERROR` | Request validation failed |

---

# 22. API Development Standards

All controllers must:

- Use DTO validation.
- Return consistent response formats.
- Enforce authentication.
- Enforce resource-level authorisation.
- Use appropriate HTTP status codes.
- Avoid returning sensitive internal data.
- Document endpoints in Swagger.

All services must:

- Enforce business rules.
- Use transactions for financial operations.
- Prevent duplicate financial actions.
- Record important audit events.
- Trigger reliable notifications and background jobs.
- Avoid trusting client-supplied ownership information.

All financial operations should use database transactions and appropriate row locking.

Use `NUMERIC` database fields and decimal-safe arithmetic. Do not use JavaScript floating-point arithmetic for money calculations.

Use decimal arithmetic or integer minor units for calculations and serialise monetary values consistently in API responses.

---

# 23. Suggested API Implementation Order

| Phase | API modules |
|---|---|
| 1 | Authentication and Users |
| 2 | Plans and Entitlements |
| 3 | Groups and Memberships |
| 4 | Group Rounds |
| 5 | Billing and Purchases |
| 6 | Contributions and Cycles |
| 7 | Payouts and Receipts |
| 8 | Target Distributions |
| 9 | Withdrawals and Refunds |
| 10 | Notifications and Reports |
| 11 | Super Admin and Audit Logs |
| 12 | Payment integrations and webhooks |

Implement and test each module before moving to the next phase.

---

# 24. Final API Architecture Decisions

| Area | Decision |
|---|---|
| API style | REST |
| Base path | `/api/v1` |
| Authentication | JWT |
| Browser refresh | Secure HttpOnly cookie |
| Request validation | DTO validation |
| Documentation | Swagger |
| Pagination | Page and limit |
| Financial operations | Transaction-safe |
| Duplicate protection | Idempotency keys and database constraints |
| Free access | Dedicated entitlement endpoints |
| Group purchase | One-time per round |
| Contributions | Manual reporting and verification |
| Payout | Organiser records payment as sent |
| Member confirmation | Authenticated beneficiary action |
| Confirmation period | 48 elapsed hours |
| Organiser override | After deadline with reason |
| Receipt generation | Automatic after payout is marked as sent |
| Disputes | Dedicated dispute workflow |
| Financial reports | Backend-calculated |

---

# 25. Conclusion

This API specification establishes the communication contract between the Adashi frontend and backend.

It ensures that:

- Organisers can manage their groups and rounds.
- Members can participate in multiple groups.
- Every user receives only one free Starter entitlement.
- Paid group rounds use one-time purchases.
- Contributions are traceable and verifiable.
- Payouts have a transparent confirmation workflow.
- Every payout marked as sent generates a receipt.
- The 48-hour confirmation period is enforced by the backend.
- Organiser overrides are auditable.
- Members can dispute recorded payouts.
- Financial records remain reliable and traceable.

The backend must remain the authoritative source of truth for all financial operations, entitlement usage, permissions and group-round completion.

**This document should be used as the API contract during NestJS backend and Next.js frontend implementation.**