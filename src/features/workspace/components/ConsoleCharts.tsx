import { memo, useMemo } from 'react';
import type { ConsoleChart, ConsoleChartTier } from '../workspace.types';
import { ChartCard } from './charts/ChartCard';

export type ConsoleChartsProps = {
  charts: ConsoleChart[];
  tiers?: ConsoleChartTier[];
};

export const ConsoleCharts = memo(function ConsoleCharts({
  charts,
  tiers,
}: ConsoleChartsProps) {
  const byId = useMemo(() => new Map(charts.map((c) => [c.id, c])), [charts]);

  if (charts.length === 0) return null;

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
});
