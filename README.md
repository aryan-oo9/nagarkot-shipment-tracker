# Nagarkot Shipment Status Tracker

Full-stack shipment tracking application developed for the **Nagarkot Forwarders Pvt. Ltd.** technical hiring assignment.

## Project Purpose

The application allows logistics operators and customers to track cargo consignments, create new shipments, update transit statuses, view append-only status histories, and filter consignments by reference number or operational status.

## Current Project Status

- **Phase:** Phase 2 – Backend Implementation (Completed; awaiting migration application approval)
- **Implementation Status:**
  - Backend: Complete Express REST API in [`backend/`](./backend/) with TypeScript, Zod, and PostgreSQL connection pooling. Automated tests and type-checking verified.
  - Database: Initial schema migration authored in [`backend/migrations/001_initial_schema.sql`](./backend/migrations/001_initial_schema.sql).
  - Frontend: Pending Phase 3 (React + TypeScript + Vite).
  - Deployment: Pending Phase 5.

## Planned Technology Stack

- **Frontend:** React, TypeScript, Vite (Target deployment: Vercel)
- **Backend:** Node.js, Express, TypeScript (Target deployment: Render)
- **Database:** PostgreSQL (Supabase-hosted managed database), accessed directly via `pg` (node-postgres)
- **Validation:** Zod (runtime API request schema validation)
- **Architecture:** Monorepo with independent `frontend/` and `backend/` sub-packages

## Backend Local Setup & Verification

### 1. Installation
```powershell
cd backend
npm install
```

### 2. Environment Configuration
Copy the template and provide valid PostgreSQL credentials:
```powershell
cp .env.example .env
```
Key variables:
- `PORT=5000`
- `DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres`
- `CORS_ORIGIN=http://localhost:5173`

### 3. Database Migration
Apply the SQL migration file [`backend/migrations/001_initial_schema.sql`](./backend/migrations/001_initial_schema.sql) through the **Supabase Dashboard SQL Editor** before running database-backed operations.

### 4. Running Verification Commands
- **Type-Check:** `npm run typecheck`
- **Build:** `npm run build`
- **Automated Tests:** `npm test`
- **Development Server:** `npm run dev`
- **Production Server:** `npm start`
- **Manual PowerShell Smoke Test:** `powershell -ExecutionPolicy Bypass -File scripts/smoke-test.ps1`

## Documentation Index

Detailed planning and architecture specifications are maintained in the [`docs/`](./docs/) directory:

- [Project Master Plan](docs/PROJECT_PLAN.md): Hiring objectives, phase-by-phase scope, requirements traceability, and status.
- [System Architecture](docs/ARCHITECTURE.md): Frontend/Backend/Database decoupling, API endpoint contracts, error handling, and hosting boundaries.
- [Data Model & Persistence](docs/DATA_MODEL.md): Two-table relational schema, transactional integrity, status transition assumptions, and indexing.
- [Development Workflow](docs/DEVELOPMENT_WORKFLOW.md): Incremental development rules, tool usage (Context7, Chrome DevTools MCP, design skills), security protocols, and testing discipline.

---
*Note: Comprehensive live deployment URLs will be added during Phase 6 (Final Documentation and Submission).*
