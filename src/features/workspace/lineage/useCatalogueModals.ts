import { createContext, useContext } from 'react';

/**
 * Context only — the actual modal rendering lives in `CatalogueModalsProvider.tsx`.
 * Kept in a separate file so `logicalModel`/`glossary` row components can call
 * `useCatalogueModals()` without importing the provider (which pulls in the BDE detail
 * modal + Sankey diagram) — avoids a circular dependency between the two feature folders.
 */
export type CatalogueModalsContextValue = {
  /** Opens the BDE detail modal for the element with this `CatalogueBdeDetail.id`. */
  openBdeDetail: (bdeId: string) => void;
  /**
   * Opens the lineage diagram modal. `key` matches a `lineage-summary.json` entry's
   * `key` field — a BDE/term name, or `LD::<logical dataset name>` for a dataset-scoped view.
   */
  openLineage: (key: string) => void;
};

export const CatalogueModalsContext = createContext<CatalogueModalsContextValue | null>(null);

export function useCatalogueModals(): CatalogueModalsContextValue {
  const ctx = useContext(CatalogueModalsContext);
  if (!ctx) {
    throw new Error('useCatalogueModals must be used within a <CatalogueModalsProvider>');
  }
  return ctx;
}
