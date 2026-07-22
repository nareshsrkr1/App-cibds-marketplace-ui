import type { RegisterFormState } from './types';
import { APP_REGISTRY, listApplications } from './registry';

type Props = {
  state: RegisterFormState;
  onChange: <K extends keyof RegisterFormState>(key: K, value: RegisterFormState[K]) => void;
};

export function DescribeStep({ state, onChange }: Props) {
  const inherited = state.app ? APP_REGISTRY[state.app] : null;

  return (
    <div className="rg-body-in">
      <div className="rg-eyebrow">Physical dataset</div>
      <h3 className="rg-h">Identify the dataset.</h3>
      <p className="rg-sub">The registered name and summary consumers see in the catalogue.</p>

      <div className="rg-fld">
        <label htmlFor="rg-app">
          Application <span className="req">*</span>
        </label>
        <select
          id="rg-app"
          value={state.app}
          onChange={(e) => onChange('app', e.target.value)}
        >
          <option value="">Select application…</option>
          {listApplications().map((app) => (
            <option key={app} value={app}>
              {app}
            </option>
          ))}
        </select>
        {inherited ? (
          <div className="rg-inherit">
            Inherits Producer Contract <span className="mono">{inherited.offerId}</span> · App{' '}
            <span className="mono">{inherited.appId}</span>
          </div>
        ) : null}
      </div>

      <div className="rg-fld">
        <label htmlFor="rg-name">
          Physical dataset name <span className="req">*</span>
        </label>
        <input
          id="rg-name"
          value={state.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="e.g. Endur_FX_Forwards_Snap"
        />
        <div className="rg-hint">The registered name consumers will see.</div>
      </div>

      <div className="rg-fld">
        <label htmlFor="rg-short">Short description</label>
        <input
          id="rg-short"
          maxLength={100}
          value={state.shortDesc}
          onChange={(e) => onChange('shortDesc', e.target.value)}
          placeholder="One line — what this dataset contains"
        />
      </div>

      <div className="rg-fld">
        <label htmlFor="rg-desc">Description</label>
        <textarea
          id="rg-desc"
          rows={2}
          value={state.desc}
          onChange={(e) => onChange('desc', e.target.value)}
          placeholder="A fuller description of the dataset, its grain and meaning."
        />
      </div>
    </div>
  );
}
