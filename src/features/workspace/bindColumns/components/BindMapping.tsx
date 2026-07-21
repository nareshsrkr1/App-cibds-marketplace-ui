import { Fragment, useEffect, useState } from 'react';
import {
  BDE_DETAILS,
  bdeIdFromLabel,
  isAmountColumn,
} from '../bindColumns.bdeDetails';
import type { BindColumn, BindFilter } from '../bindColumns.types';

/** Rows shown per page of the filtered bind table (view only — edits keep full list). */
export const BIND_PAGE_SIZE = 10;

export type BindMappingProps = {
  columns: BindColumn[];
  bdeOptions: string[];
  filter: BindFilter;
  query: string;
  onFilter: (f: BindFilter) => void;
  onQuery: (q: string) => void;
  onBindChange: (index: number, value: string) => void;
  onAcceptSuggested: () => void;
  onProposeField: (index: number, field: 'proposeName' | 'proposeDef', value: string) => void;
  onSubmitPropose: (index: number) => void;
  onColumnMeta: (
    index: number,
    patch: Partial<Pick<BindColumn, 'golden' | 'cde' | 'xform' | 'uom'>>,
  ) => void;
};

type RowStatus = 'suggested' | 'manual' | 'proposed' | 'awaiting' | 'needs-mapping';

function rowStatus(c: BindColumn): RowStatus {
  if (c.method === 'p' && c.suggest) return 'proposed';
  if (c.method === 's' && c.suggest) return 'suggested';
  if (c.method === 'm' && c.suggest) return 'manual';
  if (c.suggestedBde && !c.suggest) return 'awaiting';
  return 'needs-mapping';
}

function StatusBadge({ status }: { status: RowStatus }) {
  const labels: Record<RowStatus, string> = {
    suggested: 'Suggested',
    manual: 'Manual',
    proposed: 'Proposed',
    awaiting: 'Suggestion ready',
    'needs-mapping': 'Needs mapping',
  };
  return <span className={`bx-status bx-status--${status}`}>{labels[status]}</span>;
}

function selectTone(status: RowStatus): string {
  if (status === 'suggested') return ' suggested';
  if (status === 'manual') return ' manual';
  return '';
}

const XFORM_OPTIONS = [
  'Straight copy',
  'Derived / calculated',
  'Standardised / mapped',
  'Enriched',
];

export function BindMapping({
  columns,
  bdeOptions,
  filter,
  query,
  onFilter,
  onQuery,
  onBindChange,
  onAcceptSuggested,
  onProposeField,
  onSubmitPropose,
  onColumnMeta,
}: BindMappingProps) {
  const [page, setPage] = useState(1);
  const q = query.toLowerCase();

  const match = (c: BindColumn) => {
    if (q && !c.col.toLowerCase().includes(q)) return false;
    if (filter === 'unbound') return !c.suggest;
    if (filter === 'suggested')
      return Boolean(c.suggestedBde) || (c.method === 's' && Boolean(c.suggest));
    if (filter === 'manual') return c.method === 'm' && Boolean(c.suggest);
    if (filter === 'pii') return c.pii === 'Yes';
    return true;
  };

  const matched = columns.map((c, i) => ({ c, i })).filter(({ c }) => match(c));
  const pageCount = Math.max(1, Math.ceil(matched.length / BIND_PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageStart = (safePage - 1) * BIND_PAGE_SIZE;
  const pageRows = matched.slice(pageStart, pageStart + BIND_PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [filter, query]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const bound = columns.filter((c) => Boolean(c.suggest)).length;
  const total = columns.length;
  const pendingSuggested = columns.filter(
    (c) => c.suggestedBde && c.suggest !== c.suggestedBde,
  ).length;
  const needsMapping = columns.filter((c) => !c.suggest && !c.suggestedBde).length;
  const ready = columns.filter((c) => c.suggest && !c.proposed).length;
  const proposed = columns.filter((c) => c.proposed).length;
  const unmapped = columns.filter((c) => !c.suggest && !c.proposed).length;
  const gate = proposed + unmapped;

  const counts = {
    all: total,
    unbound: columns.filter((c) => !c.suggest).length,
    suggested: columns.filter((c) => Boolean(c.suggestedBde)).length,
    manual: columns.filter((c) => c.method === 'm' && c.suggest).length,
    pii: columns.filter((c) => c.pii === 'Yes').length,
  };

  const chip = (k: BindFilter, lbl: string) => (
    <button
      key={k}
      type="button"
      className={`bx-seg${filter === k ? ' on' : ''}${k === 'suggested' ? ' bx-seg--suggested' : ''}${k === 'manual' ? ' bx-seg--manual' : ''}`}
      onClick={() => onFilter(k)}
    >
      {lbl}
      <span className="bx-seg-n">{counts[k]}</span>
    </button>
  );

  const rangeFrom = matched.length === 0 ? 0 : pageStart + 1;
  const rangeTo = Math.min(pageStart + BIND_PAGE_SIZE, matched.length);

  return (
    <div className="sh-block">
      <div className="bx-summary" aria-label="Binding summary">
        <div className="bx-summary-item">
          <span className="bx-summary-v">{ready}</span>
          <span className="bx-summary-l">Ready to publish</span>
        </div>
        <div className="bx-summary-item">
          <span className="bx-summary-v">{pendingSuggested}</span>
          <span className="bx-summary-l">Suggestions ready</span>
        </div>
        <div className="bx-summary-item">
          <span className="bx-summary-v">{needsMapping}</span>
          <span className="bx-summary-l">Needs mapping</span>
        </div>
        <div className={`bx-summary-item${gate ? ' warn' : ''}`}>
          <span className="bx-summary-v">{gate}</span>
          <span className="bx-summary-l">Pending governance</span>
        </div>
        <div className="bx-summary-item muted">
          <span className="bx-summary-v">
            {bound}/{total}
          </span>
          <span className="bx-summary-l">Columns bound</span>
        </div>
      </div>

      <div className="bx-panel">
        <div className="bx-toolbar">
          <div className="bx-seg-group" role="group" aria-label="Filter columns">
            {chip('all', 'All')}
            {chip('suggested', 'Suggested')}
            {chip('unbound', 'Unbound')}
            {chip('manual', 'Manual')}
            {chip('pii', 'PII')}
          </div>
          <div className="bx-toolbar-right">
            <input
              className="bx-search"
              value={query}
              placeholder="Search columns…"
              onChange={(e) => onQuery(e.target.value)}
              aria-label="Search columns"
            />
            <button
              type="button"
              className="bx-primary"
              onClick={onAcceptSuggested}
              disabled={pendingSuggested === 0}
              title={
                pendingSuggested === 0
                  ? 'No pending suggestions to apply'
                  : `Apply ${pendingSuggested} suggested binding(s)`
              }
            >
              Accept all suggested
            </button>
          </div>
        </div>

        <div className="bx-table-wrap">
          <table className="bx-table">
            <thead>
              <tr>
                <th scope="col" className="bx-col-pde">
                  Physical column
                </th>
                <th scope="col" className="bx-col-type">
                  Type
                </th>
                <th scope="col" className="bx-col-bde">
                  Business element
                </th>
                <th scope="col" className="bx-col-status">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="bx-empty">
                    No columns match this filter.
                  </td>
                </tr>
              ) : (
                pageRows.map(({ c, i }) => {
                  const status = rowStatus(c);
                  const hasSuggestion = Boolean(c.suggestedBde);
                  const awaiting = status === 'awaiting';
                  const needsMap = status === 'needs-mapping';
                  const detailKey = c.suggest || '';
                  const detail = detailKey ? BDE_DETAILS[detailKey] : undefined;

                  return (
                    <Fragment key={`${c.col}-${i}`}>
                      <tr className={`bx-row bx-row--${status}`}>
                        <td className="bx-col-pde">
                          <div className="bx-pde-name mono">
                            {c.col}
                            {c.pii === 'Yes' ? <span className="bx-pii">PII</span> : null}
                          </div>
                        </td>
                        <td className="bx-col-type mono">
                          {c.type}
                          {c.len ? `(${c.len})` : ''}
                        </td>
                        <td className="bx-col-bde">
                          <div className="bx-bde-cell">
                            <select
                              className={`bx-select${selectTone(status)}`}
                              value={c.propose ? '__propose' : c.suggest || ''}
                              onChange={(e) => onBindChange(i, e.target.value)}
                              aria-label={`Bind ${c.col}`}
                            >
                              <option value="">Select a business element…</option>
                              {hasSuggestion ? (
                                <optgroup label="Harvest suggestion">
                                  <option value={c.suggestedBde}>{c.suggestedBde}</option>
                                </optgroup>
                              ) : null}
                              <optgroup label="Endorsed BDEs">
                                {bdeOptions
                                  .filter((o) => o !== c.suggestedBde)
                                  .map((o) => (
                                    <option key={o} value={o}>
                                      {o}
                                    </option>
                                  ))}
                              </optgroup>
                              <option value="__propose">Propose a new BDE…</option>
                            </select>

                            {awaiting ? (
                              <div className="bx-hint bx-hint--action">
                                <span className="bx-hint-label">Suggested</span>
                                <button
                                  type="button"
                                  className="bx-link"
                                  onClick={() => onBindChange(i, c.suggestedBde)}
                                >
                                  {c.suggestedBde}
                                </button>
                              </div>
                            ) : null}

                            {needsMap && !c.propose ? (
                              <div className="bx-hint">
                                No harvest suggestion. Choose an endorsed BDE or propose a new
                                one for governance.
                              </div>
                            ) : null}
                          </div>
                        </td>
                        <td className="bx-col-status">
                          <StatusBadge status={status} />
                        </td>
                      </tr>

                      {detail ? (
                        <tr className="bx-detail-row">
                          <td colSpan={4}>
                            <div
                              className={`bx-detail${status === 'manual' ? ' bx-detail--manual' : ''}`}
                            >
                              <div className="bx-detail-def">{detail.def}</div>
                              <div className="bx-detail-meta">
                                <span>
                                  <span className="bx-dk">BDE</span>{' '}
                                  <span className="mono">{bdeIdFromLabel(detailKey)}</span>
                                </span>
                                <span>
                                  <span className="bx-dk">Subject area</span> {detail.sa}
                                </span>
                                <span>
                                  <span className="bx-dk">Classification</span> {detail.cls}
                                </span>
                                <span>
                                  <span className="bx-dk">PII</span> {detail.pii}
                                </span>
                              </div>
                              <div className="bx-gov">
                                <div className="bx-gov-row">
                                  <label className="bx-chk">
                                    <input
                                      type="checkbox"
                                      checked={Boolean(c.golden)}
                                      onChange={(e) =>
                                        onColumnMeta(i, { golden: e.target.checked })
                                      }
                                    />
                                    <span>
                                      Golden source{' '}
                                      <span className="bx-help">
                                        (authoritative PDE for this BDE)
                                      </span>
                                    </span>
                                  </label>
                                  <label className="bx-chk">
                                    <input
                                      type="checkbox"
                                      checked={Boolean(c.cde)}
                                      onChange={(e) =>
                                        onColumnMeta(i, { cde: e.target.checked })
                                      }
                                    />
                                    <span>
                                      Critical Data Element{' '}
                                      <span className="bx-help">(BCBS 239)</span>
                                    </span>
                                  </label>
                                </div>
                                <div className="bx-gov-row">
                                  <div className="bx-fld">
                                    <label htmlFor={`xform-${i}`}>Transformation</label>
                                    <select
                                      id={`xform-${i}`}
                                      value={c.xform || 'Straight copy'}
                                      onChange={(e) =>
                                        onColumnMeta(i, { xform: e.target.value })
                                      }
                                    >
                                      {XFORM_OPTIONS.map((x) => (
                                        <option key={x} value={x}>
                                          {x}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  {isAmountColumn(c.col, c.type) ? (
                                    <div className="bx-fld">
                                      <label htmlFor={`uom-${i}`}>Unit / currency</label>
                                      <input
                                        id={`uom-${i}`}
                                        placeholder="e.g. USD, bps, %"
                                        value={c.uom || ''}
                                        onChange={(e) =>
                                          onColumnMeta(i, { uom: e.target.value })
                                        }
                                      />
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}

                      {c.propose ? (
                        <tr className="bx-detail-row">
                          <td colSpan={4}>
                            <div className="bx-propose">
                              <div className="bx-propose-title">
                                Propose a new BDE for <span className="mono">{c.col}</span>
                              </div>
                              <div className="bx-propose-grid">
                                <div className="bx-fld">
                                  <label>
                                    BDE logical name <span className="req">*</span>
                                  </label>
                                  <input
                                    value={c.proposeName ?? ''}
                                    onChange={(e) =>
                                      onProposeField(i, 'proposeName', e.target.value)
                                    }
                                    placeholder="e.g. Settlement Amount"
                                  />
                                </div>
                                <div className="bx-fld bx-fld--wide">
                                  <label>
                                    Short definition <span className="req">*</span>
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={c.proposeDef ?? ''}
                                    onChange={(e) =>
                                      onProposeField(i, 'proposeDef', e.target.value)
                                    }
                                    placeholder="Business meaning of this column…"
                                  />
                                </div>
                              </div>
                              <p className="bx-propose-note">
                                Routed to Data Governance for endorsement and BDE ID
                                assignment. Column stays unbound until endorsed.
                              </p>
                              <button
                                type="button"
                                className="btn-lt"
                                onClick={() => onSubmitPropose(i)}
                              >
                                Submit to Governance
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {matched.length > 0 ? (
          <div className="bx-pager" role="navigation" aria-label="Column pages">
            <span className="bx-pager-meta">
              {rangeFrom}–{rangeTo} of {matched.length}
              {matched.length !== total ? ` (filtered from ${total})` : ''}
            </span>
            <div className="bx-pager-acts">
              <button
                type="button"
                className="btn-lt"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="bx-pager-page">
                Page {safePage} / {pageCount}
              </span>
              <button
                type="button"
                className="btn-lt"
                disabled={safePage >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
