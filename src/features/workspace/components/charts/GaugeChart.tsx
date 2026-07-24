import { memo } from 'react';

export const GaugeChart = memo(function GaugeChart({
  value,
  target,
  unitLabel = 'within SLA',
}: {
  value: number;
  target: number;
  unitLabel?: string;
}) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value)) / 100;
  const ang = pct * c;
  const met = value >= target;
  const near = value >= target - 15;
  const stroke = met ? 'var(--green)' : near ? 'var(--amber)' : 'var(--red)';
  return (
    <div className="bi-donutwrap">
      <svg viewBox="0 0 140 140" className="bi-donut" aria-hidden="true">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#eee7db" strokeWidth="15" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="15"
          strokeLinecap="round"
          strokeDasharray={`${ang} ${c}`}
          transform="rotate(-90 70 70)"
        />
        <text
          x="70"
          y="66"
          textAnchor="middle"
          className="bi-dn"
          style={{ fill: stroke }}
        >
          {Math.round(value)}%
        </text>
        <text x="70" y="86" textAnchor="middle" className="bi-dl">
          {unitLabel}
        </text>
      </svg>
      <div className="bi-gauge-t">Target {target}%</div>
    </div>
  );
});
