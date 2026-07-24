export type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  label?: string;
};

const ELLIPSIS = '…';

/** First, last, current, and one neighbor on each side; gaps collapse to an ellipsis. */
function buildPageList(page: number, pageCount: number): Array<number | typeof ELLIPSIS> {
  const pages = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);

  const out: Array<number | typeof ELLIPSIS> = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push(ELLIPSIS);
    out.push(p);
    prev = p;
  }
  return out;
}

/** Renders nothing when there's only one page — same "invisible until needed"
 * behavior the "Show more" reveal buttons it replaces already had. */
export function Pagination({ page, pageCount, onPageChange, label = 'Pagination' }: PaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <nav className="ui-pagination" aria-label={label}>
      <button
        type="button"
        className="ui-pagination__nav"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ‹ Previous
      </button>
      <div className="ui-pagination__pages">
        {buildPageList(page, pageCount).map((p, i) =>
          p === ELLIPSIS ? (
            <span key={`ellipsis-${i}`} className="ui-pagination__ellipsis">
              {ELLIPSIS}
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`ui-pagination__page${p === page ? ' is-active' : ''}`}
              aria-current={p === page ? 'page' : undefined}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ),
        )}
      </div>
      <button
        type="button"
        className="ui-pagination__nav"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        Next ›
      </button>
    </nav>
  );
}
