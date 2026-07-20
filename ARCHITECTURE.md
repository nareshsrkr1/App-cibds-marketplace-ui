# CIB Data Marketplace UI — Architecture & Design Guide

This document explains how the application is built, how data flows, what design tokens and fonts are used, and how mock APIs relate to real APIs. It is written for developers who may be new to React or to this repo.

---

## 1. What this application is

**CIB Data Marketplace UI** is a React single-page app for exploring and working with governed data offerings.

Today it includes:

| Area | Route | Purpose |
|------|--------|---------|
| Marketing / landing | `/` | Brand story, “How data moves”, metrics strip, CTAs |
| Workspace console | `/workspace` | Persona-aware console (nav, hero/KPIs, charts, panels) for Producer, Governance, Consumer, Admin |

Catalogue and other deep views are reserved for later; many nav items and actions are visible but disabled until those stories land.

---

## 2. Technology stack

| Layer | Choice | Why |
|-------|--------|-----|
| UI library | React 19 | Component model |
| Language | TypeScript | Safer contracts between UI and APIs |
| Build tool | Vite 6 | Fast local dev and production builds |
| Routing | React Router 7 | Client-side routes (`/`, `/workspace`) |
| HTTP | `fetch` via shared `httpClient` | Simple, no heavy client library |
| Mock APIs | MSW (Mock Service Worker) | Same URLs as real APIs; browser + Vitest |
| Unit tests | Vitest + Testing Library | Component and API behaviour |
| E2E tests | Playwright | Critical user journeys |
| Fonts | Vendored woff2 in `public/fonts` | Same typefaces; no Fontsource/Google CDN (corporate-friendly) |

---

## 3. High-level architecture

```text
┌─────────────────────────────────────────────────────────────┐
│  Browser                                                     │
│  ┌──────────────┐   ┌─────────────────────────────────────┐ │
│  │ Routes       │   │ Features (pages + feature APIs)     │ │
│  │ /            │──▶│ landing / session / workspace       │ │
│  │ /workspace   │   └───────────────┬─────────────────────┘ │
│  └──────────────┘                   │                         │
│                     ┌───────────────▼───────────────┐       │
│                     │ src/api/endpoints.ts          │       │
│                     │ (path + resource id catalog)  │       │
│                     └───────────────┬───────────────┘       │
│                                     │                         │
│                     ┌───────────────▼───────────────┐       │
│                     │ httpClient + app-config       │       │
│                     │ mode = mock | real            │       │
│                     └───────┬───────────┬───────────┘       │
│                             │           │                     │
│              mock mode      │           │  real mode          │
│                     ┌───────▼───┐   ┌───▼──────────┐         │
│                     │ MSW mocks │   │ API_BASE_URL │         │
│                     │ src/mocks │   │ (backend)    │         │
│                     └───────────┘   └──────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

**Important idea:** the UI always calls the same feature API functions and the same URL paths. Mock vs real is decided by **config**, not by rewriting page code.

---

## 4. Folder structure (what lives where)

```text
App-cibds-marketplace-ui/
├── config/
│   ├── env-local.properties          # Local mock/real switches (developer)
│   └── env-local.properties.example  # Template for new developers
├── public/
│   ├── app-config.json               # Runtime config loaded by the app
│   ├── fonts/                        # Vendored IBM Plex / Cormorant / Fraunces
│   └── mockServiceWorker.js          # MSW service worker (browser mocks)
├── scripts/
│   └── generate-app-config.mjs       # Builds public/app-config.json from env properties
├── src/
│   ├── api/                          # API CONTRACT catalog (permanent)
│   │   ├── endpoints.ts              # Paths, resource ids, wired vs planned
│   │   └── index.ts
│   ├── app/                          # App shell, config, HTTP
│   │   ├── App.tsx                   # Routes + starts MSW when needed
│   │   ├── api/                      # httpClient, apiConfig, types
│   │   └── config/                   # load/normalize app-config.json
│   ├── components/                   # Shared UI (Button, Spinner, WorkspaceShell, …)
│   ├── features/                     # Product features (pages + *.api.ts)
│   │   ├── landing/
│   │   ├── session/
│   │   └── workspace/
│   ├── mocks/                        # TEMPORARY: MSW handlers + JSON (until backends exist)
│   │   ├── session/context.json
│   │   ├── landing/{metrics,content,handlers}.…
│   │   └── workspace/{producer,governance,consumer,admin}/…
│   ├── services/                     # Cross-cutting helpers (toast, notifications seed)
│   ├── theme/                        # Design tokens, fonts, global/component CSS
│   ├── test/                         # Vitest setup (MSW node server)
│   └── main.tsx                      # Bootstrap: config → render App
├── e2e/                              # Playwright tests
└── ARCHITECTURE.md                   # This file
```

### Permanent vs temporary

| Keep forever | Temporary (until all APIs are real + tests don’t need MSW) |
|--------------|------------------------------------------------------------|
| `src/api/` | `src/mocks/` |
| `src/features/*/*.api.ts` | `public/mockServiceWorker.js` |
| `src/app/api/*` | MSW-only test helpers (`setLandingMockScenario`, etc.) |
| `src/theme/` | |
| UI components & pages | |

---

## 5. Application bootstrap

1. `index.html` loads the Vite entry (`src/main.tsx`).
2. `main.tsx` imports vendored fonts (`src/theme/fonts.css` via `fonts.ts`), design tokens, then `loadAppConfig()` from `/app-config.json`.
3. React renders `<App />` inside `<BrowserRouter>`.
4. If any resource is still in **mock** mode, `App` starts the MSW browser worker.
5. Routes render Landing or Workspace.

Config is generated before `npm run dev` / `npm run build` via:

```bash
npm run config:generate
# reads config/env-local.properties → writes public/app-config.json
```

---

## 6. Routing

Defined in `src/app/App.tsx`:

| Path | Screen |
|------|--------|
| `/` | `LandingPage` |
| `/workspace` | `WorkspacePage` |
| `*` | Redirect to `/` |

Workspace access from landing depends on session entitlements (`WORKSPACE_VIEW`).

---

## 7. API design

### 7.1 Contract catalog — `src/api/endpoints.ts`

Single source of truth for every known HTTP API:

- **id** — stable resource name used in `app-config.json` (e.g. `sessionContext`)
- **method** — currently mostly `GET`
- **path** — e.g. `/api/v1/session/context`
- **wired** — `true` if UI calls it today; `false` if reserved for later
- **summary** — human-readable description

**Wired today**

| Resource id | Path | Feature API |
|-------------|------|-------------|
| `landingMetrics` | `/api/v1/marketplace/landing/metrics` | `fetchLandingMetrics` |
| `landingContent` | `/api/v1/marketplace/landing/content` | `fetchLandingContent` |
| `sessionContext` | `/api/v1/session/context` | `fetchSessionContext` |
| `workspaceNav` | `/api/v1/workspace/nav?persona=` | `fetchWorkspaceNav` |
| `workspaceConsoleHero` | `/api/v1/workspace/console/hero?persona=` | `fetchConsoleHero` |
| `workspaceConsoleCharts` | `/api/v1/workspace/console/charts?persona=` | `fetchConsoleCharts` |
| `workspaceConsoleSubRequests` | `/api/v1/workspace/console/subscription-requests?persona=` | `fetchConsoleSubscriptionRequests` |
| `workspaceConsoleConsumers` | `/api/v1/workspace/console/consumers?persona=` | `fetchConsoleConsumers` |
| `workspaceConsoleGovernance` | `/api/v1/workspace/console/governance?persona=` | `fetchConsoleGovernance` |

**Planned (not wired in UI yet)**

| Resource id | Path |
|-------------|------|
| `notifications` | `/api/v1/notifications` |
| `datasets` | `/api/v1/datasets` |
| `businessTerms` | `/api/v1/business-terms` |
| `governance` | `/api/v1/governance/queue` |
| `search` | `/api/v1/search` |

### 7.2 Feature API modules

Thin wrappers that call `httpGet` with the catalog path + resource id:

| Module | File |
|--------|------|
| Landing | `src/features/landing/landing.api.ts` |
| Session | `src/features/session/session.api.ts` |
| Workspace | `src/features/workspace/workspace.api.ts` |

Pages import these functions — never call `fetch` directly for marketplace APIs.

### 7.3 Mock vs real (phased rollout)

```text
getApiMode(resource)
  → resource override in app-config
  → else api.defaultMode
  → else "mock"

mock  → relative URL, MSW answers
real  → API_BASE_URL + path, real backend answers
```

Example local config (`config/env-local.properties`):

```properties
API_DEFAULT_MODE=mock
API_BASE_URL=

LANDING_METRICS_MODE=mock
LANDING_CONTENT_MODE=mock
SESSION_CONTEXT_MODE=mock
WORKSPACE_NAV_MODE=mock
WORKSPACE_CONSOLE_HERO_MODE=mock
WORKSPACE_CONSOLE_CHARTS_MODE=mock
WORKSPACE_CONSOLE_SUB_REQUESTS_MODE=mock
WORKSPACE_CONSOLE_CONSUMERS_MODE=mock
WORKSPACE_CONSOLE_GOVERNANCE_MODE=mock
```

When a backend is ready for one resource only:

```properties
SESSION_CONTEXT_MODE=real
API_BASE_URL=https://api.example.com
```

No page rewrite required.

---

## 8. Complete request flow (end-to-end)

This is the structure as implemented today: **which screen calls which API, where the call lives, and which mock JSON answers in mock mode.**

### 8.1 Shared call stack (every wired API)

```text
Page / component
  → features/*/….api.ts          (named fetchX)
  → httpGet(path, { resource })  (src/app/api/httpClient.ts)
  → getApiMode(resource)         (src/app/api/apiConfig.ts + app-config.json)
  → fetch(url)
       ├─ mode=mock → MSW handler in src/mocks/**/handlers.ts → JSON fixture
       └─ mode=real → API_BASE_URL + path → backend
  → ApiResult<T>                 ({ ok, data } | { ok:false, error })
  → page setState → UI section
```

### 8.2 Landing page (`/`) — `LandingPage.tsx`

On mount, three calls run (session + metrics + content):

| Step | Called from | Feature API | Resource id | HTTP path | Mock handler / fixture |
|------|-------------|-------------|-------------|-----------|------------------------|
| 1 | `LandingPage` | `fetchSessionContext()` | `sessionContext` | `GET /api/v1/session/context` | `src/mocks/workspace/handlers.ts` + `src/mocks/session/context.json` |
| 2 | `LandingPage` | `fetchLandingMetrics()` | `landingMetrics` | `GET /api/v1/marketplace/landing/metrics` | `src/mocks/landing/handlers.ts` + `src/mocks/landing/metrics.json` |
| 3 | `LandingPage` | `fetchLandingContent()` | `landingContent` | `GET /api/v1/marketplace/landing/content` | `src/mocks/landing/handlers.ts` + `src/mocks/landing/content.json` |

**UI use**

- Session → enable Workspace CTA when `WORKSPACE_VIEW` is present
- Metrics → proof strip numbers
- Content → diagram, capabilities, pipeline, FAQs (no hardcoded section copy)

### 8.3 Workspace page (`/workspace`) — `WorkspacePage.tsx`

#### A. First load

```text
1. fetchSessionContext()
      → user name/initials, personas, entitlements, personaProfiles.subtitle
      → WorkspaceShell (persona switcher + footer “Test user / Test Owner”)

2. In parallel (active persona, default PRODUCER):
      fetchWorkspaceNav(persona)
      fetchConsoleHero(persona)
      fetchConsoleCharts(persona)
      + persona-specific panels (see table below)
```

Only the **first** hero load shows the full-page spinner in the main pane. Later persona switches keep the wishes/hero/KPIs/actions visible and only refresh charts + panels.

#### B. Persona switch

```text
User clicks Governance / Consumer / Admin / Producer
  → setPersona(next)
  → same parallel fetches with ?persona=<NEXT>
  → left nav updates from workspaceNav
  → hero KPIs/actions soft-replace when hero returns
  → charts + panels clear → reload → soft enter animation
```

#### C. Which console APIs run per persona

| Persona | Always | Also | Renders |
|---------|--------|------|---------|
| **PRODUCER** | nav, hero, charts | consumers + subscription-requests | KPIs, actions, 6 charts (2 tiers), two panels |
| **GOVERNANCE** | nav, hero, charts | governance | KPIs, charts, endorsement queue panel |
| **CONSUMER** | nav, hero, charts | — | KPIs, charts (panels empty) |
| **ADMIN** | nav, hero, charts | — | KPIs, charts (panels empty) |

#### D. Workspace API ↔ code ↔ mock map

| UI region | Called in | Feature API (`workspace.api.ts`) | Resource id | Path | Mock JSON (by persona folder) |
|-----------|-----------|----------------------------------|-------------|------|-------------------------------|
| Left nav groups | `WorkspacePage` → `ConsoleSidebar` | `fetchWorkspaceNav` | `workspaceNav` | `/api/v1/workspace/nav?persona=` | `src/mocks/workspace/{persona}/nav.json` |
| Wishes / greeting / subtitle | `ProducerConsole` → `ConsoleHeader` | `fetchConsoleHero` | `workspaceConsoleHero` | `/api/v1/workspace/console/hero?persona=` | `…/{persona}/hero.json` (+ greeting computed client-side) |
| KPI strip | `ProducerConsole` | same hero | same | same | `hero.kpis` |
| Action buttons | `ProducerConsole` | same hero | same | same | `hero.actions` |
| Statistics charts | `ProducerConsole` → `ConsoleCharts` | `fetchConsoleCharts` | `workspaceConsoleCharts` | `/api/v1/workspace/console/charts?persona=` | `…/{persona}/charts.json` |
| “My consumers…” panel | `ProducerConsole` → `ConsolePanelBlock` | `fetchConsoleConsumers` | `workspaceConsoleConsumers` | `/api/v1/workspace/console/consumers?persona=` | `producer/consumers.json` |
| “Subscription requests…” | same | `fetchConsoleSubscriptionRequests` | `workspaceConsoleSubRequests` | `/api/v1/workspace/console/subscription-requests?persona=` | `producer/subscription-requests.json` |
| Endorsement queue | same | `fetchConsoleGovernance` | `workspaceConsoleGovernance` | `/api/v1/workspace/console/governance?persona=` | `governance/queue.json` |
| Sidebar footer subtitle | `WorkspaceShell` | from session (not a separate API) | `sessionContext` | `/api/v1/session/context` | `personaProfiles[PERSONA].subtitle` (e.g. Producer → `Test Owner`) |

Handlers live in **`src/mocks/workspace/handlers.ts`**. They read `?persona=`, pick the matching persona JSON, and apply optional latency from `src/mocks/mockDelay.ts`.

#### E. Client-only (not from API)

| Concern | Where |
|---------|--------|
| Time-of-day greeting (`Good morning/afternoon/evening, {name}.`) | `src/features/workspace/greeting.ts` — clock + `displayName` from session/hero |
| Persona switch animation (charts/panels only) | `WorkspacePage` + `.console-body-stage` in `components.css` |
| Disabled nav / actions (“Available in a future release”) | Flags on mock JSON (`enabled: false`) |

### 8.4 Sequence diagram — workspace first load (Producer)

```text
Browser                WorkspacePage           Feature APIs              MSW / Backend
   │                         │                      │                          │
   │  open /workspace        │                      │                          │
   │────────────────────────▶│                      │                          │
   │                         │ fetchSessionContext  │                          │
   │                         │─────────────────────▶│─────────────────────────▶│
   │                         │◀─────────────────────│◀ session/context.json    │
   │                         │                      │                          │
   │                         │ fetchWorkspaceNav(PRODUCER)                     │
   │                         │ fetchConsoleHero(PRODUCER)                      │
   │                         │ fetchConsoleCharts(PRODUCER)                    │
   │                         │ fetchConsoleConsumers(PRODUCER)                 │
   │                         │ fetchConsoleSubscriptionRequests(PRODUCER)      │
   │                         │─────────────────────▶│─────────────────────────▶│
   │                         │◀── nav / hero / charts / panels (parallel) ─────│
   │  paint shell + sections │                      │                          │
   │◀────────────────────────│                      │                          │
```

### 8.5 File cheat-sheet

| Concern | File |
|---------|------|
| Path + resource catalog | `src/api/endpoints.ts` |
| Session fetch | `src/features/session/session.api.ts` |
| Landing fetches | `src/features/landing/landing.api.ts` |
| Workspace fetches | `src/features/workspace/workspace.api.ts` |
| Orchestration (when to call what) | `src/features/workspace/WorkspacePage.tsx` |
| Console layout | `src/features/workspace/components/ProducerConsole.tsx` |
| Shell / sidebar / footer | `src/components/layout/WorkspaceShell/WorkspaceShell.tsx` |
| Session mock | `src/mocks/session/context.json` |
| Workspace mocks | `src/mocks/workspace/{producer,governance,consumer,admin}/` |
| MSW workspace routes | `src/mocks/workspace/handlers.ts` |
| MSW landing routes | `src/mocks/landing/handlers.ts` |
| Mock latency toggle | `src/mocks/mockDelay.ts` |
| Env → app-config | `scripts/generate-app-config.mjs` + `config/env-local.properties` |

---

## 9. Mocks (`src/mocks`) — what they are

Mocks use **MSW** to intercept the same paths as the real API.

| Piece | Role |
|-------|------|
| `mocks/*/handlers.ts` | Request → JSON response (and error/empty scenarios for tests) |
| `mocks/**/*.json` | Fixture payloads |
| `mocks/landing/browser.ts` | Browser worker: registers all handlers, started from `App.tsx` |
| `mocks/landing/server.ts` | Node server for Vitest |
| `test/setup.ts` | Starts MSW for unit tests |

Handlers import paths from `src/api/endpoints.ts` so mock URLs stay aligned with the catalog.

**You do not delete mocks every time one API goes real.**  
Delete the whole `mocks` folder only when:

- every production resource is `real`, and  
- tests no longer rely on MSW.

Until then, flipping config is enough.

Persona fixtures are segregated:

```text
src/mocks/workspace/
├── handlers.ts
├── producer/   { nav, hero, charts, consumers, subscription-requests }.json
├── governance/ { nav, hero, charts, queue }.json
├── consumer/   { nav, hero, charts }.json
└── admin/      { nav, hero, charts }.json
```

---

## 10. Design system — tokens & theme

Tokens live in `src/theme/tokens.css` as CSS custom properties on `:root`.

### 10.1 Colour palette

| Token | Value | Typical use |
|-------|-------|-------------|
| `--ink` | `#141414` | Primary text |
| `--mid` | `#565b61` | Secondary text |
| `--light` | `#9aa0a6` | Muted / labels |
| `--bg` / `--canvas` | `#f6f5f2` | Page background |
| `--white` / `--surface` | `#fff` | Cards / elevated surfaces |
| `--border` | `#e4e2dc` | Default borders |
| `--gold` / `--gold-deep` / `--gold-mid` / `--gold-lt` | gold family | Accents, eyebrows, tags |
| `--navy` / `--navy-2` / `--navy2` | navy family | Brand, primary buttons, sidebar |
| `--blue` | `#4a80b4` | Info |
| `--green` / `--green-lt` | green | Success / positive states |
| `--amber` / `--amber-lt` | amber | Warnings |
| `--red` / `--red-lt` | red | Errors / danger |

Semantic aliases (prefer these in shared components):

- `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`
- `--color-border`, `--surface-page`, `--surface-elevated`
- `--color-accent`, `--color-brand`
- `--status-success`, `--status-warning`, `--status-danger`, `--status-info` (+ `*-bg`)

### 10.2 Typography

| Token | Font stack | Role |
|-------|------------|------|
| `--sans` | IBM Plex Sans | Body, UI, buttons |
| `--serif` | Cormorant Garamond | Italic accents, KPI numbers |
| `--display` | Fraunces | Headlines, section titles |
| `--mono` | IBM Plex Mono | Labels, codes, meta |

Fonts are **vendored** as latin `.woff2` files in `public/fonts/`, declared in `src/theme/fonts.css` (Sans 300–700, Mono 400/500, Cormorant italic + 500/600, Fraunces 400/500, plus a KPI family for thick italic numerals), and imported via `src/theme/fonts.ts` from `main.tsx`. Gold/navy accents and console shadows are tuned toward the HTML SoT vibrancy. There is no Google Fonts CDN and no Fontsource npm dependency (important for restricted corporate networks).

### 10.3 Spacing, radius, elevation

| Token family | Examples |
|--------------|----------|
| Spacing | `--space-1` (4px) … `--space-10` (40px) |
| Radius | `--radius-sm` 6px, `--radius-md` 8px, `--radius-lg` 12px |
| Shadows | `--shadow-sm`, `--shadow-md` |
| Controls | `--control-height` 40px (also sm/lg) |
| Focus | `--focus-ring` gold-tinted outline |
| Breakpoints (reference) | `--bp-md` 820px, `--bp-lg` 1100px |

### 10.4 CSS file map

| File | Contents |
|------|----------|
| `theme/fonts.ts` | Imports `fonts.css` |
| `theme/fonts.css` | `@font-face` for vendored woff2 |
| `theme/tokens.css` | Design tokens |
| `theme/globals.css` | Box model, base body styles |
| `theme/components.css` | Shared + workspace shell / console styles |
| `theme/landing.css` | Landing page layout |
| `features/landing/landing.css` | Landing state banners / FAQ extras |

Visual language: warm off-white canvas, navy + gold brand accents, serif/display headlines — not a generic purple SaaS look.

---

## 11. UI composition

### Landing (`/`)

- Sticky nav, hero with “How data moves” diagram  
- Metrics proof strip (from `landingMetrics` API)  
- Capabilities, pipeline (“How it works”), FAQ, CTA, footer (from `landingContent` API)  
- Workspace CTA enabled when session has `WORKSPACE_VIEW`

### Workspace (`/workspace`)

- `WorkspaceShell` — left nav (~252px), brand, persona switcher (2×2 grid), nav groups, user footer  
- `ProducerConsole` — shared console layout for all personas: hero + KPIs + actions + charts + optional panels  
- Personas aligned to latest HTML SoT (`CIBD_Updated.html`):
  - **Producer** — 5 KPIs, 4 actions, 6 charts (2 tiers), consumers + subscription panels  
  - **Governance** — 4 KPIs (Endorsed BDEs / Glossary / Pending / Unmapped), vocabulary actions, 12 charts (4 tiers), endorsement queue  
  - **Consumer** — 5 KPIs, 3 actions, 6 charts (2 tiers)  
  - **Admin** — 5 KPIs, 3 actions, full Producer+Consumer+Governance chart stack with section headings  
- Footer subtitle from `session.personaProfiles[persona].subtitle`  
- Persona switch: wishes/hero stay; charts and panels refresh with a soft enter

Shared building blocks under `src/components/`: Button, Badge, Card, Modal, Alert, Empty/Error/Loading states, Toast, Spinner, PersonaSelector, WorkspaceShell, notification UI (foundation).

---

## 12. Testing

| Type | Tool | Entry |
|------|------|-------|
| Unit / component | Vitest + Testing Library | `npm test` |
| E2E | Playwright | `npm run test:e2e` |

Vitest uses the MSW **node** server (`src/mocks/landing/server.ts`) via `src/test/setup.ts`.  
Browser MSW is skipped when `import.meta.env.MODE === 'test'`.

Mock scenarios for tests (examples):

- `setLandingMockScenario('error' | 'empty' | …)`
- `setSessionMockScenario('noWorkspace' | …)`
- `setConsoleSectionScenario('charts', 'error')` — fail one console section without killing hero

---

## 13. Common developer tasks

### Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Switch one API to real

1. Ensure backend implements the path in `src/api/endpoints.ts`.  
2. Edit `config/env-local.properties`: set that resource to `real` and set `API_BASE_URL`.  
3. Restart / regenerate config (`npm run config:generate` or restart `npm run dev`).  
4. Confirm Network tab hits the real host, not MSW.

### Add a new API later

1. Add entry to `src/api/endpoints.ts` (`wired: true` when you hook UI).  
2. Add `fetchX` in the right `features/*/….api.ts`.  
3. Add MSW handler + JSON under `src/mocks` while backend is missing.  
4. Register resource mode in `scripts/generate-app-config.mjs` + env example.  
5. Call the fetch from a page/component.

### Eventually remove all mocks

One-time cleanup (not required for each resource flip):

1. Set all resources to `real` in production config.  
2. Delete `src/mocks/`.  
3. Remove MSW start from `App.tsx`.  
4. Rework `src/test/setup.ts` and tests that use mock scenario helpers.  
5. Optionally remove the `msw` dependency and `public/mockServiceWorker.js`.

Keep `src/api/` and feature `*.api.ts` — those are the real client.

---

## 14. Mental model (one paragraph)

Think of this app as **a real frontend that talks to real URL contracts**. While backends are incomplete, MSW pretends to be the server. Design tokens and vendored fonts define the look. When a backend arrives, you flip a config switch for that resource. When every backend is ready and tests no longer need MSW, you can delete the mocks folder without redesigning the application.

---

## 15. Quick reference — npm scripts

| Script | What it does |
|--------|----------------|
| `npm run dev` | Generate config + start Vite |
| `npm run build` | Generate config + TypeScript check + production build |
| `npm run preview` | Preview production build |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end (Playwright) |
| `npm run config:generate` | Rebuild `public/app-config.json` |

---

*Last updated: workspace section APIs, persona-segregated mocks, vendor fonts, full call-flow map in §8.*
