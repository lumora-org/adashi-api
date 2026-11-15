# 13 — Admin Portal and Platform Super Administration Specification

**Project:** Adashi Contribution and Savings Management Platform  
**Document:** Admin Portal and Platform Super Administration Specification  
**Audience:** Product designers, frontend developers, backend developers, QA engineers  
**Status:** Core product specification

---

## 1. Purpose

This document defines the administrative portal used by the platform owner and authorised platform administrators.

The Super Admin portal is a first-class part of Adashi. It must not be treated as an optional dashboard or a collection of unfinished admin endpoints.

The platform owner must be able to oversee users, groups, rounds, billing, platform revenue, disputes, reports, system settings and administrator access.

## 2. Platform roles and authority

Adashi uses two permission layers.

### 2.1 Platform-level roles

| Role | Responsibility |
|---|---|
| SUPER_ADMIN | Full platform governance and administration |
| PLATFORM_ADMIN | Operational administration within assigned permissions |
| PLATFORM_SUPPORT | Customer support and limited account assistance |
| PLATFORM_FINANCE | Platform purchase verification and revenue reporting |
| PLATFORM_AUDITOR | Read-only audit and oversight access |

These are platform roles. They must not be confused with group participation.

### 2.2 Group-level relationships

| Relationship | Responsibility |
|---|---|
| Organiser | Manages their own group and rounds |
| Member | Participates in a group |
| Delegated Group Officer | Performs specific organiser-approved tasks |

One user may have multiple group relationships. For example, a user can organise one group and participate as a member in another.

A platform administrator must not automatically become an organiser or member of a group.

## 3. How the platform owner gets registered

### 3.1 Recommended initial account creation

The first Super Admin account must be provisioned through a controlled bootstrap process.

Do not provide a public Super Admin registration form.

Recommended procedure:

1. Deploy the backend and database.
2. Run a dedicated bootstrap command from the trusted deployment environment.
3. The command checks whether a Super Admin already exists.
4. If none exists, it creates a time-limited, single-use owner invitation.
5. The invitation is sent to the configured owner email address.
6. The owner opens the invitation and verifies control of the email address.
7. The owner sets a strong password.
8. The owner configures two-factor authentication.
9. The backend creates the first `SUPER_ADMIN` account.
10. The bootstrap invitation and setup secret are permanently invalidated.

The bootstrap command must refuse to run if a Super Admin already exists.

Example command:

```bash
npm run admin:bootstrap
```

The command must not print passwords, setup tokens or secrets into application logs.

### 3.2 Alternative secure provisioning

A deployment operator may create the initial owner invitation through a protected one-time deployment secret. The same one-time and no-existing-owner conditions must apply.

Do not:

- Hardcode the owner password.
- Store a default Super Admin password in source control.
- Permit role assignment through public registration.
- Allow an unauthenticated API endpoint to create Super Admin accounts.
- Rely on manually editing a production database as the normal registration process.

### 3.3 Owner account security

Require:

- Verified email.
- Strong password.
- Multi-factor authentication.
- Secure session handling.
- Login rate limiting.
- Login and session audit records.
- Recovery procedures.
- Notification of critical account changes.

Provide a recovery process that does not create a permanent bypass around MFA.

## 4. Admin portal routes

Recommended deployment arrangement:

- Public website: `adashi.com`
- User application: `app.adashi.com`
- Admin portal: `admin.adashi.com`
- API: `api.adashi.com`

These are proposed domains, not claims of availability.

Suggested route structure:

```text
/admin
├── login
├── setup
├── overview
├── users
├── groups
├── rounds
├── billing
│   ├── purchases
│   ├── plans
│   └── entitlements
├── financial-oversight
├── disputes
├── reports
├── notifications
├── administrators
├── audit-logs
├── settings
└── profile
```

The admin portal must use the same trusted identity service but apply separate platform-level authorisation policies.

## 5. Admin dashboard

The dashboard should present a concise operational overview.

### Summary metrics

- Total registered users.
- Active users.
- Suspended users.
- Total groups.
- Active groups.
- Active rounds.
- Completed rounds.
- Pending platform purchases.
- Verified platform purchase revenue.
- Pending disputes.
- Outstanding operational alerts.

### Dashboard charts

Recommended charts:

- User registration over time.
- New groups over time.
- Active versus completed rounds.
- Platform purchase revenue over time.
- Purchase verification status.
- Contribution and payout activity trends.

Important: Platform purchase revenue is not group contribution money. Never combine these into one revenue metric.

### Recent activity

Show:

- Recent registrations.
- Group activations.
- Purchase verifications.
- Account suspensions.
- Dispute submissions.
- Administrator actions.
- System alerts.

All dashboard figures must be calculated from authoritative records and clearly identify their date range.

## 6. User management

### User list screen

Columns:

- Name.
- Email.
- Phone number.
- Account status.
- Verification status.
- Registration date.
- Last login.
- Number of groups.
- Actions.

Features:

- Search by name, email or phone.
- Filter by account status.
- Filter by verification status.
- Filter by registration period.
- Pagination.
- Export authorised user reports.

### User details screen

Display:

- Profile information.
- Account status.
- Verification history.
- Group participation history.
- Organised groups.
- Security events available to the administrator.
- Support history.
- Relevant audit events.

Sensitive credentials, password hashes, MFA secrets and authentication tokens must never be displayed.

### User actions

- View account.
- Suspend account.
- Reactivate account.
- Initiate a verification resend.
- Revoke active sessions.
- Record an administrative note.
- Review support history.

Suspension requires a reason and confirmation.

Suspension should prevent login or protected actions according to policy, but must not delete financial records or erase a user's transaction history.

## 7. Group management

### Group list

Display:

- Group name.
- Group type.
- Organiser.
- Member count.
- Current round.
- Collection method.
- Group status.
- Creation date.

### Group details

Display:

- Group profile.
- Organiser details.
- Membership list.
- Round history.
- Contribution summaries.
- Payout summaries.
- Withdrawal records.
- Disputes.
- Relevant audit events.

### Administrative actions

- View group.
- Suspend group activity.
- Restore group activity.
- Review reported abuse.
- Record an administrative note.
- Escalate a dispute.
- Review round history.

Suspending a group must not delete it or silently change its financial records.

The system must record the reason, administrator, timestamp and affected resources.

## 8. Round management

The Super Admin can view all rounds across the platform.

Filters:

- Active.
- In progress.
- Awaiting distribution.
- Completed.
- Cancelled.
- Suspended.
- Pending payment.

Round details should include:

- Group.
- Round number.
- Activation date.
- Plan purchased.
- Member count.
- Contribution progress.
- Payout progress.
- Unresolved financial obligations.
- Dispute status.

A Super Admin may suspend a round for a legitimate operational or safety reason, but must not silently mark it completed or rewrite its history.

## 9. Billing and platform revenue

### 9.1 Purchase management

Display:

- Purchase reference.
- Group.
- Organiser.
- Plan.
- Amount.
- Currency.
- Payment method.
- Payment status.
- Evidence.
- Verification administrator.
- Verification timestamp.

### 9.2 Purchase actions

Authorised billing administrators can:

- View purchase.
- Review evidence.
- Approve payment.
- Reject payment.
- Request clarification.
- Record verification reference.

Every decision requires an audit record.

### 9.3 Plan management

Manage:

- Plan name.
- Plan code.
- Member limit.
- Price.
- Currency.
- Availability.
- Effective date.
- Version.

Initial illustrative plans:

| Plan | Member limit | Illustrative price |
|---|---:|---:|
| Starter | 10 | ₦1,000 |
| Standard | 20 | ₦2,000 |
| Premium | 50 | ₦3,500 |
| Enterprise | Custom | Custom |

Prices must be configurable from the backend.

Changing a plan price must not rewrite historical purchases. Store the price and plan details as a snapshot at purchase time.

### 9.4 Upgrade management

If a group exceeds its current plan limit, the organiser must pay the applicable upgrade difference before the higher limit is activated.

The backend must calculate the difference using the applicable plan versions and prevent duplicate upgrade charges.

### 9.5 Free entitlement oversight

Display:

- User.
- Entitlement state.
- Reservation date.
- Activation date.
- Group activated.
- Entitlement event history.

States:

- `AVAILABLE`
- `RESERVED`
- `USED`

An administrator must not casually reset a consumed free entitlement. Any exceptional correction must require a documented reason, elevated permission and immutable audit event.

## 10. Financial oversight

This module is for oversight and investigation. It is not a wallet or money-custody interface.

### Platform administrators may view

- Verified contributions.
- Reported contributions.
- Rejected contributions.
- Reversed contributions.
- Payouts marked sent.
- Payout confirmations.
- Disputed payouts.
- Withdrawals.
- Settlements.
- Refunds.
- Relevant payment references and evidence, subject to access permissions.

### Financial oversight rules

- Do not combine platform revenue with group contribution totals.
- Do not allow silent edits to financial amounts.
- Do not delete financial events.
- Do not provide an unrestricted transfer or withdrawal button.
- Use controlled correction workflows with reason, approval and audit trail.
- Restrict evidence access to authorised roles.
- Mask sensitive account information where appropriate.

## 11. Dispute management

### Dispute queue

Display:

- Dispute reference.
- Group.
- Round.
- Payout or contribution reference.
- Reporting member.
- Organiser.
- Submission date.
- Dispute category.
- Current status.

### Dispute details

Display:

- Original financial record.
- Related events.
- Member explanation.
- Organiser response.
- Uploaded evidence.
- Relevant payment references.
- Previous administrative actions.

### Dispute workflow

1. Member submits a dispute.
2. Backend records the dispute and relevant financial event.
3. Relevant cycle or distribution is flagged.
4. Organiser is notified.
5. Authorised support or dispute administrator reviews the case.
6. Additional information may be requested.
7. Decision is recorded with reason.
8. Parties are notified.
9. The case is closed or escalated.

Do not overwrite the original payout confirmation. Preserve all previous states and events.

Dispute resolution must not imply that the platform has independently verified a bank transfer unless appropriate evidence supports that conclusion.

## 12. Administrator management

### Administrator invitation

`POST /admin/administrators/invitations`

Example:

```json
{
  "email": "operations@example.com",
  "fullName": "Operations Officer",
  "platformRole": "PLATFORM_SUPPORT",
  "permissions": [
    "users.read",
    "groups.read",
    "disputes.read",
    "disputes.manage"
  ]
}
```

The invitation must be:

- Sent to the intended email.
- Time-limited.
- Single-use.
- Revocable.
- Linked to the inviting administrator.
- Logged.

The invited administrator must establish their own password and MFA.

### Administrator roles

| Role | Default access |
|---|---|
| SUPER_ADMIN | All platform administration |
| PLATFORM_ADMIN | Explicitly assigned operational permissions |
| PLATFORM_SUPPORT | User and group support |
| PLATFORM_FINANCE | Purchase verification and platform revenue |
| PLATFORM_AUDITOR | Read-only oversight |

Use permission-based authorisation in addition to roles.

### Administrator actions

- Invite administrator.
- Change permissions.
- Suspend administrator access.
- Revoke sessions.
- Revoke invitations.
- Review administrator activity.

Do not permit an administrator to grant themselves additional permissions.

High-risk role changes should require Super Admin approval and an audit record.

## 13. Reports and analytics

Recommended reports:

- User registrations.
- Active users.
- Group creation.
- Group activation.
- Round completion.
- Plan distribution.
- Platform revenue.
- Purchase verification.
- Free entitlement usage.
- Contribution activity.
- Payout activity.
- Disputes.
- Withdrawals and refunds.
- Administrator activity.

Allow date filters and CSV export for authorised users.

Financial reports must identify whether amounts are reported, verified, sent, confirmed or disputed.

## 14. Notifications and announcements

Super Admin can manage:

- Platform announcement banners.
- Maintenance notices.
- Policy update notifications.
- User account notifications.
- Purchase status notifications.
- Security alerts.

Bulk announcements must have:

- Target audience.
- Message content.
- Delivery channel.
- Scheduled or immediate status.
- Author.
- Creation timestamp.
- Delivery status.

Do not allow arbitrary bulk messaging without rate limits and abuse controls.

## 15. Platform settings

Configurable settings may include:

- Platform name.
- Logo.
- Support email.
- Support phone number.
- Terms and conditions version.
- Privacy policy version.
- Default currency.
- Allowed file types.
- Upload size limits.
- Notification preferences.
- Maintenance mode.
- Session security settings.

High-risk settings require confirmation and audit logging.

Do not allow configuration changes that bypass the financial state machine or disable essential audit logging.

## 16. Admin audit log screen

Display:

- Actor.
- Platform role.
- Action.
- Resource type.
- Resource ID.
- Timestamp.
- IP address where lawfully collected.
- Reason.
- Before/after metadata where safe.
- Request or correlation ID.

Audit records must be append-only to ordinary application users.

Do not log passwords, access tokens, refresh tokens, MFA secrets or unnecessary sensitive data.

## 17. Admin interface design

Use a professional dashboard layout.

### Desktop

- Persistent left sidebar.
- Top navigation.
- Search.
- Notification area.
- Administrator profile menu.
- Main content area.

### Mobile

- Responsive navigation drawer.
- Compact dashboard cards.
- Scrollable tables or responsive data lists.
- Accessible action menus.
- Clear confirmation dialogs for high-risk operations.

Recommended visual identity:

- Emerald: `#087F5B`
- Navy: `#142B3B`
- Gold: `#E7B54A`
- Off-white: `#F6F8F7`

Use status labels consistently:

- Active.
- Pending.
- Suspended.
- Completed.
- Rejected.
- Disputed.
- Requires review.

## 18. Recommended backend modules

```text
src/modules/admin/
├── admin.module.ts
├── auth/
├── bootstrap/
├── dashboard/
├── users/
├── groups/
├── rounds/
├── billing/
├── entitlements/
├── financial-oversight/
├── disputes/
├── reports/
├── notifications/
├── administrators/
├── permissions/
├── settings/
└── audit/
```

Each module should use dedicated controllers, services, DTOs, guards and permission policies where appropriate.

## 19. Essential admin API endpoints

```text
POST   /admin/bootstrap/initial-owner
GET    /admin/dashboard/overview

GET    /admin/users
GET    /admin/users/:userId
POST   /admin/users/:userId/suspend
POST   /admin/users/:userId/reactivate
POST   /admin/users/:userId/revoke-sessions

GET    /admin/groups
GET    /admin/groups/:groupId
POST   /admin/groups/:groupId/suspend
POST   /admin/groups/:groupId/reactivate

GET    /admin/rounds
GET    /admin/rounds/:roundId

GET    /admin/billing/group-purchases
GET    /admin/billing/group-purchases/:purchaseId
POST   /admin/billing/group-purchases/:purchaseId/verify
POST   /admin/billing/group-purchases/:purchaseId/reject

GET    /admin/plans
POST   /admin/plans
PATCH  /admin/plans/:planId

GET    /admin/entitlements

GET    /admin/financial-oversight
GET    /admin/disputes
GET    /admin/disputes/:disputeId
POST   /admin/disputes/:disputeId/resolve
POST   /admin/disputes/:disputeId/escalate

POST   /admin/administrators/invitations
GET    /admin/administrators
PATCH  /admin/administrators/:adminId/permissions
POST   /admin/administrators/:adminId/suspend
POST   /admin/administrators/:adminId/revoke-sessions

GET    /admin/reports
GET    /admin/audit-logs
GET    /admin/settings
PATCH  /admin/settings
```

The bootstrap route is not a normal public registration endpoint. It must be protected by the deployment bootstrap mechanism and disabled permanently after initial owner creation.

## 20. Acceptance criteria

The admin portal is ready when:

1. The owner can securely create the initial Super Admin account.
2. Public registration cannot create a Super Admin.
3. The owner can invite and manage administrators.
4. Permissions are enforced by the backend.
5. All users, groups and rounds can be monitored.
6. Platform purchases and revenue are clearly separated from group funds.
7. Financial oversight preserves transaction history.
8. Disputes can be investigated and resolved.
9. Admin actions create immutable audit events.
10. The portal works on desktop and mobile.
11. Sensitive evidence and account information are protected.
12. Critical actions require confirmation and appropriate authority.

**End of Document 13.**