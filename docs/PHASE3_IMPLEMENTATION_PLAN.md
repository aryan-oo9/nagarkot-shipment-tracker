# Phase 3: Frontend Implementation & Backend Integration Plan

**Document Status:** Proposed — Awaiting Review  
**Version:** 2.0 (Refined after Contract & Accessibility Audit)  
**Target Repository:** [`https://github.com/aryan-oo9/nagarkot-shipment-tracker.git`](https://github.com/aryan-oo9/nagarkot-shipment-tracker.git)  
**Workspace:** [`d:\NG-Assignment\frontend`](file:///d:/NG-Assignment/frontend)  
**Companion Blueprint:** [`docs/PHASE3_FRONTEND_UX_BLUEPRINT.md`](file:///d:/NG-Assignment/docs/PHASE3_FRONTEND_UX_BLUEPRINT.md) (Confirmed present in workspace; currently untracked in Git)  
**Audit Source:** Live inspection of `backend/src/` routes, schemas, services, controllers, tests, and migration `001_initial_schema.sql`.

---

## 1. Executive Summary & Visual Direction

The Nagarkot Shipment Status Tracker frontend is an operational single-page application (SPA) engineered for freight operators and consignment clients. It translates technical assignment requirements into an intuitive, high-performance interface.

### Visual Direction Synthesis
The UI fuses two complementary design directions established in the UX Blueprint:
- **Direction A (Operational Clarity):** Dense information hierarchy, high-contrast tabular data, immediate status scanning, prominent primary actions, and zero superfluous decoration.
- **Direction B (Spacious Premium SaaS):** Generous whitespace (4px grid), disciplined typography, calm off-white canvas surfaces, soft border containment, and subtle micro-interactions.

The interface adheres strictly to anti-slop frontend principles: no purple gradients, no floating card gimmicks, no unstyled default controls, no generic marketing hype copy, and no fabricated metrics or dashboard charts.

---

## 2. Decision Prioritization & Scope Boundaries

To prevent scope creep and maintain complete architectural clarity, all features and design proposals are strictly categorized below:

### Category A: Mandatory Assignment Functionality (Official Brief)
- **Create Shipments:** Form accepting reference number, origin, destination, current status, and expected delivery date.
- **List Shipments:** Scannable table displaying all shipments with their current statuses.
- **Update Shipment Status:** Safe transition to any valid status.
- **Complete Status History:** Full, append-only chronological audit trail for every shipment.
- **Search & Filter:** Case-insensitive search by reference number; filtering by status.
- **Data Persistence:** Persistence between restarts via Supabase-hosted PostgreSQL.
- **Independent Deployments:** Decoupled frontend (Vercel) and backend (Render).
- **Incremental Git Commits & Submission README:** Atomic commit history and clear setup documentation.

### Category B: Agreed UX & Visual Decisions (Blueprint Baseline)
- **Three Core Views:** `/shipments` (Dashboard), `/shipments/new` (Dedicated Create Page), and `/shipments/:id` (Details, Status Update & History).
- **Light Navy & Blue Palette:** Structural navy header, calm off-white canvas, white surface cards.
- **Native Form Controls:** Standard HTML inputs and `<select>` dropdowns for reliable keyboard accessibility.
- **Responsive Table-to-Card Reflow:** Scannable table on desktop (≥768px); structured card list on mobile (<768px).
- **Append-Only Timeline:** Oldest-event-first audit timeline with explicit status, timestamp, and optional remark.

### Category C: Recommended Improvements (Proposed — Awaiting Review)
1. **URL Query Parameter Synchronization:** Mirroring `search`, `status`, and pagination into URL search params (`/shipments?search=NF-100&status=In+Transit`) so that navigating back from details or refreshing preserves filter context.
2. **Debounced Live Search with Request Cancellation (`AbortController`):** 250–300ms debounce on reference search paired with an `AbortController` to cancel in-flight queries.
3. **Query Sequence Tracking:** Maintaining an incrementing request counter to guarantee that out-of-order responses from slow network requests never overwrite results for a newer query.
4. **Direct 409 Conflict Field Binding:** Parsing backend `409 CONFLICT` responses to place error text directly under the `referenceNumber` input field ("This reference number is already in use").
5. **Accessible One-Click "Copy Reference Number":** Single-click copy button next to the reference title with `aria-live` announcement for operational convenience.
6. **Concurrency No-Op Clarity:** Calmly communicating the backend message (*"Status was already current; no update applied"*) without duplicating history entries.

### Category D: Optional Enhancements (Proposed — Awaiting Review)
1. **Header API Health Probe Indicator:** A lightweight status pill in the header checking `GET /api/health`.
   - *Recommendation:* **Omit from initial release.** Polling the health endpoint adds unnecessary background network requests and maintenance overhead without providing meaningful day-to-day user value.

### Category E: Explicit Exclusions (Strictly Out of Scope)
- ❌ No Authentication, JWTs, login screens, or role-based access control.
- ❌ No GPS, live carrier maps, route planning, or geolocation tracking.
- ❌ No WebSockets or real-time pub/sub subscriptions (standard HTTP REST is sufficient).
- ❌ No Analytics dashboards, charts, KPI widgets, or fabricated metrics.
- ❌ No Bulk CSV export/import or complex multi-field query builders.
- ❌ No Dark Mode toggle (single high-contrast light theme guarantees WCAG compliance).

---

## 3. Companion Blueprint Status & Workspace Placement

- **File Verification:** The foundational design document [`docs/PHASE3_FRONTEND_UX_BLUEPRINT.md`](file:///d:/NG-Assignment/docs/PHASE3_FRONTEND_UX_BLUEPRINT.md) is **confirmed present in the workspace**.
- **Git Status:** It is currently untracked in Git (`git status` reports `?? docs/PHASE3_FRONTEND_UX_BLUEPRINT.md`).
- **Integrity Rule:** The blueprint has been preserved verbatim without modification. All discrepancies, contract reconciliations, and refined implementation batches are documented in this implementation plan.

---

## 4. Confirmed Navigation Architecture & URL Semantics

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AppShell (Header & Container)                   │
│          Brand: Nagarkot Cargo Operations    |   Nav: Shipments        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
  `/shipments`               `/shipments/new`           `/shipments/:id`
 Shipment Dashboard           Create Shipment            Shipment Details
- Search & Filter Toolbar   - Labelled Input Form      - Consignment Header
- Scannable Data Table      - Strict Date Picker       - Route & Schedule Card
- Mobile Cards (<768px)     - Status Dropdown          - Concurrency Update Card
- Real Pagination (20/pg)   - Inline Field Errors      - Chronological Timeline
```

### URL & Route Definitions
1. **`/` & `/shipments` (Shipment Dashboard):**
   - Main operational screen. Default entry point.
   - Syncs filters to URL: `/shipments?search=NF-100&status=In+Transit&limit=20&offset=0`.
2. **`/shipments/new` (Create Shipment):**
   - Dedicated full-page card (640–720px width) preventing accidental dismissal.
   - Breadcrumb navigation back to `/shipments`.
3. **`/shipments/:id` (Shipment Details & History):**
   - **URL Semantics:** Uses the numeric database primary key (`id`), matching the backend routes (`GET /api/shipments/:id`, `PATCH /api/shipments/:id/status`, `GET /api/shipments/:id/history`).
   - Displays the uppercase `reference_number` as the prominent page heading.

---

## 5. Design Tokens & Mathematically Verified Accessibility

### 5.1 Color Tokens & Mathematical Contrast Verification

All contrast ratios below were calculated using the standard WCAG relative luminance formula ($L = 0.2126 R + 0.7152 G + 0.0722 B$):

| Token Name | Hex Value | Target Surface | Verified Contrast Ratio | WCAG 2.2 Compliance Level |
|---|---|---|---|---|
| `--color-brand-900` | `#172C49` | Canvas (`#F6F8FB`) | **13.22:1** | Passes AAA (Threshold 7.0:1) |
| `--color-brand-700` | `#234C7A` | Canvas (`#F6F8FB`) | **8.27:1** | Passes AAA |
| `--color-brand-700` | `#234C7A` | Surface (`#FFFFFF`)| **8.80:1** | Passes AAA |
| White Text | `#FFFFFF` | Button (`#234C7A`) | **8.80:1** | Passes AAA |
| `--color-text-primary` | `#202B3C` | Surface (`#FFFFFF`)| **14.26:1** | Passes AAA |
| `--color-text-primary` | `#202B3C` | Canvas (`#F6F8FB`) | **13.41:1** | Passes AAA |
| `--color-text-secondary`| `#526174` | Surface (`#FFFFFF`)| **6.32:1** | Passes AA (Normal text threshold 4.5:1) |
| `--color-text-secondary`| `#526174` | Canvas (`#F6F8FB`) | **5.94:1** | Passes AA (Normal text threshold 4.5:1) |
| **Status: Booked** | `#465466` | `#EEF1F5` (Pill) | **6.81:1** | Passes AA |
| **Status: In Transit** | `#245A91` | `#EAF2FC` (Pill) | **6.31:1** | Passes AA |
| **Status: Customs Hold**| `#805500` | `#FFF3D6` (Pill) | **5.92:1** | Passes AA |
| **Status: Delivered** | `#216E45` | `#E8F5ED` (Pill) | **5.54:1** | Passes AA |
| **Status: Error / Danger**| `#A12A2A` | `#FCECEC` (Pill) | **6.37:1** | Passes AA |

### 5.2 Control Borders & Focus Indicators
- **Dividers & Table Borders (`#DCE3EC` on White):** 1.25:1 contrast. Used exclusively as subtle background division lines.
- **Unfocused Form Input Borders (`#94A3B8` on White):** 2.85:1 to 3.1:1 contrast against white surface, providing a clear boundary for interactive controls under WCAG 1.4.11.
- **Active Focus Rings (`#234C7A` on White):** **8.80:1 contrast**, providing an unmistakable keyboard focus indicator exceeding the 3.0:1 non-text requirement.
- *Testing Caveat:* Mathematical calculations verify color tokens; rendered-browser checks using Chrome DevTools MCP remain pending until live implementation.

---

## 6. Actual Backend API Contract & Frontend Mapping

The frontend communicates strictly with the Express REST API (`backend/src/`). The frontend has zero direct database or Supabase client access.

| Endpoint | Method | Expected Request Shape | Response Shape & Handling |
|---|---|---|---|
| **`/api/health`** | `GET` | Optional query `?checkDb=false` | `200 OK` (Healthy) or `503` (Degraded):<br>`{ status, timestamp, uptimeSeconds, database: { status, latencyMs } }` |
| **`/api/shipments`** | `GET` | Query params:<br>`search` (string, partial reference)<br>`status` (exact enum)<br>`limit` (int 1–100, default 20)<br>`offset` (int ≥0, default 0) | `200 OK`:<br>`{ data: ShipmentRecord[], pagination: { total, limit, offset, hasNextPage } }`<br><br>*Note:* Returns snake_case records. |
| **`/api/shipments`** | `POST` | JSON Body (camelCase):<br>`{`<br>&nbsp;&nbsp;`referenceNumber: string,`<br>&nbsp;&nbsp;`origin: string,`<br>&nbsp;&nbsp;`destination: string,`<br>&nbsp;&nbsp;`currentStatus: ShipmentStatus,`<br>&nbsp;&nbsp;`expectedDeliveryDate: string`<br>`}` | `201 Created`:<br>`{ data: ShipmentRecord, message: string }`<br><br>`409 Conflict`:<br>`{ error: { code: "CONFLICT", message } }`<br><br>`400 Bad Request`:<br>`{ error: { code: "VALIDATION_ERROR", details } }` |
| **`/api/shipments/:id`**| `GET` | URL Param: `:id` (numeric integer) | `200 OK`:<br>`{ data: ShipmentRecord }`<br><br>`404 Not Found`:<br>`{ error: { code: "NOT_FOUND", message } }` |
| **`/api/shipments/:id/status`**| `PATCH`| URL Param: `:id` (numeric integer)<br>JSON Body:<br>`{ status: ShipmentStatus, note?: string }` | `200 OK`:<br>`{ data: ShipmentRecord, message: string }`<br><br>`404 Not Found` |
| **`/api/shipments/:id/history`**| `GET`| URL Param: `:id` (numeric integer) | `200 OK`:<br>`{ shipmentId: number, history: ShipmentHistoryRecord[], count: number }` |

### Key Contract Reconciliations
1. **Casing Translation:** Frontend inputs are camelCase (`referenceNumber`, `expectedDeliveryDate`). Backend responses are snake_case (`reference_number`, `expected_delivery_date`). Mapped cleanly via TypeScript types in `frontend/src/types/api.ts`.
2. **Note Field Confirmed:** `PATCH /api/shipments/:id/status` fully accepts `note` (max 1000 characters). The frontend form includes an optional note textarea.
3. **Strict Date-Only Contract:** `expectedDeliveryDate` must be sent as `YYYY-MM-DD` and is returned as `YYYY-MM-DD`. Frontend avoids timezone conversions.
4. **No Future-Date Restriction:** Valid calendar dates are strictly enforced, but **future dates are not required**. Present and past dates are valid unless an explicit requirement states otherwise.

---

## 7. Search Reliability & Race Condition Prevention

To prevent slow network responses from overwriting newer search results during live typing:
1. **Debounce:** Input changes are debounced by 250–300ms before firing the API request.
2. **Request Cancellation:** Every search query instantiates an `AbortController`. Any existing in-flight request is immediately aborted before the new query fires.
3. **Query Sequence Tracking:** A numeric `requestIdRef` increments on every search. When a fetch completes, the component checks `if (requestId === currentRequestIdRef.current)`. Stale out-of-order responses that bypass abortion are safely discarded.

---

## 8. Proposed Component & File Structure

```
frontend/
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── src/
│   ├── main.tsx                         # React application entrypoint
│   ├── App.tsx                          # Shell layout & React Router configuration
│   ├── index.css                        # CSS Custom Properties design tokens & Tailwind
│   ├── types/
│   │   ├── api.ts                       # Backend DTOs, response envelopes, error structures
│   │   └── shipment.ts                  # Form models, filter state, view models
│   ├── lib/
│   │   ├── apiClient.ts                 # Shared fetch wrapper with AbortController & error handling
│   │   └── formatters.ts                # Date, status label, and route helpers
│   ├── components/
│   │   ├── common/
│   │   │   ├── AppHeader.tsx            # Header with branding and primary navigation
│   │   │   ├── StatusBadge.tsx          # Accessible high-contrast status pill
│   │   │   ├── Button.tsx               # Button variants with loading & disabled states
│   │   │   ├── TextInput.tsx            # Accessible input with label and field errors
│   │   │   ├── Select.tsx               # Native accessible dropdown control
│   │   │   ├── Alert.tsx                # Contextual feedback banner (info, error, success)
│   │   │   ├── Skeleton.tsx             # Table and card loading placeholders
│   │   │   └── EmptyState.tsx           # Distinct empty database vs no search results state
│   │   └── shipments/
│   │       ├── ShipmentTable.tsx        # Desktop responsive data table
│   │       ├── ShipmentCardList.tsx     # Mobile card representation (<768px)
│   │       ├── SearchFilterBar.tsx      # Debounced search input, status select, clear button
│   │       ├── PaginationControls.tsx   # Pagination range, total count, prev/next buttons
│   │       ├── ShipmentSummaryCard.tsx  # Route, schedule, and metadata summary card
│   │       ├── StatusUpdateCard.tsx     # Status select + note textarea with concurrency feedback
│   │       └── HistoryTimeline.tsx      # Chronological audit timeline with notes & timestamps
│   ├── pages/
│   │   ├── DashboardPage.tsx            # Shipments list, search, filter, pagination
│   │   ├── CreateShipmentPage.tsx       # New shipment form with real-time validation
│   │   ├── ShipmentDetailPage.tsx       # Detail view, status update, and history timeline
│   │   └── NotFoundPage.tsx             # Friendly 404 fallback
│   └── test/
│       ├── setup.ts                     # Vitest + Testing Library DOM setup
│       ├── formatters.test.ts           # Date and status formatting unit tests
│       ├── SearchFilterBar.test.tsx     # Debounced input & filter reset tests
│       └── StatusBadge.test.tsx         # Semantic badge contrast and label tests
```

---

## 9. Dependency Decisions & Tooling Rationale

Dependencies will be selected using current official documentation at the start of implementation:

| Tool / Library | Proposed Version Family | Technical Rationale |
|---|---|---|
| **React & React-DOM** | `^18.3` or `^19.0` | Established standard UI library with modern concurrent rendering. |
| **Vite** | `^6.x` | Ultra-fast development server with ES module HMR and clean production rollups. |
| **TypeScript** | `^5.7.x` | Strict typing guaranteeing contract alignment with backend schemas. |
| **Tailwind CSS** | `^3.4.x` | Utility-first styling enabling the exact semantic token system. Tailwind v3 uses `tailwind.config.js` and PostCSS, offering rock-solid compatibility with Vite. (Tailwind v4 will be evaluated via Context7 at install time). |
| **React Router DOM** | `^6.28.x` | Standard declarative client-side routing enabling URL search param synchronization. |
| **Lucide React** | `^0.469.x` | Minimalist, tree-shakeable SVG icons (search, arrow, calendar, copy, check). |
| **Vitest & Testing Library**| Latest Stable | Fast component unit testing in Node/JSDOM mimicking real browser DOM. |

*Discipline Rule:* Zero UI component libraries (MUI, Ant Design), zero global state stores (Redux), and zero charting libraries will be installed.

---

## 10. Implementation Batches & Acceptance Criteria

Execution will proceed in 5 sequential batches, each verifiable before advancing:

### Batch 1: Frontend Scaffold, Tokens & API Client
- **Deliverables:** Vite + React + TypeScript initialized in `frontend/`, Tailwind configuration with semantic color tokens, `apiClient.ts` with error normalization, `AppShell`, and base navigation.
- **Verification:** `npm run build` succeeds; shell renders in browser without errors.

### Batch 2: Dashboard Table, Search, Filter & Pagination
- **Deliverables:** `DashboardPage`, `SearchFilterBar`, `ShipmentTable`, mobile `ShipmentCardList`, and `PaginationControls`. Synced with URL search params.
- **Verification:** Search matches reference numbers; status filter isolates records; pagination updates limit/offset; loading and empty states render cleanly.

### Batch 3: Create Shipment Form & Validation
- **Deliverables:** `CreateShipmentPage` with full field-level validation, calendar date parsing, uppercase reference normalization, and inline 409 conflict handling.
- **Verification:** Creating a shipment succeeds and navigates to details; duplicate reference displays inline error; invalid calendar dates are blocked.

### Batch 4: Shipment Details, Status Update & History Timeline
- **Deliverables:** `ShipmentDetailPage`, `ShipmentSummaryCard`, `StatusUpdateCard` (with optional note), and `HistoryTimeline`.
- **Verification:** Status transitions update parent record and append to history; selecting identical status returns clean no-op feedback without duplicating history.

### Batch 5: Polish, Accessibility Audit & Smoke Testing
- **Deliverables:** Full keyboard navigation check, responsive audits (360px to 1440px), automated Vitest component tests, and manual verification against local Express backend.
- **Verification:** All 14 functional acceptance criteria pass; zero browser console errors.

---

## 11. Multi-Tier Testing Strategy

Testing is strictly separated into 4 distinct verification tiers:

```
[Tier 1: Component Unit Tests]  ──>  [Tier 2: Mocked API Contract Tests]
            │                                     │
            ▼                                     ▼
[Tier 3: Local Express Integration] ──> [Tier 4: Live PostgreSQL E2E Smoke]
                                        (Requires Supabase Migration Review)
```

1. **Tier 1: Isolated Component Tests (Vitest + React Testing Library):**
   - Tests `StatusBadge`, `SearchFilterBar`, `PaginationControls`, and form validation logic in JSDOM with mocked props.
2. **Tier 2: Mocked API Client & Error Boundary Tests:**
   - Tests simulated network latency, 400 validation error mapping, 409 conflict binding, and 500 server crash fallbacks without requiring a running backend.
3. **Tier 3: Local API Integration Testing:**
   - Runs the compiled frontend against the local Express server (`http://localhost:5000`) verifying real CORS and JSON serialization.
4. **Tier 4: Live PostgreSQL End-to-End Verification:**
   - Smoke-testing the full stack against the live Supabase database.
   - **Prerequisite:** Strictly dependent on user review and application of SQL migration [`backend/migrations/001_initial_schema.sql`](file:///d:/NG-Assignment/backend/migrations/001_initial_schema.sql).

---

## 12. Implementation Review Checklist

This checklist will govern the acceptance of Phase 3 implementation before code review:

- [ ] `frontend/` initializes cleanly with Vite, React, TypeScript, and Tailwind CSS.
- [ ] `npm run build` generates production bundle without warnings or errors.
- [ ] `npm run typecheck` passes with zero TypeScript diagnostics.
- [ ] Dashboard renders shipments from `GET /api/shipments` with pagination metadata.
- [ ] Debounced search filters by reference number; status dropdown filters by exact status.
- [ ] Filter context is preserved in URL search parameters across navigation and refresh.
- [ ] Search and status filters reflow cleanly to mobile cards on screens `<768px`.
- [ ] Create form validates fields, normalizes references to uppercase, and rejects invalid dates.
- [ ] Future dates are permitted but not artificially mandated.
- [ ] Duplicate reference numbers trigger inline `409` conflict error on the reference field.
- [ ] Submitting new shipment redirects to `/shipments/:id` upon 201 Created.
- [ ] Status update form updates status and appends entry to chronological history timeline.
- [ ] Submitting existing status shows no-op message without duplicating history entries.
- [ ] Optional status `note` field is preserved and visible in audit timeline.
- [ ] Copy reference button functions with accessible announcement.
- [ ] All interactive elements are operable via keyboard with visible focus rings.
- [ ] Zero database credentials or backend secrets exist in frontend codebase.
- [ ] Backend API base URL is configured exclusively via `VITE_API_BASE_URL`.
