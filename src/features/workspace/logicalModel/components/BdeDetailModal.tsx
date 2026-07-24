import { Modal } from '../../../../components/ui/Modal/Modal';
import { Badge } from '../../../../components/ui/Badge/Badge';
import { decomposeIso11179 } from '../logicalModel.iso11179';
import type { CatalogueBdeDetail } from '../logicalModel.types';

export type BdeDetailModalProps = {
  open: boolean;
  bde: CatalogueBdeDetail | null;
  /** Full BDE list, for resolving "related elements" (siblings in the same logical dataset). */
  elements: CatalogueBdeDetail[];
  onClose: () => void;
  onSelectBde: (bdeId: string) => void;
  onTraceLineage: (bdeName: string) => void;
};

export function BdeDetailModal({
  open,
  bde,
  elements,
  onClose,
  onSelectBde,
  onTraceLineage,
}: BdeDetailModalProps) {
  if (!bde) return null;

  const iso = decomposeIso11179(bde.name);
  const related = elements.filter(
    (e) => e.id !== bde.id && e.logicalDatasetId === bde.logicalDatasetId,
  );

  return (
    <Modal open={open} onClose={onClose} title={bde.name}>
      <div className="bde-modal">
        <div className="bde-modal__eyebrow">Business Data Element · {bde.id}</div>
        <div className="bde-modal__tags">
          <Badge tone={bde.classification === 'Restricted' ? 'danger' : 'info'}>
            {bde.classification}
          </Badge>
          {bde.pii ? <Badge tone="warning">PII</Badge> : null}
          {bde.isCde ? <Badge tone="success">Critical Data Element</Badge> : null}
          <Badge tone={bde.status === 'Endorsed' ? 'success' : 'neutral'}>{bde.status}</Badge>
        </div>
        <nav className="bde-modal__breadcrumb" aria-label="Ontology position">
          {bde.domain} › {bde.subDomain} › {bde.logicalDatasetName} › {bde.name}
        </nav>
        <p className="bde-modal__def">{bde.definition}</p>

        <div className="bde-modal__grid">
          <div className="bde-modal__card">
            <h3>Ontology position</h3>
            <dl>
              <dt>Domain</dt>
              <dd>{bde.domain}</dd>
              <dt>Sub-domain</dt>
              <dd>{bde.subDomain}</dd>
              <dt>Logical dataset</dt>
              <dd>{bde.logicalDatasetName}</dd>
              <dt>Element ID</dt>
              <dd className="mono">{bde.id}</dd>
            </dl>
          </div>
          <div className="bde-modal__card">
            <h3>Governance</h3>
            <dl>
              <dt>Classification</dt>
              <dd>{bde.classification}</dd>
              <dt>PII</dt>
              <dd>{bde.pii ? 'Yes' : 'No'}</dd>
              <dt>Status</dt>
              <dd>{bde.status}</dd>
              <dt>Steward</dt>
              <dd>{bde.steward}</dd>
            </dl>
          </div>
        </div>

        <div className="bde-modal__card bde-modal__card--wide">
          <h3>ISO 11179 name decomposition</h3>
          <div className="bde-modal__iso">
            <div>
              <span className="bde-modal__iso-k">Object class</span>
              <span className="bde-modal__iso-v">{iso.objectClass || '—'}</span>
            </div>
            <div>
              <span className="bde-modal__iso-k">Qualifier</span>
              <span className="bde-modal__iso-v">{iso.qualifier || '—'}</span>
            </div>
            <div>
              <span className="bde-modal__iso-k">Property</span>
              <span className="bde-modal__iso-v">{iso.property || '—'}</span>
            </div>
            <div>
              <span className="bde-modal__iso-k">Class word</span>
              <span className="bde-modal__iso-v">{iso.classWord || '—'}</span>
            </div>
          </div>
        </div>

        <div className="bde-modal__card bde-modal__card--wide">
          <h3>Realisation &amp; lineage</h3>
          <p className="bde-modal__realise-summary">
            {bde.pdeCount} physical columns across {bde.datasetCount} datasets
          </p>
          <div className="bde-modal__chips">
            {bde.realizations.map((r) => (
              <span key={r.datasetName} className="bde-modal__chip">
                <span className={`cat-sor cat-sor-${r.sor.toLowerCase()}`}>{r.sor}</span> {r.datasetName}
                <span className="sub"> · {r.columns.length} col{r.columns.length === 1 ? '' : 's'}</span>
              </span>
            ))}
          </div>
          <button
            type="button"
            className="cat-btn cat-btn-s bde-modal__trace"
            onClick={() => onTraceLineage(bde.name)}
          >
            ↳ Trace full lineage
          </button>
        </div>

        {related.length > 0 ? (
          <div className="bde-modal__card bde-modal__card--wide">
            <h3>Related elements</h3>
            <div className="bde-modal__chips">
              {related.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className="bde-modal__related-chip"
                  onClick={() => onSelectBde(r.id)}
                >
                  {r.name} <span className="mono">{r.id}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
