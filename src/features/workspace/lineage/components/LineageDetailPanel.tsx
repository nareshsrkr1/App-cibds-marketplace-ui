import type { LineageColumnDetail } from '../lineage.types';

export type DetailRow = { label: string; value: string };

export type DetailView = {
  title: string;
  subtitle?: string;
  rows: DetailRow[];
  columns?: LineageColumnDetail[];
};

export type LineageDetailPanelProps = {
  view: DetailView | null;
};

export function LineageDetailPanel({ view }: LineageDetailPanelProps) {
  if (!view) {
    return (
      <div className="lin-detail lin-detail--empty">
        <p className="sub">Select a node in the diagram to see its details.</p>
      </div>
    );
  }

  return (
    <div className="lin-detail">
      <h3>{view.title}</h3>
      {view.subtitle ? <div className="sub">{view.subtitle}</div> : null}
      <dl className="lin-detail__rows">
        {view.rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      {view.columns && view.columns.length > 0 ? (
        <div className="lin-detail__cols">
          <div className="cat-nest-title">Columns</div>
          {view.columns.map((col) => (
            <div className="lin-detail__col" key={col.name}>
              <span className="mono">{col.name}</span>
              <span className="sub">
                {col.type} · {col.nullable ? 'Nullable' : 'Not null'}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
