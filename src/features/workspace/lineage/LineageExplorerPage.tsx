import { useEffect, useMemo, useState } from 'react';
import { ConsoleHeader } from '../components/ConsoleHeader';
import { ErrorState } from '../../../components/feedback/ErrorState/ErrorState';
import { Spinner } from '../../../components/feedback/Spinner/Spinner';
import { fetchBusinessElements } from '../logicalModel/logicalModel.api';
import type { CatalogueBdeDetail } from '../logicalModel/logicalModel.types';
import { fetchLineageSummaries } from './lineage.api';
import type { LineageSummary } from './lineage.types';
import { CatalogueModalsProvider } from './CatalogueModalsProvider';
import { useCatalogueModals } from './useCatalogueModals';
import './lineage.css';

const QUICK_PICK_COUNT = 8;

function LineageExplorerBody() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<LineageSummary[]>([]);
  const [elements, setElements] = useState<CatalogueBdeDetail[]>([]);
  const [reloadToken, setReloadToken] = useState(0);
  const { openLineage } = useCatalogueModals();

  useEffect(() => {
    const ac = new AbortController();
    setStatus('loading');
    setError(null);
    void Promise.all([
      fetchLineageSummaries({ signal: ac.signal }),
      fetchBusinessElements({ signal: ac.signal }),
    ])
      .then(([summaryResult, elementsResult]) => {
        if (ac.signal.aborted) return;
        if (!summaryResult.ok) {
          setStatus('error');
          setError(summaryResult.error);
          return;
        }
        if (!elementsResult.ok) {
          setStatus('error');
          setError(elementsResult.error);
          return;
        }
        setSummaries(summaryResult.data.entries);
        setElements(elementsResult.data.elements);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unable to load lineage data.');
      });
    return () => ac.abort();
  }, [reloadToken]);

  const cdeByName = useMemo(() => {
    const isCde = new Map(elements.map((e) => [e.name, e.isCde]));
    return (name: string) => isCde.get(name) ?? false;
  }, [elements]);

  const picks = useMemo(() => {
    const sorted = [...summaries].sort((a, b) => {
      const aCde = cdeByName(a.bdeName) ? 1 : 0;
      const bCde = cdeByName(b.bdeName) ? 1 : 0;
      if (aCde !== bCde) return bCde - aCde;
      return a.bdeName.localeCompare(b.bdeName);
    });
    return sorted.slice(0, QUICK_PICK_COUNT);
  }, [summaries, cdeByName]);

  if (status === 'loading') {
    return (
      <div className="cat-loading" role="status" aria-label="Loading">
        <Spinner size="lg" label="Loading lineage" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="workspace-state workspace-state--main">
        <ErrorState
          title="Unable to load lineage"
          description={error ?? 'Lineage data is unavailable.'}
          onRetry={() => setReloadToken((n) => n + 1)}
        />
      </div>
    );
  }

  return (
    <div className="sh-block">
      <div className="lx-search">
        <label htmlFor="lx-element-search">Trace a business element</label>
        <select
          id="lx-element-search"
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) openLineage(e.target.value);
            e.target.value = '';
          }}
        >
          <option value="">Search all {summaries.length} elements…</option>
          {[...summaries]
            .sort((a, b) => a.bdeName.localeCompare(b.bdeName))
            .map((s) => (
              <option key={s.key} value={s.key}>
                {s.bdeName}
              </option>
            ))}
        </select>
      </div>
      <div className="lx-legend">
        <span>
          <i className="lin-swatch lin-swatch--root" /> Glossary term
        </span>
        <span>
          <i className="lin-swatch lin-swatch--bde" /> Business element
        </span>
        <span>
          <i className="lin-swatch lin-swatch--dataset" /> Physical dataset
        </span>
        <span>
          <i className="lin-swatch lin-swatch--columns" /> Column
        </span>
      </div>
      <div className="lx-picks-h">Frequently traced — critical data elements first</div>
      <div className="lx-picks">
        {picks.map((s) => (
          <button
            key={s.key}
            type="button"
            className="lx-pick"
            onClick={() => openLineage(s.key)}
          >
            <span className="lx-pick-name">
              {s.bdeName}
              {cdeByName(s.bdeName) ? <span className="lx-pick-cde">CDE</span> : null}
            </span>
            <span className="lx-pick-meta">
              <span>
                {s.datasets.length} dataset{s.datasets.length === 1 ? '' : 's'}
              </span>
              <span className="lx-pick-dot">·</span>
              <span>
                {s.columnCount} PDE{s.columnCount === 1 ? '' : 's'}
              </span>
            </span>
            <span className="lx-pick-flow" aria-hidden="true">
              <span>Source</span>
              <span className="lx-pick-arr">→</span>
              <span>Element</span>
              <span className="lx-pick-arr">→</span>
              <span>Column</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function LineageExplorerPage() {
  return (
    <div className="lx-page" data-testid="lineage-explorer">
      <ConsoleHeader
        eyebrow="Intelligence"
        greeting="Lineage explorer."
        subtitle="Trace any business element upstream to its systems of record and downstream to every column that realises it — across Endur and Catalyst."
      />
      <CatalogueModalsProvider>
        <LineageExplorerBody />
      </CatalogueModalsProvider>
    </div>
  );
}
