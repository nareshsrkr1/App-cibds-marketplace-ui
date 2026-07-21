import type { BindPublishResponse } from '../bindColumns.types';

export type BindSuccessProps = {
  result: BindPublishResponse;
  onDone: () => void;
  onBindAnother: () => void;
};

export function BindSuccess({ result, onDone, onBindAnother }: BindSuccessProps) {
  return (
    <div className="sh-block">
      <div className="reg-minted" role="status">
        <div className="rm-h">✓ Bindings published</div>
        <div className="rm-chain">
          <span className="rm-id">
            <span className="rm-l">{result.datasetName}</span>
            <span className="mono">{result.datasetId}</span>
          </span>
        </div>
        <div className="rm-foot">
          {result.boundCount} of {result.totalColumns} columns bound under Offer{' '}
          {result.offerId}. Contract <span className="mono">{result.contractId}</span> saved
          via {result.reviewPath === 'steward' ? 'steward endorsement' : 'self-certify'}.
        </div>
      </div>
      <div className="bulk-acts">
        <button type="button" className="btn-lt" onClick={onBindAnother}>
          Bind another dataset
        </button>
        <div className="spacer" />
        <button type="button" className="btn-dk" onClick={onDone}>
          Done
        </button>
      </div>
    </div>
  );
}
