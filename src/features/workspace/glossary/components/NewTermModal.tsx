import { useState } from 'react';
import { Modal } from '../../../../components/ui/Modal/Modal';
import { Button } from '../../../../components/ui/Button/Button';
import type { CatalogueClassification, SubjectArea } from '../../logicalModel/logicalModel.types';
import type { GlossaryTerm } from '../glossary.types';
import { mintTermId } from '../glossary.bulkTerms';

export type NewTermModalProps = {
  open: boolean;
  subjectAreas: SubjectArea[];
  onClose: () => void;
  onCreated: (term: GlossaryTerm) => void;
};

const CLASSIFICATIONS: CatalogueClassification[] = ['Internal', 'Confidential', 'Restricted'];
const CLASS_WORDS = ['Amount', 'Identifier', 'Name', 'Date', 'Code', 'Indicator', 'Rate', 'Quantity'];
const GOVERNANCE_OWNERS = ['Data Governance', 'Data Management'];

export function NewTermModal({ open, subjectAreas, onClose, onCreated }: NewTermModalProps) {
  const [name, setName] = useState('');
  const [subjectAreaId, setSubjectAreaId] = useState(subjectAreas[0]?.id ?? '');
  const [definition, setDefinition] = useState('');
  // Domain/sub-domain/class word/synonyms/related terms/governance owner are pre-fill
  // helpers for the governance reviewer — same as the HTML SoT, they don't map onto any
  // field GlossaryTerm actually persists, only the required name/definition/subject
  // area/classification do.
  const [domain, setDomain] = useState('');
  const [subDomain, setSubDomain] = useState('');
  const [classWord, setClassWord] = useState('');
  const [synonyms, setSynonyms] = useState('');
  const [relatedTerms, setRelatedTerms] = useState('');
  const [classification, setClassification] = useState<CatalogueClassification>('Internal');
  const [governanceOwner, setGovernanceOwner] = useState(GOVERNANCE_OWNERS[0]);
  const [errors, setErrors] = useState<{ name?: boolean; definition?: boolean }>({});
  const [submittedName, setSubmittedName] = useState<string | null>(null);

  function reset() {
    setName('');
    setSubjectAreaId(subjectAreas[0]?.id ?? '');
    setDefinition('');
    setDomain('');
    setSubDomain('');
    setClassWord('');
    setSynonyms('');
    setRelatedTerms('');
    setClassification('Internal');
    setGovernanceOwner(GOVERNANCE_OWNERS[0]);
    setErrors({});
    setSubmittedName(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit() {
    const nextErrors = { name: !name.trim(), definition: !definition.trim() };
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.definition) return;

    const term: GlossaryTerm = {
      id: mintTermId(name),
      name: name.trim(),
      definition: definition.trim(),
      subjectAreaId: subjectAreaId || subjectAreas[0]?.id || '',
      classification,
      pii: false,
      status: 'Proposed',
      pdeCount: 0,
      bdeIds: [],
    };
    onCreated(term);
    setSubmittedName(term.name);
  }

  return (
    <Modal open={open} onClose={handleClose} title="New glossary term" size="wide" headerTheme="navy">
      <div className="gls-nt">
        {submittedName ? (
          <div className="gls-nt-success">
            <div className="gls-nt-success-icon" aria-hidden="true">
              ✓
            </div>
            <h3>Submitted as Proposed</h3>
            <p>
              <strong>{submittedName}</strong> is recorded as Proposed in the Data Governance
              definition queue — it won't block anything. Governance will confirm the
              definition, assign a Business Element ID, set classification, and endorse it,
              typically within <strong>2 business days</strong>.
            </p>
            <Button variant="primary" onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="gls-nt-note">
              <div className="gls-nt-note-h">What happens after you submit</div>
              <ol>
                <li>
                  <strong>Registered right away</strong> — your term enters the Data Governance
                  definition queue as Proposed. It's recorded, not blocked.
                </li>
                <li>
                  <strong>Governance reviews</strong> — they confirm the definition, set the
                  subject area and classification, and assign a Business Element ID.
                </li>
                <li>
                  <strong>Endorsed &amp; discoverable</strong> — once endorsed it appears in
                  search and the catalogue.
                </li>
              </ol>
              <div className="gls-nt-sla">⏱ Standard review SLA: 2 business days.</div>
            </div>

            <div className="gls-fld-row">
              <div className={`gls-fld${errors.name ? ' is-err' : ''}`}>
                <label htmlFor="nt-name">
                  Term name <span className="gls-req">*</span>
                </label>
                <input
                  id="nt-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Gross Exposure"
                />
                {errors.name ? <div className="gls-fld-err">Required.</div> : null}
              </div>
              <div className="gls-fld">
                <label htmlFor="nt-sa">
                  Subject area <span className="gls-req">*</span>
                </label>
                <select id="nt-sa" value={subjectAreaId} onChange={(e) => setSubjectAreaId(e.target.value)}>
                  {subjectAreas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={`gls-fld${errors.definition ? ' is-err' : ''}`}>
              <label htmlFor="nt-def">
                Proposed definition <span className="gls-req">*</span>
              </label>
              <textarea
                id="nt-def"
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                placeholder="Describe the business meaning of this term."
              />
              {errors.definition ? <div className="gls-fld-err">Required.</div> : null}
            </div>

            <div className="gls-fld-row gls-fld-row--3">
              <div className="gls-fld">
                <label htmlFor="nt-dom">
                  Data domain <span className="gls-opt">(optional)</span>
                </label>
                <input id="nt-dom" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="e.g. Trading Data" />
              </div>
              <div className="gls-fld">
                <label htmlFor="nt-sub">
                  Sub-domain <span className="gls-opt">(optional)</span>
                </label>
                <input
                  id="nt-sub"
                  value={subDomain}
                  onChange={(e) => setSubDomain(e.target.value)}
                  placeholder="Trade & Position"
                />
              </div>
              <div className="gls-fld">
                <label htmlFor="nt-rep">
                  Class Word <span className="gls-opt">(optional)</span>
                </label>
                <select id="nt-rep" value={classWord} onChange={(e) => setClassWord(e.target.value)}>
                  <option value="">—</option>
                  {CLASS_WORDS.map((w) => (
                    <option key={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="gls-fld-row">
              <div className="gls-fld">
                <label htmlFor="nt-syn">
                  Synonyms &amp; aliases <span className="gls-opt">(optional)</span>
                </label>
                <input
                  id="nt-syn"
                  value={synonyms}
                  onChange={(e) => setSynonyms(e.target.value)}
                  placeholder="e.g. face value; principal (semicolon-separated)"
                />
              </div>
              <div className="gls-fld">
                <label htmlFor="nt-rel">
                  Related terms <span className="gls-opt">(optional)</span>
                </label>
                <input
                  id="nt-rel"
                  value={relatedTerms}
                  onChange={(e) => setRelatedTerms(e.target.value)}
                  placeholder="e.g. Gross Notional; Cleared Notional"
                />
              </div>
            </div>

            <div className="gls-fld-row">
              <div className="gls-fld">
                <label htmlFor="nt-cls">Classification</label>
                <select
                  id="nt-cls"
                  value={classification}
                  onChange={(e) => setClassification(e.target.value as CatalogueClassification)}
                >
                  {CLASSIFICATIONS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="gls-fld">
                <label htmlFor="nt-own">
                  Governance owner <span className="gls-opt">(optional)</span>
                </label>
                <select id="nt-own" value={governanceOwner} onChange={(e) => setGovernanceOwner(e.target.value)}>
                  {GOVERNANCE_OWNERS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            <p className="gls-fld-hint">
              The more you fill in, the less back-and-forth with Governance — these pre-fill
              what they'd otherwise have to chase.
            </p>

            <div className="gls-nt-actions">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSubmit}>
                Submit
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
