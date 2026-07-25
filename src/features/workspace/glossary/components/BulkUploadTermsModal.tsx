import { useRef, useState, type DragEvent } from 'react';
import { Modal } from '../../../../components/ui/Modal/Modal';
import { Button } from '../../../../components/ui/Button/Button';
import type { SubjectArea } from '../../logicalModel/logicalModel.types';
import type { GlossaryTerm } from '../glossary.types';
import {
  csvRowToGlossaryTerm,
  glossaryTermsCsvTemplate,
  parseGlossaryTermsCsv,
  summarizeGlossaryTermRows,
  validateGlossaryTermCsvRow,
  type GlossaryTermCsvRow,
} from '../glossary.bulkTerms';

export type BulkUploadTermsModalProps = {
  open: boolean;
  subjectAreas: SubjectArea[];
  onClose: () => void;
  onApplied: (terms: GlossaryTerm[]) => void;
};

/** A 3-stage wizard — the HTML SoT's separate "Template" step is folded into "Upload"
 * here, since downloading the template and dropping a file are really one action from
 * the user's point of view. */
type Stage = 'upload' | 'validate' | 'apply';

const STAGES: Array<{ key: Stage; label: string }> = [
  { key: 'upload', label: 'Upload' },
  { key: 'validate', label: 'Validate' },
  { key: 'apply', label: 'Apply' },
];

function readFileAsText(file: File): Promise<string> {
  if (typeof file.text === 'function') return file.text();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read file.'));
    reader.readAsText(file);
  });
}

function BulkStepper({ stage }: { stage: Stage }) {
  const activeIndex = STAGES.findIndex((s) => s.key === stage);
  return (
    <div className="gls-bulk-stepper">
      {STAGES.map((s, i) => (
        <div
          key={s.key}
          className={`gls-bulk-step${i === activeIndex ? ' is-active' : i < activeIndex ? ' is-done' : ''}`}
        >
          <span className="gls-bulk-step-dot">{i < activeIndex ? '✓' : i + 1}</span>
          <span className="gls-bulk-step-lbl">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

export function BulkUploadTermsModal({ open, subjectAreas, onClose, onApplied }: BulkUploadTermsModalProps) {
  const [stage, setStage] = useState<Stage>('upload');
  const [rows, setRows] = useState<GlossaryTermCsvRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [appliedCount, setAppliedCount] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStage('upload');
    setRows([]);
    setBusy(false);
    setAppliedCount(0);
    setDragOver(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleBack() {
    const idx = STAGES.findIndex((s) => s.key === stage);
    if (idx <= 0) return;
    setRows([]);
    setStage(STAGES[idx - 1].key);
  }

  function handleDownloadTemplate() {
    const csv = glossaryTermsCsvTemplate();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'glossary_terms_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const text = await readFileAsText(file);
      const parsed = parseGlossaryTermsCsv(text);
      if (parsed.length === 0) return;
      setRows(parsed);
      setStage('validate');
    } catch {
      // Malformed CSV — leave the uploader in place; row-level errors surface at review.
    } finally {
      setBusy(false);
    }
  }

  function openPicker() {
    fileRef.current?.click();
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  const { total, valid, invalid, validRows } = summarizeGlossaryTermRows(rows, subjectAreas);

  function handleApply() {
    const terms = validRows.map((r) => csvRowToGlossaryTerm(r, subjectAreas));
    onApplied(terms);
    setAppliedCount(terms.length);
    setStage('apply');
  }

  return (
    <Modal open={open} onClose={handleClose} title="Bulk upload — Glossary terms" size="wide" headerTheme="navy">
      <div className="gls-bulk">
        <BulkStepper stage={stage} />

        {stage === 'upload' ? (
          <>
            <p className="gls-bulk-intro">
              Fill one row per term, then upload the CSV below. Every row is validated
              before anything is added.
            </p>

            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="gls-bulk-file-input"
              data-testid="bulk-terms-file-input"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
                e.target.value = '';
              }}
            />
            <div
              role="button"
              tabIndex={0}
              className={`gls-bulk-drop${dragOver ? ' is-dragover' : ''}${busy ? ' is-busy' : ''}`}
              onClick={openPicker}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openPicker();
                }
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragOver(false);
              }}
              onDrop={onDrop}
              aria-label="Drop a glossary terms CSV here, or click to browse"
              aria-busy={busy}
            >
              <div aria-hidden="true">⇪</div>
              <div>Drop your filled CSV here, or click to browse</div>
              <div className="gls-bulk-drop-hint">We'll parse and validate 5 columns per row.</div>
              {busy ? <div className="gls-bulk-drop-status">Reading CSV…</div> : null}
            </div>
            <p className="gls-bulk-samplelink-wrap">
              <button type="button" className="gls-bulk-samplelink" onClick={handleDownloadTemplate}>
                ⤓ Download sample CSV
              </button>
            </p>
          </>
        ) : null}

        {stage === 'validate' ? (
          <>
            <div className="gls-bulk-summary">
              <div className="gls-bulk-stat">
                <span className="gls-bulk-stat-n">{total}</span>
                <span>rows</span>
              </div>
              <div className="gls-bulk-stat is-ok">
                <span className="gls-bulk-stat-n">{valid}</span>
                <span>valid</span>
              </div>
              <div className={`gls-bulk-stat${invalid ? ' is-bad' : ''}`}>
                <span className="gls-bulk-stat-n">{invalid}</span>
                <span>need fixing</span>
              </div>
            </div>

            <div className="gls-bulk-table" role="table" aria-label="Glossary term preview">
              <div className="gls-bulk-table-head" role="row">
                <span>Result</span>
                <span>Term</span>
                <span>Subject area</span>
                <span>Classification</span>
              </div>
              {rows.map((row, i) => {
                const errs = validateGlossaryTermCsvRow(row, subjectAreas);
                const ok = errs.length === 0;
                return (
                  <div key={`${row.term}-${i}`} className={`gls-bulk-row${ok ? '' : ' is-bad'}`} role="row">
                    <span>{ok ? '✓ Valid' : `⚠ ${errs[0]}`}</span>
                    <span>{row.term || '—'}</span>
                    <span>{row.subjectArea || '—'}</span>
                    <span>{row.classification || 'Internal'}</span>
                  </div>
                );
              })}
            </div>
            <p className="gls-bulk-hint">Rejected rows are skipped; valid rows apply on confirm.</p>

            <div className="gls-bulk-actions">
              <Button variant="secondary" onClick={handleBack}>
                ← Back
              </Button>
              <Button variant="primary" onClick={handleApply} disabled={valid === 0}>
                Apply {valid} valid term{valid === 1 ? '' : 's'} ✓
              </Button>
            </div>
          </>
        ) : null}

        {stage === 'apply' ? (
          <div className="gls-bulk-success">
            <div className="gls-bulk-success-icon" aria-hidden="true">
              ✓
            </div>
            <h3>{appliedCount} record{appliedCount === 1 ? '' : 's'} applied</h3>
            <p>New terms were added to the glossary as Proposed, pending governance review.</p>
            <Button variant="primary" onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
