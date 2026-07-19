# CIB Data Marketplace UI — Architecture & Design Guide

This document explains how the application is built, how data flows, what design tokens and fonts are used, and how mock APIs relate to real APIs. It is written for developers who may be new to React or to this repo.

---

## 1. What this application is

**CIB Data Marketplace UI** is a React single-page app for exploring and working with governed data offerings.

Today it includes:

| Area | Route | Purpose |
|------|--------|---------|
| Marketing / landing | `/` | Brand story, “How data moves”, metrics strip, CTAs |
| Workspace console | `/workspace` | Persona-aware Producer console (KPIs, charts, approval panels) |

Catalogue and other personas are reserved for later; CTAs may be disabled until entitlements allow them.

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
2. `main.tsx` imports **Fontsource** fonts, design tokens, then `loadAppConfig()` from `/app-config.json`.
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

| Resource id | Path |
|-------------|------|
| `landingMetrics` | `/api/v1/marketplace/landing/metrics` |
| `sessionContext` | `/api/v1/session/context` |
| `workspaceConsoleHero` | `/api/v1/workspace/console/hero?persona=` |
| `workspaceConsoleCharts` | `/api/v1/workspace/console/charts?persona=` |
| `workspaceConsoleSubRequests` | `/api/v1/workspace/console/subscription-requests?persona=` |
| `workspaceConsoleGovernance` | `/api/v1/workspace/console/governance?persona=` |

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

- `src/features/landing/landing.api.ts`
- `src/features/session/session.api.ts`
- `src/features/workspace/workspace.api.ts`

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
SESSION_CONTEXT_MODE=mock
WORKSPACE_CONSOLE_HERO_MODE=mock
WORKSPACE_CONSOLE_CHARTS_MODE=mock
WORKSPACE_CONSOLE_SUB_REQUESTS_MODE=mock
WORKSPACE_CONSOLE_GOVERNANCE_MODE=mock
```

When a backend is ready for one resource only:

```properties
SESSION_CONTEXT_MODE=real
API_BASE_URL=https://api.example.com
```

No page rewrite required.

### 7.4 Producer console: four section APIs

Workspace does **not** load one giant console payload. It loads four sections in parallel:

1. **Hero** — eyebrow, subtitle, KPIs, action buttons  
2. **Charts** — statistics graphs  
3. **Subscription requests** — awaiting approval list  
4. **Governance** — sent-to-governance list  

Hero can render while charts/panels are still loading. A failed section shows an inline error; it does not blank the whole console.

Greeting (`Good morning/afternoon/evening, …`) is computed **on the client** from the system clock + user display name (`src/features/workspace/greeting.ts`).

---

## 8. Mocks (`src/mocks`) — what they are

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

---

## 9. Design system — tokens & theme

Tokens live in `src/theme/tokens.css` as CSS custom properties on `:root`.

### 9.1 Colour palette

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

### 9.2 Typography

| Token | Font stack | Role |
|-------|------------|------|
| `--sans` | IBM Plex Sans | Body, UI, buttons |
| `--serif` | Cormorant Garamond | Italic accents, KPI numbers |
| `--display` | Fraunces | Headlines, section titles |
| `--mono` | IBM Plex Mono | Labels, codes, meta |

Fonts are **vendored** as latin `.woff2` files in `public/fonts/`, declared in `src/theme/fonts.css`, and imported via `src/theme/fonts.ts` from `main.tsx`. There is no Google Fonts CDN and no Fontsource npm dependency (important for restricted corporate networks).

### 9.3 Spacing, radius, elevation

| Token family | Examples |
|--------------|----------|
| Spacing | `--space-1` (4px) … `--space-10` (40px) |
| Radius | `--radius-sm` 6px, `--radius-md` 8px, `--radius-lg` 12px |
| Shadows | `--shadow-sm`, `--shadow-md` |
| Controls | `--control-height` 40px (also sm/lg) |
| Focus | `--focus-ring` gold-tinted outline |
| Breakpoints (reference) | `--bp-md` 820px, `--bp-lg` 1100px |

### 9.4 CSS file map

| File | Contents |
|------|----------|
| `theme/fonts.ts` | Fontsource weight imports |
| `theme/tokens.css` | Design tokens |
| `theme/globals.css` | Box model, base body styles |
| `theme/components.css` | Shared + workspace shell / console styles |
| `theme/landing.css` | Landing page layout |
| `features/landing/landing.css` | Landing state banners / FAQ extras |

Visual language: warm off-white canvas, navy + gold brand accents, serif/display headlines — not a generic purple SaaS look.

---

## 10. UI composition

### Landing (`/`)

- Sticky nav, hero with “How data moves” diagram  
- Metrics proof strip (from `landingMetrics` API)  
- Capabilities, pipeline (“How it works”), FAQ, CTA, footer  
- Workspace CTA enabled when session has `WORKSPACE_VIEW`

### Workspace (`/workspace`)

- `WorkspaceShell` — left nav (~252px), brand, persona switcher (2×2 grid), nav groups, user footer  
- `ProducerConsole` — hero + KPIs + actions + charts (4 per row on wide screens) + two panels  
- Personas: Producer / Governance / Consumer / Admin (only enabled personas are clickable; others visible but disabled)  
- Subtitle under user name comes from role/persona (not a hardcoded system name)

Shared building blocks under `src/components/`: Button, Badge, Card, Modal, Alert, Empty/Error/Loading states, Toast, Spinner, PersonaSelector, WorkspaceShell, notification UI (foundation).

---

## 11. Testing

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

## 12. Common developer tasks

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

## 13. Mental model (one paragraph)

Think of this app as **a real frontend that talks to real URL contracts**. While backends are incomplete, MSW pretends to be the server. Design tokens and Fontsource fonts define the look. When a backend arrives, you flip a config switch for that resource. When every backend is ready and tests no longer need MSW, you can delete the mocks folder without redesigning the application.

---

## 14. Quick reference — npm scripts

| Script | What it does |
|--------|----------------|
| `npm run dev` | Generate config + start Vite |
| `npm run build` | Generate config + TypeScript check + production build |
| `npm run preview` | Preview production build |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end (Playwright) |
| `npm run config:generate` | Rebuild `public/app-config.json` |

---

*Last aligned with the `feature-global-space` codebase (Producer console section APIs, vendored fonts, central `src/api` catalog).*
