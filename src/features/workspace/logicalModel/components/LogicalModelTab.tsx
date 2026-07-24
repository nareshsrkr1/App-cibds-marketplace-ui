import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../../../components/feedback/EmptyState/EmptyState';
import { ErrorState } from '../../../../components/feedback/ErrorState/ErrorState';
import { Spinner } from '../../../../components/feedback/Spinner/Spinner';
import { Pagination } from '../../../../components/ui/Pagination/Pagination';
import { usePagination } from '../../../../components/ui/Pagination/usePagination';
import '../logicalModel.css';
import { fetchBusinessElements, fetchLogicalModel } from '../logicalModel.api';
import {
  SUBJECT_AREA_SORT_OPTIONS,
  type CatalogueBdeDetail,
  type LogicalDataset,
  type SubjectArea,
  type SubjectAreaSortKey,
} from '../logicalModel.types';
import { SubjectAreaRow } from './SubjectAreaRow';

const PAGE_SIZE = 10;

export function LogicalModelTab() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [subjectAreas, setSubjectAreas] = useState<SubjectArea[]>([]);
  const [logicalDatasets, setLogicalDatasets] = useState<LogicalDataset[]>([]);
  const [elements, setElements] = useState<CatalogueBdeDetail[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SubjectAreaSortKey>('name');

  useEffect(() => {
    const ac = new AbortController();
    setStatus('loading');
    setError(null);
    void Promise.all([
      fetchLogicalModel({ signal: ac.signal }),
      fetchBusinessElements({ signal: ac.signal }),
    ])
      .then(([modelResult, elementsResult]) => {
        if (ac.signal.aborted) return;
        if (!modelResult.ok) {
          setStatus('error');
          setError(modelResult.error);
          return;
        }
        if (!elementsResult.ok) {
          setStatus('error');
          setError(elementsResult.error);
          return;
        }
        setSubjectAreas(modelResult.data.subjectAreas);
        setLogicalDatasets(modelResult.data.logicalDatasets);
        setElements(elementsResult.data.elements);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unable to load the logical model.');
      });
    return () => ac.abort();
  }, [reloadToken]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = subjectAreas.filter((a) => {
      if (!q) return true;
      return `${a.label} ${a.domain} ${a.subDomain}`.toLowerCase().includes(q);
    });
    rows = [...rows].sort((a, b) => {
      if (sortKey === 'bdes') return b.bdeCount - a.bdeCount;
      if (sortKey === 'realised') return b.realisedCount - a.realisedCount;
      return a.label.localeCompare(b.label);
    });
    return rows;
  }, [subjectAreas, query, sortKey]);

  const filterKey = `${query}|${sortKey}`;
  const { page, setPage, pageCount, pageItems } = usePagination(visible, PAGE_SIZE, filterKey);

  if (status === 'loading') {
    return (
      <div className="cat-loading" role="status" aria-label="Loading">
        <Spinner size="lg" label="Loading logical model" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="workspace-state workspace-state--main">
        <ErrorState
          title="Unable to load the logical model"
          description={error ?? 'The logical model is unavailable.'}
          onRetry={() => setReloadToken((n) => n + 1)}
        />
      </div>
    );
  }

  return (
    <div className="lgm">
      <div className="cat-toolbar">
        <div className="cat-search">
          <span aria-hidden="true">⌕</span>
          <input
            aria-label="Search subject areas"
            placeholder="Search this section…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="cat-facets">
          <select
            aria-label="Sort"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SubjectAreaSortKey)}
          >
            {SUBJECT_AREA_SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="cat-rescount">{visible.length} subject areas</div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="No subject areas match"
          description="Try a different search term."
        />
      ) : (
        <>
          <div className="lgm-table" role="tree" aria-label="Logical model">
            <div className="lgm-head">
              <span />
              <span>Subject area</span>
              <span className="num">Datasets</span>
              <span className="num">BDEs</span>
              <span className="num">Realised</span>
              <span>Status</span>
            </div>
            {pageItems.map((area) => (
              <SubjectAreaRow
                key={area.id}
                area={area}
                logicalDatasets={logicalDatasets}
                elements={elements}
              />
            ))}
          </div>
          <Pagination
            page={page}
            pageCount={pageCount}
            onPageChange={setPage}
            label="Subject areas pages"
          />
        </>
      )}
    </div>
  );
}
