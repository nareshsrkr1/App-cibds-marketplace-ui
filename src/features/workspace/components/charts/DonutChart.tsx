import { memo } from 'react';

export const DonutChart = memo(function DonutChart({
  realised,
  gap,
}: {
  realised: number;
  gap: number;
}) {
  const total = realised + gap || 1;
  const r = 52;
  const c = 2 * Math.PI * r;
  const freal = realised / total;
  const ang = freal * c;
  return (
    <div className="bi-donutwrap">
      <svg viewBox="0 0 140 140" className="bi-donut" aria-hidden="true">
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth="16"
        />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="var(--green)"
          strokeWidth="16"
          strokeDasharray={`${ang} ${c}`}
          strokeDashoffset="0"
          transform="rotate(-90 70 70)"
          strokeLinecap="round"
        />
        <text x="70" y="66" textAnchor="middle" className="bi-dn">
          {Math.round(freal * 100)}%
        </text>
        <text x="70" y="84" textAnchor="middle" className="bi-dl">
          bound
        </text>
      </svg>
      <div className="bi-legend">
        <span>
          <i className="dg" />
          {realised} realised
        </span>
        <span>
          <i className="db" />
          {gap} gap
        </span>
      </div>
    </div>
  );
});
