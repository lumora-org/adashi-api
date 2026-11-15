# 06 — Adashi Platform Frontend Architecture

**Document:** Frontend Architecture  
**Project:** Adashi Contribution and Savings Management Platform  
**Version:** 1.0  
**Status:** Proposed — Implementation Guide  
**Frontend:** Next.js + TypeScript  
**Application Type:** Mobile-first Progressive Web App (PWA)  
**Backend:** NestJS REST API  
**Currency:** Nigerian Naira (NGN)

---

## 1. Purpose

This document defines the frontend architecture for Adashi.

The frontend will provide a simple, responsive experience for organisers and members to manage group contributions, track savings, view payout progress, confirm payments received, and access financial records.

The interface must be easy to use for people who may not be highly technical.

The platform should work well on:
- Android smartphones.
- iPhones.
- Tablets.
- Desktop computers.

The primary design priority is mobile usability.

## 2. Recommended Technology Stack

| Component | Recommended technology |
|---|---|
| Framework | Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI components | shadcn/ui |
| Icons | Lucide React |
| Server data fetching | TanStack Query |
| Forms | React Hook Form |
| Validation | Zod |
| API client | Axios or native fetch wrapper |
| Charts | Recharts |
| Date handling | date-fns |
| PWA support | Next.js-compatible PWA setup |
| Notifications | Web Push + in-app notifications |
| Testing | Jest/Vitest + Playwright |

Use stable and mutually compatible package versions. Pin dependencies in the lockfile.

## 3. Frontend Architecture

Use a feature-based architecture.

Each feature should contain its own components, hooks, API functions, types, and validation schemas where appropriate.

Avoid placing the entire frontend inside one large components folder.

### 3.1 Application structure

```text
web/
│
├── public/
│   ├── icons/
│   ├── images/
│   ├── manifest.json
│   └── favicon.ico
│
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx
│   │   │   ├── pricing/
│   │   │   ├── how-it-works/
│   │   │   └── faq/
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── groups/
│   │   │   ├── contributions/
│   │   │   ├── payouts/
│   │   │   ├── withdrawals/
│   │   │   ├── notifications/
│   │   │   ├── receipts/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   │
│   │   ├── admin/
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   └── not-found.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── navigation/
│   │   ├── forms/
│   │   ├── tables/
│   │   ├── charts/
│   │   └── feedback/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── groups/
│   │   ├── memberships/
│   │   ├── rounds/
│   │   ├── entitlements/
│   │   ├── purchases/
│   │   ├── contributions/
│   │   ├── cycles/
│   │   ├── beneficiaries/
│   │   ├── target-savings/
│   │   ├── distributions/
│   │   ├── payouts/
│   │   ├── receipts/
│   │   ├── withdrawals/
│   │   ├── refunds/
│   │   ├── notifications/
│   │   ├── reports/
│   │   └── settings/
│   │
│   ├── lib/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── utils/
│   │   ├── constants/
│   │   └── formatting/
│   │
│   ├── hooks/
│   ├── providers/
│   ├── types/
│   └── middleware.ts
│
├── .env.example
├── next.config.ts
├── package.json
└── README.md
```

## 4. Application User Types

Adashi has three main application experiences.

### 4.1 Public visitor

A visitor can:
- View the landing page.
- Learn how Adashi works.
- Compare plans.
- Read FAQs.
- Register.
- Log in.

### 4.2 Organiser

An organiser can:
- Create multiple groups.
- Activate free or paid group rounds.
- Invite members.
- Configure contribution schedules.
- Manage beneficiary order.
- Verify contributions.
- Record payouts.
- Approve withdrawal requests.
- View financial reports.
- Manage group rounds.

### 4.3 Member

A member can:
- Join multiple groups.
- View group information.
- View contribution schedules.
- Report payments.
- View personal financial summaries.
- View their payout position.
- Confirm receipt of payouts.
- Dispute payouts.
- Request withdrawal.
- Download receipts.
- View notifications.

A single user account can perform both organiser and member activities.

The interface must therefore support switching between groups and clearly identify the user's role in each group.

---

## 5. Public Website

The public website should communicate the product clearly and encourage registration.

### 5.1 Landing page sections

1. Hero section.
2. How Adashi works.
3. Rotational Adashi explanation.
4. Target-Based Adashi explanation.
5. Features and benefits.
6. Transparency and accountability.
7. Pricing plans.
8. Free Starter offer.
9. Frequently asked questions.
10. Registration and login calls to action.
11. Footer with contact and legal links.

### 5.2 Hero section

Suggested content direction:

**Headline:** Manage Your Adashi Groups With Confidence.

**Supporting text:** Organise contributions, track payments, manage payout turns, and keep transparent financial records — all in one place.

Primary CTA: Create Your Free Group.

Secondary CTA: See How It Works.

Do not claim that Adashi guarantees payment or protects funds unless the platform has a verified service that supports such a claim.

### 5.3 Free Starter section

Clearly explain:

- Every user gets one free Starter group activation.
- Starter supports up to 10 members.
- The free entitlement can only be used once.
- Deleting the group or cancelling a round does not restore it.
- Users can purchase additional group rounds when needed.

### 5.4 Pricing section

Display the proposed plans:

| Plan | Members | One-time price |
|---|---:|---:|
| Starter | Up to 10 | ₦1,000 |
| Standard | Up to 20 | ₦2,000 |
| Premium | Up to 50 | ₦3,500 |
| Enterprise | Custom | Contact us |

Prices should be retrieved from the backend configuration rather than hardcoded into components.

Clearly state that paid plans are one-time purchases per group round, not monthly subscriptions.

---

## 6. Authentication and Account Experience

### Pages

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`

### Registration fields

- Full name.
- Email address.
- Phone number.
- Password.
- Confirm password.
- Agreement to terms and privacy policy.

Use frontend validation for usability and backend validation for security.

### Authentication behaviour

After login:

1. Retrieve the authenticated user profile.
2. Retrieve available groups and memberships.
3. Retrieve the user's entitlement status.
4. Determine the appropriate dashboard.
5. Preserve the user's active group context.

Never treat frontend route protection as a substitute for backend authorisation.

### Session management

Prefer secure, HTTP-only cookies for refresh-token handling where supported by the deployment architecture.

Do not store long-lived refresh tokens in localStorage.

Use a controlled session-expiration experience that allows users to sign in again without losing unsaved work.

---

## 7. Dashboard Architecture

The dashboard should adapt to the selected group and the user's role.

### 7.1 Organiser dashboard

Display:

- Total groups.
- Active groups.
- Active rounds.
- Total verified contributions.
- Outstanding contributions.
- Payouts awaiting confirmation.
- Pending withdrawal requests.
- Recent financial activity.

Include a group overview showing:

- Group name.
- Group type.
- Number of members.
- Current round.
- Round progress.
- Next beneficiary or target progress.
- Outstanding financial obligations.

### 7.2 Member dashboard

Display:

- Joined groups.
- Total verified contributions across selected group contexts.
- Pending payment reports.
- Next contribution due date.
- Expected payout information.
- Payouts awaiting confirmation.
- Recent receipts.
- Notifications.

Make it easy to switch between groups.

### 7.3 Dashboard accuracy

Dashboard figures must come from backend financial summaries.

Do not calculate authoritative financial totals only in the browser.

---

## 8. Group Management

### Group listing page

Show all groups the user can access.

Each group card should display:

- Group name.
- Group type.
- Organiser.
- Member count.
- Current round status.
- Contribution frequency or savings target.
- User's role in that group.

### Create group flow

Use a guided multi-step form.

**Step 1 — Basic information**

- Group name.
- Description.
- Group type.

**Step 2 — Contribution configuration**

For rotational groups:
- Contribution amount.
- Contribution frequency.
- Start date.
- Contribution deadline settings.

For target-based groups:
- Savings target.
- Optional deadline.
- Whether members may contribute different amounts.

**Step 3 — Payment collection**

- Organiser collection.
- Direct beneficiary collection.

**Step 4 — Member configuration**

- Invite members.
- Set membership limit.
- Configure initial beneficiary order where applicable.

**Step 5 — Plan and activation**

- Select eligible plan.
- Apply available free Starter entitlement, if eligible.
- Otherwise proceed to the one-time purchase process.

Do not activate the round before the backend confirms the entitlement or payment requirements are satisfied.

### Group detail page

Suggested tabs:

- Overview.
- Members.
- Contributions.
- Payouts.
- Cycles or Target.
- Reports.
- Settings.

Only display tabs and actions the current user is authorised to access.

---

## 9. Group Round Experience

A persistent group may have multiple rounds.

Display a round history section with:

- Round number or identifier.
- Plan.
- Start date.
- Completion date.
- Round status.
- Financial summary.

A completed round should be available as read-only history.

The organiser can start another round through an explicit action.

Before activating another round, the frontend must retrieve the current round and entitlement/purchase requirements from the backend.

Never silently replace an existing round.

---

## 10. Contribution Management

### 10.1 Member contribution view

Show:

- Amount expected.
- Due date.
- Payment collection method.
- Payment destination instructions.
- Payment reporting action.
- Verification status.
- Contribution history.

### 10.2 Report contribution form

Fields:

- Amount paid.
- Payment date.
- Payment reference.
- Optional evidence upload.
- Additional note.

The member should receive confirmation that the payment has been reported, not that it has been verified.

### 10.3 Organiser contribution view

Show a table or mobile-friendly list with:

- Member.
- Expected amount.
- Reported amount.
- Payment date.
- Verification status.
- Evidence.
- Actions.

Actions:

- Verify.
- Reject.
- View evidence.

Rejection should require a reason.

### 10.4 Status presentation

Use clear labels:

| Backend status | User-facing label |
|---|---|
| EXPECTED | Awaiting payment |
| REPORTED | Awaiting verification |
| VERIFIED | Verified |
| REJECTED | Rejected |
| OVERDUE | Overdue |
| REVERSED | Reversed |

Do not use colour as the only way to communicate status. Always show text.

---

## 11. Rotational Adashi Interface

The rotational group page should make the beneficiary order and cycle progress easy to understand.

### Main components

- Current cycle.
- Current beneficiary.
- Expected contribution amount.
- Contribution deadline.
- Number of members who have paid.
- Outstanding contributions.
- Payout status.
- Upcoming beneficiaries.

### Beneficiary order

Use a numbered list or timeline.

Show:
- Position.
- Member name.
- Expected cycle.
- Payout status.

Any organiser-approved order change should be visibly recorded with its reason.

### Cycle progression

Display a clear timeline:

1. Contributions expected.
2. Contributions verified.
3. Payout ready.
4. Payout sent.
5. Receipt confirmed.
6. Next cycle.

A disputed payout must be clearly flagged. Do not show the next cycle as completed or automatically advance it while the dispute blocks progression.

---

## 12. Target-Based Adashi Interface

The target-based group page should focus on savings progress and transparent distribution.

### Main components

- Savings target.
- Total verified savings.
- Remaining amount.
- Percentage progress.
- Deadline, if configured.
- Individual contribution summaries.
- Distribution status.

### Progress display

Use a progress bar and numerical figures.

Example:

```text
Group Savings Target: ₦1,000,000
Verified Savings:     ₦650,000
Remaining:            ₦350,000
Progress:             65%
```

These figures are illustrative.

### Distribution interface

When the target is reached:

1. Display that the group is awaiting distribution.
2. Show the proposed distributable amount.
3. Show eligible member count.
4. Show the calculated equal share.
5. Display any rounding adjustment.
6. Allow the organiser to review and approve.
7. Show payout progress for each member.

The frontend must display the backend's calculated distribution. Do not independently calculate the authoritative share.

---

## 13. Payout Management

### 13.1 Organiser payout interface

Display:

- Beneficiary.
- Amount.
- Transfer destination information where authorised.
- Transfer reference.
- Payout status.
- Sent date.
- Confirmation deadline.
- Confirmation status.

The organiser should have a **Mark as Sent** action.

The form should request:

- Amount transferred.
- Transfer date/time where appropriate.
- Bank transfer reference.
- Optional evidence.

The backend must validate the amount and payout eligibility.

### 13.2 Member payout interface

When the organiser marks a payout as sent:

- Create a notification.
- Show the payout details.
- Show the receipt.
- Display the 48-hour confirmation deadline.
- Show a **Confirm Received** action.
- Show a **Dispute Payout** action.

### 13.3 Confirmation countdown

The interface may display the remaining time.

Example:

```text
Please confirm receipt within:
23 hours, 45 minutes
```

The countdown is informational. The backend remains authoritative.

### 13.4 Organiser override

After the 48-hour deadline, show the organiser a **Confirm on Behalf** action if the payout remains eligible.

Require:
- Reason.
- Optional supporting evidence.
- Confirmation of the action.

Clearly explain that this records organiser confirmation, not member confirmation.

### 13.5 Dispute interface

The member should be able to:

- Select a dispute reason.
- Explain the issue.
- Upload supporting evidence.
- Submit the dispute.

Show the dispute status and any resolution updates.

Never hide a dispute merely because the organiser has recorded an override.

---

## 14. Receipts Interface

Provide a receipt history page.

Each receipt should display:

- Receipt number.
- Group.
- Round.
- Beneficiary.
- Amount.
- Date sent.
- Confirmation status.
- Download action.

Receipt details must distinguish:

- Payout recorded as sent.
- Confirmed by member.
- Confirmed by organiser.
- Disputed.

PDF generation may take time. Display a processing state when a receipt is still being generated.

Use authenticated downloads or short-lived signed URLs.

---

## 15. Withdrawal and Refund Interface

### Member withdrawal request

Form fields:

- Reason for withdrawal.
- Additional explanation.
- Optional supporting document.

Explain that the settlement amount is subject to the group's rules and organiser review.

### Organiser withdrawal management

Display:

- Member.
- Request date.
- Reason.
- Verified contribution total.
- Previous payouts received.
- Calculated net settlement.
- Proposed refund.
- Approval status.

Actions:

- Approve.
- Reject.
- Request clarification, if supported.

Require a reason for rejection or exceptional settlement decisions.

### Refund tracking

Display:

- Approved refund amount.
- Transfer status.
- Transfer reference.
- Confirmation status.
- Receipt or evidence, where available.

Do not present a refund as completed until the corresponding backend settlement record is confirmed.

---

## 16. Notifications Interface

Provide a notification centre.

Suggested categories:

- Group updates.
- Contributions.
- Payouts.
- Withdrawals.
- Refunds.
- System notifications.

Features:

- Unread count.
- Mark as read.
- Mark all as read.
- Notification details.
- Navigation to the related group or transaction.

Notifications should be accessible from mobile navigation.

---

## 17. Reports and Financial History

### Organiser reports

- Total verified contributions.
- Contributions by member.
- Outstanding contributions.
- Payout history.
- Payouts awaiting confirmation.
- Disputed payouts.
- Refunds.
- Group round financial summary.

### Member reports

- Personal contribution history.
- Personal payout history.
- Total amount contributed.
- Total amount received.
- Pending and rejected reports.
- Withdrawal and refund history.

Provide CSV or PDF exports where supported.

Use backend report endpoints as the source of truth.

---

## 18. Navigation Design

### Desktop

Use a sidebar with:

- Dashboard.
- My Groups.
- Contributions.
- Payouts.
- Withdrawals.
- Receipts.
- Notifications.
- Reports.
- Settings.

### Mobile

Use a compact bottom navigation for the most important destinations.

Recommended items:

- Home.
- Groups.
- Activity.
- Notifications.
- Profile.

Provide contextual navigation inside group details.

Do not overcrowd the mobile bottom navigation with every feature.

### Group switching

Provide an easy group selector.

The selected group should be visible in the dashboard header and group-specific pages.

Avoid relying on a hidden global selection that could cause a user to perform an action in the wrong group.

---

## 19. Design System

Adashi should have a modern, trustworthy financial-product appearance.

### Design principles

- Clean and readable.
- Mobile-first.
- Professional but approachable.
- Strong visual hierarchy.
- Clear financial information.
- Consistent status presentation.
- Accessible colour contrast.
- Large touch targets.
- Minimal unnecessary animation.

### Suggested visual direction

A possible starting palette:

| Purpose | Colour |
|---|---|
| Primary | Deep emerald |
| Secondary | Dark navy |
| Accent | Warm gold |
| Background | Soft off-white |
| Surface | White |
| Main text | Dark slate |
| Secondary text | Muted slate |
| Success | Green |
| Warning | Amber |
| Error | Red |

These are initial design recommendations, not a final brand identity.

### Typography

Use a modern, readable sans-serif font.

Financial figures should use consistent number formatting and alignment.

### Currency formatting

Use a shared currency formatter for all financial displays.

Example:

```text
₦1,500.00
₦25,000.00
₦1,250,000.00
```

Avoid inconsistent formatting between dashboards, tables, receipts, and reports.

---

## 20. State Management and API Integration

Use TanStack Query for server state.

Use React state or a lightweight client-state library only for local interface state.

### Server state

Examples:

- Current user.
- Groups.
- Memberships.
- Contributions.
- Payouts.
- Receipts.
- Notifications.
- Reports.
- Entitlement status.

### Local state

Examples:

- Open modal.
- Selected tab.
- Form input.
- Temporary filters.
- Active navigation state.

### API client

Create a central API client.

Responsibilities:

- Base URL configuration.
- Authentication handling.
- Request and response types.
- Error handling.
- Consistent request behaviour.
- Session-expiration handling.

Do not create a separate unconfigured HTTP client inside every feature.

### Cache invalidation

After important mutations, invalidate affected queries.

Examples:

- Verifying a contribution should refresh contribution summaries and group progress.
- Sending a payout should refresh payout records, beneficiary information, receipt status, and notifications.
- Confirming a payout should refresh payout status and cycle progress.
- Approving a withdrawal should refresh membership and settlement information.

Do not optimistically display financial success before the backend confirms it.

---

## 21. Forms and Validation

Use React Hook Form with Zod.

Validate:

- Required fields.
- Email format.
- Phone format.
- Password strength.
- Positive monetary values.
- Date validity.
- Member limits.
- Required reasons for financial exceptions.
- File type and size.

Frontend validation improves usability, but the backend remains authoritative.

Show clear inline errors.

Preserve form data when a recoverable server error occurs.

---

## 22. Progressive Web App Requirements

Adashi should be installable as a PWA.

Requirements:

- Web app manifest.
- Application icons.
- Appropriate theme colours.
- Service worker.
- Install prompt support where available.
- Responsive offline fallback.
- Push notification support where permission is granted.

### Offline behaviour

For the MVP, allow users to:

- Load previously cached public content.
- View an offline fallback page.
- See a clear connection status.

Do not allow financial operations to appear successful while offline.

Contribution reporting, verification, payout sending, confirmation, withdrawal approval, and refund settlement require a successful backend response.

Do not queue sensitive financial actions for silent background submission.

---

## 23. Accessibility and Usability

Implement:

- Semantic HTML.
- Keyboard navigation.
- Accessible form labels.
- Visible focus states.
- Sufficient contrast.
- Screen-reader-friendly status labels.
- Clear confirmation dialogs for sensitive actions.
- Responsive text and layout.

Use plain language for financial actions.

For example, prefer **Confirm I Received This Payment** over an unclear label such as **Approve Transaction**.

---

## 24. Error and Loading States

Every data-driven page should support:

- Initial loading.
- Empty state.
- Success state.
- Error state.
- Retry action.
- Session-expired state.

Examples:

**No groups:**  
"You haven't joined or created a group yet."

**No contributions:**  
"No contribution records are available for this round."

**Receipt processing:**  
"Your receipt is being generated. You can download it when it is ready."

**Network failure:**  
"Unable to connect. Check your internet connection and try again."

Do not display a successful financial operation when the API request fails or its result is unknown.

---

## 25. Performance Optimisation

Use:

- Next.js server components for suitable public and static content.
- Client components only where interaction is needed.
- Lazy loading for heavy components.
- Pagination for large lists.
- Optimised images.
- Route-level loading states.
- Cached public content.
- Query caching with appropriate invalidation.
- Debounced search and filtering.

Do not preload every group's full financial history when a user opens the dashboard.

Load detailed transaction history only when needed.

---

## 26. Security Requirements

- Never expose backend secrets in frontend code.
- Never place private API keys in `NEXT_PUBLIC_` variables.
- Use secure authentication cookies where supported.
- Protect sensitive routes.
- Validate all API responses before trusting their shape where necessary.
- Prevent unauthorised group navigation.
- Do not expose private bank details to unrelated members.
- Use safe file upload handling.
- Avoid rendering untrusted HTML.
- Apply appropriate Content Security Policy and security headers.
- Ensure all financial operations are authorised by the backend.

The frontend must never be treated as the security boundary.

---

## 27. Environment Variables

Example `.env.example`:

```env
NEXT_PUBLIC_APP_NAME=Adashi
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

Any server-only secrets or credentials must remain in non-public environment variables.

Use separate environment configuration for development, staging, and production.

---

## 28. Frontend Testing Strategy

### Unit tests

Test:

- Currency formatting.
- Date formatting.
- Status labels.
- Form validation.
- Permission-based rendering.
- Progress presentation.

### Component tests

Test:

- Group cards.
- Contribution lists.
- Payout cards.
- Confirmation dialogs.
- Receipt displays.
- Notification items.
- Empty and error states.

### End-to-end tests

Test:

1. User registration and login.
2. Free Starter group activation.
3. Paid group activation.
4. Group creation.
5. Member invitation and joining.
6. Contribution reporting.
7. Organiser contribution verification.
8. Payout marked as sent.
9. Member confirms receipt.
10. Organiser override after 48 hours.
11. Member disputes payout.
12. Withdrawal request and approval.
13. Receipt download.
14. Round completion.

Test both mobile and desktop viewport sizes.

---

## 29. Implementation Phases

### Phase 1 — Frontend foundation

- Next.js setup.
- Tailwind CSS.
- Component library.
- Global layout.
- Design tokens.
- API client.
- Error handling.

### Phase 2 — Public website

- Landing page.
- How it works.
- Pricing.
- FAQs.
- Free Starter explanation.
- Registration and login links.

### Phase 3 — Authentication

- Registration.
- Login.
- Password reset.
- Session handling.
- Protected routes.

### Phase 4 — Dashboard and groups

- Organiser dashboard.
- Member dashboard.
- Group listing.
- Group creation.
- Group details.
- Group switching.
- Membership invitations.

### Phase 5 — Group rounds and purchases

- Round history.
- Free entitlement flow.
- Paid purchase flow.
- Upgrade flow.
- Round activation.

### Phase 6 — Contributions

- Contribution schedule.
- Payment reporting.
- Organiser verification.
- Contribution history.
- Outstanding payment views.

### Phase 7 — Adashi types

- Rotational cycles.
- Beneficiary order.
- Target progress.
- Distribution preview.

### Phase 8 — Payouts and receipts

- Payout sent form.
- Confirmation countdown.
- Member confirmation.
- Organiser override.
- Dispute workflow.
- Receipt generation and download.

### Phase 9 — Withdrawals and reports

- Withdrawal requests.
- Organiser approval.
- Refund tracking.
- Financial reports.
- Exports.

### Phase 10 — PWA and production readiness

- PWA manifest.
- Service worker.
- Offline fallback.
- Push notifications.
- Accessibility.
- Performance testing.
- Security testing.

---

## 30. Final Frontend Architecture Recommendation

Build Adashi using **Next.js, TypeScript, Tailwind CSS, shadcn/ui, and TanStack Query**.

Use a feature-based architecture and a shared design system.

Prioritise:

1. Mobile-first usability.
2. Clear organiser and member experiences.
3. Simple group creation.
4. Transparent contribution records.
5. Clear payout confirmation and dispute flows.
6. Accessible receipts and financial history.
7. Reliable backend-driven financial information.
8. A polished public landing page.

The frontend should make complex group financial activities feel simple without hiding important transaction details or status information.