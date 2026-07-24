import { useEffect, useState } from 'react';
import type { ConsolePanel } from '../workspace.types';

export type ConsolePanelBlockProps = {
  panel: ConsolePanel;
  onMore?: () => void;
};

/** Items beyond this many are hidden behind a local "Show more" reveal — forward cover for
 * real data volumes; today's mock panels (2-3 items) never hit this. */
const PAGE_SIZE = 6;

export function ConsolePanelBlock({ panel, onMore }: ConsolePanelBlockProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => setVisibleCount(PAGE_SIZE), [panel.id]);

  const visibleItems = panel.items.slice(0, visibleCount);
  const remaining = panel.items.length - visibleItems.length;

  return (
    <div className="sh-block">
      <div className="sh-bh">
        <h3>{panel.title}</h3>
        {panel.moreLabel ? (
          onMore ? (
            <button type="button" className="sh-more" onClick={onMore}>
              {panel.moreLabel}
            </button>
          ) : (
            <span className="sh-more" title="Available in a future release">
              {panel.moreLabel}
            </span>
          )
        ) : null}
      </div>
      {panel.items.length === 0 ? (
        <p className="sh-empty">Nothing here yet.</p>
      ) : (
        visibleItems.map((item) => (
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
              {item.meta ? <div className="wf-meta">{item.meta}</div> : null}
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
                  title="Open Workflow to approve"
                >
                  {item.actionLabel ?? 'Approve'}
                </button>
              ) : null}
            </div>
          </div>
        ))
      )}
      {remaining > 0 ? (
        <button
          type="button"
          className="sh-show-more"
          onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
        >
          Show {Math.min(remaining, PAGE_SIZE)} more
        </button>
      ) : null}
    </div>
  );
}
