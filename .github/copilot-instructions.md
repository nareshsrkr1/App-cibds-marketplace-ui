# CIBDS Marketplace UI — Copilot instructions

React 19 + TypeScript + Vite marketplace UI. Follow these conventions for every new feature so implementations stay consistent with what the team has already built. Prefer mirroring an existing workspace screen over inventing a parallel pattern.

Canonical narrative (may lag routes slightly): `ARCHITECTURE.md`. Trust `src/app/App.tsx` for the live route tree.

---

## 1. Folder structure (do not invent parallel trees)

```
src/
  app/                 App shell: App.tsx routes, FeatureRoute, error boundary,
                       config/ (appConfig, featureFlags), api/ (httpClient, apiConfig, auth)
  features/            Product features (pages, *.api.ts, adapters, feature CSS)
    landing/           Public landing
    session/           SessionProvider + session.api (no page)
    producer/          Register Physical Dataset wizard (routed under /workspace/…)
    workspace/         Shell + nested screens (camelCase subfolders)
      workspaceRoutes.ts   Nav id ↔ path map (required for every workspace nav target)
      components/          Shared console/charts pieces
      bulkPde/, bindColumns/, workflow/, physicalDatasets/,
      logicalModel/, glossary/, lineage/, …
  components/          Shared UI: ui/, feedback/, layout/ (AppShell, WorkspaceShell),
                       persona/, notifications/
  theme/               Design system (tokens, globals, components, fonts)
  api/
    endpoints.ts       Permanent API contract (paths + resource ids)
    mock/              MSW browser/server + handlers (temporary until APIs are real)
  mocks/               JSON fixtures ONLY — no handlers, no TS logic
  services/            Cross-cutting: logger, toastService, notificationService
  test/                Vitest setup (MSW node) — excluded from production tsc
  main.tsx             Bootstrap: fonts → tokens → loadAppConfig → Router → App

public/                app-config.json (generated), fonts/, mockServiceWorker.js
config/                env-local.properties (+ .example) → source for app-config
scripts/               generate-app-config.mjs, helpers
e2e/                   Playwright specs
```

**Do**

- Put new product screens under `src/features/…` (workspace subfeature = camelCase folder).
- Keep API path/id contracts in `src/api/endpoints.ts`.
- Keep JSON fixtures in `src/mocks/…`; keep MSW handlers in `src/api/mock/handlers/`.
- Put reusable chrome (buttons, modals, scroll helpers, shell) in `src/theme/components.css` or `src/components/`.

**Don’t**

- Put handler logic inside `src/mocks/`.
- Scatter shared button/scrollbar CSS into feature CSS as the source of truth.
- Introduce a second config system (e.g. `VITE_*` for API mode). Use `config/env-local.properties` → `npm run config:generate` → `public/app-config.json`.
- Prefer relative imports like the rest of the codebase (`@/*` exists but is unused in app code).

---

## 2. Feature module shape

For a typical workspace screen (see `bulkPde/`, `bindColumns/`, `workflow/`):

| Kind | Pattern | Example |
| --- | --- | --- |
| Page | `PascalCase*Page.tsx` | `BulkUploadPdesPage.tsx` |
| Test | Colocated `*.test.tsx` | next to the page/module |
| API | `{feature}.api.ts` | `bulkPde.api.ts` |
| Types | `{feature}.types.ts` | |
| Adapter | `{feature}.adapter.ts` | normalize / sanitize API → UI |
| CSS | `{feature}.css` | layout/state only; import from page |
| Subcomponents | `components/*.tsx` | |

**Rules**

- Pages own UI state and call feature `*.api.ts` — **never** call `fetch` / `httpGet` directly from JSX pages.
- Adapters normalize payloads (and sanitize HTML with DOMPurify when needed).
- Feature CSS may tweak layout or contextual overrides; it must **not** redefine shared button/scrollbar bases.

---

## 3. Routing, nav, and personas

### Routes

- **Single registry:** `src/app/App.tsx` (lazy routes + `Suspense`).
- **Nav id ↔ path:** `src/features/workspace/workspaceRoutes.ts` (`WORKSPACE_ROUTES`, `pathForNavId`, `activeNavIdForPath`).
- **Workspace shell:** `WorkspacePage` renders `WorkspaceShell` + `<Outlet />` for child routes.
- **Catalogue tabs:** Logical Model / Glossary Terms are **tabs inside** `PhysicalDatasetsPage`, not separate page components. They use bookmarkable subpaths (`/workspace/physical-datasets/logical-model`, `…/glossary-terms`) so left-nav can deep-link without remounting the whole catalogue.

### Adding a user-facing workspace feature (checklist)

1. Create feature folder under `src/features/workspace/<name>/` (or `src/features/<name>/` if top-level).
2. Add path id to `workspaceRoutes.ts`.
3. Lazy-import page + `<Route>` in `App.tsx`, wrapped in `<FeatureRoute flag="<id}">`.
4. Add/update id in `src/app/config/featureFlags.ts`.
5. Ensure persona `nav.json` / `hero.json` items use the **same id** (and Title Case labels).
6. Wire API: `endpoints.ts` → `*.api.ts` → MSW handler → `src/mocks/…` JSON → `generate-app-config.mjs` / env example if new resource.
7. Colocate tests; update e2e if the flow is critical.

**Don’t** register a route only in nav JSON, or hide a feature from nav without also guarding the URL via `FeatureRoute`.

### Personas

- `PRODUCER` | `GOVERNANCE` | `CONSUMER` | `ADMIN` (`src/features/session/`).
- Session loaded once via `SessionProvider` in `App.tsx`; use `useSession()`.
- Fixtures: `src/mocks/session/context.json` + `src/mocks/workspace/{producer,governance,consumer,admin}/`.
- Persona switch currently deep-links back to `/workspace` console until other personas have their own deep screens.
- When changing console/nav shape, update **all relevant persona** fixture folders.

### Copy conventions

- **Nav / tab labels = Title Case** (e.g. `"Bulk Upload PDEs"`, `"Physical Datasets"`, `"Logical Model"`, `"Glossary Terms"`).
- Gated / not-yet-live items: title tooltip `"Available in a future release"`.

---

## 4. Feature flags (single switch)

**File:** `src/app/config/featureFlags.ts`

- Ids match nav items, hero actions, and `WORKSPACE_ROUTES` keys (`register`, `bulkpde`, `bind`, `workflow`, `phys`, `lineage`, `log`, `bt`, …).
- `isFeatureEnabled` → route guards (`FeatureRoute`).
- `resolveFeatureEnabled` → adapters overwrite mock/backend `enabled` when the id is in the registry.
- Untracked ids: route defaults **enabled**; adapters fall back to payload.

**Do** flip phased rollout **only** in `featureFlags.ts`.  
**Don’t** edit every persona’s `nav.json` / `hero.json` just to turn a build feature on/off.

Catalogue tab flags (`log`, `bt`) are gated inside `PhysicalDatasetsPage`, not via separate routes.

---

## 5. Data fetching, MSW, and config

```
Page → features/*/….api.ts → httpGet/httpPost (src/app/api/httpClient.ts)
     → getApiMode(resource) → mock: relative URL + MSW | real: API_BASE_URL + path
     → ApiResult<T> → optional *.adapter.ts → UI
```

| Concern | Path |
| --- | --- |
| Endpoint catalog | `src/api/endpoints.ts` |
| HTTP client | `src/app/api/httpClient.ts` (timeout, inflight GET dedupe, Bearer) |
| Mode / base URL | `src/app/api/apiConfig.ts` + `public/app-config.json` |
| Config generation | `scripts/generate-app-config.mjs` ← `config/env-local.properties` |
| Browser MSW | `src/api/mock/browser.ts` (started from App when any resource is mock) |
| Vitest MSW | `src/api/mock/server.ts` via `src/test/setup.ts` |
| Fixtures | `src/mocks/**/*.json` |

**Do**

- Add a new backend resource end-to-end: `endpoints.ts` → feature api → handler → mock JSON → env mapping in generate script → page call → optional adapter → flag/route/nav if user-facing.
- When one API goes real, flip `*_MODE=real` in properties — do **not** delete the whole mock layer until nothing needs MSW.

**Don’t**

- Use Vite `VITE_*` env for API mode.
- Put business logic in mock JSON files.

---

## 6. Design system & UX (must match theme)

### Source of truth

| File | Role |
| --- | --- |
| `src/theme/tokens.css` | **Only** place for new colors, fonts, spacing, radius, shadows |
| `src/theme/globals.css` | Document/base styles + page scrollbar |
| `src/theme/components.css` | Shared UI, workspace shell, **marketplace buttons**, scroll helpers |
| `src/theme/fonts.css` + `public/fonts/` | Vendored IBM Plex / Cormorant / Fraunces — no CDN fonts |
| Feature `*.css` | Page-local layout only |

Loaded from `App.tsx`: tokens → globals → components.

### Tokens — prefer variables, never invent a parallel palette

- Brand: `--navy`, `--navy2`, `--navy-2`, `--color-brand`
- Accent: `--gold`, `--gold-mid`, `--gold-deep`, `--gold-lt`
- Info: `--blue`
- Text: `--ink`, `--mid`, `--light`
- Surfaces: `--bg` / `--canvas`, `--white` / `--surface`, `--border`, `--border-2`
- Status: `--green`/`--green-lt`, `--amber`/`--amber-lt`, `--red`/`--red-lt`, `--status-info-bg`
- Layout: `--space-*`, `--radius-*`, `--control-height*`, `--shadow*`
- Focus / disabled: `--focus-ring`, `--disabled-opacity`
- Fonts: `--sans`, `--serif`, `--display`, `--mono` (do not switch to Inter/Roboto/system-only stacks)

**Visual direction:** calm navy / gold / cream marketplace. Avoid purple SaaS gradients, neon glow, generic “AI UI” looks, and over-carded layouts.

### Buttons (always-loaded shared classes)

Defined in `src/theme/components.css` (also used by `src/components/ui/Button`):

| Need | Classes |
| --- | --- |
| Primary navy CTA | `btn-dk` or `ui-btn ui-btn--primary` |
| Secondary light | `btn-lt` or `ui-btn ui-btn--secondary` |
| Quiet / outline | `btn-ghost` or `ui-btn ui-btn--ghost` |
| Large | add `btn-lg` / `ui-btn--lg` |

**Hard rule:** base `btn-*` definitions **must** live in `components.css`, not only in `landing.css` or a feature sheet. Workspace can load without the landing chunk; if buttons only lived in landing CSS, they would appear unstyled.

Feature CSS may **tune** context (e.g. `.pl-cta .btn-lt`) but must not own the base definitions.

### Scrollbars (contrast by surface)

Reuse shared rules; do not invent per-page scrollbar CSS.

| Surface | Selector | Treatment |
| --- | --- | --- |
| Left nav (dark navy) | `.sb-nav` | **~1px soft gold** hairline (`rgba` of gold ~0.35; stronger on hover) — barely reads as a scrollbar |
| Workspace main (white) | `.sh-main` | **Thin soft navy** (`rgba(15, 35, 56, ~0.28)`; stronger on hover) |
| Nested lists / dropdown panels / grids | `.ui-scroll-box` | Soft navy, very thin |
| Document | `html` in `globals.css` | Soft navy |

Tracks are transparent. Gold on white workspace is wrong; navy on dark sidebar is wrong. Same thin + low-opacity approach on both sides — **different hue for contrast**.

### Surfaces & interaction polish

- Dark chrome (sidebar, navy headers): light text + gold accents; soft gold scrollbars.
- Light workspace: navy text/actions; soft navy scrollbars; gold as accent (hover borders, focus), not large fills.
- Preserve existing focus-visible gold rings/outlines; do not remove for a “cleaner” look.
- Disabled controls: `--disabled-opacity` or existing button disabled styles.
- Short transitions (~0.15s) like existing buttons — no flashy motion.
- Prefer existing modal/spinner/pagination patterns in `components.css` / `src/components/ui/`.

---

## 7. Testing & build

| Kind | Where | Command |
| --- | --- | --- |
| Unit / component | Colocated `*.test.ts(x)` under `src/` | `npm test` / `npm run test:coverage` |
| Setup | `src/test/setup.ts` | MSW node, delay=0, scenario resets |
| E2E | `e2e/*.spec.ts` | `npm run test:e2e` |

**`tsconfig.app.json` excludes from `tsc -b` / `npm run build`:**

- `src/**/*.test.ts(x)`, `src/**/*.spec.ts(x)`, `src/test`

So test-only type issues do not break production build. Do **not** remove those excludes without intending that risk.

**Do**

- Colocate tests next to the module.
- For workspace pages, use `MemoryRouter` with nested routes mirroring `App.tsx`.
- Use MSW scenario helpers from test setup when mocking API states.

**Don’t** put all unit tests in a disconnected top-level `__tests__` tree.

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Generate config + Vite dev server (hot reload) |
| `npm run build` | Generate config + `tsc -b` + Vite build |
| `npm start` | Production build + preview on `:4173` |
| `npm test` | Vitest |
| `npm run test:e2e` | Playwright |
| `npm run typecheck` / `lint` / `format` | Quality gates |
| `npm run config:generate` | Rebuild `public/app-config.json` |

Note: `npm start` runs a full build (asset tables in the log are normal). Prefer `npm run dev` for day-to-day UI work.

---

## 8. Hard-won rules (ignore these and features derail)

1. Shared buttons live in `src/theme/components.css` — never only in landing/feature CSS.
2. Scrollbars: left `.sb-nav` = soft gold hairline; right `.sh-main` / `.ui-scroll-box` = soft navy thin.
3. New colors/fonts/spacing only via `tokens.css`.
4. `featureFlags.ts` is the rollout switch; keep ids aligned with routes + nav + hero.
5. Every gated URL uses `FeatureRoute`; disabled → redirect `/workspace`.
6. Catalogue tabs stay one route (`physical-datasets/:tab?`); keep visited tabs mounted.
7. `src/mocks/` = JSON only; handlers in `src/api/mock/`.
8. Pages never `fetch`; always feature `*.api.ts` + `API_ENDPOINTS`.
9. Config via `config/env-local.properties`, not Vite env for API mode.
10. Production `tsc` excludes tests — leave that alone unless intentional.
11. Nav/tab copy = Title Case; gated tooltip = `"Available in a future release"`.
12. Update all relevant persona fixture folders when changing console/nav shape.
13. Keep `SessionProvider` / toast providers at app level — do not remount per page.
14. When unsure, copy the structure of an existing mature feature (`bulkPde`, `physicalDatasets`, `bindColumns`) instead of inventing a new layout.

---

## 9. New-feature quick checklist

- [ ] Folder under the correct `src/features/…` tree with Page / api / types / adapter / css / components
- [ ] `workspaceRoutes.ts` + `App.tsx` lazy route + `FeatureRoute`
- [ ] `featureFlags.ts` id
- [ ] Persona `nav.json` / `hero.json` (Title Case, matching id) for every affected persona
- [ ] `endpoints.ts` + feature api + MSW handler + mock JSON + config mapping if new resource
- [ ] UI uses theme tokens + shared `btn-*` / `ui-btn*` / `ui-scroll-box`
- [ ] Scrollable regions follow gold-on-dark / navy-on-light scrollbar rules
- [ ] Colocated tests; e2e updated if critical path
- [ ] No invented palette, no shared styles trapped in feature-only CSS
