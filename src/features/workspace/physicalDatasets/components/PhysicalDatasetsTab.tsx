import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../../../components/feedback/EmptyState/EmptyState';
import { ErrorState } from '../../../../components/feedback/ErrorState/ErrorState';
import { Spinner } from '../../../../components/feedback/Spinner/Spinner';
import { toast } from '../../../../services/toastService';
import { fetchPhysicalDatasets } from '../physicalDatasets.api';
import {
  CLASSIFICATION_FILTER_OPTIONS,
  SOR_FILTER_OPTIONS,
  SORT_OPTIONS,
  type PhysicalDataset,
  type PhysicalDatasetSortKey,
  type PhysicalDatasetViewMode,
} from '../physicalDatasets.types';
import { PhysicalDatasetsGrid } from './PhysicalDatasetsGrid';
import { PhysicalDatasetsTable } from './PhysicalDatasetsTable';

function toCsv(rows: PhysicalDataset[]): string {
  const header = [
    'Dataset',
    'Dataset ID',
    'Source file',
    'System of record',
    'Owner',
    'Hosting app',
    'Classification',
    'Status',
    'Columns',
    'Bound %',
    'Tier',
  ];
  const lines = rows.map((r) =>
    [
      r.name,
      r.dsId,
      r.sourceFile,
      r.sor,
      r.owner,
      r.hostingApp,
      r.classification,
      r.status,
      String(r.columnCount),
      String(r.boundPercent),
      r.tier,
    ]
      .map((v) => `"${v.replace(/"/g, '""')}"`)
      .join(','),
  );
  return [header.join(','), ...lines].join('\n');
}

export function PhysicalDatasetsTab() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [datasets, setDatasets] = useState<PhysicalDataset[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  const [query, setQuery] = useState('');
  const [sor, setSor] = useState<(typeof SOR_FILTER_OPTIONS)[number]>('All SOR');
  const [classification, setClassification] =
    useState<(typeof CLASSIFICATION_FILTER_OPTIONS)[number]>('All classification');
  const [sortKey, setSortKey] = useState<PhysicalDatasetSortKey>('name');
  const [gapsOnly, setGapsOnly] = useState(false);
  const [viewMode, setViewMode] = useState<PhysicalDatasetViewMode>('list');

  useEffect(() => {
    const ac = new AbortController();
    setStatus('loading');
    setError(null);
    void fetchPhysicalDatasets({ signal: ac.signal })
      .then((res) => {
        if (ac.signal.aborted) return;
        if (!res.ok) {
          setStatus('error');
          setError(res.error);
          return;
        }
        setDatasets(res.data.datasets);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unable to load the dataset catalogue.');
      });
    return () => ac.abort();
  }, [reloadToken]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = datasets.filter((d) => {
      if (gapsOnly && !d.hasGap) return false;
      if (sor !== 'All SOR' && d.sor !== sor) return false;
      if (classification !== 'All classification' && d.classification !== classification) {
        return false;
      }
      if (!q) return true;
      const haystack =
        `${d.name} ${d.sourceFile} ${d.owner} ${d.hostingApp} ${d.sor} ${d.classification}`.toLowerCase();
      return haystack.includes(q);
    });

    rows = [...rows].sort((a, b) => {
      if (sortKey === 'columns') return b.columnCount - a.columnCount;
      if (sortKey === 'bound') return b.boundPercent - a.boundPercent;
      return a.name.localeCompare(b.name);
    });

    return rows;
  }, [datasets, query, sor, classification, gapsOnly, sortKey]);

  const gapCount = useMemo(() => datasets.filter((d) => d.hasGap).length, [datasets]);

  const filterKey = `${query}|${sor}|${classification}|${gapsOnly}|${sortKey}`;

  const handleExportCsv = () => {
    const csv = toCsv(visible);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'physical_datasets.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Physical datasets exported to CSV.');
  };

  if (status === 'loading') {
    return (
      <div className="pdc-loading" role="status" aria-label="Loading">
        <Spinner size="lg" label="Loading datasets" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="workspace-state workspace-state--main">
        <ErrorState
          title="Unable to load the catalogue"
          description={error ?? 'Physical datasets are unavailable.'}
          onRetry={() => setReloadToken((n) => n + 1)}
        />
      </div>
    );
  }

  return (
    <>
      <div className="pdc-toolbar">
        <div className="pdc-toolbar-top">
          <div className="pdc-search">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Search physical datasets"
              placeholder="Search this section…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="pdc-facets">
            <select
              aria-label="Filter by source system"
              value={sor}
              onChange={(e) => setSor(e.target.value as (typeof SOR_FILTER_OPTIONS)[number])}
            >
              {SOR_FILTER_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <select
              aria-label="Filter by classification"
              value={classification}
              onChange={(e) =>
                setClassification(e.target.value as (typeof CLASSIFICATION_FILTER_OPTIONS)[number])
              }
            >
              {CLASSIFICATION_FILTER_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <select
              aria-label="Sort"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as PhysicalDatasetSortKey)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="pdc-toolbar-btns">
          <button
            type="button"
            className={`pdc-fbtn${gapsOnly ? ' is-on' : ''}`}
            onClick={() => setGapsOnly((v) => !v)}
          >
            Coverage gaps <span className="pdc-fbtn-cnt">{gapCount}</span>
          </button>
          <button type="button" className="pdc-fbtn" onClick={handleExportCsv}>
            Export CSV
          </button>
          <div className="pdc-viewtoggle">
            <button
              type="button"
              className={`pdc-vt-btn${viewMode === 'list' ? ' is-on' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
              aria-label="List view"
            >
              ☰
            </button>
            <button
              type="button"
              className={`pdc-vt-btn${viewMode === 'grid' ? ' is-on' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
              aria-label="Grid view"
            >
              ▦
            </button>
          </div>
          <div className="pdc-rescount">{visible.length} shown</div>
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="No datasets match"
          description="Try a different search term or clear the filters."
        />
      ) : viewMode === 'grid' ? (
        <PhysicalDatasetsGrid datasets={visible} resetKey={filterKey} />
      ) : (
        <PhysicalDatasetsTable datasets={visible} resetKey={filterKey} />
      )}
    </>
  );
}
