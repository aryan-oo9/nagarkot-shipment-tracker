# Nagarkot Forwarders Pvt. Ltd. — Shipment Status Tracker

Full-stack logistics consignment tracking application developed for the **Nagarkot Forwarders Pvt. Ltd.** technical evaluation.

The system allows freight forwarders, cargo dispatchers, and operations staff to register consignments, distinguish domestic from international cargo, monitor operational lifecycles, record status transitions with chronological audit notes, and visualize real-time metrics across trade operations.

---

## Live Deployment

- **Frontend Application (Vercel):** `PENDING_DEPLOYMENT`
- **Backend REST API (Render):** `PENDING_DEPLOYMENT`

*(Deployment URLs will be updated once hosted service provisioning is completed).*

---

## Features

- **Consignment Registration:** Create new shipments with unique reference numbers, origin, destination, expected delivery date, initial status, and explicit **Domestic** vs. **International** classification.
- **Searchable Inventory:** Filter consignments by operational status (`Booked`, `In Transit`, `Customs Hold`, `Delivered`), search by reference number (case-insensitive substring matching), and navigate results using server-side pagination.
- **Operations Overview Dashboard:** High-level dashboard featuring four summary KPI cards (**This month**, **This year**, **Domestic**, **International**), an interactive 75:25 layout with the latest 5 updated records, and a native SVG status distribution donut chart with accessible text summaries.
- **Consignment Detail View:** Comprehensive shipment overview displaying routes, dates, classification badges, and a one-click copy-to-clipboard action for reference numbers.
- **Status Update Management:** Update shipment status with optional operational notes (up to 1,000 characters) with feedback for successful transitions or unchanged status submissions.
- **Chronological Audit History:** Append-only timeline capturing every status change, exact timestamp, and operator notes, preserving an immutable historical trail.
- **Persistent Left Sidebar:** Fixed desktop navigation shell supporting Home, Consignment Creation, and History navigation modes with responsive mobile drawer support.

---

## Technology Choices & Rationale

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | **React 18 + TypeScript + Vite** | Component-driven UI development with strict typing, instant HMR via Vite, and lightweight client-side routing with React Router v6. |
| **Styling** | **Tailwind CSS v3.4** | Utility-first styling enabling a clean, accessible design system tailored for operational logistics workflows without bulky component library overhead. |
| **Backend API** | **Node.js + Express + TypeScript** | Lightweight, event-driven REST API with layered architecture (Routes &rarr; Controllers &rarr; Services &rarr; Database Pool) and complete end-to-end type safety. |
| **Database** | **PostgreSQL 17 (Supabase)** | Robust ACID-compliant relational persistence, declarative check constraints, relational foreign keys, and conditional aggregation queries. |
| **Validation** | **Zod** | Schema-first runtime validation for API payloads and query parameters, providing detailed error messages on invalid input. |
| **Connection Pooling** | **`pg` (node-postgres)** | Native connection pooling with SSL support, connection timeouts, and graceful pool shutdown handling. |

### Architectural Decoupling
The React frontend never communicates directly with PostgreSQL or Supabase credentials. All client requests flow through the Express REST API, ensuring complete separation of concerns, centralized input validation, and secure database credential isolation.

---

## System Architecture

```text
┌─────────────────┐       HTTP / JSON       ┌─────────────────────┐       pg Pool (TCP)       ┌──────────────────────────┐
│  React Frontend │  ─────────────────────> │  Express REST API   │  ───────────────────────> │  PostgreSQL 17 Database  │
│  (Vite + TS)    │  <───────────────────── │  (Node.js + TS)     │  <─────────────────────── │  (Supabase Cloud)        │
└─────────────────┘       CORS Allowed      └─────────────────────┘       SSL Encrypted       └──────────────────────────┘
```

- **Frontend Layer:** Handles state management, UI rendering, input masking, client-side validation, and accessible feedback states.
- **API Layer:** Enforces request schema validation via Zod, manages CORS policies, orchestrates atomic database transactions, and standardizes JSON responses.
- **Persistence Layer:** Stores relational records with foreign key integrity, domain check constraints, and indexed lookups.

---

## Data Model & Assumptions

The relational schema comprises two core tables:

### 1. `shipments`
- `id` (SERIAL PRIMARY KEY): Unique internal numerical identifier.
- `reference_number` (VARCHAR(64) UNIQUE NOT NULL): External shipment reference identifier (e.g., `NF-102941`).
- `shipment_type` (VARCHAR(20) NOT NULL): Classification constrained to `'Domestic'` or `'International'`.
- `origin` (VARCHAR(255) NOT NULL): Origin terminal or locality.
- `destination` (VARCHAR(255) NOT NULL): Destination terminal or port.
- `current_status` (VARCHAR(50) NOT NULL): Constrained to `'Booked'`, `'In Transit'`, `'Customs Hold'`, or `'Delivered'`.
- `expected_delivery_date` (DATE NOT NULL): Estimated delivery date (`YYYY-MM-DD`).
- `created_at` (TIMESTAMPTZ NOT NULL DEFAULT NOW()): Record registration timestamp.
- `updated_at` (TIMESTAMPTZ NOT NULL DEFAULT NOW()): Last modification timestamp.

### 2. `shipment_status_history`
- `id` (SERIAL PRIMARY KEY): Unique history record identifier.
- `shipment_id` (INT NOT NULL REFERENCES shipments(id) ON DELETE CASCADE): Parent shipment reference.
- `status` (VARCHAR(50) NOT NULL): Status at the time of update.
- `changed_at` (TIMESTAMPTZ NOT NULL DEFAULT NOW()): Transition timestamp.
- `note` (TEXT NULL): Operational dispatch or customs note.

### Transactional & Domain Assumptions
- **Atomic Registration:** When a shipment is created, both the `shipments` row and its initial status history entry (`"Initial consignment registration"`) are written inside an atomic `BEGIN...COMMIT` database transaction. If either operation fails, the transaction is rolled back.
- **Atomic Status Updates:** Updating a shipment acquires an atomic transaction that modifies `current_status`, updates `updated_at = NOW()`, and inserts a new immutable audit record into `shipment_status_history`.
- **Calendar & Timezone Policy:** Aggregations for "This month" and "This year" calculate boundaries based on UTC (`date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE 'UTC')`), ensuring predictable reporting regardless of server locality.
- **Database Provisioning Note:** As database migration files are excluded from this public submission repository, the target PostgreSQL database must already be provisioned with these two tables, check constraints, and appropriate indexes before running the application.

---

## Shipment Status Flow

```text
[ Booked ] ──> [ In Transit ] ──> [ Customs Hold ] ──> [ Delivered ]
     │                │                  │
     └────────────────┴──────────────────┴──> (Any valid operational transition)
```

1. **Booked:** Initial state assigned upon consignment registration.
2. **In Transit:** Consignment has departed origin terminal and is en route.
3. **Customs Hold:** Consignment held for customs inspection, clearance, or documentation review.
4. **Delivered:** Consignment safely arrived and confirmed at final destination.

Operators may transition a consignment to any valid status to reflect real-world logistics exceptions (e.g., transitioning from In Transit to Customs Hold, or releasing a hold back into Transit). Every update requires an explicit target status selection and accepts an optional operational note (up to 1,000 characters). Submitting the existing current status is treated idempotently with informative feedback.

---

## Local Setup & Installation

### Prerequisites
- **Node.js:** v20.0.0 or higher
- **npm:** v10.0.0 or higher
- **PostgreSQL 17 Database:** A running PostgreSQL database (e.g. Supabase) with the `shipments` and `shipment_status_history` tables pre-configured.

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/aryan-oo9/nagarkot-shipment-tracker.git
cd nagarkot-shipment-tracker
```

---

### Step 2: Backend Setup
Open a terminal in the root directory:
```bash
cd backend
npm install
```

Create a `.env` file from the provided example template:
```bash
# On Windows PowerShell:
Copy-Item .env.example .env

# On Linux/macOS:
cp .env.example .env
```

Configure your environment variables in `backend/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
CORS_ORIGIN=http://localhost:5173
```

Start the backend API development server:
```bash
npm run dev
```
The API server will listen on `http://localhost:5000`. Verify its health by opening `http://localhost:5000/api/health` in your browser.

---

### Step 3: Frontend Setup
Open a second terminal window:
```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:
```bash
# On Windows PowerShell:
Copy-Item .env.example .env

# On Linux/macOS:
cp .env.example .env
```

Configure `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend Vite development server:
```bash
npm run dev
```
Open your browser at `http://localhost:5173` (or the port indicated in Vite's terminal output).

---

### Key Commands Summary

| Project | Command | Purpose |
| :--- | :--- | :--- |
| **Backend** | `npm run dev` | Starts API development server with auto-reload (`tsx watch`) |
| **Backend** | `npm run build` | Compiles TypeScript to `dist/` |
| **Backend** | `npm start` | Runs compiled production server (`node dist/server.js`) |
| **Backend** | `npm run typecheck` | Validates TypeScript types |
| **Frontend** | `npm run dev` | Starts Vite development server with HMR |
| **Frontend** | `npm run build` | Validates types and compiles production assets into `dist/` |
| **Frontend** | `npm run typecheck` | Runs TypeScript static verification |
| **Frontend** | `npm run preview` | Previews local production build |

---

## Scaling to 10,000 Shipments & Concurrent Users

To scale this application reliably to 10,000 active consignments and high concurrent user traffic:

1. **Database Indexing & Query Plans:** Add composite indexes on `(current_status, created_at DESC)` and `(shipment_type, created_at DESC)`, as well as a PostgreSQL trigram index (`pg_trgm`) on `reference_number` for fast sub-millisecond substring searches under volume.
2. **Efficient Server-Side Pagination:** Continue using bounded page sizes (default limit 20) with offset or keyset pagination (`WHERE id < :cursor`) to guarantee consistent query execution times as rows grow.
3. **Database Connection Pooling:** Integrate transaction-level connection pooling (such as Supabase Supavisor or PgBouncer) to multiplex thousands of concurrent client connections over a modest pool of database workers (e.g. 20–50 connections) without exhausting database memory limits.
4. **Summary Aggregation Optimization:** For dashboard metrics, the existing implementation uses a single conditional aggregate query (`FILTER (WHERE ...)`), which evaluates efficiently in PostgreSQL. Under sustained high traffic, dashboard metrics could be cached in Redis with a 30–60 second TTL or maintained via materialized views refreshed concurrently.
5. **Concurrency Safety:** For status updates, apply optimistic concurrency control (checking a row `version` or comparing `updated_at`) or `SELECT ... FOR UPDATE` row locks within the update transaction to prevent race conditions during simultaneous operator status submissions.

---

## Scope & Limitations

- **Authentication & Authorization:** In accordance with the hiring assignment guidelines, user authentication, multi-tenant accounts, role-based access control (RBAC), and permissions are out of scope.
- **Docker:** Containerization is optional per the specification and not required for local setup or deployment.
- **Schema Management:** Migration files have been excluded from the public GitHub repository per submission guidelines; database tables and constraints must be provisioned directly in PostgreSQL.
