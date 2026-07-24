import { memo } from 'react';

export const SplitChart = memo(function SplitChart({
  segments,
}: {
  segments: Record<string, number>;
}) {
  const endur = segments.Endur ?? 0;
  const catalyst = segments.Catalyst ?? 0;
  const total = endur + catalyst || 1;
  const e = (endur / total) * 100;
  return (
    <div className="bi-split">
      <div className="bi-splitbar">
        <div className="bi-seg endur" style={{ width: `${e}%` }}>
          <span>{endur}</span>
        </div>
        <div className="bi-seg catalyst" style={{ width: `${100 - e}%` }}>
          <span>{catalyst}</span>
        </div>
      </div>
      <div className="bi-legend">
        <span>
          <i className="de" />
          Endur {Math.round(e)}%
        </span>
        <span>
          <i className="dc" />
          Catalyst {Math.round(100 - e)}%
        </span>
      </div>
    </div>
  );
});
