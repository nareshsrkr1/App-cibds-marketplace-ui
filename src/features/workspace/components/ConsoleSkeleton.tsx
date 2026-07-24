/** Shaped placeholder for the first console load — swapped for the real hero/KPIs/charts once ready. */
export function ConsoleSkeleton() {
  return (
    <div className="console-skeleton" aria-hidden="true">
      <div className="console-skeleton__block console-skeleton__eyebrow">
        <span className="console-skeleton__shimmer" />
      </div>
      <div className="console-skeleton__block console-skeleton__title">
        <span className="console-skeleton__shimmer" />
      </div>
      <div className="console-skeleton__kpis">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="console-skeleton__kpi">
            <span className="console-skeleton__shimmer" />
          </div>
        ))}
      </div>
      <div className="console-skeleton__charts">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="console-skeleton__chart">
            <span className="console-skeleton__shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}
