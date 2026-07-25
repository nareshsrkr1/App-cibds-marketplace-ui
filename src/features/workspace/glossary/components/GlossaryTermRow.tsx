import { useState } from 'react';
import { Badge } from '../../../../components/ui/Badge/Badge';
import { useCatalogueModals } from '../../lineage/useCatalogueModals';
import type { CatalogueBdeDetail } from '../../logicalModel/logicalModel.types';
import type { GlossaryTerm } from '../glossary.types';

export type GlossaryTermRowProps = {
  term: GlossaryTerm;
  subjectAreaLabel: string;
  /** Full BDE list — used to render the "rolls up to this term" BDE details. */
  elements: CatalogueBdeDetail[];
};

export function GlossaryTermRow({ term, subjectAreaLabel, elements }: GlossaryTermRowProps) {
  const [expanded, setExpanded] = useState(false);
  const { openLineage } = useCatalogueModals();
  const byId = new Map(elements.map((e) => [e.id, e]));
  const rollupBdes = term.bdeIds.map((id) => byId.get(id)).filter((e): e is CatalogueBdeDetail => e !== undefined);

  return (
    <div className={`gls-row${expanded ? ' is-open' : ''}`}>
      <div
        className="gls-row-h"
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
        <div className="gls-row-title">
          <strong title={term.name}>{term.name}</strong>
          <div className="sub defprev" title={term.definition}>
            {term.definition}
          </div>
        </div>
        <span className="num">{term.bdeIds.length}</span>
        <span className="gls-area" title={subjectAreaLabel}>
          {subjectAreaLabel}
        </span>
        <span className="num">{term.pdeCount}</span>
        <span className="sub">{term.pii ? 'PII' : 'No PII'}</span>
        <span className="cat-badge-group">
          <Badge tone={term.status === 'Endorsed' ? 'success' : 'neutral'}>{term.status}</Badge>
          {term.pdeCount === 0 ? (
            <Badge tone="danger" title="Coverage gap">
              gap
            </Badge>
          ) : null}
        </span>
      </div>
      {expanded ? (
        <div className="gls-detail">
          <div className="cat-deffull">{term.definition}</div>
          <div className="gls-dgrid">
            <div>
              <span className="cat-dk">Subject area</span>
              <span className="cat-dv">{subjectAreaLabel}</span>
            </div>
            <div>
              <span className="cat-dk">Business data elements</span>
              <span className="cat-dv">{term.bdeIds.length}</span>
            </div>
            <div>
              <span className="cat-dk">Realised in (PDEs)</span>
              <span className="cat-dv">{term.pdeCount}</span>
            </div>
            <div>
              <span className="cat-dk">Classification</span>
              <span className="cat-dv">{term.classification}</span>
            </div>
            <div>
              <span className="cat-dk">PII</span>
              <span className="cat-dv">{term.pii ? 'Yes' : 'No'}</span>
            </div>
          </div>
          <div className="ln-wrap">
            <div className="cat-nest-title">Business Data Elements rolling up to this term</div>
            {rollupBdes.map((bde) => (
              <div className="bde-line" key={bde.id}>
                <span className="mono">{bde.id}</span> <strong>{bde.name}</strong>{' '}
                <span className="sub">· {bde.pdeCount} PDEs</span>
              </div>
            ))}
          </div>
          <div className="ln-btnwrap">
            <button type="button" className="cat-btn cat-btn-s" onClick={() => openLineage(term.name)}>
              ↳ View lineage
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
