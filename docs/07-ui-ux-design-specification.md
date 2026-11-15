# 07 — Adashi Platform UI/UX Design Specification

**Document:** Frontend UI/UX Design Specification  
**Project:** Adashi Contribution and Savings Management Platform  
**Version:** 1.0  
**Status:** Proposed — Design and Implementation Guide  
**Platform:** Mobile-first Progressive Web App  
**Currency:** Nigerian Naira (NGN)

---

## 1. Design Objective

Adashi should make managing group contributions and savings simple, transparent, and trustworthy.

The design must support two different user experiences:

- **Organisers:** Need tools to manage groups, members, contributions, payouts, refunds, and reports.
- **Members:** Need a straightforward way to see their obligations, report payments, track their financial position, and confirm payouts.

The interface should not feel like a complicated accounting application.

Users should be able to understand the important financial information without navigating through multiple pages.

### Core design principles

1. Mobile-first.
2. Simple navigation.
3. Clear financial information.
4. Transparent transaction history.
5. Consistent status indicators.
6. Minimal unnecessary steps.
7. Strong confirmation for sensitive actions.
8. Responsive layouts.
9. Accessible typography and colour contrast.
10. Consistent experience across all group types.

---

## 2. Visual Identity and Design Direction

The product should have a modern financial-technology appearance without looking too corporate or complicated.

### 2.1 Suggested colour palette

| Colour | Hex | Purpose |
|---|---|---|
| Deep Emerald | `#087F5B` | Primary actions and branding |
| Dark Navy | `#142B3B` | Headings and navigation |
| Warm Gold | `#E7B54A` | Highlights and important information |
| Soft Background | `#F6F8F7` | Main page background |
| White | `#FFFFFF` | Cards and surfaces |
| Slate | `#52616B` | Secondary text |
| Success Green | `#168A55` | Successful transactions |
| Warning Amber | `#D99116` | Pending actions |
| Error Red | `#D64545` | Errors and rejected transactions |
| Border Grey | `#E3E9E6` | Dividers and card borders |

Use emerald as the primary brand colour, with navy providing contrast and gold used sparingly.

### 2.2 Typography

Recommended fonts:

- Inter
- Manrope
- Plus Jakarta Sans

Use one primary font throughout the platform.

Typography should be readable on smaller screens.

Financial amounts should use consistent font weight and number formatting.

### 2.3 UI style

Use:

- Rounded cards.
- Subtle shadows.
- Clear borders.
- Comfortable spacing.
- Simple line icons.
- Consistent button heights.
- Clean tables on desktop.
- Stacked cards on mobile.

Avoid:

- Excessive gradients.
- Too many colours.
- Large decorative illustrations inside operational dashboards.
- Excessive animation.
- Overloaded dashboards.
- Tiny text for financial details.

---

## 3. Application Navigation

### 3.1 Desktop navigation

Use a persistent left sidebar.

Suggested layout:

```text
+----------------------------------------------------------+
| LOGO / ADASHI                    Notifications  Profile   |
+-------------------+--------------------------------------+
|                   |                                      |
| Dashboard         |                                      |
| My Groups         |          MAIN CONTENT                |
| Contributions     |                                      |
| Payouts           |                                      |
| Withdrawals       |                                      |
| Receipts          |                                      |
| Notifications     |                                      |
| Reports           |                                      |
| Settings          |                                      |
|                   |                                      |
|                   |                                      |
+-------------------+--------------------------------------+
```

The sidebar should collapse on smaller desktop screens.

### 3.2 Mobile navigation

Use a compact bottom navigation.

Recommended items:

- Home
- Groups
- Activity
- Notifications
- Profile

Show no more than five primary items.

Secondary pages should be accessible from contextual menus or page navigation.

### 3.3 Group context

Whenever a user is viewing a group-specific page, show:

- Group name.
- Group type.
- User's role.
- Active round.

Provide an obvious way to switch groups.

The interface must make it difficult to accidentally perform an action in the wrong group.

---

## 4. Public Website Screens

### 4.1 Landing page

**Route:** `/`

Sections:

1. Header/navigation.
2. Hero.
3. How it works.
4. Adashi types.
5. Features.
6. Transparency and accountability.
7. Pricing.
8. Free Starter offer.
9. FAQs.
10. Footer.

#### Hero design

Headline:

**Manage Your Adashi Groups With Confidence.**

Supporting text:

"Organise contributions, track payments, manage payout turns, and keep transparent financial records — all in one place."

Buttons:

- Create Your Free Group
- Explore How It Works

Use a visual representation of the platform dashboard or group contribution progress.

#### How it works

Use three simple steps:

1. Create your group.
2. Invite members and manage contributions.
3. Track payouts and financial progress.

#### Adashi types

Create two distinct cards.

**Rotational Adashi**

Members contribute regularly, and each cycle's collected contributions go to the designated beneficiary.

**Target-Based Adashi**

Members contribute towards a shared savings target and receive equal distributions when the target is achieved and distribution is approved.

#### Free Starter section

Use a visually prominent section explaining:

- One free Starter activation per user.
- Up to 10 members.
- Access to Starter plan functionality.
- One-time use only.

CTA: **Start Free**

#### Pricing

Display four plan cards.

| Plan | Members | Price |
|---|---:|---:|
| Starter | 10 | ₦1,000 |
| Standard | 20 | ₦2,000 |
| Premium | 50 | ₦3,500 |
| Enterprise | Custom | Contact us |

The free Starter entitlement should be presented separately from the paid Starter price.

Prices must be loaded from backend configuration.

Explain that paid plans are one-time purchases for each group round.

### 4.2 How it works page

**Route:** `/how-it-works`

Explain:

- Group creation.
- Member invitations.
- Contribution collection methods.
- Contribution verification.
- Rotational payouts.
- Target-based distributions.
- Receipts and payout confirmation.
- Withdrawal and refund processes.

### 4.3 Pricing page

**Route:** `/pricing`

Include:

- Plan comparison.
- Member limits.
- One-time purchase explanation.
- Free Starter eligibility.
- Upgrade explanation.
- Enterprise contact option.

Do not imply that an upgrade resets the round or creates a new group.

### 4.4 FAQ page

**Route:** `/faq`

Suggested questions:

1. What is Adashi?
2. What is Rotational Adashi?
3. What is Target-Based Adashi?
4. Can I create multiple groups?
5. Can I join multiple groups?
6. Is there a free plan?
7. Can I use Adashi without online payments?
8. How are contributions verified?
9. How does payout confirmation work?
10. What happens if a member wants to leave?
11. Can I start a new round?
12. How do I download receipts?

---

## 5. Authentication Screens

### 5.1 Registration

**Route:** `/register`

Fields:

- Full name.
- Email address.
- Phone number.
- Password.
- Confirm password.
- Terms and privacy agreement.

Design:

- Clean centred form.
- Adashi logo.
- Clear validation messages.
- Link to login.
- Mobile-friendly input spacing.

### 5.2 Login

**Route:** `/login`

Fields:

- Email or phone number, depending on backend authentication support.
- Password.
- Remember-session option, if supported safely.
- Forgot password link.

### 5.3 Password recovery

**Routes:**

- `/forgot-password`
- `/reset-password`

Use simple, clear instructions and avoid revealing whether an account exists through error messages.

---

## 6. Dashboard Screens

### 6.1 Organiser dashboard

**Route:** `/dashboard`

Desktop layout:

```text
+--------------------------------------------------------+
| Good morning, User                                     |
| Manage your groups and track their financial activity  |
+--------------------------------------------------------+
| Total Groups | Active Rounds | Verified Contributions  |
+--------------------------------------------------------+
| Outstanding Contributions | Pending Payouts            |
+--------------------------------------------------------+
| My Groups                                               |
|                                                        |
| Group A             Group B             Group C         |
| Active              Active              Completed      |
|                                                        |
+--------------------------------------------------------+
| Recent Activity                                         |
+--------------------------------------------------------+
```

#### Summary cards

- Total groups.
- Active rounds.
- Total verified contributions.
- Outstanding contributions.
- Payouts awaiting confirmation.
- Pending withdrawal requests.

#### Group overview card

Each group card should show:

- Group name.
- Group type.
- Member count.
- Current round.
- Status.
- Progress.
- Main action.

Main action may be **Open Group** or **Continue Setup** depending on the group state.

#### Recent activity

Display recent:

- Contributions reported.
- Contributions verified.
- Payouts sent.
- Payouts confirmed.
- Withdrawal requests.

### 6.2 Member dashboard

**Route:** `/dashboard`

Display:

- Joined groups.
- Total verified contributions.
- Pending contributions.
- Upcoming contribution.
- Expected payout.
- Payout awaiting confirmation.
- Recent receipts.

Include a clear **Confirm Received** call to action when applicable.

### 6.3 Mixed-role dashboard

A user may be an organiser in one group and a member in another.

The dashboard must not assume that a user's platform account has one permanent group role.

Use role-specific group actions and summaries.

---

## 7. Group Management Screens

### 7.1 Group listing

**Route:** `/groups`

Display groups as cards.

Each card contains:

- Group name.
- Group type.
- Organiser.
- Member count.
- Current round.
- User role.
- Round status.

Filters:

- All groups.
- Groups I organise.
- Groups I belong to.
- Active.
- Completed.

### 7.2 Create group

**Route:** `/groups/create`

Use a guided wizard.

#### Step 1 — Basic information

Fields:

- Group name.
- Description.
- Group type.

#### Step 2 — Contribution configuration

For Rotational Adashi:

- Contribution amount.
- Frequency.
- Start date.
- Contribution deadline.

For Target-Based Adashi:

- Savings target.
- Optional deadline.
- Variable member contribution setting.

#### Step 3 — Payment collection method

Display two selection cards:

**Organiser Collection**

Members send contributions to the organiser's bank account. The organiser records and verifies the payments.

**Direct Beneficiary Collection**

Members send contributions to the current beneficiary. The organiser records and verifies the payments.

Clearly explain the implications of each method.

#### Step 4 — Member configuration

- Invite members.
- Set member limit.
- Set initial beneficiary order for rotational groups.

#### Step 5 — Plan activation

Show:

- Selected plan.
- Member limit.
- Price.
- Free Starter eligibility.
- Payment requirement.

The backend must confirm eligibility before showing a successful free activation.

### 7.3 Group details

**Route:** `/groups/:groupId`

Use group-level tabs:

- Overview.
- Members.
- Contributions.
- Payouts.
- Cycles / Target.
- Reports.
- Settings.

On mobile, tabs may become a horizontal scroll menu or dropdown.

---

## 8. Group Round Screens

### 8.1 Round overview

Display:

- Round identifier.
- Start date.
- Plan.
- Member count.
- Round status.
- Financial progress.
- Outstanding obligations.

### 8.2 Round history

**Route:** `/groups/:groupId/rounds`

Display previous rounds in a chronological list.

Each entry should include:

- Round number.
- Status.
- Start date.
- Completion date.
- Plan.
- Summary.

Completed rounds should be read-only for ordinary users.

### 8.3 Start a new round

The organiser should see **Start New Round** after the previous round is eligible for completion.

Before proceeding, display:

- Previous round summary.
- Outstanding obligations, if any.
- New round configuration.
- Applicable plan price.
- Free entitlement or purchase requirement.

Do not allow a new round to silently overwrite previous records.

---

## 9. Membership Screens

### 9.1 Members list

**Route:** `/groups/:groupId/members`

Display:

- Member name.
- Phone or email where authorised.
- Join date.
- Membership status.
- Round participation status.
- Total verified contributions.

Organiser actions:

- Invite member.
- View member details.
- Review withdrawal request.

### 9.2 Invitation screen

Allow the organiser to invite users using supported contact details.

Show invitation status:

- Pending.
- Accepted.
- Declined.
- Expired.

### 9.3 Member details

Display the member's group-specific financial summary.

For organisers, show authorised financial information about that member.

For members, show their own personal financial records.

---

## 10. Contribution Screens

### 10.1 Contribution overview

**Route:** `/groups/:groupId/contributions`

Organiser view:

- Total expected.
- Total reported.
- Total verified.
- Total outstanding.
- Contribution list.

Member view:

- Amount expected.
- Due date.
- Payment instructions.
- Report payment action.
- Personal contribution history.

### 10.2 Report payment

Use a modal or dedicated page.

Fields:

- Amount.
- Date paid.
- Transfer reference.
- Optional evidence.
- Note.

After submission, show:

**Payment reported successfully. It is awaiting organiser verification.**

Do not show "Payment verified" until the backend confirms it.

### 10.3 Verify payment

Organiser sees:

- Member.
- Reported amount.
- Payment date.
- Transfer reference.
- Evidence.
- Verify and Reject actions.

Require a rejection reason.

---

## 11. Rotational Adashi Screens

### 11.1 Cycle overview

**Route:** `/groups/:groupId/cycles`

Show:

- Current cycle.
- Current beneficiary.
- Contribution deadline.
- Expected contribution amount.
- Verified collection progress.
- Outstanding members.
- Payout status.

### 11.2 Beneficiary order

Display a numbered beneficiary list.

Example:

```text
1. Member A — Cycle 1
2. Member B — Cycle 2
3. Member C — Cycle 3
4. Member D — Cycle 4
```

Show any approved order changes and their reasons.

### 11.3 Cycle detail

Display:

- Cycle number.
- Beneficiary.
- Expected contributions.
- Verified contributions.
- Outstanding contributions.
- Payout amount.
- Payout status.

### 11.4 Cycle timeline

Use these stages:

1. Contributions expected.
2. Contributions verified.
3. Payout ready.
4. Payout sent.
5. Payout confirmed.
6. Next cycle.

If a payout is disputed, show a warning and explain that progression may be paused pending review.

---

## 12. Target-Based Adashi Screens

### 12.1 Target overview

**Route:** `/groups/:groupId/target`

Display:

- Target amount.
- Verified savings.
- Remaining amount.
- Percentage progress.
- Deadline.
- Eligible members.

### 12.2 Member contribution summary

Display each member's:

- Verified contributions.
- Number of contributions.
- Pending contributions.
- Contribution history.

### 12.3 Distribution preview

When the target is reached, show:

- Distributable amount.
- Eligible member count.
- Equal share.
- Rounding adjustment.
- Excluded members and documented reasons, where authorised.

The organiser should review the calculation before approving distribution.

### 12.4 Distribution progress

Show each beneficiary's:

- Name.
- Expected share.
- Payout status.
- Confirmation status.

---

## 13. Payout Screens

### 13.1 Organiser payout overview

**Route:** `/groups/:groupId/payouts`

Display:

- Pending payouts.
- Sent payouts.
- Confirmed payouts.
- Disputed payouts.
- Total payout obligations.

### 13.2 Mark payout as sent

Use a confirmation modal.

Fields:

- Amount sent.
- Transfer reference.
- Transfer date/time.
- Optional evidence.

Before submission, display the beneficiary and amount prominently.

After backend success:

- Update the payout status to SENT.
- Display the 48-hour deadline.
- Show that a receipt is being generated.
- Notify the beneficiary through the backend notification system.

### 13.3 Member payout detail

**Route:** `/payouts/:payoutId`

Display:

- Group.
- Round.
- Amount.
- Organiser.
- Sent date.
- Transfer reference, where available.
- Receipt.
- Confirmation deadline.
- Current status.

Buttons:

- Confirm Received.
- Dispute Payout.

### 13.4 Confirmation interaction

When the member selects **Confirm Received**, display:

"Please confirm that you have received the payout shown above."

Require explicit confirmation before submitting.

After success, display:

"Your receipt confirmation has been recorded."

### 13.5 Organiser override interaction

After the deadline, display **Confirm on Behalf**.

The organiser must enter a reason and confirm the action.

Warning text:

"This action records confirmation on behalf of the beneficiary. It does not represent confirmation by the member."

### 13.6 Dispute interaction

Provide:

- Dispute reason.
- Description.
- Supporting evidence.
- Submit dispute.

Show a clear status and any review updates.

---

## 14. Receipt Screens

### Receipt list

**Route:** `/receipts`

Display:

- Receipt number.
- Group.
- Beneficiary.
- Amount.
- Date.
- Confirmation status.
- Download action.

### Receipt detail

Show the complete receipt.

Include a status history:

- Payout recorded as sent.
- Receipt generated.
- Member confirmation or organiser override.
- Dispute status, if applicable.

If the receipt is still generating, show a processing indicator.

The receipt must not falsely imply that Adashi independently verified the beneficiary's bank account.

---

## 15. Withdrawal and Refund Screens

### 15.1 Member withdrawal request

**Route:** `/groups/:groupId/withdraw`

Display:

- Current membership status.
- Verified contributions.
- Previous payouts received.
- Estimated settlement, if available.
- Withdrawal policy.

Fields:

- Reason.
- Additional explanation.
- Supporting document, optional.

### 15.2 Organiser withdrawal requests

**Route:** `/groups/:groupId/withdrawals`

Display:

- Member.
- Date requested.
- Reason.
- Settlement calculation.
- Previous payout history.
- Status.

Actions:

- Approve.
- Reject.
- Request clarification, if supported.

### 15.3 Refund detail

Display:

- Approved refund.
- Amount.
- Transfer status.
- Reference.
- Confirmation status.
- Evidence.

---

## 16. Notifications Screens

**Route:** `/notifications`

Display a chronological notification list.

Each item should include:

- Notification title.
- Message.
- Date and time.
- Read/unread status.
- Related group or transaction.
- Navigation action.

Example notifications:

- "A contribution has been reported by a member."
- "Your contribution has been verified."
- "A payout has been marked as sent to you."
- "Your payout confirmation deadline has passed."
- "A member has requested withdrawal."
- "A payout has been disputed."

Use notification preferences to let users control optional channels where supported.

Important financial notifications should remain visible in the in-app notification history.

---

## 17. Reports Screens

### Organiser reports

**Route:** `/groups/:groupId/reports`

Report categories:

- Contributions.
- Payouts.
- Outstanding obligations.
- Withdrawals.
- Refunds.
- Round summary.

Filters:

- Date range.
- Member.
- Transaction status.
- Round.

### Member reports

Display personal:

- Contribution summary.
- Payout summary.
- Outstanding contributions.
- Refund history.
- Receipts.

Allow authorised CSV/PDF export.

---

## 18. Settings Screens

### Profile settings

- Full name.
- Email.
- Phone number.
- Profile photo, if supported.
- Password update.

### Notification settings

- In-app notifications.
- Email notifications.
- Push notification permission.
- Optional SMS notifications.

### Security settings

- Active sessions.
- Sign out.
- Password change.

### Group settings

Organiser-only:

- Group details.
- Contribution rules.
- Payment collection method.
- Member limit and plan.
- Beneficiary order.
- Group status.

Financial rule changes should be restricted once a round is active, except where the backend explicitly permits a documented change.

---

## 19. Super Admin Screens

**Route:** `/admin`

Super Admin functionality should be separate from ordinary organiser and member navigation.

Suggested screens:

- Platform dashboard.
- Users.
- Groups.
- Plans and pricing.
- Group purchases.
- Platform transactions.
- Support and disputes overview.
- Audit logs.
- System configuration.

Super Admin access should be tightly restricted.

Administrative visibility must not create an unrestricted ability to edit group financial history.

---

## 20. Reusable Component Library

Create reusable components for consistency.

### Layout

- `AppSidebar`
- `MobileBottomNav`
- `AppHeader`
- `PageHeader`
- `GroupSwitcher`
- `GroupContextHeader`

### Cards

- `StatCard`
- `GroupCard`
- `ContributionCard`
- `PayoutCard`
- `ReceiptCard`
- `NotificationCard`

### Financial components

- `CurrencyDisplay`
- `FinancialSummary`
- `ContributionStatusBadge`
- `PayoutStatusBadge`
- `ProgressBar`
- `TransactionTimeline`

### Forms

- `FormInput`
- `CurrencyInput`
- `DateInput`
- `FileUpload`
- `ConfirmDialog`
- `ReasonInput`

### Feedback

- `LoadingState`
- `EmptyState`
- `ErrorState`
- `SuccessMessage`
- `ToastNotification`

Keep these components configurable without turning them into overly complex components with dozens of unrelated props.

---

## 21. Status and Colour Rules

Use consistent status labels.

### Contribution statuses

| Status | Label | Suggested appearance |
|---|---|---|
| EXPECTED | Awaiting payment | Neutral |
| REPORTED | Awaiting verification | Amber |
| VERIFIED | Verified | Green |
| REJECTED | Rejected | Red |
| OVERDUE | Overdue | Red |
| REVERSED | Reversed | Neutral |

### Payout statuses

| Status | Label | Suggested appearance |
|---|---|---|
| PENDING | Pending | Neutral |
| SENT | Sent — awaiting confirmation | Amber |
| CONFIRMED_BY_MEMBER | Confirmed by member | Green |
| CONFIRMED_BY_ORGANISER | Confirmed by organiser | Blue |
| DISPUTED | Disputed | Red |
| CANCELLED | Cancelled | Neutral |

Always display the confirmation method in text. Do not use colour alone to distinguish member confirmation from organiser confirmation.

---

## 22. Important Interaction Rules

1. Financial actions require explicit user confirmation.
2. Do not hide transfer references or important transaction details.
3. Do not show a successful operation until the backend confirms it.
4. Prevent accidental double submissions.
5. Display loading states during financial requests.
6. Clearly explain why an action is unavailable.
7. Display the selected group and round before sensitive actions.
8. Preserve the user's input after recoverable failures.
9. Require a reason for rejection, disputes, overrides, and exceptional decisions where applicable.
10. Show clear history for important financial changes.

### Confirmation modal example

Before marking a payout as sent:

**Confirm payout**

"You are recording a payout of ₦50,000 to Member A in Group B."

- Transfer reference.
- Beneficiary.
- Amount.

Buttons:

- Cancel.
- Confirm Payout Sent.

The backend remains responsible for validating the payout amount and status.

---

## 23. Responsive Behaviour

### Mobile

- Single-column layouts.
- Bottom navigation.
- Stacked summary cards.
- Full-width primary buttons.
- Compact financial lists.
- Scrollable tables or card replacements.
- Large touch targets.
- No horizontal page overflow.

### Tablet

- Two-column card layouts where appropriate.
- Collapsible navigation.
- Wider transaction lists.

### Desktop

- Sidebar navigation.
- Multi-column dashboards.
- Full financial tables.
- Wider charts and reports.
- Contextual side panels where useful.

Test the interface at narrow mobile widths, not only standard desktop dimensions.

---

## 24. Design Acceptance Criteria

The design is ready for implementation when:

- Public pages are complete.
- Authentication screens are complete.
- Organiser and member dashboards are defined.
- Group creation is fully mapped.
- Group and round navigation is clear.
- Contribution reporting and verification are defined.
- Rotational and target-based experiences are distinct.
- Payout confirmation and override flows are defined.
- Dispute handling is represented.
- Receipt views are defined.
- Withdrawal and refund workflows are represented.
- Mobile and desktop navigation are defined.
- Reusable components are documented.
- Loading, empty, success, and error states are covered.
- Financial status labels are consistent.

---

## 25. Final UI/UX Recommendation

Adashi should look and feel like a modern, trustworthy financial-management application.

The most important design objective is clarity.

A member should immediately understand:

- What they have contributed.
- What they still need to contribute.
- Whether their contributions have been verified.
- When they are expected to receive a payout.
- Whether a payout has been sent.
- Whether they need to confirm receipt.

An organiser should immediately understand:

- How each group is performing.
- Which members have paid.
- Which payments remain outstanding.
- Who is due to receive a payout.
- Which payouts need confirmation.
- Which disputes or withdrawals need attention.
- Whether the round can be completed.

Build the interface around these everyday tasks rather than filling the dashboard with unnecessary charts and decorative elements.