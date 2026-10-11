# System Architecture: Nagarkot Shipment Tracker

## 1. High-Level Architectural Overview

The system is designed as a classic, decoupled three-tier web application prioritizing simplicity, strong data consistency, and clear operational boundaries:

```
┌─────────────────────────────────┐
│     React 19 / Vite SPA         │  <--- Client Tier (Hosted on Vercel)
│ (TypeScript, UI State, Filters) │
└────────────────┬────────────────┘
                 │ HTTP / REST (JSON)
                 │ CORS-Protected
                 ▼
┌─────────────────────────────────┐
│       Node.js / Express         │  <--- Application Tier (Hosted on Render)
│  (TypeScript, Zod Validation,   │
│   Connection Pool, Transacted)  │
└────────────────┬────────────────┘
                 │ Parameterized SQL over TLS
                 │ pg connection pool
                 ▼
┌─────────────────────────────────┐
│    PostgreSQL Database          │  <--- Persistence Tier (Supabase-hosted)
│ (Shipments, Audit History,      │
│  Relational Integrity & Indexes)│
└─────────────────────────────────┘
```

---

## 2. Responsibilities by Layer

### A. Client Presentation Layer (Frontend)
- **Technology:** React, TypeScript, Vite.
- **Responsibilities:**
  - Rendering operational dashboards, shipment lists, search inputs, status filter badges, shipment creation forms, and history audit timelines.
  - Client-side input validation and error display.
  - Zero direct database access: communication occurs strictly via HTTP calls to the Express backend.
  - Managing UI states (loading spinners, empty states, error notices, confirmation modals).

### B. Application & Business Logic Layer (Backend)
- **Technology:** Node.js, Express, TypeScript.
- **Responsibilities:**
  - Exposing REST API endpoints conforming to consistent JSON contracts.
  - Runtime request body and query parameter validation via **Zod**.
  - Enforcing business rules (e.g., valid status transitions, unique reference numbers).
  - Executing parameterized SQL queries using the `pg` pool to prevent SQL injection.
  - Managing database transactions (`BEGIN`, `COMMIT`, `ROLLBACK`) for atomic multi-table writes.
  - Centralized error handling and standardized HTTP status response codes.

### C. Data Persistence Layer (Database)
- **Technology:** PostgreSQL (hosted on Supabase).
- **Responsibilities:**
  - Persisting shipment data and immutable audit history entries.
  - Enforcing schema constraints (primary keys, foreign keys, uniqueness, not-null constraints, check constraints).
  - Providing fast query retrieval via B-Tree indexes on `reference_number` and `shipment_id`.
  - Ensuring ACID transactional compliance.

---

## 3. Hosting & Deployment Separation

Frontend and backend will be deployed as distinct services to mirror real-world production architectures:

- **Frontend Deployment (Vercel):**
  - Built as a static Single Page Application (`vite build` -> `dist/`).
  - Deployed to Vercel's global CDN.
  - Configured with SPA rewrite rules (`vercel.json`) to route all requests to `index.html`.
  - Configured with environment variable `VITE_API_BASE_URL` pointing to the Render backend URL.

- **Backend Deployment (Render):**
  - Built as a Node.js web service (`tsc` -> `dist/`).
  - Runs Express with `PORT` provided by Render.
  - Securely connects to Supabase PostgreSQL using `DATABASE_URL` via SSL/TLS (`ssl: { rejectUnauthorized: false }` or Supabase CA cert).
  - Configured with `CORS_ORIGIN` matching the Vercel production frontend domain.

---

## 4. REST API Endpoint Contract (Implemented in Phase 2)

*(The backend API is implemented in `backend/src/` conforming to the contracts below).*

### Health Check
- **`GET /api/health`**
  - **Purpose:** Verifies server and database connection health for monitoring and deployment probes. Supports `?checkDb=false` to bypass database ping if needed.
  - **Success Response (200 OK - Database Connected):**
    ```json
    {
      "status": "healthy",
      "timestamp": "2026-10-11T13:45:00.000Z",
      "uptimeSeconds": 124,
      "database": {
        "status": "connected",
        "latencyMs": 4
      }
    }
    ```
  - **Degraded Response (503 Service Unavailable - Database Disconnected):**
    ```json
    {
      "status": "degraded",
      "timestamp": "2026-10-11T13:45:00.000Z",
      "uptimeSeconds": 124,
      "database": {
        "status": "disconnected",
        "error": "Connection timeout"
      }
    }
    ```

### Shipments Collection
- **`POST /api/shipments`**
  - **Purpose:** Create a new shipment consignment and automatically record its initial history entry.
  - **Request Body:**
    ```json
    {
      "reference_number": "NF-98214",
      "origin": "Kathmandu, Nepal",
      "destination": "Hamburg, Germany",
      "current_status": "Booked",
      "expected_delivery_date": "2026-11-05"
    }
    ```
  - **Response (201 Created):** Returns the created shipment record.

- **`GET /api/shipments`**
  - **Purpose:** Retrieve shipments with optional search and filtering.
  - **Query Parameters:**
    - `search` (optional, string): Case-insensitive match on `reference_number`, `origin`, or `destination`.
    - `status` (optional, string): Filter by exact status (e.g., `Booked`, `In Transit`, `Customs Hold`, `Delivered`).
  - **Response (200 OK):**
    ```json
    {
      "data": [ ...shipments ],
      "count": 12
    }
    ```

### Single Shipment
- **`GET /api/shipments/:id`**
  - **Purpose:** Fetch a single shipment by its primary key ID.
  - **Response (200 OK):** Full shipment object.
  - **Response (404 Not Found):** Error if ID does not exist.

### Status Update
- **`PATCH /api/shipments/:id/status`**
  - **Purpose:** Update the current status of a shipment and append a history record.
  - **Request Body:**
    ```json
    {
      "status": "In Transit",
      "note": "Departed Tribhuvan International Cargo Terminal"
    }
    ```
  - **Response (200 OK):** Updated shipment object with new `current_status` and `updated_at`.

### Status History Trail
- **`GET /api/shipments/:id/history`**
  - **Purpose:** Retrieve the full, chronologically ordered status audit trail for a shipment.
  - **Response (200 OK):**
    ```json
    {
      "shipment_id": 1,
      "history": [
        {
          "id": 1,
          "status": "Booked",
          "changed_at": "2026-10-11T10:00:00.000Z",
          "note": "Initial shipment creation"
        },
        {
          "id": 2,
          "status": "In Transit",
          "changed_at": "2026-10-11T12:30:00.000Z",
          "note": "Departed Tribhuvan International Cargo Terminal"
        }
      ]
    }
    ```

---

## 5. Environment Variable Boundaries

| Service | Variable Name | Purpose | Example |
|---|---|---|---|
| **Backend** | `PORT` | Local and cloud HTTP port binding | `5000` |
| **Backend** | `DATABASE_URL` | PostgreSQL connection connection URI (Supabase pooler or direct) | `postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres` |
| **Backend** | `CORS_ORIGIN` | Allowed client origin for CORS middleware | `http://localhost:5173` or `https://nagarkot-tracker.vercel.app` |
| **Backend** | `NODE_ENV` | Runtime environment mode | `development` or `production` |
| **Frontend**| `VITE_API_BASE_URL` | Base URL used by browser fetch calls | `http://localhost:5000` or `https://nagarkot-api.onrender.com` |

*Security Rule:* Real values for these variables will only live in local `.env` files (ignored by Git) and in hosting provider secrets consoles. `.env.example` templates will be committed without credentials.

---

## 6. HTTP Error Handling Standard

All backend endpoints will emit standardized, predictable JSON error payloads:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload",
    "details": [
      {
        "field": "expected_delivery_date",
        "issue": "Expected date string in YYYY-MM-DD format"
      }
    ]
  }
}
```

Standard Status Code Conventions:
- **`400 Bad Request`**: Validation failure (Zod schema mismatch).
- **`404 Not Found`**: Shipment record does not exist.
- **`409 Conflict`**: Duplicate `reference_number` violation.
- **`500 Internal Server Error`**: Unexpected database or server exception (sanitized message sent to client; full stack trace logged internally).
