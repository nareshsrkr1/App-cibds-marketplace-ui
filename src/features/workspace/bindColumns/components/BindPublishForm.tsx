import type { BindReviewPath } from '../bindColumns.types';

export type BindPublishProps = {
  contractName: string;
  reviewPath: BindReviewPath;
  offerId: string;
  showError: boolean;
  onContractName: (v: string) => void;
  onReviewPath: (v: BindReviewPath) => void;
};

export function BindPublishForm({
  contractName,
  reviewPath,
  offerId,
  showError,
  onContractName,
  onReviewPath,
}: BindPublishProps) {
  return (
    <div className="sh-block">
      <div className="sechd">Publish &amp; review</div>
      <div className={`fld${showError && !contractName.trim() ? ' show-err' : ''}`}>
        <label htmlFor="bind-contract">
          Producer contract label <span className="req">*</span>
        </label>
        <input
          id="bind-contract"
          value={contractName}
          placeholder="e.g. Commodity Trades — Risk feed (producer contract)"
          onChange={(e) => onContractName(e.target.value)}
        />
        {showError && !contractName.trim() ? (
          <div className="errmsg">Required.</div>
        ) : null}
        {offerId ? (
          <div className="offer-id">
            <span className="oi-lbl">Producer Contract ID</span>
            <span className="oi-val mono">{offerId}</span>
          </div>
        ) : null}
      </div>

      <div className="fld">
        <label>How should this be reviewed?</label>
        <div className="chips" role="group" aria-label="Review path">
          <button
            type="button"
            className={`chip-sel${reviewPath === 'steward' ? ' on' : ''}`}
            onClick={() => onReviewPath('steward')}
          >
            Send to a steward <span className="mtag s">Recommended</span>
          </button>
          <button
            type="button"
            className={`chip-sel${reviewPath === 'self' ? ' on' : ''}`}
            onClick={() => onReviewPath('self')}
          >
            Self-certify <span className="sub">(no steward review)</span>
          </button>
        </div>
        <div className="hint">
          {reviewPath === 'steward'
            ? 'A steward reviews and endorses before publish — required for new BDEs or unmapped columns.'
            : 'Publish now and stand behind the quality yourself — available when every column binds to an endorsed element.'}
        </div>
      </div>
      <div className="hint">Distribution activates only after the bindings are published.</div>
    </div>
  );
}
