import type { RegisterFormState } from './types';
import { RETENTION_OPTIONS, SOR_OPTIONS, TIER_OPTIONS } from './types';

type Props = {
  state: RegisterFormState;
  onChange: <K extends keyof RegisterFormState>(key: K, value: RegisterFormState[K]) => void;
};

export function PhysicalStep({ state, onChange }: Props) {
  return (
    <div className="rg-body-in">
      <div className="rg-eyebrow">Physical</div>
      <h3 className="rg-h">Source & lineage.</h3>
      <p className="rg-sub">System of record, regulatory tier and retention.</p>

      <div className="rg-fld">
        <label htmlFor="rg-sor">System of record</label>
        <select id="rg-sor" value={state.sor} onChange={(e) => onChange('sor', e.target.value)}>
          {SOR_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      <div className="rg-fld">
        <label htmlFor="rg-tier">BCBS 239 lineage tier</label>
        <select id="rg-tier" value={state.tier} onChange={(e) => onChange('tier', e.target.value)}>
          {TIER_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      <div className="rg-fld">
        <label htmlFor="rg-ret">Retention</label>
        <select
          id="rg-ret"
          value={state.retention}
          onChange={(e) => onChange('retention', e.target.value)}
        >
          {RETENTION_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
