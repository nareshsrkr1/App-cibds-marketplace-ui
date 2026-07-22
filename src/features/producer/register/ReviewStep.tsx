import type { RegisterFormState } from './types';

type Props = {
  state: RegisterFormState;
};

function row(label: string, value: string) {
  return (
    <div className="rg-rvrow" key={label}>
      <span className="rg-rvk">{label}</span>
      <span className="rg-rvv">{value || '—'}</span>
    </div>
  );
}

export function ReviewStep({ state }: Props) {
  if (state.minted) {
    return (
      <div className="rg-body-in">
        <div className="rg-minted">
          <div className="rgm-h">✓ Dataset registered</div>
          <div className="rgm-chain">
            <span className="rgm-id">
              <span className="rgm-l">App</span>
              <span className="mono">{state.appId}</span>
            </span>
            <span className="rgm-arr">›</span>
            <span className="rgm-id">
              <span className="rgm-l">Producer Contract</span>
              <span className="mono">{state.offerId}</span>
            </span>
            <span className="rgm-arr">›</span>
            <span className="rgm-id hi">
              <span className="rgm-l">Dataset ID · minted</span>
              <span className="mono">{state.dsId}</span>
            </span>
          </div>
          <div className="rgm-foot">
            Registered under the application&apos;s offer. Bind its columns as the next step —
            binding is a separate, deliberate action.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rg-body-in">
      <div className="rg-eyebrow">Review</div>
      <h3 className="rg-h">Confirm & register.</h3>
      <p className="rg-sub">Review the dataset before minting its Dataset ID.</p>
      <div className="rg-review">
        {row('Application', state.app)}
        {row('Name', state.name)}
        {row('Short description', state.shortDesc)}
        {row('System of record', state.sor)}
        {row('Lineage tier', state.tier)}
        {row('Retention', state.retention)}
        {row('Use cases', state.useCases.join(', '))}
        {row('Restriction', state.restrict)}
        {row('Class Word', state.rep)}
        {row('Pattern', `${state.pattern} · ${state.subtype}`)}
        {row('Frequency', `${state.freq} · ${state.tz}`)}
        {row('Owner', state.owner)}
        {row('Governance', state.steward)}
      </div>
    </div>
  );
}
