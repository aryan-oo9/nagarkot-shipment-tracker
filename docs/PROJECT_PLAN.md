# Project Master Plan: Nagarkot Shipment Tracker

## 1. Project Objective & Context

This project is a full-stack web application built for the **Nagarkot Forwarders Pvt. Ltd.** technical hiring assignment. The application provides an operational shipment tracking dashboard where forwarders and clients can monitor cargo statuses across international and domestic logistics corridors.

The primary goal is to demonstrate clean full-stack software craftsmanship: robust data integrity, production-ready TypeScript code, clear transactional separation, responsive UI, accessible design, and zero artificial complexity.

---

## 2. Requirements Traceability: Official vs. Implementation Decisions

| Official Assignment Requirement | Implementation Architecture Decision |
|---|---|
| **Create shipments** with reference number, origin, destination, current status, expected delivery date | Express `POST /api/shipments` validated with Zod; creates shipment and initial history record atomically in PostgreSQL. |
| **List shipments** and their current statuses | Express `GET /api/shipments` returning sorted shipments; visualized in React operational dashboard table with search and filters. |
| **Update shipment status** | Express `PATCH /api/shipments/:id/status` validating allowed status values; atomically updates status and appends history entry. |
| **View complete status history** | Express `GET /api/shipments/:id/history` returning ordered audit trail (`ORDER BY changed_at ASC, id ASC`); visualized as a timeline in React. |
| **Search/filter** by status or reference number | Express query params `?search=` and `?status=`, backed by parameterized SQL queries and database indexes. |
| **Persist data between restarts** | Persistent PostgreSQL database hosted on Supabase; direct connection via `pg` (node-postgres) driver. |
| **Deploy frontend & backend separately** | Independent deployments: Frontend on Vercel (SPA static bundle), Backend on Render (Node.js web service). |
| **Incremental Git commits** | Strict phase-by-phase development workflow; each milestone tested and verified before committing. |
| **Comprehensive README** | Final README to cover architecture decisions, local setup, data assumptions, and scalability analysis for 10,000+ shipments. |

---

## 3. Agreed Technology Stack

- **Frontend:** React 19 / 18, TypeScript, Vite, Tailwind CSS / Vanilla CSS design tokens.
- **Backend:** Node.js (v24), Express, TypeScript, Zod validation.
- **Database:** PostgreSQL (Supabase-hosted managed instance).
- **Database Driver:** `pg` (node-postgres) with connection pooling and explicit SQL transactions.
- **Hosting Targets (Provisional):** Vercel (Frontend), Render (Backend).
- **Tooling & Build:** Local `npm` scripts and `npx` execution; zero reliance on global CLI tools.

---

## 4. Scope Boundaries & Explicit Exclusions

To ensure focus on assignment criteria and avoid over-engineering, the following items are strictly **out of scope**:

- ❌ User authentication, JWTs, login forms, sessions.
- ❌ Role-based access control (RBAC) or multi-tenant organizational accounts.
- ❌ Microservices, message queues (RabbitMQ/Kafka), or serverless event brokers.
- ❌ WebSockets or real-time pub/sub subscriptions (standard HTTP REST is sufficient).
- ❌ Heavy ORMs (Prisma, TypeORM) — raw parameterized SQL via `pg` is required.
- ❌ Map integrations (Google Maps, Leaflet) or live GPS tracking.
- ❌ AI/LLM chatbot integrations inside the application.
- ❌ Docker containerization is optional and will not block core deployment.

---

## 5. Development Phases & Acceptance Criteria

### Phase 1: Repository Foundation, Architecture Decisions & Project Documentation *(Current)*
- **Goal:** Clean repository setup, verified remote, core documentation suite (`docs/`), `.gitignore`, and development workflow definition.
- **Acceptance Criteria:** Repository cloned, remote verified, `.gitignore` protects secrets, `PROJECT_PLAN.md`, `ARCHITECTURE.md`, `DATA_MODEL.md`, `DEVELOPMENT_WORKFLOW.md`, and initial `README.md` created. No code implementation started.

### Phase 2: Database Schema & Backend Core Implementation
- **Goal:** Initialize Express backend with TypeScript, database connection pooling, table migration script, Zod validators, and core REST endpoints with transactions.
- **Acceptance Criteria:** Express server compiles cleanly (`npx tsc --noEmit`); database schema migrated; `POST /api/shipments`, `GET /api/shipments` (with search/filter), `PATCH /api/shipments/:id/status`, and `GET /api/shipments/:id/history` implemented with parameterized SQL and transactions; API tested via automated curl scripts.

### Phase 3: Frontend Implementation & UI Quality
- **Goal:** Initialize React + Vite + TypeScript application, create accessible logistics UI dashboard, forms, status timeline, and search/filter components.
- **Acceptance Criteria:** Fast Vite build; zero AI-slop design tells; clear logistics color tokens; reactive search/filter; shipment creation dialog; status update modal; history timeline; tested in Chrome DevTools MCP.

### Phase 4: Full-Stack Integration, End-to-End Testing & Hardening
- **Goal:** Connect frontend to backend, test error handling (400, 404, 409, 500), verify CORS, validate edge cases (empty states, invalid dates, network latency).
- **Acceptance Criteria:** End-to-end user flows verified; atomic transaction rollback confirmed on simulated error; console error-free.

### Phase 5: Cloud Deployment & Live Verification
- **Goal:** Deploy backend to Render, deploy frontend to Vercel, configure production environment variables (`DATABASE_URL`, `CORS_ORIGIN`, `VITE_API_BASE_URL`), verify live health checks.
- **Acceptance Criteria:** Public Vercel URL interacts successfully with public Render API URL; database persistence verified across restarts.

### Phase 6: Final Documentation, Submission & Repository Audit
- **Goal:** Finalize root `README.md` with full setup instructions, API specs, architectural explanations, 10k shipment scalability analysis, and final repository verification.
- **Acceptance Criteria:** Clean git log with meaningful commit messages; all tests passing; live links operational; repository submitted according to assignment instructions.

---

## 6. Current Status & Unresolved Decisions

- **Current Status:** Phase 1 complete. Foundation, documentation, and workflow established.
- **Unresolved / Provisional Decisions:**
  1. *Supabase Connection:* Actual database host URL and password pending configuration by user in Phase 2.
  2. *Render/Vercel Accounts:* Exact deployment URLs will be established during Phase 5.
  3. *Reference Number Pattern:* Needs format convention (e.g., `NF-XXXXXX` vs. free-text input). Proposed as uppercase alphanumeric string.

---

## 7. Change Management Governance

All subsequent implementation phases **must strictly follow this plan**. If any technical hurdle, platform constraint, or architectural insight requires modifying the stack, schema, or workflow, the change must be explicitly justified, reviewed, and recorded in this document before implementation proceeds.
