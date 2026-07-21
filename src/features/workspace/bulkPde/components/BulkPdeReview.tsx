import { useState } from 'react';
import { inferRepresentation } from '../bulkPde.inferRep';
import type { BulkPdeRow, BulkPdeRowSource } from '../bulkPde.types';
import { summarizeBulkPdeRows, validateBulkPdeRow } from '../bulkPde.validate';

export type BulkPdeReviewProps = {
  rows: BulkPdeRow[];
  source: BulkPdeRowSource;
  registerBusy: boolean;
  onStartOver: () => void;
  onRegister: () => void;
};

function statusLabel(ok: boolean, errors: string[]) {
  if (ok) return <span className="st-ok">✓ Valid</span>;
  return (
    <span className="st-err" title={errors.join('; ')}>
      ⚠ {errors[0]}
    </span>
  );
}

export function BulkPdeReview({
  rows,
  source,
  registerBusy,
  onStartOver,
  onRegister,
}: BulkPdeReviewProps) {
  const { total, valid, invalid } = summarizeBulkPdeRows(rows);
  const [openRows, setOpenRows] = useState<Record<number, boolean>>({});
  const canRegister = source === 'file' && valid > 0 && !registerBusy;

  const toggleRow = (index: number) => {
    setOpenRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="sh-block">
      {source === 'sample' ? (
        <div className="bulk-preview-banner" role="status">
          Sample preview — validation only. Upload a real CSV to register PDEs.
        </div>
      ) : null}

      <div className="bulk-summary" aria-label="Validation summary">
        <div className="bs-stat">
          <span className="bs-n">{total}</span>
          <span className="bs-l">rows</span>
        </div>
        <div className="bs-stat ok">
          <span className="bs-n">{valid}</span>
          <span className="bs-l">valid</span>
        </div>
        <div className={`bs-stat${invalid ? ' err' : ''}`}>
          <span className="bs-n">{invalid}</span>
          <span className="bs-l">need fixing</span>
        </div>
      </div>

      <div className="bulk-table2" role="table" aria-label="PDE preview">
        <div className="bt2-head" role="row">
          <span role="columnheader">Status</span>
          <span role="columnheader">Dataset</span>
          <span role="columnheader">Column</span>
          <span role="columnheader">Type</span>
          <span role="columnheader">Rep.</span>
          <span role="columnheader">PII</span>
        </div>
        {rows.map((row, index) => {
          const errors = validateBulkPdeRow(row);
          const ok = errors.length === 0;
          const fullType = (row.type || '') + (row.length ? `(${row.length})` : '');
          const open = Boolean(openRows[index]);
          return (
            <div key={`${row.dataset}-${row.column}-${index}`}>
              <button
                type="button"
                className={`bt2-row${ok ? '' : ' bad'}`}
                onClick={() => toggleRow(index)}
                aria-expanded={open}
                aria-controls={`bulk-pde-detail-${index}`}
              >
                <span className="bt2-st">{statusLabel(ok, errors)}</span>
                <span>{row.dataset || '—'}</span>
                <span className="mono">{row.column || '—'}</span>
                <span className="mono">{fullType || '—'}</span>
                <span className="bt2-rep">{ok ? inferRepresentation(row.type) : '—'}</span>
                <span>{row.pii || 'No'}</span>
              </button>
              <div
                id={`bulk-pde-detail-${index}`}
                className={`bt2-detail${open ? ' show' : ''}`}
                role="region"
                hidden={!open}
              >
                <div className="btd-grid">
                  <div>
                    <span className="btd-k">Nullable</span>
                    <span className="btd-v">{row.nullable || '—'}</span>
                  </div>
                  <div>
                    <span className="btd-k">Source mapping</span>
                    <span className="btd-v mono">{row.sourceMapping || '—'}</span>
                  </div>
                  <div>
                    <span className="btd-k">Valid values</span>
                    <span className="btd-v">{row.validValues || '—'}</span>
                  </div>
                  <div className="btd-wide">
                    <span className="btd-k">Description</span>
                    <span className="btd-v">{row.description || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bulk-acts">
        <button type="button" className="btn-lt" onClick={onStartOver} disabled={registerBusy}>
          ← Start over
        </button>
        <div className="spacer" />
        {source === 'file' ? (
          <button
            type="button"
            className={`btn-dk${registerBusy ? ' is-busy' : ''}`}
            onClick={onRegister}
            disabled={!canRegister}
            aria-busy={registerBusy}
          >
            {registerBusy
              ? 'Registering…'
              : `Register ${valid} valid PDE${valid !== 1 ? 's' : ''} ✓`}
          </button>
        ) : (
          <button type="button" className="btn-dk" onClick={onStartOver}>
            Upload a CSV to register →
          </button>
        )}
      </div>
    </div>
  );
}
