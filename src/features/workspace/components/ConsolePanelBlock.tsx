import type { ConsolePanel } from '../workspace.types';

export type ConsolePanelBlockProps = {
  panel: ConsolePanel;
};

export function ConsolePanelBlock({ panel }: ConsolePanelBlockProps) {
  return (
    <div className="sh-block">
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
  );
}
