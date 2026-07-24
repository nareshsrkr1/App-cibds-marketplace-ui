import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../../../components/feedback/EmptyState/EmptyState';
import { ErrorState } from '../../../../components/feedback/ErrorState/ErrorState';
import { Spinner } from '../../../../components/feedback/Spinner/Spinner';
import { Pagination } from '../../../../components/ui/Pagination/Pagination';
import { usePagination } from '../../../../components/ui/Pagination/usePagination';
import { fetchBusinessElements, fetchLogicalModel } from '../../logicalModel/logicalModel.api';
import type { CatalogueBdeDetail, SubjectArea } from '../../logicalModel/logicalModel.types';
import { fetchGlossaryTerms } from '../glossary.api';
import '../glossary.css';
import {
  GLOSSARY_SORT_OPTIONS,
  GLOSSARY_STATUS_OPTIONS,
  type GlossarySortKey,
  type GlossaryStatusFilter,
  type GlossaryTerm,
} from '../glossary.types';
import { GlossaryTermRow } from './GlossaryTermRow';

const FUTURE = 'Available in a future release';
const PAGE_SIZE = 10;

export function GlossaryTermsTab() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [elements, setElements] = useState<CatalogueBdeDetail[]>([]);
  const [subjectAreas, setSubjectAreas] = useState<SubjectArea[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  const [query, setQuery] = useState('');
  const [subjectAreaId, setSubjectAreaId] = useState('All');
  const [statusFilter, setStatusFilter] = useState<GlossaryStatusFilter>('All status');
  const [sortKey, setSortKey] = useState<GlossarySortKey>('name');

  useEffect(() => {
    const ac = new AbortController();
    setStatus('loading');
    setError(null);
    void Promise.all([
      fetchGlossaryTerms({ signal: ac.signal }),
      fetchBusinessElements({ signal: ac.signal }),
      fetchLogicalModel({ signal: ac.signal }),
    ])
      .then(([termsResult, elementsResult, modelResult]) => {
        if (ac.signal.aborted) return;
        if (!termsResult.ok) {
          setStatus('error');
          setError(termsResult.error);
          return;
        }
        if (!elementsResult.ok) {
          setStatus('error');
          setError(elementsResult.error);
          return;
        }
        if (!modelResult.ok) {
          setStatus('error');
          setError(modelResult.error);
          return;
        }
        setTerms(termsResult.data.terms);
        setElements(elementsResult.data.elements);
        setSubjectAreas(modelResult.data.subjectAreas);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unable to load the glossary.');
      });
    return () => ac.abort();
  }, [reloadToken]);

  const subjectAreaLabel = useMemo(() => {
    const byId = new Map(subjectAreas.map((a) => [a.id, a.label]));
    return (id: string) => byId.get(id) ?? id;
  }, [subjectAreas]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = terms.filter((t) => {
      if (subjectAreaId !== 'All' && t.subjectAreaId !== subjectAreaId) return false;
      if (statusFilter !== 'All status' && t.status !== statusFilter) return false;
      if (!q) return true;
      return `${t.name} ${t.definition}`.toLowerCase().includes(q);
    });
    rows = [...rows].sort((a, b) => {
      if (sortKey === 'bdes') return b.bdeIds.length - a.bdeIds.length;
      if (sortKey === 'pdes') return b.pdeCount - a.pdeCount;
      return a.name.localeCompare(b.name);
    });
    return rows;
  }, [terms, query, subjectAreaId, statusFilter, sortKey]);

  const filterKey = `${query}|${subjectAreaId}|${statusFilter}|${sortKey}`;
  const { page, setPage, pageCount, pageItems } = usePagination(visible, PAGE_SIZE, filterKey);

  if (status === 'loading') {
    return (
      <div className="cat-loading" role="status" aria-label="Loading">
        <Spinner size="lg" label="Loading glossary" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="workspace-state workspace-state--main">
        <ErrorState
          title="Unable to load the glossary"
          description={error ?? 'The business glossary is unavailable.'}
          onRetry={() => setReloadToken((n) => n + 1)}
        />
      </div>
    );
  }

  return (
    <div className="gls">
      <div className="cat-toolbar">
        <div className="cat-search">
          <span aria-hidden="true">⌕</span>
          <input
            aria-label="Search glossary terms"
            placeholder="Search this section…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="cat-facets">
          <select
            aria-label="Filter by subject area"
            value={subjectAreaId}
            onChange={(e) => setSubjectAreaId(e.target.value)}
          >
            <option value="All">All subject areas</option>
            {subjectAreas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as GlossaryStatusFilter)}
          >
            {GLOSSARY_STATUS_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <select
            aria-label="Sort"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as GlossarySortKey)}
          >
            {GLOSSARY_SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="cat-btn cat-btn-s" disabled title={FUTURE}>
          Bulk upload
        </button>
        <button type="button" className="cat-btn cat-btn-s" disabled title={FUTURE}>
          New term
        </button>
        <div className="cat-rescount">{visible.length} terms</div>
      </div>

      {visible.length === 0 ? (
        <EmptyState title="No terms match" description="Try a different search term or clear the filters." />
      ) : (
        <>
          <div className="gls-table" role="table" aria-label="Glossary terms">
            <div className="gls-head" role="row">
              <span />
              <span>Glossary term</span>
              <span className="num">BDEs</span>
              <span>Subject area</span>
              <span className="num">PDEs</span>
              <span>PII</span>
              <span>Status</span>
            </div>
            {pageItems.map((term) => (
              <GlossaryTermRow
                key={term.id}
                term={term}
                subjectAreaLabel={subjectAreaLabel(term.subjectAreaId)}
                elements={elements}
              />
            ))}
          </div>
          <Pagination
            page={page}
            pageCount={pageCount}
            onPageChange={setPage}
            label="Glossary terms pages"
          />
        </>
      )}
    </div>
  );
}
