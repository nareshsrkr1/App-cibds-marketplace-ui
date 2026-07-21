import type { BindApplicationGroup, BindResolvedDataset, BindSrcType } from '../bindColumns.types';

export type BindSourceProps = {
  applications: BindApplicationGroup[];
  selectedDsId: string;
  srcType: BindSrcType;
  showError: boolean;
  onSelectDataset: (dsId: string) => void;
  onSrcType: (src: BindSrcType) => void;
  resolved: BindResolvedDataset | null;
};

export function BindSource({
  applications,
  selectedDsId,
  srcType,
  showError,
  onSelectDataset,
  onSrcType,
  resolved,
}: BindSourceProps) {
  return (
    <div className="sh-block">
      <div className={`fld${showError && !selectedDsId ? ' show-err' : ''}`}>
        <label htmlFor="bind-ds">
          Which dataset are you binding? <span className="req">*</span>
        </label>
        <select
          id="bind-ds"
          value={selectedDsId}
          onChange={(e) => onSelectDataset(e.target.value)}
          className={showError && !selectedDsId ? 'err' : ''}
        >
          <option value="">Select a registered dataset…</option>
          {applications.map((app) => (
            <optgroup key={app.appId} label={`${app.name} — ${app.offerId}`}>
              {app.datasets.map((d) => (
                <option key={d.dsId} value={d.dsId}>
                  {d.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {showError && !selectedDsId ? (
          <div className="errmsg">Select the dataset you are binding.</div>
        ) : null}
      </div>

      {resolved ? (
        <>
          <div className="idchain" aria-label="Binding identity">
            <div className="idc-h">Binding under</div>
            <div className="idc-row">
              <div className="idc">
                <span className="idc-l">Application</span>
                <span className="idc-v">{resolved.app}</span>
              </div>
              <div className="idc-arr" aria-hidden="true">
                ›
              </div>
              <div className="idc">
                <span className="idc-l">App ID</span>
                <span className="idc-v mono">{resolved.appId}</span>
              </div>
              <div className="idc-arr" aria-hidden="true">
                ›
              </div>
              <div className="idc">
                <span className="idc-l">
                  Producer Contract ID <span className="idc-note">producer contract</span>
                </span>
                <span className="idc-v mono">{resolved.offerId}</span>
              </div>
              <div className="idc-arr" aria-hidden="true">
                ›
              </div>
              <div className="idc hi">
                <span className="idc-l">Dataset ID</span>
                <span className="idc-v mono">{resolved.dsId}</span>
              </div>
            </div>
            <div className="idc-foot">
              These identifiers are looked up from the registry — the dataset is already
              registered. Binding attaches columns to business elements under this identity.
            </div>
          </div>

          <div className="fld">
            <label>Schema source</label>
            <div className="chips" role="group" aria-label="Schema source">
              <button
                type="button"
                className={`chip-sel${srcType === 's3' ? ' on' : ''}`}
                onClick={() => onSrcType('s3')}
              >
                S3 — auto-harvest <span className="mtag s">available</span>
              </button>
              <button
                type="button"
                className={`chip-sel${srcType === 'other' ? ' on' : ''}`}
                onClick={() => onSrcType('other')}
              >
                Other source — manual columns
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
