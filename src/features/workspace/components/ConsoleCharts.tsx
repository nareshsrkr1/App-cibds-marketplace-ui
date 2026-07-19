import type { ConsoleChart } from '../workspace.types';

function BarsChart({
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
}

function HBarsChart({ rows }: { rows: Array<[string, number]> }) {
  const max = Math.max(...rows.map((r) => r[1]), 1);
  return (
    <div className="bi-hbars">
      {rows.map(([label, value]) => (
        <div className="bi-hrow" key={label}>
          <span className="bi-hlbl">{label}</span>
          <div className="bi-htrack">
            <div className="bi-hfill" style={{ width: `${((value / max) * 100).toFixed(1)}%` }} />
          </div>
          <span className="bi-hval">{value}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ realised, gap }: { realised: number; gap: number }) {
  const total = realised + gap || 1;
  const r = 52;
  const c = 2 * Math.PI * r;
  const freal = realised / total;
  const ang = freal * c;
  return (
    <div className="bi-donutwrap">
      <svg viewBox="0 0 140 140" className="bi-donut" aria-hidden="true">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--border)" strokeWidth="16" />
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
}

function SplitChart({ segments }: { segments: Record<string, number> }) {
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
}

function ChartBody({ chart }: { chart: ConsoleChart }) {
  if (chart.kind === 'bars') return <BarsChart data={chart.data} color={chart.color} />;
  if (chart.kind === 'hbars') return <HBarsChart rows={chart.rows} />;
  if (chart.kind === 'donut') return <DonutChart realised={chart.realised} gap={chart.gap} />;
  return <SplitChart segments={chart.segments} />;
}

export type ConsoleChartsProps = {
  charts: ConsoleChart[];
};

export function ConsoleCharts({ charts }: ConsoleChartsProps) {
  if (charts.length === 0) return null;
  return (
    <div className="sh-charts" aria-label="Console statistics">
      {charts.map((chart) => (
        <figure className="bi-card" key={chart.id}>
          <figcaption className="bi-cap">{chart.title}</figcaption>
          <div className="bi-sub">{chart.subtitle}</div>
          <div className="bi-body">
            <ChartBody chart={chart} />
          </div>
          {chart.footer ? <div className="bi-foot">{chart.footer}</div> : null}
        </figure>
      ))}
    </div>
  );
}
