import type { RegisterFormState } from './types';
import { CADENCE_OPTIONS, CLASS_OPTIONS, PATTERN_OPTIONS, SUBTYPE_OPTIONS } from './types';

type Props = {
  state: RegisterFormState;
  onChange: <K extends keyof RegisterFormState>(key: K, value: RegisterFormState[K]) => void;
};

export function TechnicalStep({ state, onChange }: Props) {
  return (
    <div className="rg-body-in">
      <div className="rg-eyebrow">Technical</div>
      <h3 className="rg-h">Shape & delivery.</h3>
      <p className="rg-sub">Class Word and the service strategy pattern.</p>

      <div className="rg-fld">
        <label htmlFor="rg-class">Classification</label>
        <select id="rg-class" value={state.rep} onChange={(e) => onChange('rep', e.target.value)}>
          {CLASS_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      <div className="rg-fld">
        <label htmlFor="rg-cadence">Data cadence type</label>
        <select
          id="rg-cadence"
          value={state.cadence}
          onChange={(e) => onChange('cadence', e.target.value)}
        >
          {CADENCE_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      <div className="rg-fld">
        <label htmlFor="rg-pattern">Service strategy pattern</label>
        <select
          id="rg-pattern"
          value={state.pattern}
          onChange={(e) => onChange('pattern', e.target.value)}
        >
          {PATTERN_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      <div className="rg-fld">
        <label htmlFor="rg-subtype">Pattern sub-type</label>
        <select
          id="rg-subtype"
          value={state.subtype}
          onChange={(e) => onChange('subtype', e.target.value)}
        >
          {SUBTYPE_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
