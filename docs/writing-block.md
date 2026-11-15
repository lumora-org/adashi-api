# Adashi Platform
## Product Requirements Document — Updated

### 1. Product Overview

The Adashi Platform is a mobile-first Progressive Web Application (PWA) that digitises traditional contribution and savings groups.

It enables organisers to create and manage groups, invite members, track contributions, monitor outstanding payments, manage beneficiary rotations, record distributions and maintain transparent financial records.

The platform supports two operating models:

1. **Rotational Adashi:** Members contribute regularly, and one member receives the accumulated contributions during each cycle until every eligible member has received their turn.
2. **Target-Based Adashi:** Members continuously contribute towards a shared savings target. Once the target is achieved, the distributable amount is shared equally among eligible members.

A public landing page will explain the platform, its features, pricing and registration process.

### 2. Confirmed Business Decisions

| Requirement | Decision |
|---|---|
| Platform | Mobile-first PWA |
| Organiser accounts | Multiple groups per organiser |
| Member participation | Multiple groups per member |
| Group types | Rotational and Target-Based |
| Target-based distribution | Equal distribution |
| Payment collection | Organiser collection or direct beneficiary collection |
| Group billing | One-time payment per group round |
| Subscription renewal | Required for each new round |
| Group completion | All eligible members must receive their payouts |
| Member withdrawal | Refund of own contributions, normally last in payout order |
| Currency | Nigerian Naira (NGN) |
| Public website | Required |

### 3. User Roles

**Super Admin**
- Manage the platform.
- Manage users, groups and pricing plans.
- Monitor platform revenue and group purchases.
- Review platform transactions.
- Suspend groups or accounts when necessary.
- Access platform-level reports and audit logs.

**Organiser**
- Create multiple Adashi groups.
- Configure group operating rules.
- Purchase and renew group rounds.
- Invite and manage members.
- Track contributions and outstanding payments.
- Verify manually reported payments.
- Manage beneficiary order and payouts.
- Process withdrawal requests.
- View group financial reports.

**Member**
- Maintain one account.
- Join multiple groups.
- View group-specific contribution rules.
- View personal contribution history and totals.
- Report payments where permitted.
- View outstanding contributions.
- View beneficiary schedules and payout status.
- Request withdrawal from a group.
- Receive notifications.
- View distribution records.

A user may organise one group and participate as a member in other groups.

### 4. Group and Group-Round Structure

A group represents a continuing relationship between an organiser and its members.

A group round represents one complete operational run of that group.

For example:
- Organiser creates "Family Adashi".
- Organiser purchases its first round.
- Members contribute and receive their payouts.
- All eligible members receive their payouts.
- Round 1 becomes COMPLETED.
- Organiser purchases another round.
- Round 2 begins with a new contribution and payout schedule.

Previous rounds remain available for historical viewing and reporting.

Renewal must not erase, overwrite or reset previous financial records.

### 5. Group Subscription and Pricing

The organiser pays once to activate each group round.

Proposed pricing:

| Plan | Maximum members | One-time payment |
|---|---:|---:|
| Starter | 10 | ₦1,000 |
| Standard | 20 | ₦2,000 |
| Premium | 50 | ₦3,500 |
| Enterprise | Custom | Custom |

Rules:
- No monthly or annual recurring charges.
- A new group requires a new purchase.
- A completed group round requires payment before a new round can begin.
- The payment covers the entire operational round, regardless of how long it takes.
- If the group exceeds its plan limit, the organiser must upgrade and pay the difference.
- The platform must retain the original purchase and upgrade records.
- A group round must not become active until its purchase is successfully verified.

The group purchase is separate from member contributions and group payout funds.

### 6. Group Status and Subscription Lifecycle

Recommended group statuses:

- DRAFT
- PENDING_PAYMENT
- ACTIVE
- COMPLETED
- SUSPENDED
- CLOSED

Recommended round statuses:

- DRAFT
- PENDING_PAYMENT
- ACTIVE
- IN_PROGRESS
- AWAITING_DISTRIBUTION
- COMPLETED
- CANCELLED

A group round becomes COMPLETED only when all eligible members have received their required payouts and all required financial settlements have been recorded.

Upon completion:
- The round status becomes COMPLETED.
- Its subscription entitlement expires.
- The organiser can view historical records.
- New contribution activity cannot be started in the completed round.
- The organiser can purchase a new round.

The system must not mark a round completed merely because its contribution target or collection schedule has ended.

### 7. Rotational Adashi

Members contribute a configured amount at a configured interval.

Supported frequencies:
- Daily
- Weekly
- Every two weeks
- Every three weeks
- Monthly

At the end of each cycle, the designated beneficiary receives the accumulated group contributions.

Required features:
- Contribution amount and frequency.
- Member list.
- Beneficiary order.
- Cycle generation.
- Contribution tracking.
- Outstanding contribution tracking.
- Total collected per cycle.
- Beneficiary payout tracking.
- Payout confirmation.
- Remaining beneficiaries.
- Round completion tracking.

The organiser must configure the beneficiary order before the round starts.

Changes to the beneficiary order must be recorded in the audit history.

### 8. Target-Based Adashi

Members continuously contribute towards a shared financial target.

Required configuration:
- Target amount.
- Contribution rules.
- Optional target deadline.
- Eligible members.
- Equal distribution rule.

Members may contribute different amounts if permitted by the group's rules.

Required tracking:
- Individual contributions.
- Total accumulated contributions.
- Target progress.
- Contribution history.
- Target achievement.
- Distributable amount.
- Equal distribution calculation.
- Individual payout records.

**Equal distribution rule:**

Once the target is achieved and distribution is approved, the distributable amount is divided equally among eligible members.

The system must:
- Calculate the amount due to each eligible member.
- Display the total distributable amount.
- Display each member's expected share.
- Handle rounding differences transparently.
- Record each payout separately.
- Track outstanding payouts.
- Require organiser approval before final distribution.

The equal distribution rule must be disclosed and accepted by members before the round starts.

### 9. Contribution Tracking and Payment Verification

Contribution status and payout status must be separate.

Contribution statuses:
- EXPECTED
- REPORTED
- VERIFIED
- REJECTED
- OVERDUE
- REVERSED, where applicable

Payout statuses:
- NOT_DUE
- PENDING
- APPROVED
- PAID
- DISPUTED
- CANCELLED

A member may have completed all their contributions but still be awaiting their payout.

Every contribution must have:
- Group and round reference.
- Member reference.
- Amount.
- Payment date.
- Payment method.
- Payment reference, where available.
- Verification status.
- Recorded by.
- Verified by.
- Audit timestamps.

A payment reported by a member must not automatically be treated as verified bank settlement.

### 10. Payment Collection Methods

Each group supports two collection methods.

**Organiser Collection**
- Members transfer contributions to the organiser's registered account.
- The organiser records or verifies each payment.
- The system updates the contribution record.

**Direct Beneficiary Collection**
- Members transfer contributions directly to the current beneficiary's account.
- The organiser records or verifies the payment.
- The system associates the contribution with the appropriate cycle and beneficiary.

The group must select its collection method when configured.

The system must preserve the payment method used for each contribution.

### 11. Member Withdrawal

A member can request to leave an active group.

Default withdrawal policy:
- The member is entitled to receive only the total amount they personally contributed.
- Their withdrawal request is recorded.
- Their verified contribution total is calculated automatically.
- Their refund is tracked as a separate financial obligation.
- Normally, they are placed last in the payout order.
- If they have a valid reason, the organiser may approve an exception to the normal payout order.

Withdrawal workflow:
1. Member submits withdrawal request.
2. Member provides a reason.
3. System calculates verified contributions.
4. Organiser reviews the request.
5. Organiser approves or rejects it.
6. If approved, the member's refund obligation is recorded.
7. Payout is processed and confirmed.
8. Membership is marked as withdrawn.

The system must record the organiser's decision and reason for any exception.

A withdrawal refund must not be counted as a normal beneficiary payout.

A member who has already received a rotational payout requires a separate settlement calculation before withdrawal can be approved. The system must not automatically refund all contributions without accounting for money already received.

### 12. Financial Transparency

Every member must have a personal financial summary for each group round.

Members can view:
- Total amount contributed.
- Number of verified contributions.
- Pending contributions.
- Rejected contributions.
- Outstanding contributions.
- Amount received from the group.
- Expected payout, where applicable.
- Contribution and payout history.

Organisers can view:
- Total contributed by each member.
- Total group contributions.
- Outstanding contributions.
- Total verified collections.
- Total payouts.
- Remaining payout obligations.
- Withdrawal requests.
- Refund obligations.
- Overall financial position.

Financial totals must be calculated from transaction records rather than manually maintained summary values.

The platform should provide downloadable reports where appropriate.

### 13. Group Completion Rules

For Rotational Adashi:
- All required contribution cycles must be processed.
- All eligible beneficiaries must have their payouts recorded as PAID.
- Approved withdrawals and refund obligations must be settled.
- Outstanding payout obligations must be zero.
- Only then can the round become COMPLETED.

For Target-Based Adashi:
- The target must be achieved or the organiser must follow an explicitly approved alternative closure process.
- The distributable amount must be calculated.
- Equal distribution must be approved.
- All eligible members must receive their payouts.
- Approved withdrawal/refund obligations must be settled.
- Only then can the round become COMPLETED.

The system must not treat an organiser's manual status change as sufficient proof of payment. Payout records must be completed and verified.

### 14. Notifications

The system should support:
- New group invitation.
- Contribution reminder.
- Payment reported.
- Payment verified.
- Payment rejected.
- Contribution overdue.
- Beneficiary turn approaching.
- Payout recorded.
- Withdrawal request received.
- Withdrawal approved or rejected.
- Group target reached.
- Distribution approved.
- Group round completed.
- New round purchase confirmed.

### 15. Public Landing Page

The landing page must include:
1. Hero section.
2. How the platform works.
3. Rotational Adashi explanation.
4. Target-Based Adashi explanation.
5. Platform features.
6. Pricing plans.
7. Trust and transparency section.
8. Frequently asked questions.
9. Registration and login links.

The website must be mobile-first and clearly explain that the platform helps groups manage records and accountability.

### 16. Core Platform Modules

1. Public Website
2. Authentication and User Management
3. Organiser Dashboard
4. Member Dashboard
5. Group Management
6. Group Membership
7. Group Rounds
8. Group Purchases and Billing
9. Contribution Configuration
10. Contribution Tracking
11. Rotational Cycle Management
12. Beneficiary Management
13. Target-Based Savings
14. Equal Distribution
15. Payment Records and Verification
16. Withdrawal and Refund Management
17. Notifications
18. Reports and Financial History
19. Super Admin Management
20. Audit Logs

### 17. Financial Integrity and Security

The platform must:
- Keep platform purchase revenue separate from group contribution money.
- Preserve financial transaction history.
- Record who creates, verifies, approves and confirms transactions.
- Prevent duplicate payment recording.
- Prevent duplicate payouts.
- Prevent unauthorised modification of financial records.
- Maintain an audit trail of configuration changes.
- Use appropriate transaction controls for financial operations.
- Keep group data isolated.
- Ensure members can only access records for groups they belong to.
- Ensure organisers can only manage groups they own or are authorised to manage.

The MVP may use manual payment reporting and organiser verification. Automated collection, custody and payout services require appropriate licensed payment partners and regulatory review.

### 18. Initial MVP Scope

The first release should include:
- Public landing page.
- Registration, login and account management.
- Multiple groups per organiser.
- Multiple groups per member.
- Group creation and one-time round purchase.
- Rotational Adashi.
- Target-Based Adashi.
- Contribution tracking.
- Manual payment verification.
- Beneficiary scheduling.
- Equal target-based distribution.
- Member withdrawal requests.
- Refund tracking.
- Individual contribution summaries.
- Organiser financial dashboards.
- Group completion and renewal.
- Super Admin dashboard.
- Reports and audit logs.
