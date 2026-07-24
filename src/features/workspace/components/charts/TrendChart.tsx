import { memo } from 'react';

export const TrendChart = memo(function TrendChart({
  seriesA,
  seriesB,
  labels = ['Series A', 'Series B'],
}: {
  seriesA: number[];
  seriesB: number[];
  labels?: [string, string];
}) {
  const W = 280;
  const H = 120;
  const padL = 28;
  const padB = 18;
  const padT = 10;
  const n = Math.max(seriesA.length, seriesB.length, 1);
  const max = Math.max(...seriesA, ...seriesB, 1);
  const px = (i: number) => padL + (i / Math.max(n - 1, 1)) * (W - padL - 8);
  const py = (v: number) => padT + (1 - v / max) * (H - padT - padB);

  const line = (arr: number[], color: string) => {
    const pts = arr.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ');
    return (
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    );
  };

  const dots = (arr: number[], color: string) =>
    arr.map((v, i) => (
      <circle
        key={`${color}-${i}`}
        cx={px(i)}
        cy={py(v)}
        r={3}
        fill={color}
        stroke="#fff"
        strokeWidth={1.5}
      >
        <title>{`Week ${i + 1}: ${v}`}</title>
      </circle>
    ));

  const gridY = [0, Math.round(max / 2), max];

  return (
    <div className="bi-trend">
      <svg viewBox={`0 0 ${W} ${H}`} className="bi-svg" aria-hidden="true">
        {gridY.map((v) => (
          <g key={v}>
            <line
              x1={padL}
              x2={W}
              y1={py(v)}
              y2={py(v)}
              stroke="#ece8e1"
              strokeWidth={1}
            />
            <text x={padL - 4} y={py(v) + 4} textAnchor="end" className="bi-axis">
              {v}
            </text>
          </g>
        ))}
        {line(seriesA, 'var(--gold-deep)')}
        {line(seriesB, 'var(--navy)')}
        {dots(seriesB, 'var(--navy)')}
        {dots(seriesA, 'var(--gold-deep)')}
        {seriesA.map((_, i) => (
          <text key={i} x={px(i)} y={H - 2} textAnchor="middle" className="bi-axis">
            W{i + 1}
          </text>
        ))}
      </svg>
      <div className="bi-trend-lg">
        <span>
          <i style={{ background: 'var(--gold-deep)' }} />
          {labels[0]}
        </span>
        <span>
          <i style={{ background: 'var(--navy)' }} />
          {labels[1]}
        </span>
      </div>
    </div>
  );
});
