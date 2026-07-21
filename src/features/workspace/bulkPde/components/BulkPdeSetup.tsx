import { useRef, useState, type DragEvent } from 'react';
import type { BulkPdeApplication } from '../bulkPde.types';

export type BulkPdeSetupProps = {
  applications: BulkPdeApplication[];
  selectedAppId: string;
  onSelectApp: (applicationId: string) => void;
  onDownloadTemplate: () => void;
  onFileSelected: (file: File) => void;
  onLoadSample: () => void;
  templateBusy: boolean;
  parseBusy: boolean;
  templateColumns: string[];
};

export function BulkPdeSetup({
  applications,
  selectedAppId,
  onSelectApp,
  onDownloadTemplate,
  onFileSelected,
  onLoadSample,
  templateBusy,
  parseBusy,
  templateColumns,
}: BulkPdeSetupProps) {
  const selected = applications.find((a) => a.id === selectedAppId);
  const busy = parseBusy;
  const canUpload = Boolean(selectedAppId) && !busy;
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const openPicker = () => {
    if (!canUpload) return;
    fileRef.current?.click();
  };

  const takeFile = (file: File | undefined | null) => {
    if (!file || !canUpload) return;
    onFileSelected(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (!canUpload) return;
    takeFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="sh-block">
      <div className="bulk-cfgrow">
        <div className="fld">
          <label htmlFor="bulk-pde-app">
            Application <span className="req">*</span>
          </label>
          <select
            id="bulk-pde-app"
            value={selectedAppId}
            onChange={(e) => onSelectApp(e.target.value)}
            disabled={busy}
          >
            <option value="">Select application…</option>
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className={`btn-lt bulk-cfgrow-action${templateBusy ? ' is-busy' : ''}`}
          onClick={onDownloadTemplate}
          disabled={templateBusy || busy}
          aria-busy={templateBusy}
        >
          {templateBusy ? 'Preparing…' : '⤓ Download CSV template'}
        </button>
      </div>
      <div className="reg-inherit" aria-live="polite">
        {selected ? (
          <>
            Registers under Offer <span className="mono">{selected.offerId}</span>
          </>
        ) : (
          <span className="reg-inherit-placeholder">&nbsp;</span>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        className="bulk-file-input"
        data-testid="bulk-pde-file-input"
        onChange={(e) => {
          takeFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      <div
        role="button"
        tabIndex={canUpload ? 0 : -1}
        className={`bulk-drop${canUpload ? '' : ' is-disabled'}${busy ? ' is-loading' : ''}${dragOver ? ' is-dragover' : ''}`}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPicker();
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          if (canUpload) setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (canUpload) setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={onDrop}
        aria-disabled={!canUpload}
        aria-busy={busy}
        aria-label="Drop a PDE CSV here, or click to browse"
      >
        <div className="bd-ic" aria-hidden="true">
          ⇪
        </div>
        <div className="bd-t">Drop a PDE CSV here, or click to browse</div>
        <div className="bd-s">
          Columns: {templateColumns.join(', ') || '…'} — each dataset gets a new Dataset
          ID minted on submit
        </div>
        {!selectedAppId ? (
          <div className="bd-hint">Select an application first to upload a CSV.</div>
        ) : null}
        {busy ? (
          <div className="bulk-drop-spinner" role="status" aria-label="Processing file">
            Reading CSV…
          </div>
        ) : null}
      </div>

      <p className="bulk-sample-link">
        <button
          type="button"
          className="tmpllink"
          onClick={onLoadSample}
          disabled={!canUpload}
        >
          Preview sample data
        </button>
      </p>
    </div>
  );
}
