import { useEffect, useRef, useState } from 'react';
import type { NavGroup } from '../../../features/workspace/nav.types';
import { NavIcon } from './NavIcon';

const FUTURE = 'Available in a future release';

export type ConsoleSidebarProps = {
  groups: NavGroup[];
  status?: 'loading' | 'ready' | 'error';
  refreshing?: boolean;
  onSelect?: (id: string) => void;
};

export function ConsoleSidebar({
  groups,
  status = 'ready',
  refreshing = false,
  onSelect,
}: ConsoleSidebarProps) {
  const navRef = useRef<HTMLElement>(null);
  const [fadeTop, setFadeTop] = useState(false);
  const [fadeBottom, setFadeBottom] = useState(false);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const update = () => {
      const overflowing = el.scrollHeight > el.clientHeight + 1;
      setFadeTop(overflowing && el.scrollTop > 0);
      setFadeBottom(overflowing && el.scrollTop + el.clientHeight < el.scrollHeight - 1);
    };

    update();
    el.addEventListener('scroll', update);
    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    observer?.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      observer?.disconnect();
    };
  }, [groups]);

  if ((status === 'loading' || status === 'error') && groups.length === 0) {
    return <nav className="sb-nav" aria-label="Workspace" />;
  }

  return (
    <div className="sb-nav-wrap">
      <div className={`sb-nav-fade sb-nav-fade--top${fadeTop ? ' is-visible' : ''}`} />
      <nav
        ref={navRef}
        className={`sb-nav${refreshing ? ' is-refreshing' : ''}`}
        aria-label="Workspace"
      >
        {groups.map((g) => (
          <div key={g.id} className={`sb-group${g.sub ? ' sub' : ''}`}>
            <div className="sb-gl">{g.label}</div>
            {g.items.map((it) => (
              <button
                key={it.id}
                type="button"
                className={`sb-item${it.active ? ' on' : ''}${it.enabled ? '' : ' is-disabled'}`}
                disabled={!it.enabled}
                title={it.enabled ? it.label : FUTURE}
                aria-label={it.label}
                aria-current={it.active ? 'page' : undefined}
                onClick={() => {
                  if (it.enabled) onSelect?.(it.id);
                }}
              >
                {it.icon ? (
                  <span className="sb-ic" aria-hidden="true">
                    <NavIcon glyph={it.icon} />
                  </span>
                ) : null}
                <span className="sb-it-l">{it.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div
        className={`sb-nav-fade sb-nav-fade--bottom${fadeBottom ? ' is-visible' : ''}`}
      />
    </div>
  );
}
