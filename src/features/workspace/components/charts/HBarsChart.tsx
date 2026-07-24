import { memo } from 'react';

export const HBarsChart = memo(function HBarsChart({
  rows,
}: {
  rows: Array<[string, number]>;
}) {
  const max = Math.max(...rows.map((r) => r[1]), 1);
  const scale = ['#0f2338', '#1f3f5c', '#356184', '#5b87a8', '#8aa8c2', '#b6cad9'];
  return (
    <div className="bi-hbars">
      {rows.map(([label, value], i) => (
        <div className="bi-hrow" key={label}>
          <span className="bi-hlbl" title={label}>
            {label}
          </span>
          <div className="bi-htrack">
            <div
              className="bi-hfill"
              style={{
                width: `${((value / max) * 100).toFixed(1)}%`,
                background: scale[Math.min(i, scale.length - 1)],
              }}
            />
          </div>
          <span className="bi-hval">{value}</span>
        </div>
      ))}
    </div>
  );
});
