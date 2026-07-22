import { useEffect, useRef, useState, type DragEvent } from 'react';
import type { BindColumn, BindResolvedDataset, BindSrcType } from '../bindColumns.types';

/** Rows shown per page of the harvest table (view only — full list stays in memory). */
export const HARVEST_PAGE_SIZE = 10;

export type BindHarvestProps = {
  resolved: BindResolvedDataset;
  srcType: BindSrcType;
  columns: BindColumn[];
  harvestBusy: boolean;
  onDownloadSample: () => void;
  onFileSelected: (file: File) => void;
};

export function BindHarvest({
  resolved,
  srcType,
  columns,
  harvestBusy,
  onDownloadSample,
  onFileSelected,
}: BindHarvestProps) {
  const [page, setPage] = useState(1);
  const s3Path = `s3://${resolved.s3Prefix}/`;

  const pageCount = Math.max(1, Math.ceil(columns.length / HARVEST_PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageStart = (safePage - 1) * HARVEST_PAGE_SIZE;
  const pageRows = columns.slice(pageStart, pageStart + HARVEST_PAGE_SIZE);
  const rangeFrom = columns.length === 0 ? 0 : pageStart + 1;
  const rangeTo = Math.min(pageStart + HARVEST_PAGE_SIZE, columns.length);

  useEffect(() => {
    setPage(1);
  }, [columns.length, srcType]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const canUpload = !harvestBusy;

  const openPicker = () => {
    if (!canUpload) return;
    fileRef.current?.click();
  };

  const takeFile = (file: File | undefined | null) => {
    if (!file || !canUpload) return;
    onFileSelected(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (!canUpload) return;
    takeFile(e.dataTransfer.files?.[0]);
  };

  if (srcType === 'other' && columns.length === 0) {
    return (
      <div className="sh-block">
        <div className="ob-note">
          <b>Auto-harvest isn&apos;t available for this source.</b> Upload a column metadata
          CSV so we can bind the columns. This dataset is already registered as{' '}
          <span className="mono">{resolved.dsId}</span>.
        </div>

        <div className="ob-download">
          <button type="button" className="btn-lt" onClick={onDownloadSample}>
            ⤓ Download sample data (CSV)
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="bulk-file-input"
          data-testid="bind-harvest-file-input"
          onChange={(e) => {
            takeFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />

        <div
          role="button"
          tabIndex={canUpload ? 0 : -1}
          className={`bulk-drop${canUpload ? '' : ' is-disabled'}${harvestBusy ? ' is-loading' : ''}${dragOver ? ' is-dragover' : ''}`}
          onClick={openPicker}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openPicker();
            }
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            if (canUpload) setDragOver(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (canUpload) setDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragOver(false);
          }}
          onDrop={onDrop}
          aria-disabled={!canUpload}
          aria-busy={harvestBusy}
          aria-label="Drop a column metadata CSV here, or click to browse"
        >
          <div className="bd-ic" aria-hidden="true">
            ⇪
          </div>
          <div className="bd-t">Drop a column metadata CSV here, or click to browse</div>
          <div className="bd-s">
            column · type · length · nullable · valid values · source mapping · origination ·
            PII
          </div>
          {harvestBusy ? (
            <div className="bulk-drop-spinner" role="status" aria-label="Reading file">
              Reading CSV…
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="sh-block">
      {/* Top: stable across page changes */}
      <div className="ok-banner" role="status">
        {srcType === 's3'
          ? `✓ Harvested ${columns.length} columns from ${s3Path} — type, length, source mapping, origination and null % captured.`
          : `✓ Loaded ${columns.length} columns from uploaded metadata — validated for binding.`}
      </div>
      <div className="ds-idbar">
        <span className="ds-idlbl">Producer Contract</span>
        <span className="ds-idval mono">{resolved.offerId}</span>
        <span className="ds-idlbl" style={{ marginLeft: 8 }}>
          Dataset
        </span>
        <span className="ds-idval mono">{resolved.dsId}</span>
        <span className="ds-idname">{resolved.name}</span>
        <span className="ds-idtag">Registered</span>
      </div>

      {/* Middle: only this region updates when paging */}
      <div className="harvest-page-region" aria-live="polite">
        <div className="bind-table-wrap harvest-table-wrap">
          <table className="bind-htable">
            <thead>
              <tr>
                <th>Column</th>
                <th>Type · Length</th>
                <th>Source mapping</th>
                <th>Origination</th>
                <th>Valid values</th>
                <th>PII</th>
                {srcType === 's3' ? <th>Profile</th> : null}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((c) => (
                <tr key={c.col}>
                  <td className="mono">{c.col}</td>
                  <td className="mono">
                    {c.type}
                    {c.len ? ` · ${c.len}` : ''}
                  </td>
                  <td className="mono sub">{c.srcmap || '—'}</td>
                  <td>
                    <span
                      className={`mtag ${c.orig === 'No Transformation' ? 'n' : 's'}`}
                    >
                      {c.orig || '—'}
                    </span>
                  </td>
                  <td className="sub">{c.vals || '—'}</td>
                  <td>
                    {c.pii === 'Yes' ? (
                      <span className="mtag m">PII</span>
                    ) : (
                      <span className="sub">No</span>
                    )}
                  </td>
                  {srcType === 's3' ? <td className="sub">{c.profile || '—'}</td> : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {columns.length > HARVEST_PAGE_SIZE ? (
          <div className="bind-pager" role="navigation" aria-label="Harvest column pages">
            <span className="bind-pager-meta">
              Showing <b>{rangeFrom}</b>–<b>{rangeTo}</b> of <b>{columns.length}</b>
            </span>
            <div className="bind-pager-acts">
              <button
                type="button"
                className="btn-lt"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Previous
              </button>
              <span className="bind-pager-page">
                Page {safePage} of {pageCount}
              </span>
              <button
                type="button"
                className="btn-lt"
                disabled={safePage >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              >
                Next →
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Bottom: stable across page changes */}
      <p className="fld hint harvest-hint">
        {srcType === 's3'
          ? 'Harvest reads each column’s technical detail and source mapping, and profiles null % and distinct count. Bind every column to a business element in the next step.'
          : 'No automatic profiling for uploaded metadata — those come only from S3 harvest.'}
      </p>
    </div>
  );
}
