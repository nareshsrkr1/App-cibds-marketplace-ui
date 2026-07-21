import { useEffect, useState } from 'react';
import type { BindColumn, BindResolvedDataset, BindSrcType } from '../bindColumns.types';

/** Rows shown per page of the harvest table (view only — full list stays in memory). */
export const HARVEST_PAGE_SIZE = 10;

export type BindHarvestProps = {
  resolved: BindResolvedDataset;
  srcType: BindSrcType;
  columns: BindColumn[];
  harvestBusy: boolean;
  onLoadSample: () => void;
};

export function BindHarvest({
  resolved,
  srcType,
  columns,
  harvestBusy,
  onLoadSample,
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

  if (srcType === 'other' && columns.length === 0) {
    return (
      <div className="sh-block">
        <div className="ob-note">
          <b>Auto-harvest isn&apos;t available for this source.</b> Load column metadata so we
          can bind the columns. This dataset is already registered as{' '}
          <span className="mono">{resolved.dsId}</span>.
        </div>
        <button
          type="button"
          className="bulk-drop"
          onClick={onLoadSample}
          disabled={harvestBusy}
          aria-busy={harvestBusy}
          aria-label="Load sample column metadata"
        >
          <div className="bd-ic" aria-hidden="true">
            ⇪
          </div>
          <div className="bd-t">Load sample column metadata</div>
          <div className="bd-s">
            column · type · length · nullable · valid values · source mapping · origination ·
            PII
          </div>
          {harvestBusy ? (
            <div className="bulk-drop-spinner" role="status">
              Loading…
            </div>
          ) : null}
        </button>
        <p className="bulk-sample-link">
          Demo data only — real CSV upload for bind harvest ships with the backend.
        </p>
      </div>
    );
  }

  return (
    <div className="sh-block">
      {/* Top: stable across page changes */}
      <div className="ok-banner" role="status">
        {srcType === 's3'
          ? `✓ Harvested ${columns.length} columns from ${s3Path} — type, length, source mapping, origination and null % captured.`
          : `✓ Loaded ${columns.length} columns from sample metadata — validated for binding.`}
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
