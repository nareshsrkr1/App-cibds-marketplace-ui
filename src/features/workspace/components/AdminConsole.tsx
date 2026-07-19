import { ConsoleHeader } from './ConsoleHeader';
import type { ConsoleSummary } from '../workspace.types';

export type AdminConsoleProps = {
  data: ConsoleSummary;
};

export function AdminConsole({ data }: AdminConsoleProps) {
  return (
    <div className="admin-console">
      <ConsoleHeader
        eyebrow={data.eyebrow}
        greeting={data.greeting}
        subtitle={data.subtitle}
      />
      <div className="sh-kpis" aria-label="Admin KPIs">
        {data.kpis.map((k) => (
          <div key={k.id} className={`sh-kpi${k.warn ? ' warn' : ''}`}>
            <span className="kn">{k.value}</span>
            <span className="kl">{k.label}</span>
          </div>
        ))}
      </div>
      {data.summaries && data.summaries.length > 0 ? (
        <div className="sh-actions" aria-label="Admin summaries">
          {data.summaries.map((s) => (
            <div key={s.id} className="sh-summary-chip">
              <strong>{s.title}</strong>
              <span>{s.body}</span>
            </div>
          ))}
        </div>
      ) : null}
      <div className="sh-cols">
        <div className="sh-block">
          <div className="sh-bh">
            <h3>Action items</h3>
          </div>
          {data.actionItems.length === 0 ? (
            <p className="sh-empty">No action items.</p>
          ) : (
            data.actionItems.map((item) => (
              <div className="wf-row" key={item.id}>
                <div className="wf-main">
                  <div className="wf-t">{item.title}</div>
                  <div className="wf-s">{item.subtitle}</div>
                </div>
                <div className="wf-side">
                  {item.tag ? (
                    <span className={`wf-tag ${item.tagKind ?? 'ok'}`}>{item.tag}</span>
                  ) : null}
                  {item.age ? <span className="wf-age">{item.age}</span> : null}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="sh-block">
          <div className="sh-bh">
            <h3>Recent activity</h3>
          </div>
          {data.recentActivity.length === 0 ? (
            <p className="sh-empty">No recent activity.</p>
          ) : (
            data.recentActivity.map((item) => (
              <div className="wf-row" key={item.id}>
                <div className="wf-main">
                  <div className="wf-t">{item.title}</div>
                  <div className="wf-s">
                    {item.detail}
                    {item.by ? ` · ${item.by}` : ''}
                  </div>
                </div>
                {item.age ? (
                  <div className="wf-side">
                    <span className="wf-age">{item.age}</span>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
