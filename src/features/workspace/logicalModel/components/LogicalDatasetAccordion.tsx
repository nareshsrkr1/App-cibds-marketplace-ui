import { useState } from 'react';
import { useCatalogueModals } from '../../lineage/useCatalogueModals';
import { BdeRow } from './BdeRow';
import type { CatalogueBdeDetail, LogicalDataset } from '../logicalModel.types';

const INITIAL_BDE_CAP = 15;

export type LogicalDatasetAccordionProps = {
  dataset: LogicalDataset;
  /** Full BDE list — this dataset's member rows are looked up by name from it. */
  elements: CatalogueBdeDetail[];
};

export function LogicalDatasetAccordion({ dataset, elements }: LogicalDatasetAccordionProps) {
  const [expanded, setExpanded] = useState(false);
  const [showAllBdes, setShowAllBdes] = useState(false);
  const { openLineage } = useCatalogueModals();

  const byName = new Map(elements.map((e) => [e.name, e]));
  const members = dataset.bdeNames
    .map((name) => byName.get(name))
    .filter((e): e is CatalogueBdeDetail => e !== undefined);
  const visibleMembers = showAllBdes ? members : members.slice(0, INITIAL_BDE_CAP);
  const hiddenCount = members.length - visibleMembers.length;

  return (
    <div className="nest-ld" aria-level={2} role="treeitem" aria-expanded={expanded}>
      <div
        className="nest-ld-h"
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
        <span className="nl-name">
          <strong>{dataset.name}</strong>
        </span>
        <span className="nl-meta">
          {dataset.bdeCount} elements · {dataset.pdeCount} PDEs
        </span>
        <button
          type="button"
          className="cat-btn cat-btn-xs"
          onClick={(e) => {
            e.stopPropagation();
            openLineage(`LD::${dataset.name}`);
          }}
        >
          ↳ Lineage
        </button>
      </div>
      {expanded ? (
        <div className="nest-ld-body">
          <div className="nest-bde-list">
            {visibleMembers.map((bde) => (
              <BdeRow key={bde.id} bde={bde} />
            ))}
          </div>
          {hiddenCount > 0 ? (
            <button
              type="button"
              className="cat-show-more"
              onClick={() => setShowAllBdes(true)}
            >
              Show all {members.length} elements
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
