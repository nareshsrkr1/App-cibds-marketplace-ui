import { ConsoleCharts } from './ConsoleCharts';
import { ConsoleHeader } from './ConsoleHeader';
import type { ConsoleSummary } from '../workspace.types';

export type ProducerConsoleProps = {
  data: ConsoleSummary;
};

export function ProducerConsole({ data }: ProducerConsoleProps) {
  const actions = data.actions ?? [];
  const panels = data.panels ?? [];

  return (
    <div className="producer-console" data-testid="producer-console">
      <ConsoleHeader
        eyebrow={data.eyebrow}
        greeting={data.greeting}
        subtitle={data.subtitle}
      />

      <div className="sh-kpis" aria-label="Producer KPIs">
        {data.kpis.map((k) => (
          <div key={k.id} className={`sh-kpi${k.warn ? ' warn' : ''}`}>
            <span className="kn">{k.value}</span>
            <span className="kl">{k.label}</span>
          </div>
        ))}
      </div>

      {actions.length > 0 ? (
        <div className="sh-actions" aria-label="Console actions">
          {actions.map((a) => (
            <button
              key={a.id}
              type="button"
              className={a.variant === 'primary' ? 'btn-dk' : 'btn-lt'}
              disabled={a.enabled === false}
              title={a.enabled === false ? 'Available in a future release' : a.label}
            >
              {a.label}
            </button>
          ))}
        </div>
      ) : null}

      <ConsoleCharts charts={data.charts ?? []} />

      {panels.length > 0 ? (
        <div className="sh-cols">
          {panels.map((panel) => (
            <div className="sh-block" key={panel.id}>
              <div className="sh-bh">
                <h3>{panel.title}</h3>
                {panel.moreLabel ? (
                  <span className="sh-more" title="Available in a future release">
                    {panel.moreLabel}
                  </span>
                ) : null}
              </div>
              {panel.items.length === 0 ? (
                <p className="sh-empty">Nothing here yet.</p>
              ) : (
                panel.items.map((item) => (
                  <div className="wf-row" key={item.id}>
                    <div className="wf-main">
                      <div className="wf-t">{item.title}</div>
                      {item.subtitleHtml ? (
                        <div
                          className="wf-s"
                          dangerouslySetInnerHTML={{ __html: item.subtitleHtml }}
                        />
                      ) : item.subtitle ? (
                        <div className="wf-s">{item.subtitle}</div>
                      ) : null}
                    </div>
                    <div className="wf-side">
                      {item.tag ? (
                        <span className={`wf-tag ${item.tagKind ?? 'ok'}`}>{item.tag}</span>
                      ) : null}
                      {item.age ? <span className="wf-age">{item.age}</span> : null}
                      {item.approve ? (
                        <button
                          type="button"
                          className="wf-approve"
                          disabled
                          title="Available in a future release"
                        >
                          Approve
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
