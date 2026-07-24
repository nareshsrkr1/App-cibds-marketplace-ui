import { memo } from 'react';

export const BarsChart = memo(function BarsChart({
  data,
  color = 'var(--navy)',
}: {
  data: Record<string, number>;
  color?: string;
}) {
  const keys = Object.keys(data);
  const vals = keys.map((k) => data[k]);
  const max = Math.max(...vals, 1);
  const W = 260;
  const H = 150;
  const pad = 28;
  const gap = (W - pad) / keys.length;
  const bw = gap * 0.6;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="bi-svg" aria-hidden="true">
      {keys.map((k, i) => {
        const x = pad + i * gap + (gap - bw) / 2;
        const h = (vals[i] / max) * (H - 40);
        const y = H - 24 - h;
        return (
          <g key={k}>
            <rect x={x} y={y} width={bw} height={h} rx={3} fill={color}>
              <title>{`${k}: ${vals[i]}`}</title>
            </rect>
            <text x={x + bw / 2} y={y - 5} textAnchor="middle" className="bi-val">
              {vals[i]}
            </text>
            <text x={x + bw / 2} y={H - 8} textAnchor="middle" className="bi-lbl">
              {k}
            </text>
          </g>
        );
      })}
    </svg>
  );
});
