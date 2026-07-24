import { Pagination } from '../../../../components/ui/Pagination/Pagination';
import { usePagination } from '../../../../components/ui/Pagination/usePagination';
import type { PhysicalDataset } from '../physicalDatasets.types';

const PAGE_SIZE = 10;

export type PhysicalDatasetsGridProps = {
  datasets: PhysicalDataset[];
  /** Identifies "a different result set" — pass the combined filter/search
   * state so changing a filter jumps back to page 1. */
  resetKey?: unknown;
};

export function PhysicalDatasetsGrid({ datasets, resetKey }: PhysicalDatasetsGridProps) {
  const { page, setPage, pageCount, pageItems } = usePagination(datasets, PAGE_SIZE, resetKey);

  return (
    <>
      <div className="ui-scroll-box pdc-grid-scroll">
        <div className="pdc-cardgrid">
          {pageItems.map((ds) => (
            <div className="pdc-gcard" key={ds.dsId}>
              <div className="pdc-gc-title">{ds.name}</div>
              <div className="pdc-gc-sub">{ds.sourceFile}</div>
              <div className="pdc-gc-nums">
                <span className="pdc-gc-n">{ds.columnCount} cols</span>
                <span className="pdc-gc-n">{ds.boundPercent}% bound</span>
              </div>
              <div className="pdc-gc-foot">
                <span
                  className={
                    ds.sor === 'Endur' ? 'pdc-sor pdc-sor--endur' : 'pdc-sor pdc-sor--catalyst'
                  }
                >
                  {ds.sor}
                </span>
                <span className="pdc-badge pdc-badge--published">{ds.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} label="Physical datasets pages" />
    </>
  );
}
