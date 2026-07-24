import { Fragment, useState } from 'react';
import type { PhysicalDataset } from '../physicalDatasets.types';

export type PhysicalDatasetsTableProps = {
  datasets: PhysicalDataset[];
};

function sorClass(sor: PhysicalDataset['sor']): string {
  return sor === 'Endur' ? 'pdc-sor pdc-sor--endur' : 'pdc-sor pdc-sor--catalyst';
}

function classificationClass(classification: PhysicalDataset['classification']): string {
  switch (classification) {
    case 'Confidential':
      return 'pdc-badge pdc-badge--confidential';
    case 'Restricted':
      return 'pdc-badge pdc-badge--restricted';
    default:
      return 'pdc-badge pdc-badge--internal';
  }
}

export function PhysicalDatasetsTable({ datasets }: PhysicalDatasetsTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (dsId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(dsId)) next.delete(dsId);
      else next.add(dsId);
      return next;
    });
  };

  return (
    <table className="pdc-table">
      <thead>
        <tr>
          <th aria-hidden="true" />
          <th>Physical dataset</th>
          <th>Source system</th>
          <th>Owner</th>
          <th>Hosting app</th>
          <th>Classification</th>
          <th>Status</th>
          <th>Columns</th>
          <th>BDE binding</th>
        </tr>
      </thead>
      <tbody>
        {datasets.map((ds) => {
          const isOpen = expanded.has(ds.dsId);
          return (
            <Fragment key={ds.dsId}>
              <tr
                className={`pdc-row${isOpen ? ' is-open' : ''}`}
                onClick={() => toggle(ds.dsId)}
                aria-expanded={isOpen}
              >
                <td className="pdc-caret">{isOpen ? '⌄' : '›'}</td>
                <td>
                  <strong>{ds.name}</strong>
                  <div className="pdc-sub">{ds.sourceFile}</div>
                </td>
                <td>
                  <span className={sorClass(ds.sor)}>{ds.sor}</span>
                </td>
                <td>{ds.owner}</td>
                <td>{ds.hostingApp}</td>
                <td>
                  <span className={classificationClass(ds.classification)}>
                    {ds.classification}
                  </span>
                </td>
                <td>
                  <span className="pdc-badge pdc-badge--published">{ds.status}</span>
                </td>
                <td>{ds.columnCount} cols</td>
                <td>
                  <div className="pdc-barwrap">
                    <div className="pdc-bar" style={{ width: `${ds.boundPercent}%` }} />
                  </div>
                  <span className="pdc-barlbl">{ds.boundPercent}% bound</span>
                </td>
              </tr>
              {isOpen ? (
                <tr className="pdc-detail">
                  <td colSpan={9}>
                    <div className="pdc-dgrid">
                      <div>
                        <span className="pdc-dk">Source file</span>
                        <span className="pdc-dv">{ds.sourceFile}</span>
                      </div>
                      <div>
                        <span className="pdc-dk">System of record</span>
                        <span className="pdc-dv">{ds.sor}</span>
                      </div>
                      <div>
                        <span className="pdc-dk">Owner</span>
                        <span className="pdc-dv">{ds.owner}</span>
                      </div>
                      <div>
                        <span className="pdc-dk">Hosting app</span>
                        <span className="pdc-dv">{ds.hostingApp}</span>
                      </div>
                      <div>
                        <span className="pdc-dk">Classification</span>
                        <span className="pdc-dv">{ds.classification}</span>
                      </div>
                      <div>
                        <span className="pdc-dk">Columns</span>
                        <span className="pdc-dv">{ds.columnCount}</span>
                      </div>
                      <div>
                        <span className="pdc-dk">BDE binding</span>
                        <span className="pdc-dv">{ds.boundPercent}% of columns bound</span>
                      </div>
                      <div>
                        <span className="pdc-dk">Tier</span>
                        <span className="pdc-dv">{ds.tier}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : null}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}
