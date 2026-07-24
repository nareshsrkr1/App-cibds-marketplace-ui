import { useState } from 'react';
import { Badge } from '../../../../components/ui/Badge/Badge';
import { LogicalDatasetAccordion } from './LogicalDatasetAccordion';
import type { CatalogueBdeDetail, LogicalDataset, SubjectArea } from '../logicalModel.types';

export type SubjectAreaRowProps = {
  area: SubjectArea;
  logicalDatasets: LogicalDataset[];
  elements: CatalogueBdeDetail[];
};

export function SubjectAreaRow({ area, logicalDatasets, elements }: SubjectAreaRowProps) {
  const [expanded, setExpanded] = useState(false);
  const memberDatasets = logicalDatasets.filter((d) => d.subjectAreaId === area.id);

  return (
    <div
      className={`lgm-row${expanded ? ' is-open' : ''}`}
      aria-level={1}
      role="treeitem"
      aria-expanded={expanded}
    >
      <div
        className="lgm-row-h"
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
        <div className="lgm-row-title">
          <strong title={area.label}>{area.label}</strong>
          <div className="sub" title={area.subDomain}>
            {area.subDomain}
          </div>
        </div>
        <span className="num">{area.logicalDatasetCount}</span>
        <span className="num">{area.bdeCount}</span>
        <span className="num">{area.realisedCount}</span>
        <Badge tone={area.status === 'Endorsed' ? 'success' : 'neutral'}>{area.status}</Badge>
      </div>
      {expanded ? (
        <div className="lgm-detail">
          <div className="lgm-dgrid">
            <div>
              <span className="cat-dk">Domain / LOB</span>
              <span className="cat-dv">{area.domain}</span>
            </div>
            <div>
              <span className="cat-dk">Sub-domain</span>
              <span className="cat-dv">{area.subDomain}</span>
            </div>
            <div>
              <span className="cat-dk">Subject area</span>
              <span className="cat-dv">{area.label}</span>
            </div>
            <div>
              <span className="cat-dk">Logical datasets</span>
              <span className="cat-dv">{area.logicalDatasetCount}</span>
            </div>
            <div>
              <span className="cat-dk">Business data elements</span>
              <span className="cat-dv">{area.bdeCount}</span>
            </div>
            <div>
              <span className="cat-dk">Realised (PDE columns)</span>
              <span className="cat-dv">{area.realisedCount}</span>
            </div>
          </div>
          <div className="cat-nest-title">
            Logical datasets in this subject area ({memberDatasets.length})
          </div>
          {memberDatasets.map((dataset) => (
            <LogicalDatasetAccordion key={dataset.id} dataset={dataset} elements={elements} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
