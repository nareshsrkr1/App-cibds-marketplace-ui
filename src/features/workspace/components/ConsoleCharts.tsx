import type { ConsoleChart, ConsoleChartTier } from '../workspace.types';

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

function GaugeChart({
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
        <text x="70" y="66" textAnchor="middle" className="bi-dn" style={{ fill: stroke }}>
          {Math.round(value)}%
        </text>
        <text x="70" y="86" textAnchor="middle" className="bi-dl">
          {unitLabel}
        </text>
      </svg>
      <div className="bi-gauge-t">Target {target}%</div>
    </div>
  );
}

function TrendChart({
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
      <circle key={`${color}-${i}`} cx={px(i)} cy={py(v)} r={3} fill={color} stroke="#fff" strokeWidth={1.5}>
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
}

function ChartBody({ chart }: { chart: ConsoleChart }) {
  if (chart.kind === 'bars') return <BarsChart data={chart.data} color={chart.color} />;
  if (chart.kind === 'hbars') return <HBarsChart rows={chart.rows} />;
  if (chart.kind === 'donut') return <DonutChart realised={chart.realised} gap={chart.gap} />;
  if (chart.kind === 'split') return <SplitChart segments={chart.segments} />;
  if (chart.kind === 'gauge') {
    return (
      <GaugeChart value={chart.value} target={chart.target} unitLabel={chart.unitLabel} />
    );
  }
  return (
    <TrendChart seriesA={chart.seriesA} seriesB={chart.seriesB} labels={chart.labels} />
  );
}

function ChartCard({ chart }: { chart: ConsoleChart }) {
  return (
    <figure className="bi-card">
      <figcaption className="bi-cap">{chart.title}</figcaption>
      <div className="bi-sub">{chart.subtitle}</div>
      <div className="bi-body">
        <ChartBody chart={chart} />
      </div>
      {chart.footer ? <div className="bi-foot">{chart.footer}</div> : null}
    </figure>
  );
}

export type ConsoleChartsProps = {
  charts: ConsoleChart[];
  tiers?: ConsoleChartTier[];
};

export function ConsoleCharts({ charts, tiers }: ConsoleChartsProps) {
  if (charts.length === 0) return null;

  const byId = new Map(charts.map((c) => [c.id, c]));

  if (tiers && tiers.length > 0) {
    return (
      <div className="sh-charts" aria-label="Console statistics">
        {tiers.map((tier) => {
          const tierCharts = tier.chartIds
            .map((id) => byId.get(id))
            .filter((c): c is ConsoleChart => Boolean(c));
          const isSection = tier.heading === 'section';
          if (!isSection && tierCharts.length === 0) return null;
          return (
            <div key={tier.id} className={isSection ? 'bi-section' : 'bi-tier'}>
              <div className={isSection ? 'bi-sechd' : 'bi-tier-l'}>{tier.label}</div>
              {tierCharts.length > 0 ? (
                <div className="bi-primary">
                  {tierCharts.map((chart) => (
                    <ChartCard key={chart.id} chart={chart} />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="sh-charts sh-charts--flat" aria-label="Console statistics">
      {charts.map((chart) => (
        <ChartCard key={chart.id} chart={chart} />
      ))}
    </div>
  );
}
