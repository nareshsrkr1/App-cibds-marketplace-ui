import type { RegisterFormState } from './types';
import { STEWARD_OPTIONS } from './types';

type Props = {
  state: RegisterFormState;
  onChange: <K extends keyof RegisterFormState>(key: K, value: RegisterFormState[K]) => void;
};

export function StewardshipStep({ state, onChange }: Props) {
  return (
    <div className="rg-body-in">
      <div className="rg-eyebrow">Stewardship</div>
      <h3 className="rg-h">Ownership.</h3>
      <p className="rg-sub">Who owns and governs this dataset.</p>

      <div className="rg-fld">
        <label htmlFor="rg-owner">Data owner</label>
        <input
          id="rg-owner"
          value={state.owner}
          onChange={(e) => onChange('owner', e.target.value)}
          placeholder="e.g. Commodities Mid-Office"
        />
      </div>

      <div className="rg-fld">
        <label htmlFor="rg-steward">Governance role</label>
        <select
          id="rg-steward"
          value={state.steward}
          onChange={(e) => onChange('steward', e.target.value)}
        >
          {STEWARD_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
