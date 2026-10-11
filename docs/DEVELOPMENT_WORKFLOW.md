# Antigravity Development Workflow & Quality Protocol

## 1. Core Operating Principles

To guarantee production-grade code, avoid hallucinations, and maintain absolute visibility over every change, all development in this repository adheres to a strict phased batch protocol:

```
[Inspect State] ──> [Explain Plan] ──> [Implement Scope] ──> [Run Tests & Verify] ──> [Inspect Diff] ──> [User Review]
```

### The 7-Step Batch Loop
Every single implementation batch must:
1. **Inspect First:** Check relevant files, directory state, and Git status before modifying or creating code.
2. **Explain Decisions:** Clearly present the planned changes, architecture reasoning, and files targeted.
3. **Scoped Implementation:** Implement **only** the agreed scope for that specific batch. Never jump ahead to unapproved phases.
4. **Active Verification:** Run compiler checks, linters, migration scripts, or tests immediately.
5. **Inspect Diff:** Check `git status` and `git diff` to ensure no unintended modifications or stray files were created.
6. **Transparent Reporting:** Report exact files modified, commands executed, test results, and any unresolved risks.
7. **Await Review:** Never proceed to the next batch without explicit user review.

---

## 2. Engineering & Code Quality Rules

- **No Monolithic Generations:** The entire application must never be generated in a single prompt. Changes are partitioned into small, logically cohesive increments (e.g., Database Migrations -> Express Router -> React UI Dashboard).
- **No Stubs or Placeholders:** Code must be fully implemented without `// TODO: add later` or pseudo-code stubs.
- **Strict Parameterized SQL:** All SQL queries interacting with PostgreSQL must use parameterized variables (`$1, $2, ...`) through the `pg` client. String concatenation or template literals for SQL queries are forbidden.
- **Runtime Validation:** All inbound HTTP payloads and query strings must be validated using **Zod** before hitting controllers or database logic.
- **Verification Discipline:**
  - Generating code is **not** evidence that it works.
  - Distinguish between **code generation**, **local automated verification** (via `tsc`, `curl.exe`, Chrome DevTools), and **production verification** (live URL checks).
  - Never claim a feature works without verifiable command output.

---

## 3. Secrets & Security Policy

- **Zero Secret Ingestion:** Real passwords, Supabase database URLs, and API keys must **never** be hardcoded in source code, committed to Git, or documented in markdown files.
- **Environment Templates:** When services are created, provide clear `.env.example` templates with empty placeholders (e.g. `DATABASE_URL=postgresql://user:password@host:port/dbname`).
- **Git Ignore Protection:** The `.gitignore` file must continuously guard against `.env`, `.env.*`, and temporary credential files.

---

## 4. Antigravity Tool & Skill Integration

Based on the environment audit performed in Phase 1, tools are selectively assigned to their optimal project roles:

| Tool / Skill | Role in this Project | Operating Rule |
|---|---|---|
| **Context7 MCP** | Up-to-date documentation lookup | Use to fetch authoritative documentation for Express 5, React 19, Vite, Zod, and `pg` pooling to prevent outdated syntax. |
| **Chrome DevTools MCP** | Frontend testing and browser validation | Use `list_console_messages`, `list_network_requests`, and `take_screenshot` to verify React UI behavior, API integrations, and console errors in an active browser. |
| **`design-code` & `Anti-AI-Slop UI/UX`** | Frontend styling & aesthetics | Enforce clean, high-contrast logistics styling (clear status badges, readable data tables, structured timelines) and ban generic AI design tropes (e.g., purple gradients, centered card cliches). |
| **`a11y-audit`** | Accessibility verification | Run during Phase 3 to ensure forms, tables, and modal dialogs conform to WCAG 2.2 contrast and ARIA guidelines. |
| **`ux-writing`** | Interface copy & documentation | Guide clear microcopy on status transitions, empty states, error alerts, and README documentation. |
| **Supabase MCP** | *Inspection only* | Verified active for project inspection (`list_projects`, `list_tables`). To guarantee database safety, schema migrations are never applied automatically without explicit user review. The backend application connects directly via `DATABASE_URL` using `pg`. |
| **Flutter / Android Skills** | *Excluded* | All mobile-specific tools and skills are completely ignored for this full-stack web project. |

---

## 5. Git Commit & Release Discipline

- **Incremental Commits:** Commits must map to distinct, verified milestones (e.g., `chore: establish phase 1 documentation and repository foundation`).
- **No Automatic Commits or Pushes:** The agent will not run `git commit` or `git push` automatically without first presenting the diff and verification outcomes for user inspection and approval.
- **Commit Message Convention:** Follow standard Conventional Commits format:
  - `feat:` New user-facing or backend capability.
  - `fix:` Bug fix or constraint resolution.
  - `docs:` Documentation updates.
  - `chore:` Build scripts, package configurations, or tooling.
  - `test:` Test scripts and automated test suites.
