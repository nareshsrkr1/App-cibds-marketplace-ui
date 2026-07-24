import { memo } from 'react';
import type { ConsoleChart } from '../../workspace.types';
import { BarsChart } from './BarsChart';
import { HBarsChart } from './HBarsChart';
import { DonutChart } from './DonutChart';
import { SplitChart } from './SplitChart';
import { GaugeChart } from './GaugeChart';
import { TrendChart } from './TrendChart';

function ChartBody({ chart }: { chart: ConsoleChart }) {
  if (chart.kind === 'bars') return <BarsChart data={chart.data} color={chart.color} />;
  if (chart.kind === 'hbars') return <HBarsChart rows={chart.rows} />;
  if (chart.kind === 'donut')
    return <DonutChart realised={chart.realised} gap={chart.gap} />;
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

export const ChartCard = memo(function ChartCard({ chart }: { chart: ConsoleChart }) {
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
});
