import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchBusinessElements } from '../logicalModel/logicalModel.api';
import type { CatalogueBdeDetail } from '../logicalModel/logicalModel.types';
import { BdeDetailModal } from '../logicalModel/components/BdeDetailModal';
import { CatalogueModalsContext } from './useCatalogueModals';
import { LineageModal } from './components/LineageModal';
import './lineage.css';

export type CatalogueModalsProviderProps = {
  children: ReactNode;
};

/**
 * Owns the BDE-detail and Lineage modals for one screen (mounted in `PhysicalDatasetsPage`
 * and separately in `LineageExplorerPage` — not globally at the workspace shell, since no
 * other workspace route opens either modal).
 */
export function CatalogueModalsProvider({ children }: CatalogueModalsProviderProps) {
  const [openBdeId, setOpenBdeId] = useState<string | null>(null);
  const [openLineageKey, setOpenLineageKey] = useState<string | null>(null);
  const [elements, setElements] = useState<CatalogueBdeDetail[]>([]);

  useEffect(() => {
    if (!openBdeId || elements.length > 0) return;
    const ac = new AbortController();
    void fetchBusinessElements({ signal: ac.signal }).then((result) => {
      if (!ac.signal.aborted && result.ok) setElements(result.data.elements);
    });
    return () => ac.abort();
  }, [openBdeId, elements.length]);

  const value = useMemo(
    () => ({
      openBdeDetail: (bdeId: string) => setOpenBdeId(bdeId),
      openLineage: (key: string) => setOpenLineageKey(key),
    }),
    [],
  );

  const selectedBde = elements.find((e) => e.id === openBdeId) ?? null;

  return (
    <CatalogueModalsContext.Provider value={value}>
      {children}
      <BdeDetailModal
        open={openBdeId !== null}
        bde={selectedBde}
        elements={elements}
        onClose={() => setOpenBdeId(null)}
        onSelectBde={(bdeId) => setOpenBdeId(bdeId)}
        onTraceLineage={(bdeName) => {
          // Match the intended flow: tracing lineage replaces the BDE detail
          // modal rather than stacking a second overlay (and a second focus
          // trap) on top of it.
          setOpenBdeId(null);
          setOpenLineageKey(bdeName);
        }}
      />
      <LineageModal
        open={openLineageKey !== null}
        lineageKey={openLineageKey}
        onClose={() => setOpenLineageKey(null)}
      />
    </CatalogueModalsContext.Provider>
  );
}
