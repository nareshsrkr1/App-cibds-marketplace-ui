import type { RegisterFormState } from './types';
import { FREQ_OPTIONS, TZ_OPTIONS } from './types';

type Props = {
  state: RegisterFormState;
  onChange: <K extends keyof RegisterFormState>(key: K, value: RegisterFormState[K]) => void;
};

export function ScheduleStep({ state, onChange }: Props) {
  return (
    <div className="rg-body-in">
      <div className="rg-eyebrow">Schedule</div>
      <h3 className="rg-h">Cadence & SLA.</h3>
      <p className="rg-sub">When the data refreshes and its service window.</p>

      <div className="rg-fld">
        <label htmlFor="rg-freq">Frequency</label>
        <select id="rg-freq" value={state.freq} onChange={(e) => onChange('freq', e.target.value)}>
          {FREQ_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      <div className="rg-fld">
        <label htmlFor="rg-tz">Timezone</label>
        <select id="rg-tz" value={state.tz} onChange={(e) => onChange('tz', e.target.value)}>
          {TZ_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      <div className="rg-fld">
        <label htmlFor="rg-sla-start">SLA start (cron)</label>
        <input
          id="rg-sla-start"
          value={state.slaStart}
          onChange={(e) => onChange('slaStart', e.target.value)}
          placeholder="0 6 * * *"
        />
      </div>

      <div className="rg-fld">
        <label htmlFor="rg-sla-end">SLA end (cron)</label>
        <input
          id="rg-sla-end"
          value={state.slaEnd}
          onChange={(e) => onChange('slaEnd', e.target.value)}
          placeholder="0 8 * * *"
        />
      </div>
    </div>
  );
}
