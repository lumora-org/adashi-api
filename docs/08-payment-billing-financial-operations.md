# 08 — Payment, Billing and Financial Operations Specification

## 1. Document Purpose

This document defines how the Adashi platform handles financial operations across group purchases, member contributions, beneficiary payouts, withdrawals, refunds, and financial reporting.

It establishes the business rules and technical requirements necessary to ensure that financial activities are:

- Transparent to organisers and members.
- Properly recorded and auditable.
- Consistent across group rounds.
- Protected against duplicate transactions.
- Reconciled against actual payment reports.
- Secure against unauthorised financial actions.

The backend must remain the authoritative source of all financial records and calculations.

---

## 2. Financial Architecture Principles

The platform must follow these principles:

1. **No internal wallet in the MVP:** The platform will not maintain spendable member balances or hold group contribution funds.
2. **Separate platform revenue from group funds:** Revenue from group purchases must never be mixed with member contributions or beneficiary payouts.
3. **Immutable financial history:** Financial transactions must not be silently deleted or overwritten.
4. **Explicit verification:** A member's payment report is not proof that a payment has been received.
5. **Auditable actions:** Every important financial action must record the actor, timestamp, reason where applicable, and affected records.
6. **Server-side calculations:** All monetary calculations and financial state transitions must be validated by the backend.
7. **Idempotent operations:** Repeated requests must not create duplicate payments, receipts, refunds, or entitlements.
8. **Round-level accounting:** Every contribution, payout, withdrawal, refund, and financial report must be associated with the appropriate group and group round.

---

## 3. Financial Categories

The system must distinguish between the following financial categories.

### 3.1 Platform revenue

Money paid to the platform by organisers to activate groups or group rounds.

Examples:
- Starter plan purchase.
- Standard plan purchase.
- Premium plan purchase.
- Upgrade payment.

This money belongs to the platform and must be recorded separately from group contribution money.

### 3.2 Group contributions

Money members contribute towards a group's rotational or target-based savings arrangement.

Examples:
- Daily contribution.
- Weekly contribution.
- Monthly contribution.
- Target-based contribution.

The platform records and tracks these payments but does not hold them in an internal wallet.

### 3.3 Beneficiary payouts

Money transferred by an organiser or member to the beneficiary entitled to receive funds under the group's rules.

The system records:
- Who was supposed to receive the payout.
- The expected payout amount.
- Who marked the payout as sent.
- When it was marked as sent.
- Whether the beneficiary confirmed receipt.
- Whether an organiser confirmed on the beneficiary's behalf.
- Whether the payout was disputed.

### 3.4 Withdrawals and refunds

Money returned or settled when a member leaves a group or when an eligible group financial obligation must be refunded.

These records must be linked to the original membership, round, and relevant financial transactions.

---

## 4. Group Purchase and Billing Model

### 4.1 One-time group activation

The platform uses a one-time purchase model.

An organiser pays once to activate a group round. There is no mandatory monthly or annual recurring subscription.

When a group completes its current round and the organiser starts another round, a new purchase is required.

The group itself remains available in the organiser's account, preserving:
- Group identity.
- Group settings.
- Membership history.
- Previous rounds.
- Financial history.
- Completed payout records.

### 4.2 Proposed pricing plans

The following prices are initial configurable values, not permanent hardcoded prices.

| Plan | Maximum members | Proposed price |
|---|---:|---:|
| Starter | 10 | ₦1,000 |
| Standard | 20 | ₦2,000 |
| Premium | 50 | ₦3,500 |
| Enterprise | Custom | Custom |

The backend must store plan definitions and prices in configuration or database records.

Each plan should support:
- Name.
- Description.
- Member limit.
- Price.
- Active/inactive status.
- Effective date.
- Optional feature restrictions.

Existing purchases must preserve the price and plan details that applied when the purchase was made.

### 4.3 Group purchase lifecycle

A group purchase should follow this lifecycle:

1. Organiser selects a plan.
2. Backend checks the group and round eligibility.
3. Backend calculates the purchase amount.
4. Purchase record is created.
5. Organiser completes payment using the configured payment method.
6. Payment is verified.
7. Purchase status changes to `PAID`.
8. Group round is activated.
9. Activation is recorded in the audit log.

Suggested purchase statuses:

- `PENDING`
- `PAYMENT_REPORTED`
- `PAID`
- `FAILED`
- `CANCELLED`
- `REFUNDED`

A purchase must not activate a round merely because the frontend reports successful payment.

### 4.4 Payment verification

For the initial MVP, group purchase payments may be verified manually by an authorised platform administrator.

The payment record should include:
- Purchase ID.
- Organiser ID.
- Group ID.
- Round ID.
- Selected plan.
- Amount due.
- Amount paid.
- Payment reference.
- Payment method.
- Payment date.
- Verification status.
- Verified by.
- Verification timestamp.

If a payment gateway is introduced, verified gateway events should replace manual confirmation for supported payment methods.

### 4.5 Price changes

The platform administrator may update plan prices.

However:
- A completed purchase must retain its original price.
- A pending purchase should retain the price presented when it was created, subject to an explicit expiry policy.
- A new purchase should use the currently active price.
- Price changes must be logged.

---

## 5. Free Starter Group Entitlement

### 5.1 Entitlement rule

Every registered user receives one free Starter group activation, subject to the following restrictions:

- The free activation is available only once per user.
- The group can contain up to 10 members.
- The free entitlement cannot be transferred.
- The entitlement cannot be converted into cash.
- The entitlement cannot be restored through ordinary group deletion or cancellation.
- Creating another group does not grant another free activation.

The entitlement applies to one activation, not an unlimited free subscription.

### 5.2 Entitlement states

Use the following states:

| State | Meaning |
|---|---|
| `AVAILABLE` | User has not used the free activation. |
| `RESERVED` | User has started an activation process, but activation is not complete. |
| `USED` | Free activation has been successfully consumed. |

### 5.3 Entitlement workflow

1. User requests a free Starter activation.
2. Backend checks whether the user has an available entitlement.
3. Backend reserves the entitlement.
4. Group and round activation validations run.
5. Backend activates the round.
6. Entitlement changes to `USED`.
7. Activation and entitlement consumption are committed in one database transaction.

If activation fails before completion, the reservation may be released according to the reservation expiry policy.

A successful activation permanently consumes the entitlement.

### 5.4 Important anti-abuse rules

The backend must not restore the entitlement when:
- The organiser deletes the group.
- The organiser cancels a round.
- A member leaves the group.
- The organiser creates another group.
- The organiser closes a group.

Use a unique database constraint or equivalent enforcement to ensure that one user cannot consume multiple free entitlements.

The entitlement should be reserved and consumed transactionally to prevent concurrent activation requests from using it twice.

---

## 6. Plan Upgrade and Member Limits

An organiser may upgrade a plan when the group exceeds its current member limit.

Example:

- Current plan: Starter — ₦1,000.
- Current limit: 10 members.
- Required plan: Standard — ₦2,000.
- Upgrade difference: ₦1,000.

The organiser pays the difference between the current plan price and the required plan price.

### Upgrade rules

1. The backend verifies the current plan.
2. The backend checks the required member limit.
3. The backend calculates the difference using the applicable purchase price records.
4. An upgrade purchase is created.
5. Payment is verified.
6. The group round's plan entitlement is updated.
7. The upgrade is recorded in the audit log.

The organiser must not be allowed to exceed the plan limit while an upgrade is pending.

A plan upgrade must not reset contributions, payout order, membership history, or round history.

The system must prevent duplicate upgrade charges caused by repeated requests.

---

## 7. Contribution Collection Operations

Every group must select one of the supported collection methods.

### 7.1 Organiser collection

Members transfer contributions to the organiser's designated bank account.

Workflow:

1. System creates an expected contribution.
2. Member transfers the contribution to the organiser.
3. Member reports the payment.
4. Organiser reviews the report.
5. Organiser verifies or rejects it.
6. System updates the contribution record.
7. Financial summaries are recalculated from verified records.

### 7.2 Direct beneficiary collection

Members transfer contributions directly to the current beneficiary.

Workflow:

1. System creates an expected contribution.
2. Member transfers money to the beneficiary's designated bank account.
3. Member reports the payment.
4. Organiser reviews the report.
5. Organiser verifies or rejects it.
6. System updates the contribution record.
7. Financial summaries are recalculated.

The system must clearly identify the collection method in group settings and contribution instructions.

### 7.3 Payment reporting

A member reporting a contribution should provide:

- Contribution ID.
- Amount paid.
- Payment date.
- Payment reference, where available.
- Payment channel.
- Optional transaction evidence.
- Additional note, if necessary.

The system should support image or document evidence using private file storage.

Uploaded evidence must be access-controlled. It must not be publicly accessible through predictable URLs.

### 7.4 Contribution statuses

| Status | Meaning |
|---|---|
| `EXPECTED` | Contribution is scheduled but has not been reported. |
| `REPORTED` | Member has reported making the payment. |
| `VERIFIED` | Organiser has confirmed receipt. |
| `REJECTED` | Organiser has rejected the report. |
| `OVERDUE` | Contribution has passed its due date without verification. |
| `REVERSED` | A previously verified contribution has been reversed through an authorised process. |

A contribution should not become `VERIFIED` merely because a member uploads a receipt.

### 7.5 Contribution verification

The organiser can:
- View reported contributions.
- Review payment details.
- View submitted evidence.
- Verify a contribution.
- Reject a contribution with a reason.

The system must record:
- Verifying organiser.
- Verification timestamp.
- Previous status.
- New status.
- Rejection or reversal reason, where applicable.

### 7.6 Reversals and corrections

A verified contribution must not be edited or deleted silently.

If an error occurs:
1. An authorised user submits a correction or reversal request.
2. The system records the reason.
3. The organiser or authorised reviewer approves it.
4. A reversal record is created.
5. The original transaction remains visible.
6. Financial totals are recalculated using the valid transaction history.

A reversal must not erase the original contribution.

---

## 8. Financial Summaries

### 8.1 Member financial summary

Each member should see a financial summary for every group round.

Required information:

- Total verified contributions.
- Number of verified contributions.
- Pending contribution reports.
- Rejected contributions.
- Outstanding contributions.
- Total payouts received.
- Expected payout, where applicable.
- Refunds received.
- Contribution history.
- Payout history.

The member must be able to distinguish verified contributions from reported or rejected payments.

### 8.2 Organiser financial dashboard

The organiser should see:

- Total expected contributions.
- Total reported contributions.
- Total verified contributions.
- Total outstanding contributions.
- Total verified contributions by member.
- Total payout obligations.
- Total payouts marked as sent.
- Total payouts confirmed.
- Payouts awaiting member confirmation.
- Disputed payouts.
- Approved withdrawals.
- Refund obligations.
- Refunds completed.
- Remaining financial obligations.

### 8.3 Calculation rules

Financial summaries must be calculated from transaction records.

Do not use manually editable total fields as the source of financial truth.

Cached totals may be introduced for performance, but they must be rebuildable from the underlying records.

Use integer minor units or database `NUMERIC`/`DECIMAL` values for money. Never rely on JavaScript floating-point arithmetic for financial calculations.

For Nigerian naira, store and display amounts consistently using the chosen currency precision.

---

## 9. Payout Operations

### 9.1 Payout creation

A payout obligation is created when a member becomes entitled to receive funds under the group's rules.

For rotational groups, this is based on the beneficiary's cycle.

For target-based groups, payout obligations are created after the target distribution is approved.

Each payout must contain:
- Payout ID.
- Group ID.
- Round ID.
- Beneficiary membership ID.
- Payout amount.
- Payout type.
- Status.
- Created timestamp.
- Expected payout date, where applicable.

### 9.2 Marking a payout as sent

The organiser has an action to mark a payout as sent.

The action should require:
- Payout ID.
- Amount sent.
- Payment date.
- Payment reference, where available.
- Payment channel.
- Optional evidence.

The backend must verify that:
- The payout exists.
- The payout belongs to the organiser's group.
- The payout is eligible to be sent.
- The payout has not already been sent or cancelled.
- The amount matches the approved payout obligation, unless an authorised adjustment exists.

When the payout is successfully marked as sent:

1. Payout status changes to `SENT`.
2. `sentAt` is recorded.
3. `sentBy` is recorded.
4. A 48-hour confirmation deadline is calculated.
5. A receipt record is created automatically.
6. The beneficiary is notified.
7. An audit event is recorded.

The payout update and receipt record creation must occur in the same database transaction.

### 9.3 Member confirmation

The beneficiary receives a notification that the organiser has marked the payout as sent.

The beneficiary can select **Confirm Received**.

When confirmed:
- Status becomes `CONFIRMED_BY_MEMBER`.
- `memberConfirmedAt` is recorded.
- The member's identity is recorded.
- The receipt is updated to reflect the confirmation.
- The organiser is notified.

Only the actual beneficiary can perform member confirmation.

### 9.4 48-hour confirmation deadline

The beneficiary has 48 elapsed hours from `sentAt` to confirm receipt.

The deadline is:

`confirmationDeadline = sentAt + 48 hours`

The backend must calculate and enforce this deadline.

The frontend may display a countdown, but it must never determine whether an organiser override is allowed.

### 9.5 Organiser confirmation on behalf of a member

If the beneficiary does not confirm within 48 hours, the organiser may confirm on their behalf.

This action must not be available before the deadline.

The organiser must provide:
- A reason for the override.
- Payment reference or evidence, where available.

When the override succeeds:
- Status becomes `CONFIRMED_BY_ORGANISER`.
- `organiserConfirmedAt` is recorded.
- The organiser's identity is recorded.
- The reason is stored.
- The beneficiary is notified.
- An audit event is recorded.

The system must never label an organiser override as member confirmation.

### 9.6 Payout disputes

A beneficiary may dispute a payout if:
- They did not receive the money.
- They received a different amount.
- The payment reference is incorrect.
- The payment was reversed.
- Another relevant issue occurred.

A dispute must:
- Record the beneficiary's reason.
- Preserve the original payout details.
- Notify the organiser.
- Flag the affected financial records.
- Prevent automatic progression where the dispute affects financial integrity.

The system must allow a beneficiary to dispute a payout even after an organiser has confirmed on their behalf.

Disputes must be reviewed and resolved through an auditable process.

### 9.7 Payout statuses

Use the following state model:

| Status | Meaning |
|---|---|
| `PENDING` | Payout obligation exists but has not been marked as sent. |
| `SENT` | Organiser has recorded that the payment was sent. |
| `CONFIRMED_BY_MEMBER` | Beneficiary personally confirmed receipt. |
| `CONFIRMED_BY_ORGANISER` | Organiser confirmed after the 48-hour deadline. |
| `DISPUTED` | Beneficiary has raised a dispute. |
| `CANCELLED` | Payout was cancelled through an authorised process. |

Every status transition must be stored in a payout event/history table.

---

## 10. Automatic Payout Receipts

### 10.1 Receipt creation

Every payout marked as sent must automatically create a receipt record.

Receipt creation must not depend on whether the beneficiary has confirmed receipt.

The receipt record must be created in the same database transaction that changes the payout to `SENT`.

### 10.2 Receipt information

Each receipt should include:

- Platform name and branding.
- Unique receipt number.
- Group name.
- Group round.
- Beneficiary name.
- Payout amount.
- Payout date.
- Payment reference, where available.
- Payment channel.
- Organiser name.
- Payout status.
- Confirmation type.
- Confirmation timestamp, where applicable.
- Dispute status.
- Receipt generation date.

The receipt must clearly state that it records the payout as reported sent by the organiser. It must not claim to be independent proof of bank settlement.

### 10.3 Receipt lifecycle

Suggested receipt generation statuses:

- `GENERATING`
- `AVAILABLE`
- `FAILED`
- `SUPERSEDED`

PDF generation should run asynchronously using a background worker.

The receipt database record must exist even if PDF generation fails.

A failed generation should be retried safely without creating a second receipt record.

### 10.4 Receipt access

The organiser and beneficiary may access the receipt.

The system should support:
- Viewing receipt details.
- Downloading the PDF.
- Viewing confirmation history.
- Viewing dispute status.

Other group members must not automatically gain access to another member's private payout receipt.

### 10.5 Receipt numbering

Receipt numbers must be unique and generated by the backend.

Example format:

`ADS-PAYOUT-2026-000001`

The exact format may be configurable, but uniqueness must be enforced by a database constraint.

---

## 11. Withdrawals and Refunds

### 11.1 Withdrawal request

A member who wants to leave an active group must submit a formal withdrawal request.

The request should contain:
- Group ID.
- Round ID.
- Reason for withdrawal.
- Optional supporting evidence.
- Request timestamp.

Suggested withdrawal statuses:

- `PENDING`
- `APPROVED`
- `REJECTED`
- `SETTLEMENT_PENDING`
- `SETTLED`
- `CANCELLED`

A member must not be marked as fully withdrawn while an approved financial settlement remains outstanding.

### 11.2 Rotational Adashi withdrawal rules

A member who leaves an active rotational group is entitled to a fair settlement based on their actual financial position.

The system must not automatically refund all contributions without considering payouts already received.

For example:

- A member has contributed ₦100,000.
- The member has already received a payout of ₦150,000.
- The system must not treat the member as automatically entitled to a ₦100,000 refund.

The settlement calculation must consider:
- Verified contributions.
- Payouts already received.
- Outstanding contribution obligations.
- Approved penalties or adjustments, if the group's rules permit them.
- Any previous refunds or settlements.

The system should calculate whether the member:
- Is entitled to a refund.
- Has no remaining settlement balance.
- Owes an outstanding amount under the group's agreed rules.

A member who has not yet received their rotational payout should normally be moved to the last eligible position in the payout order, unless the organiser approves a documented exception.

### 11.3 Target-based withdrawal rules

The recommended default for target-based groups is:

1. Calculate the member's verified contributions.
2. Calculate any previous payouts or refunds.
3. Determine the refundable amount.
4. Exclude the withdrawn member from future equal distributions after the withdrawal is approved.
5. Record the settlement decision and reason.

If a target distribution has already been approved or initiated, the system must calculate the effect on the distribution before approving withdrawal.

The organiser must not be able to silently change the equal-distribution rule.

### 11.4 Refund approval

The organiser reviews the withdrawal request and settlement calculation.

The organiser can:
- Approve the request.
- Reject the request with a reason.
- Request additional information.
- Approve an authorised exception.

An approved refund becomes a separate financial payout record.

### 11.5 Refund completion

A refund must be marked as sent and confirmed using a controlled workflow.

The system must prevent:
- Duplicate refunds.
- Refunds exceeding the approved settlement.
- Refunds against invalid or reversed contributions.
- Refunds being counted twice in financial summaries.

The original contribution records must remain intact.

### 11.6 Withdrawal audit

Record:
- Requesting member.
- Reviewing organiser.
- Approval or rejection decision.
- Settlement calculation.
- Reason for decision.
- Refund amount.
- Payment reference.
- Refund status.
- Relevant timestamps.

---

## 12. Target-Based Distribution Financial Rules

Target-based groups distribute funds equally among eligible members under the confirmed group rules.

Members may contribute different amounts if the group's rules allow, but the distribution remains equal among eligible members.

### 12.1 Distribution calculation

The system must calculate the distributable amount from verified contributions and other explicitly approved adjustments.

The basic calculation is:

`Amount per member = Distributable amount / Number of eligible members`

The system must handle currency precision and rounding explicitly.

Any remainder caused by division must be allocated using a documented deterministic rule, such as assigning the smallest remaining units in a fixed membership order.

### 12.2 Distribution approval

Before creating payouts:
- The target must be reached.
- The organiser must review the financial summary.
- Eligible membership must be confirmed.
- Outstanding withdrawals and refunds must be considered.
- Blocking disputes must be resolved.
- The distribution must be approved.

### 12.3 Distribution records

Store:
- Total verified contributions.
- Approved adjustments.
- Distributable amount.
- Number of eligible members.
- Per-member distribution amount.
- Rounding adjustment.
- Distribution approval actor.
- Approval timestamp.
- Distribution status.

Once approved, the distribution calculation must be preserved. A change must require an authorised recalculation process and an audit record.

---

## 13. Round Financial Completion

A round must not be marked completed simply because the last scheduled contribution has been recorded.

### 13.1 Rotational round completion

A rotational round can be completed when:

- All required cycles have been processed.
- All eligible beneficiaries have received their payouts.
- All payout confirmations or permitted organiser confirmations are recorded.
- All approved refunds and settlements are complete.
- No blocking financial disputes remain.
- No outstanding financial obligations remain unresolved.

### 13.2 Target-based round completion

A target-based round can be completed when:

- The target distribution has been approved.
- All eligible member payouts have been processed.
- All payouts have reached an accepted confirmation state.
- All approved refunds and settlements are complete.
- No blocking financial disputes remain.
- No outstanding financial obligations remain unresolved.

Reaching the savings target alone does not complete the round.

### 13.3 Round cancellation

Round cancellation must preserve all contribution and payout history.

Before cancellation, the system must determine:
- Total verified contributions.
- Payouts already made.
- Pending payout obligations.
- Refund obligations.
- Outstanding disputes.

The system must not automatically delete financial records or assume that all contributions can be refunded without a settlement process.

The exact refund policy for a target-based round that fails to reach its target should be configurable and agreed upon before implementation.

---

## 14. Financial Transaction and Audit Data

The implementation should maintain distinct financial records rather than one generic table containing every type of money movement.

Recommended records include:

- `GroupPurchase`
- `GroupPurchasePayment`
- `Contribution`
- `ContributionEvent`
- `Payout`
- `PayoutEvent`
- `PayoutReceipt`
- `WithdrawalRequest`
- `Settlement`
- `Refund`
- `TargetDistribution`
- `FinancialAuditLog`

Every financial record should have appropriate references to:
- User.
- Group.
- Group round.
- Membership.
- Related contribution or payout.
- Actor who performed the action.
- Creation and update timestamps.

### 14.1 Financial audit requirements

For important financial actions, record:

- Actor ID.
- Actor's group role or platform role.
- Action.
- Entity type.
- Entity ID.
- Previous state.
- New state.
- Reason.
- Evidence reference, where applicable.
- Timestamp.
- Request or correlation ID.

Financial audit records must not be editable through ordinary application endpoints.

### 14.2 Transaction history

Do not silently overwrite financial events.

For corrections:
- Preserve the original record.
- Create a reversal or adjustment record.
- Link the correction to the original.
- Record the reason and approving actor.

---

## 15. Database and Concurrency Controls

Financial operations require stronger consistency controls than ordinary profile or content updates.

The backend must implement:

### 15.1 Database transactions

Use database transactions for operations such as:
- Group activation and free entitlement consumption.
- Purchase verification and round activation.
- Contribution verification.
- Payout marking and receipt creation.
- Member payout confirmation.
- Organiser payout override.
- Refund approval and settlement.
- Target distribution approval.

### 15.2 Idempotency

Operations that may be retried must support idempotency.

Examples:
- Payment verification.
- Group activation.
- Free entitlement consumption.
- Payout marking.
- Receipt creation.
- Refund processing.

Repeated requests with the same idempotency key must not create duplicate financial records.

### 15.3 Concurrency

Use database constraints, transactions, and appropriate row-level locking to prevent:

- Two organisers verifying the same payment simultaneously.
- Duplicate free entitlement consumption.
- Duplicate group purchases.
- Duplicate payout records.
- Multiple payout confirmations.
- Duplicate refunds.
- Concurrent distribution approvals.

### 15.4 Monetary data

Use:
- PostgreSQL `NUMERIC`/`DECIMAL`, or
- Integer minor currency units.

Avoid JavaScript floating-point arithmetic for financial totals.

All calculations must be validated on the backend.

---

## 16. Notifications and Background Jobs

The platform should use background jobs for non-critical asynchronous operations.

Examples:

| Event | Action |
|---|---|
| Contribution reported | Notify organiser. |
| Contribution verified | Notify member. |
| Contribution rejected | Notify member with reason. |
| Payout marked sent | Notify beneficiary. |
| Payout confirmation received | Notify organiser. |
| 48-hour deadline reached | Notify organiser that override is available. |
| Organiser confirms on behalf | Notify beneficiary. |
| Payout disputed | Notify organiser and relevant reviewers. |
| Withdrawal submitted | Notify organiser. |
| Withdrawal approved/rejected | Notify member. |
| Receipt generated | Make receipt available and notify authorised users. |
| Round completed | Notify group members. |

Notifications must not be the source of truth for financial state.

If a notification fails, the financial transaction must remain valid and the notification should be retried.

Use a reliable queue/outbox pattern so database updates and event delivery remain consistent.

---

## 17. Reporting and Reconciliation

### 17.1 Organiser reports

The organiser should be able to generate:

- Contribution report.
- Member payment status report.
- Outstanding contributions report.
- Payout report.
- Payout confirmation report.
- Disputed payouts report.
- Withdrawal and refund report.
- Round financial summary.

### 17.2 Platform administrator reports

Platform administrators should be able to review:

- Group purchase revenue.
- Purchases by plan.
- Pending purchase payments.
- Failed and refunded purchases.
- Free entitlement usage.
- Active groups and rounds.
- Financial activity summaries.

Platform administrators must not gain unrestricted access to private group financial details without an authorised operational or support reason.

### 17.3 Reconciliation

The system should support comparison between:
- Reported member payments.
- Verified contributions.
- Payouts marked sent.
- Payout confirmations.
- Group purchase payments.
- Refunds and settlements.

The platform should highlight discrepancies rather than silently adjusting financial records.

---

## 18. Security and Permissions

### Organiser permissions

An organiser may:
- View financial records for their own groups.
- Verify or reject contributions.
- Mark eligible payouts as sent.
- Confirm payouts on behalf after 48 hours.
- Review withdrawals.
- Approve or reject settlements.
- View group financial reports.

An organiser must not:
- Confirm receipt as a member.
- Override payout confirmation before the deadline.
- Delete verified financial history.
- Modify completed financial records without an authorised correction process.
- Access unrelated groups.

### Member permissions

A member may:
- View their own contribution and payout history.
- Report contributions.
- View authorised group financial summaries.
- Confirm their own payout receipt.
- Dispute their own payout.
- Request withdrawal.
- Download receipts they are authorised to access.

A member must not:
- Verify their own contribution.
- Confirm another member's payout.
- Modify another member's financial records.
- Access private receipts belonging to another member without permission.

### Platform administrator permissions

Platform administrators may:
- Manage plan pricing.
- Verify platform purchase payments where manual verification is used.
- Review platform revenue reports.
- Manage platform billing configuration.
- Investigate authorised support cases.

Platform administration must be separated from group-level financial authority.

---

## 19. MVP Scope and Future Enhancements

### MVP

The first release should include:

- One-time group purchases.
- Configurable pricing plans.
- One-time free Starter entitlement.
- Manual purchase payment verification.
- Manual contribution reporting and verification.
- Organiser collection and direct beneficiary collection.
- Payout marking and confirmation.
- 48-hour organiser override.
- Payout disputes.
- Automatic receipt record creation.
- PDF receipt generation.
- Withdrawal requests.
- Refund and settlement records.
- Financial dashboards and reports.
- Audit logs.
- Round-level financial history.

### Future enhancements

The following may be introduced after the MVP:

- Payment gateway integration.
- Automated contribution collection.
- Automated beneficiary payouts.
- Provider-supported payment reconciliation.
- Bank transaction matching.
- Automated recurring payment reminders.
- Advanced financial analytics.
- More sophisticated dispute resolution workflows.

Any future feature that handles or controls customer funds must undergo appropriate legal, regulatory, security, and payment-provider review before implementation.

---

## 20. Acceptance Criteria

The financial module is ready for MVP release when the following conditions are met:

1. A user can consume only one free Starter activation.
2. Deleting a group does not restore a consumed free entitlement.
3. A paid group round activates only after payment verification.
4. A group upgrade charges only the calculated difference.
5. Platform purchase revenue is separate from group contributions.
6. Members can report contributions without automatically verifying them.
7. Organisers can verify or reject reported contributions.
8. Verified contributions are not silently editable or deletable.
9. Members can see their own verified contribution and payout history.
10. Organisers can see financial summaries for their own groups.
11. Organisers can mark eligible payouts as sent.
12. Every payout marked sent creates a receipt record automatically.
13. Beneficiaries can confirm receipt using their own accounts.
14. Organiser confirmation on behalf is unavailable before 48 hours.
15. Organiser overrides are recorded as `CONFIRMED_BY_ORGANISER`.
16. Beneficiaries can dispute payouts, including after organiser override.
17. Receipts can be downloaded by authorised users.
18. Withdrawal settlement accounts for previous contributions and payouts.
19. Duplicate refunds and duplicate payouts are prevented.
20. Target-based distributions are calculated equally among eligible members.
21. Round completion checks outstanding financial obligations.
22. Financial history is preserved after a round is completed.
23. Financial operations are protected by database transactions and idempotency controls.
24. Important financial actions are recorded in audit logs.

---

## 21. Final Implementation Rule

The Adashi platform must treat financial records as a controlled history of real-world payment events, not as editable account balances.

The platform records what members report, what organisers verify, what organisers mark as sent, what beneficiaries confirm, and what authorised reviewers resolve.

It must always distinguish between:

- Money expected.
- Money reported.
- Money verified.
- Money marked as sent.
- Money confirmed received.
- Money disputed.
- Money refunded or settled.

This distinction is essential to building a transparent and trustworthy Adashi platform.