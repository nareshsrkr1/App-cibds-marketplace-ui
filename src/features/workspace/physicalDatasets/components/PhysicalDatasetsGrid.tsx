import type { PhysicalDataset } from '../physicalDatasets.types';

export type PhysicalDatasetsGridProps = {
  datasets: PhysicalDataset[];
};

export function PhysicalDatasetsGrid({ datasets }: PhysicalDatasetsGridProps) {
  return (
    <div className="pdc-cardgrid">
      {datasets.map((ds) => (
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
  );
}
