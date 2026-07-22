import type { RegisterFormState } from './types';
import { RESTRICT_OPTIONS } from './types';

type Props = {
  state: RegisterFormState;
  onChange: <K extends keyof RegisterFormState>(key: K, value: RegisterFormState[K]) => void;
};

export function RestrictStep({ state, onChange }: Props) {
  return (
    <div className="rg-body-in">
      <div className="rg-eyebrow">Governance</div>
      <h3 className="rg-h">Access & restriction.</h3>
      <p className="rg-sub">How this dataset may be used and by whom.</p>

      <div className="rg-fld">
        <label htmlFor="rg-restrict">Restriction</label>
        <select
          id="rg-restrict"
          value={state.restrict}
          onChange={(e) => onChange('restrict', e.target.value)}
        >
          {RESTRICT_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
