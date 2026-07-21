import type { NavGroup } from './nav.types';

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
  if ((status === 'loading' || status === 'error') && groups.length === 0) {
    return <nav className="sb-nav" aria-label="Workspace" />;
  }

  return (
    <nav className={`sb-nav${refreshing ? ' is-refreshing' : ''}`} aria-label="Workspace">
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
                  {it.icon}
                </span>
              ) : null}
              <span className="sb-it-l">{it.label}</span>
            </button>
          ))}
        </div>
      ))}
    </nav>
  );
}
