# Nagarkot Shipment Status Tracker

## Phase 3 --- Frontend UX and Visual Design Blueprint

**Document status:** Design proposal for review\
**Version:** 1.0\
**Purpose:** Establish the frontend's user experience, visual system,
layout, wording, interaction patterns, accessibility requirements, and
acceptance criteria before implementation.\
**Implementation status:** This document is a blueprint, not evidence
that any frontend code exists.

------------------------------------------------------------------------

## 1. Product intent

Build a focused, professional shipment-operations interface for the
Nagarkot Forwarders Pvt. Ltd. technical assignment. It should look
polished and feel easy to use without becoming a large enterprise
logistics platform.

The experience combines:

-   **Direction A --- Operational clarity:** strong hierarchy, readable
    tables, fast scanning, restrained colour, obvious actions.
-   **Direction B --- Spacious premium SaaS:** generous whitespace,
    considered typography, soft neutral surfaces, calm cards, and
    careful alignment.

The result should be a **clean operations workspace with enough
breathing room**, not a dense legacy console and not an oversized
marketing dashboard.

### Core design principle

> Make the current state obvious, the next action easy to find, and the
> result of every action clear.

### Primary user goals

1.  Find a shipment quickly by reference number.
2.  Understand current status, route, and expected delivery at a glance.
3.  Create a shipment with minimal confusion.
4.  Update a shipment status safely.
5.  Inspect a chronological history and verify that a change was
    recorded.
6.  Recover gracefully from empty results, validation errors, and
    network/API failures.

### Out of scope

Do not add features merely because they are common in larger products.
Unless the assignment or reviewed backend supports them, do not add:

-   Authentication, user roles, or account-management screens.
-   GPS, live maps, route planning, or geolocation.
-   WebSockets or real-time tracking claims.
-   Analytics dashboards, charts, KPI tiles, or fabricated metrics.
-   Notifications, email/SMS, file uploads, chat, or external carrier
    integrations.
-   Bulk editing, export/import, advanced saved searches, or complex
    filter builders.
-   A forced one-way status-transition workflow.
-   A dark-mode toggle unless it can be delivered and tested without
    distracting from the required workflow.

------------------------------------------------------------------------

## 2. Information architecture

Keep navigation deliberately small. Three core views are sufficient.

### 2.1 Application shell

**Desktop** - A compact top header with a restrained brand mark and
"Nagarkot" / "Shipment operations". - A simple primary navigation item:
**Shipments**. - A page container with a consistent maximum width and
responsive side padding. - Avoid a large permanent sidebar: there are
too few primary destinations to justify one.

**Mobile** - A compact header with brand and an accessible navigation
treatment. - Keep the primary destination and create action easy to
reach. - Do not squeeze the desktop table into a tiny unreadable
layout. - Prefer shipment cards on narrow screens, with the most
important information visible first.

**Branding caution:** Use a text-based wordmark and a simple
package/route icon only if an appropriate icon is already available. Do
not invent a corporate logo or claim official brand assets exist.

### 2.2 Routes / views

Proposed routes, subject to the existing frontend/router setup:

-   `/shipments` --- shipment list and search (default view).
-   `/shipments/new` --- create shipment.
-   `/shipments/:id` --- shipment detail, status update, and history.

Use the actual backend identifier and response contract. Do not assume
the URL identifier is a reference number if the backend route uses a
numeric database ID. If the project can work cleanly without a routing
dependency, choose the simplest maintainable option; otherwise use a
standard lightweight React router.

### 2.3 Navigation behaviour

-   The dashboard is the default entry point.
-   "New shipment" opens the dedicated creation view.
-   Clicking a shipment reference or a clearly named "View details"
    action opens its detail view.
-   Provide a visible way to return to the list.
-   Preserve useful list context when navigating back: search term,
    status filter, and page where practical.
-   Do not use browser alerts as the primary interaction UI.
-   Do not make an entire table row clickable if it would conflict with
    nested buttons or make keyboard use unclear. A clear reference link
    or details action is more predictable.

------------------------------------------------------------------------

## 3. Visual direction and design tokens

Use a small semantic token system rather than scattered one-off colours
and arbitrary spacing. These are proposed starting values; check text
and control contrast during implementation before locking them.

### 3.1 Colour palette

  -----------------------------------------------------------------------
  Token                   Proposed value          Intended use
  ----------------------- ----------------------- -----------------------
  `brand-900`             `#172C49`               Primary dark
                                                  brand/navy, strong
                                                  headings where
                                                  appropriate

  `brand-700`             `#234C7A`               Primary buttons,
                                                  selected navigation,
                                                  links after contrast
                                                  verification

  `brand-100`             `#EAF1F8`               Subtle blue surfaces
                                                  and selected states

  `canvas`                `#F6F8FB`               Main page background

  `surface`               `#FFFFFF`               Cards, form surfaces,
                                                  table surface

  `border`                `#DCE3EC`               Dividers and neutral
                                                  control borders

  `text-primary`          `#202B3C`               Main text

  `text-secondary`        `#526174`               Supporting text; verify
                                                  contrast for actual
                                                  font sizes

  `success-text`          `#216E45`               Success messaging and
                                                  delivered-state
                                                  treatment

  `success-surface`       `#E8F5ED`               Soft success background

  `info-text`             `#245A91`               In-transit
                                                  informational status
                                                  treatment

  `info-surface`          `#EAF2FC`               Soft informational
                                                  background

  `warning-text`          `#805500`               Customs-hold/warning
                                                  treatment

  `warning-surface`       `#FFF3D6`               Soft warning background

  `neutral-text`          `#465466`               Booked/neutral status
                                                  text

  `neutral-surface`       `#EEF1F5`               Neutral status
                                                  background

  `danger-text`           `#A12A2A`               Validation and
                                                  destructive/error
                                                  messaging

  `danger-surface`        `#FCECEC`               Error background
  -----------------------------------------------------------------------

**Colour rules** - Use navy and blue for structure and primary actions,
not for every element. - Keep the page background subtly off-white and
cards white to create depth without heavy shadows. - Use semantic status
colours consistently, but **never communicate status through colour
alone**; always show its text label. - Do not use a status colour as the
only signal for validation errors; pair it with text and an icon where
helpful. - Verify WCAG contrast ratios in the rendered UI, particularly
for secondary text, button labels, badges, borders, focus indicators,
and hover states. - If a proposed pair fails contrast, adjust the token
rather than sacrificing legibility.

### 3.2 Typography

-   Use a clean system sans-serif stack or a single lightweight web font
    only if its loading/performance trade-off is justified.
-   Avoid mixing several typefaces.
-   Body text target: approximately `14–16px` on desktop, with `16px`
    preferred for form labels and longer instructions.
-   Supporting text should remain readable and should not be reduced to
    tiny low-contrast microcopy.
-   Use a clear heading scale; avoid excessive oversized headings.
-   Use tabular numerals for IDs, dates, counts, and pagination when
    helpful.
-   Use sentence case for page headings, buttons, filters, and messages.
-   Avoid all-caps labels except restrained table-column labels if they
    remain readable.

### 3.3 Spacing, sizing, and surfaces

Use a consistent spacing scale based on multiples of 4px, for example:
`4, 8, 12, 16, 20, 24, 32, 40, 48`.

-   Page padding: around `24–32px` on wide screens and `16px` on small
    screens.
-   Card padding: around `20–24px` on desktop and `16px` on mobile.
-   Form control height: around `42–46px`, with adequate touch targets.
-   Button height: around `40–44px` or greater where needed for touch
    usability.
-   Border radius: restrained `8–12px` for cards/controls; avoid
    rounding every surface into a pill.
-   Shadows: subtle and sparse. Prefer border and surface contrast over
    floating-card effects.
-   Use one consistent content width and alignment grid across the
    views.

### 3.4 Icons and decoration

-   Use the existing icon library if present; inspect dependencies
    before adding one.
-   Use icons to reinforce familiar actions (search, plus, back, copy,
    calendar) and pair icon-only controls with accessible names.
-   Avoid decorative illustrations, gradients, animated backgrounds,
    glassmorphism, excessive badges, and large empty hero sections.
-   Motion should communicate a state change, not act as decoration.

------------------------------------------------------------------------

## 4. Page 1 --- Shipment dashboard

This is the main operational screen and should prioritize search and the
shipment list.

### 4.1 Desktop layout hierarchy

1.  **Application header**
    -   Brand mark/name on the left.
    -   "Shipments" navigation or breadcrumb.
    -   No fake user profile, notifications, or settings menu.
2.  **Page introduction**
    -   Heading: `Shipments`
    -   Supporting text: `Track, search and manage your shipments.`
    -   Primary action on the right: `New shipment`
3.  **Search and filter toolbar**
    -   Search input with visible label or accessible name.
    -   Placeholder: `Search reference number…`
    -   Status dropdown.
    -   Optional `Clear filters` control only when a filter/search is
        active.
    -   Search and filters should fit comfortably without wrapping
        awkwardly at common desktop widths.
4.  **Results summary**
    -   Example: `Showing 1–20 of 42 shipments`.
    -   Values must come from the real API response, never hardcoded.
    -   If the backend returns pagination metadata with a different
        shape, adapt to its actual contract.
5.  **Shipment table**
    -   White surface with light borders.
    -   Clear column headings and sufficient row height.
    -   Subtle row hover and visible keyboard focus.
    -   Avoid strong zebra striping unless testing shows it improves
        scanability.
6.  **Pagination**
    -   Place below the table.
    -   Display current range/total and `Previous` / `Next`.
    -   Disable or omit unavailable actions appropriately; do not allow
        negative offsets.
    -   If an explicit page-size selector is included, offer only simple
        options such as 10, 20, and 50 and respect the backend maximum
        of 100. Otherwise keep the backend default of 20 to avoid
        unnecessary UI complexity.

### 4.2 Table columns

Recommended desktop order:

1.  **Reference** --- prominent, clickable text to open details.
2.  **Route** --- origin and destination, clearly separated with an
    arrow or text separator.
3.  **Status** --- labelled badge.
4.  **Expected delivery** --- human-readable date.
5.  **Action** --- restrained `View` link/button if the reference itself
    is not sufficiently discoverable.

Do not show every database field in the list. Creation timestamp,
internal database ID, and full status history belong in the detail view
unless the actual use case makes them necessary.

**Responsive behaviour** - On medium screens, allow the route and
expected date to wrap sensibly; preserve the reference and status. - On
narrow screens, render each shipment as a card containing reference,
status, route, expected delivery, and a clear details action. - Avoid
forcing users to scroll horizontally to discover a shipment's status. -
Keep table semantics correct on desktop (`table`, `thead`,
`th scope="col"`, `tbody`) rather than constructing a visually
table-like set of generic divs.

### 4.3 Search and status dropdown

**Search** - Search by reference number only, as supported by the
backend contract. - Trim leading/trailing spaces before submitting. -
Use a small debounce (roughly 250--350ms) only if live search is
implemented; otherwise use an explicit search action. Choose one
predictable pattern. - Avoid issuing duplicate requests for identical
query values. - Provide a clear button or `Clear filters` action when
search is active. - When the search term changes, reset pagination to
offset 0. - If the API request fails, preserve the search term and show
a recoverable error.

**Status filter** - Label: `Status` - Options: - `All statuses` (no
status query parameter) - `Booked` - `In Transit` - `Customs Hold` -
`Delivered` - Apply the filter consistently with the backend's exact
allowed status values. - Reset pagination when the status changes. - If
using a native `<select>`, keep it keyboard accessible and avoid
replacing it with a custom dropdown unless there is a concrete UX need.

### 4.4 Dashboard states and copy

**Initial loading** - Use a small skeleton or clear loading message in
the results region. - Avoid layout jumps; keep the table/card structure
stable. - Announce important async updates appropriately to assistive
technology.

**No records in database** - Heading: `No shipments yet` - Text:
`No shipments have been registered yet.` - Action:
`Create your first shipment`

**Search/filter returns no matches** - Heading: `No shipments found` -
Text: `Try another reference number or clear the filters.` - Action:
`Clear filters`

**API/network failure** - Heading: `We couldn't load shipments` - Text:
`Check your connection and try again.` - Action: `Retry` - Do not
display raw stack traces, SQL errors, or internal server details.

**Unexpected response** - Show a safe generic error and log technical
details only through a controlled development/server logging path; never
leak secrets.

------------------------------------------------------------------------

## 5. Page 2 --- Create shipment

Use a dedicated page, not a modal. The form is short, but a page gives
it clear context and makes validation and keyboard navigation easier.

### 5.1 Layout and position

-   Breadcrumb/back link: `Shipments / New shipment`.
-   Heading: `Create shipment`.
-   Supporting text:
    `Enter the shipment details to register a new record.`
-   A single-column form on mobile.
-   On desktop, a moderately narrow form card (roughly 640--760px)
    aligned to the page grid; do not stretch inputs across the entire
    viewport.
-   Keep all fields in logical reading order in the DOM and visually.
-   Form actions at the end: secondary `Cancel`, primary
    `Create shipment`.

### 5.2 Fields and order

1.  **Reference number** --- required text input.
    -   Placeholder: `e.g. NGK-1004`
    -   Helper text only if needed: `Use a unique reference number.`
    -   Trim whitespace. Match backend normalization rules; do not
        invent a second frontend-only normalization policy.
2.  **Origin** --- required text input.
    -   Placeholder: `Enter origin`
    -   Do not require a particular country/city format unless the
        backend does.
3.  **Destination** --- required text input.
    -   Placeholder: `Enter destination`
4.  **Expected delivery date** --- required date input.
    -   Use a native date input if it provides an appropriate experience
        across supported browsers.
    -   Display the expected date format clearly.
    -   Validate a real calendar date and use the backend's date-only
        contract. Do not convert a date-only value through local
        timezone arithmetic in a way that shifts the calendar date.
5.  **Initial status** --- required dropdown.
    -   Default: `Booked` only if that matches the backend's documented
        default/allowed behaviour.
    -   Options: `Booked`, `In Transit`, `Customs Hold`, `Delivered`.
    -   Do not invent status values.

At the top or near the first field, explain:
`Fields marked * are required.` Mark required inputs programmatically
and visibly.

### 5.3 Form behaviour

-   Use visible, persistent labels; placeholders are not labels.
-   Validate on submit and, where helpful, after a field has been
    touched.
-   Place each validation message beside its corresponding field and
    associate it with `aria-describedby`; mark invalid controls with
    `aria-invalid`.
-   Do not show a wall of errors before the user has interacted with the
    form.
-   On submission, show a clear pending state and prevent duplicate
    submission.
-   Keep the form values if the API request fails.
-   Map duplicate-reference (`409`) responses to a helpful
    reference-field error when the backend response provides enough
    information.
-   On success, show `Shipment created successfully.` and navigate to
    the newly created shipment's details if the returned ID is
    available.
-   On server/network failure, show a safe message and allow retry.
-   Do not create a local "success" record unless the API confirms
    creation.

### 5.4 Form wording

-   Page heading: `Create shipment`
-   Primary button: `Create shipment`
-   Secondary button: `Cancel`
-   Required-field note: `Fields marked * are required.`
-   Duplicate reference:
    `This reference number is already in use. Enter a different reference number.`
-   Generic save failure:
    `We couldn't create the shipment. Your entries are still here—please try again.`
-   Cancel confirmation is not necessary for an untouched form. If the
    form has unsaved values, decide whether a simple navigation guard is
    justified; do not add a complex confirmation flow unless needed.

------------------------------------------------------------------------

## 6. Page 3 --- Shipment details, status update, and history

This page should clearly distinguish the shipment's **current state**
from its **past events**.

### 6.1 Layout hierarchy

1.  Breadcrumb/back link: `Shipments / [reference number]`.
2.  Header row:
    -   Reference number as the page title.
    -   Current status badge beside it, with wrapping behaviour on small
        screens.
    -   A small copy-reference action may be included if it can be
        implemented accessibly and gives clear confirmation.
3.  Shipment summary card:
    -   Origin.
    -   Destination.
    -   Expected delivery date.
    -   Creation/last-updated timestamps only if available and
        meaningful.
4.  Status update section:
    -   Heading: `Update status`.
    -   Status dropdown.
    -   Optional note only if the backend's actual request and schema
        support it.
    -   Primary action: `Save status update`.
5.  History section:
    -   Heading: `Shipment history`.
    -   A chronological timeline, oldest event first, with status,
        timestamp, and note where available.
6.  Back-to-list path.

Do not use a map or fake progress route. The assignment does not require
live location data, and a status history is more truthful and useful.

### 6.2 Status-update dropdown

Label: `New status`

Options: - `Booked` - `In Transit` - `Customs Hold` - `Delivered`

Behaviour: - Initialize the control to the current status. - If the
selected value equals the current status, communicate that no change is
needed or disable submission only if the disabled state remains
understandable. The backend is still responsible for safely handling a
no-op. - Do not impose a one-way transition graph: the agreed model
allows transitions between any valid status. - When submitting, show a
pending state and prevent duplicate submissions. - After success,
refresh the shipment and history from the API or update state from the
authoritative response. - Show a clear confirmation,
e.g. `Shipment status updated successfully.` - For a no-op response,
show a neutral message rather than pretending a new event was created. -
If the request fails, preserve the selected value and show a recoverable
error.

**Notes:** The backend implementation report mentions an optional note
field, but the original agreed endpoint only required a status. Inspect
the actual Zod schema, controller, service, and API response before
deciding whether to expose a note input. If the backend does not support
it end-to-end, omit it from the UI plan or recommend it as a separately
approved small enhancement.

### 6.3 History timeline

Each history entry should show: - Status name. - Human-readable
timestamp, if supplied by the API. - Note/reason, only if present and
supported. - Clear chronological ordering.

Use a vertical timeline with a restrained line and small markers. The
status text remains the primary indicator; marker colours are
supplementary.

Use the API's deterministic ordering when available. If the frontend
must sort events, sort using a valid timestamp and stable tie-breaker;
never sort formatted date strings. Be careful with timezone display:
show a consistent local time format and, if ambiguity matters,
communicate the timezone. Do not invent timestamps.

### 6.4 Detail-page states

-   Loading: show stable skeletons or a concise loading message.
-   Not found: `We couldn't find this shipment.` with a link back to
    shipments.
-   History empty/missing: distinguish a genuinely empty response from a
    failed request; because creation should record an initial event, an
    empty history may warrant a safe warning and technical investigation
    rather than fabricated entries.
-   Status-update failure: keep the current data visible and let the
    user retry.
-   Copy-reference action (if included): announce
    `Reference number copied.` without requiring a visual-only toast.

------------------------------------------------------------------------

## 7. Component and dropdown inventory

Prefer a small reusable component set rather than duplicating styles in
each view.

### Shared components

-   `AppShell` / `AppHeader`
-   `PageHeader`
-   `Button` (primary, secondary, subtle)
-   `TextInput`
-   `SelectField`
-   `DateField`
-   `FieldError`
-   `StatusBadge`
-   `Alert` / `InlineMessage`
-   `LoadingState` / `Skeleton`
-   `EmptyState`
-   `ErrorState` with retry where appropriate
-   `ShipmentTable`
-   `ShipmentCard` for narrow screens
-   `Pagination`
-   `ShipmentSummary`
-   `ShipmentHistoryTimeline`

Use native inputs and selects unless there is a specific reason to build
a custom control. Native controls generally reduce keyboard and
accessibility implementation burden.

### Dropdowns/selects required

  -----------------------------------------------------------------------
  Control           Values            Default           Notes
  ----------------- ----------------- ----------------- -----------------
  Dashboard status  All statuses,     All statuses      All statuses
  filter            Booked, In                          should omit the
                    Transit, Customs                    status filter in
                    Hold, Delivered                     the API request

  Initial shipment  Booked, In        Booked if         Must use exact
  status            Transit, Customs  supported by the  backend values
                    Hold, Delivered   actual API        

  Status update     Booked, In        Current status    Do not add a
                    Transit, Customs                    rigid transition
                    Hold, Delivered                     graph

  Page size         10, 20, 50        20                Only if it adds
  (optional)                                            clear value; must
                                                        stay within
                                                        backend limits
  -----------------------------------------------------------------------

Do not add a custom dropdown for navigation, profile settings, themes,
or advanced filters when there is no actual need.

------------------------------------------------------------------------

## 8. API integration boundaries

The frontend must consume the actual backend API; it must not access
Supabase directly.

### Required integration approach

-   Use one shared API client/module.
-   Configure the base URL via `VITE_API_BASE_URL`.
-   Never put `DATABASE_URL`, a database password, or a Supabase
    service-role secret in frontend environment variables.
-   Handle HTTP status codes and JSON error envelopes centrally where
    practical.
-   Distinguish network errors, validation errors, not-found errors,
    duplicate conflicts, and server errors.
-   Type request/response payloads based on the actual backend contract.
-   Do not duplicate server business rules as if frontend validation
    were authoritative.
-   Keep API request state predictable: loading, success, empty, error.
-   Avoid duplicate requests and stale search responses overwriting
    newer results.
-   When filters change, reset `offset` to `0`.
-   Use the backend's pagination metadata and actual `limit`/`offset`
    semantics.
-   Use the returned shipment ID for details navigation if that is the
    backend's identifier.
-   After status updates, display data returned by the server or refetch
    the authoritative record/history.
-   Never show fabricated shipment data as if it came from the database.
    Mock fixtures may be used in tests and explicitly labelled design
    previews only.

### Endpoints to verify against the implementation

The intended routes are:

-   `GET /api/health`
-   `POST /api/shipments`
-   `GET /api/shipments?search=&status=&limit=&offset=`
-   `GET /api/shipments/:id`
-   `PATCH /api/shipments/:id/status`
-   `GET /api/shipments/:id/history`

Before implementation, inspect the actual controller, validation
schemas, service, and tests to confirm: - Exact create payload. - Exact
status-update payload, including whether `note` exists. - Response
envelopes and pagination metadata. - Error response structure. - Health
response behaviour. - Whether any route or field names differ from this
proposal.

If the implementation and docs disagree, report the discrepancy and
recommend a resolution. Do not silently create a second API contract.

------------------------------------------------------------------------

## 9. Interaction quality and perceived smoothness

The application should feel responsive without adding unnecessary
animation.

### Interaction rules

-   Use short, restrained transitions for hover, focus, and panel state
    changes; respect `prefers-reduced-motion`.
-   Do not animate every card or add scroll-triggered effects.
-   Keep content positions stable during loading to reduce layout shift.
-   Preserve search/filter context when opening a shipment and returning
    to the list where practical.
-   Debounce search only if live search is chosen; prevent stale
    responses from replacing newer results.
-   Reset pagination when the query or status filter changes.
-   Use clear button labels and avoid ambiguous icon-only actions.
-   Prevent duplicate form submission while a request is in progress.
-   Keep the page usable when the API is unavailable; explain the
    problem and offer retry.
-   Use toasts sparingly. Important errors should also be visible in the
    relevant content area.
-   Do not refresh the entire browser after a create or status update.
-   Use consistent date formatting throughout the app.
-   Avoid making the user infer whether a change succeeded: provide
    confirmation and update the displayed record/history.

### Small, worthwhile enhancements

These are candidates for approval during the implementation-analysis
phase, not automatic requirements:

1.  **Copy reference number** on the detail view, with accessible
    confirmation.
2.  **Remember list filters during navigation** so returning from
    details does not restart the user's search.
3.  **Helpful result summary** such as "Showing 21--40 of 63 shipments",
    derived from real pagination data.
4.  **Retry action** for recoverable loading errors.
5.  **Clear filters** action shown only when filters/search are active.
6.  **Stable skeleton/loading state** to make waiting feel calmer
    without inventing results.

Avoid adding more unless a real user problem justifies the extra
complexity.

------------------------------------------------------------------------

## 10. Accessibility and responsive design

Use WCAG 2.2 AA as the practical target, and verify rather than claim
conformance.

### Keyboard and focus

-   All actions must be usable with a keyboard.
-   Maintain logical DOM and tab order.
-   Keep a visible focus indicator on links, buttons, inputs, selects,
    and pagination controls.
-   Ensure sticky headers or overlays do not obscure focused controls.
-   Avoid keyboard traps and custom controls that imitate native widgets
    unnecessarily.
-   After navigation or a form submission, place focus sensibly and
    announce important state changes without stealing focus
    unnecessarily.

### Forms

-   Every field has a visible, programmatically associated label.
-   Required fields are indicated visibly and in markup.
-   Errors are adjacent to the relevant fields and linked with
    `aria-describedby`.
-   Use `aria-invalid` where appropriate.
-   Use a polite live region for important asynchronous success/error
    messages.
-   Do not rely on placeholder text to explain a field.

### Tables and status

-   Use semantic table markup and proper column headers.
-   Keep link/button names meaningful when read out of context.
-   Status text must be visible; colour alone is insufficient.
-   Ensure badge text contrast and control boundaries are sufficient.
-   On mobile, use a semantically clear card/list representation rather
    than a confusing faux-table.

### Responsive acceptance widths

Check at least: - `360px` wide phone. - `390–430px` wide phone. -
`768px` tablet. - `1024px` laptop/tablet landscape. - `1366px` and wider
desktop.

At every width: - No clipped primary actions. - No overlapping labels or
controls. - No accidental horizontal page overflow. - Search/filter
controls reflow cleanly. - Form fields remain comfortable to use. - The
shipment reference and status remain easy to find. - Timeline text wraps
without overlapping markers.

### Accessibility checks

-   Run automated accessibility checks if available.
-   Manually navigate all flows using keyboard only.
-   Check contrast for actual rendered combinations.
-   Test browser zoom and a narrow viewport.
-   Check reduced-motion behaviour.
-   Review console output for React warnings, failed requests, and
    missing keys.
-   Do not treat an automated score as proof of full accessibility.

------------------------------------------------------------------------

## 11. Error handling and content rules

Use consistent, plain language. Messages should explain what happened
and what the user can do next.

  --------------------------------------------------------------------------------------------------------------------
  Situation                           Recommended message/action
  ----------------------------------- --------------------------------------------------------------------------------
  Dashboard loading                   `Loading shipments…`

  Empty database                      `No shipments have been registered yet.` + `Create your first shipment`

  No filtered results                 `No shipments found. Try another reference number or clear the filters.`

  List API failure                    `We couldn't load shipments. Check your connection and try again.` + Retry

  Shipment not found                  `We couldn't find this shipment.` + Back to shipments

  Duplicate reference                 `This reference number is already in use. Enter a different reference number.`

  Validation failure                  Specific field-level message

  Create success                      `Shipment created successfully.`

  Status success                      `Shipment status updated successfully.`

  No-op status update                 `This shipment already has that status. No new history entry was added.`

  Generic update failure              `We couldn't save your changes. Your entries are still here—please try again.`

  Network unavailable                 `The server couldn't be reached. Check your connection and retry.`
  --------------------------------------------------------------------------------------------------------------------

Do not expose raw SQL messages, stack traces, connection details, or
environment values in the UI. Do not claim that a shipment is saved
until the backend confirms success.

------------------------------------------------------------------------

## 12. Frontend technology and dependency discipline

Preferred starting point:

-   React + TypeScript + Vite.
-   Tailwind CSS if it fits the existing setup and can be configured
    cleanly.
-   Native `fetch` through a shared API client unless the project has a
    justified existing HTTP-client dependency.
-   React Router only if it simplifies the required views.
-   Vitest + React Testing Library for component and interaction tests.
-   Existing icon library if already installed; otherwise evaluate the
    smallest reasonable option.

Before adding dependencies: 1. Inspect the repository and installed
packages. 2. Check current official documentation for chosen
versions/configuration. 3. Prefer existing dependencies and
platform-native features. 4. Avoid adding a state-management library for
this small application unless real complexity requires it. 5. Avoid
adding a component library solely to get buttons, inputs, and cards; the
required visual system is small enough to implement consistently.

The exact tool choices are proposals, not a reason to replace an
existing working setup without justification.

------------------------------------------------------------------------

## 13. Suggested frontend component/file structure

Adapt to the repository rather than forcing this exact tree:

``` text
frontend/
  src/
    app/
      App.tsx
      routes.tsx                 # if routing is used
    components/
      layout/
      ui/
      shipments/
    features/
      shipments/
        api/
        components/
        hooks/                   # only when useful
        schemas/
        types/
        pages/
    lib/
      api-client.ts
      formatters.ts
    styles/
      tokens.css                 # or Tailwind theme/config
    test/
  package.json
  tsconfig.json
  vite.config.ts
  .env.example
```

Keep API types and calls close enough to the shipment feature to be easy
to understand. Avoid excessive file splitting or abstractions that make
a simple request difficult to trace.

------------------------------------------------------------------------

## 14. Testing and acceptance criteria

The frontend is ready for review only when the required flows work and
the main states have been tested.

### Functional

-   [ ] Dashboard loads shipments from the API.
-   [ ] Search matches reference numbers through the backend.
-   [ ] Status filter works independently and together with search.
-   [ ] Changing search/filter resets pagination.
-   [ ] Pagination uses actual API metadata and respects the backend
    limit.
-   [ ] Empty database and no search matches are distinct states.
-   [ ] Create form validates fields and submits the agreed payload.
-   [ ] Duplicate reference errors are communicated usefully.
-   [ ] Created shipment opens correctly in detail view.
-   [ ] Detail view loads the selected shipment.
-   [ ] Status dropdown uses only allowed values.
-   [ ] Successful status update refreshes current status and history.
-   [ ] A no-op status update is not presented as a new event.
-   [ ] Missing shipment and network/server errors are handled.
-   [ ] Navigation back to the list preserves useful search/filter
    context where practical.

### Visual and responsive

-   [ ] Direction A + B combination is consistent across all views.
-   [ ] Layout hierarchy, spacing, typography, and controls are
    consistent.
-   [ ] Primary actions are easy to locate.
-   [ ] Desktop table is scannable.
-   [ ] Mobile shipment cards preserve key information.
-   [ ] No horizontal overflow or clipped controls at target widths.
-   [ ] Loading/empty/error states look intentional.

### Accessibility

-   [ ] All workflows can be completed by keyboard.
-   [ ] Focus indicators are visible.
-   [ ] Labels and validation messages are associated correctly.
-   [ ] Status is communicated with text as well as colour.
-   [ ] Text and controls have sufficient contrast.
-   [ ] Async feedback is announced appropriately.
-   [ ] Reduced-motion preference is respected.

### Engineering quality

-   [ ] TypeScript checks pass.
-   [ ] Production build succeeds.
-   [ ] Automated tests cover important interactions and error states.
-   [ ] No secrets or database credentials exist in frontend files.
-   [ ] No direct Supabase/database access from the browser.
-   [ ] No fabricated live data, metrics, or deployment claims.
-   [ ] Browser console has no unexplained errors/warnings.
-   [ ] API base URL is configured through `VITE_API_BASE_URL`.

------------------------------------------------------------------------

## 15. Proposed implementation sequence

This sequence describes the implementation approach, not permission to
skip the blueprint review.

### Step 1 --- Blueprint and contract analysis

Review this document against the actual repository, backend source, API
tests, and connected design/accessibility tools. Record confirmed
decisions, discrepancies, and justified improvements in a separate
implementation plan.

### Step 2 --- Foundation

Initialize or verify the frontend setup, establish the shared design
tokens, app shell, API client, error handling, and test setup.

### Step 3 --- Shipment dashboard

Implement list/search/filter/pagination and its loading, empty, and
error states.

### Step 4 --- Create shipment

Implement the labelled form, validation, pending/success/error handling,
and post-create navigation.

### Step 5 --- Shipment detail/history/status update

Implement shipment details, history timeline, status update, and clear
success/no-op/error feedback.

### Step 6 --- Quality pass

Test desktop/mobile layouts, keyboard navigation, contrast, reduced
motion, and all important API states. Review actual screenshots/browser
behaviour where the available tools support it.

### Step 7 --- Review and commit

Inspect the final diff, run type-check/build/tests, document results,
and create focused commits only after review. Do not deploy until
integration and deployment phases are approved.

------------------------------------------------------------------------

## 16. Guidance for the next blueprint-analysis pass

The next Antigravity prompt should use this document as the design
starting point and perform an analysis pass before writing frontend
implementation code.

It should:

1.  Read this entire blueprint and the existing repository
    documentation.
2.  Inspect the actual backend routes, Zod schemas, controllers,
    services, response envelopes, error codes, and tests.
3.  Identify all frontend/backend contract mismatches, especially
    payload fields, status-update notes, health behaviour, pagination
    metadata, and ID semantics.
4.  Inspect available design, accessibility, browser-inspection, and
    official-documentation skills/tools, using only relevant
    capabilities.
5.  Review this blueprint critically and suggest a **small number of
    high-value improvements** that improve clarity, usability,
    accessibility, reliability, or visual polish without expanding
    scope.
6.  Distinguish:
    -   Required assignment features.
    -   Decisions already agreed in this blueprint.
    -   Proposed improvements awaiting approval.
    -   Features explicitly out of scope.
7.  Create a second Markdown document, proposed path
    `docs/PHASE3_IMPLEMENTATION_PLAN.md`, with the actual API
    integration contract, component/page breakdown, dependency
    decisions, implementation order, testing strategy, risks, and
    acceptance criteria.
8.  Keep Antigravity chat output concise and write substantial analysis
    into the Markdown document.
9.  Do not implement frontend code during the analysis pass. Do not
    change the database, backend contract, or deployment settings. Wait
    for review before starting implementation.

A recommendation is not permission to add it automatically. Explain the
user problem it solves, the implementation cost, and why it is worth
including. Prefer a few carefully justified refinements over a long
feature wishlist.

------------------------------------------------------------------------

## 17. Reference guidance

These external references informed the accessibility and design-system
recommendations; they are guidance, not a requirement to copy another
organisation's branding:

-   W3C, **WCAG 2.2 Quick Reference**:
    https://www.w3.org/WAI/WCAG22/quickref/
-   W3C WAI, **What's New in WCAG 2.2**:
    https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
-   U.S. Web Design System, **Design Tokens**:
    https://designsystem.digital.gov/design-tokens/
-   U.S. Web Design System, **Form accessibility guidance**:
    https://designsystem.digital.gov/components/form/
-   U.S. Web Design System, **Table accessibility guidance**:
    https://designsystem.digital.gov/components/table/

Use these to verify specific decisions such as focus visibility,
keyboard operation, semantic tables, form labels, field-level
validation, contrast, and consistent design tokens. Do not claim
conformance without testing the implemented UI.

------------------------------------------------------------------------

## Final design summary

Build a light, navy-and-blue shipment operations workspace that combines
operational clarity with calm, premium spacing. Make the shipment list
the centre of the application, use a dedicated create form and
detail/history page, keep dropdowns simple and native where possible,
provide honest loading/empty/error states, and ensure every workflow is
keyboard-usable and responsive.

The best version of this project is not the one with the most features.
It is the one where the required shipment workflows are obvious,
consistent, accessible, and reliable---and where every visual choice
helps the user complete a task.
