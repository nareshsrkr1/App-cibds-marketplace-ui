import type { RegisterFormState } from './types';
import { HOST_TYPES, REG_USECASES } from './types';

type Props = {
  state: RegisterFormState;
  onChange: <K extends keyof RegisterFormState>(key: K, value: RegisterFormState[K]) => void;
  onToggleUseCase: (useCase: string) => void;
};

export function ContextStep({ state, onChange, onToggleUseCase }: Props) {
  return (
    <div className="rg-body-in">
      <div className="rg-eyebrow">Context</div>
      <h3 className="rg-h">Where it comes from.</h3>
      <p className="rg-sub">The applications that host and produce this data.</p>

      <div className="rg-fld">
        <label htmlFor="rg-host">Hosting application</label>
        <input
          id="rg-host"
          value={state.hostApp}
          onChange={(e) => onChange('hostApp', e.target.value)}
          placeholder="e.g. Endur"
        />
      </div>

      <div className="rg-fld">
        <label htmlFor="rg-hostType">Hosting application type</label>
        <select
          id="rg-hostType"
          value={state.hostType}
          onChange={(e) => onChange('hostType', e.target.value)}
        >
          {HOST_TYPES.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      <div className="rg-fld">
        <label htmlFor="rg-prod">Producing applications</label>
        <input
          id="rg-prod"
          value={state.prodApps}
          onChange={(e) => onChange('prodApps', e.target.value)}
          placeholder="Comma-separated upstream apps"
        />
      </div>

      <div className="rg-ucblock">
        <label>
          Use cases <span className="rg-multi">multi-select</span>
        </label>
        <div className="rg-ucchips">
          {REG_USECASES.map((u) => (
            <button
              key={u}
              type="button"
              className={`rg-uc${state.useCases.includes(u) ? ' on' : ''}`}
              onClick={() => onToggleUseCase(u)}
            >
              {u}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
