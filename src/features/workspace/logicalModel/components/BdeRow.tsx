import { useState } from 'react';
import { Badge } from '../../../../components/ui/Badge/Badge';
import { useCatalogueModals } from '../../lineage/useCatalogueModals';
import type { CatalogueBdeDetail } from '../logicalModel.types';

export type BdeRowProps = {
  bde: CatalogueBdeDetail;
};

export function BdeRow({ bde }: BdeRowProps) {
  const [expanded, setExpanded] = useState(false);
  const { openBdeDetail, openLineage } = useCatalogueModals();

  return (
    <div className="nest-bde" aria-level={3} role="treeitem" aria-expanded={expanded}>
      <div
        className="nest-bde-h"
        onClick={() => setExpanded((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        }}
      >
        <span className={`cat-caret${expanded ? ' is-open' : ''}`} aria-hidden="true">
          ›
        </span>
        <span className="nb-name">
          <strong>{bde.name}</strong> <span className="mono nb-id">{bde.id}</span>
        </span>
        <span className="nb-meta">
          {bde.pdeCount} PDEs · <span className="sub">{bde.pii ? 'PII' : 'No PII'}</span>
        </span>
        {bde.pdeCount === 0 ? (
          <Badge tone="danger" title="Coverage gap">
            gap
          </Badge>
        ) : null}
        <button
          type="button"
          className="nb-info"
          title="View element record"
          aria-label={`View record for ${bde.name}`}
          onClick={(e) => {
            e.stopPropagation();
            openBdeDetail(bde.id);
          }}
        >
          ⓘ
        </button>
      </div>
      {expanded ? (
        <div className="nest-bde-body">
          <div className="cat-deffull">{bde.definition}</div>
          <div className="ln-datasets">
            {bde.realizations.map((r) => (
              <div className="ln-ds" key={r.datasetName}>
                <div className="ln-ds-h">
                  <span className={`cat-sor cat-sor-${r.sor.toLowerCase()}`}>{r.sor}</span> {r.datasetName}
                  <span className="sub"> · {r.columns.length} col{r.columns.length === 1 ? '' : 's'}</span>
                </div>
                <div className="ln-cols">
                  {r.columns.map((col) => (
                    <span className="ln-col mono" key={col}>
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="ln-btnwrap">
            <button
              type="button"
              className="cat-btn cat-btn-s"
              onClick={(e) => {
                e.stopPropagation();
                openLineage(bde.name);
              }}
            >
              ↳ Trace this element
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
