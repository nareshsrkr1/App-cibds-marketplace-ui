/**
 * Single on/off switch per feature, keyed by the same id used in nav items,
 * hero actions, and (for routed features) `workspaceRoutes.ts`.
 *
 * This is the ONLY file to edit to turn a feature on or off for a phased
 * rollout — nav.json/hero.json across every persona and the route guards in
 * App.tsx all read from here. Nothing else needs touching.
 *
 * A real backend may still send its own per-item `enabled` (e.g. real
 * per-user entitlements) — that stays intact as the fallback for any id not
 * listed here. When an id IS listed here, this registry wins over whatever
 * the backend/mock sent, because it answers a different question: not "is
 * this user allowed to use it" but "is this feature live in this build at
 * all."
 */
export const FEATURE_FLAGS: Record<string, boolean> = {
  // Routed features — ids match src/features/workspace/workspaceRoutes.ts
  register: false,
  bulkpde: true,
  bind: true,
  workflow: true,
  phys: true,
  lineage: true,

  // Catalogue tabs — not separately routed (they live inside the "phys" route as
  // tabs), gated inline in PhysicalDatasetsPage instead of via FeatureRoute
  log: true,
  bt: true,

  // Not built yet
  search: false,
  gaps: false,
  mydatasets: false,
  mybindings: false,
  proposed: false,
  govqueue: false,
  addbde: false,
  bulkbde: false,
  addterm: false,
  bulkterm: false,
  adminreg: false,
  adminaudit: false,
  browse: false,
  subs: false,
  explore: false,
  requests: false,
};

/** For route guards: is this feature live? Untracked ids default to enabled. */
export function isFeatureEnabled(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(FEATURE_FLAGS, id)
    ? FEATURE_FLAGS[id]
    : true;
}

/** For adapters normalizing a per-item `enabled` from mock/backend data: the
 * registry wins when it has an opinion, otherwise falls back to what the
 * data said. */
export function resolveFeatureEnabled(id: string, fallback: boolean): boolean {
  return Object.prototype.hasOwnProperty.call(FEATURE_FLAGS, id)
    ? FEATURE_FLAGS[id]
    : fallback;
}
