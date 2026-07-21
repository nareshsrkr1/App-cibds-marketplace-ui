import type { BulkPdeMintedDataset } from '../bulkPde.types';

export type BulkPdeSuccessProps = {
  count: number;
  offerId: string;
  datasets: BulkPdeMintedDataset[];
  onUploadMore: () => void;
  onBindNow: () => void;
};

export function BulkPdeSuccess({
  count,
  offerId,
  datasets,
  onUploadMore,
  onBindNow,
}: BulkPdeSuccessProps) {
  return (
    <div className="sh-block">
      <div className="reg-minted" role="status">
        <div className="rm-h">
          ✓ {count} PDEs registered across {datasets.length} dataset
          {datasets.length !== 1 ? 's' : ''}
        </div>
        {datasets.map((d) => (
          <div className="rm-chain" key={d.dsId}>
            <span className="rm-id">
              <span className="rm-l">{d.name}</span>
              <span className="mono">{d.dsId}</span>
            </span>
          </div>
        ))}
        <div className="rm-foot">
          New Dataset IDs minted under Offer {offerId}. Columns are now available to bind.
        </div>
      </div>
      <div className="bulk-acts">
        <button type="button" className="btn-lt" onClick={onUploadMore}>
          Upload more
        </button>
        <div className="spacer" />
        <button type="button" className="btn-dk" onClick={onBindNow}>
          Bind these now →
        </button>
      </div>
    </div>
  );
}
