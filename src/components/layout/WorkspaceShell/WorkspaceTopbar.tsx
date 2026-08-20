import { useEffect, useRef, useState } from 'react';
import type { PersonaOption } from '../../persona/PersonaSelector/PersonaSelector';

/** One glyph per entitlement, keyed by persona id (case-insensitive). */
function PersonaIcon({ personaId }: { personaId: string }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: '0 0 16 16',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };
  switch (personaId.toUpperCase()) {
    case 'PRODUCER':
      // Package / box — produces & ships datasets
      return (
        <svg {...common}>
          <path d="M8 1.5 14 4.7v6.6L8 14.5 2 11.3V4.7z" />
          <path d="M2 4.7 8 8l6-3.3M8 8v6.5" />
        </svg>
      );
    case 'GOVERNANCE':
      // Shield — governs & protects
      return (
        <svg {...common}>
          <path d="M8 1.5 13.5 3.5v4c0 3.7-2.4 6.2-5.5 7-3.1-.8-5.5-3.3-5.5-7v-4z" />
          <path d="M5.7 8 7.3 9.6 10.5 6.2" />
        </svg>
      );
    case 'CONSUMER':
      // Chart/eye — consumes & reads data
      return (
        <svg {...common}>
          <path d="M1.5 8s2.2-4.5 6.5-4.5S14.5 8 14.5 8s-2.2 4.5-6.5 4.5S1.5 8 1.5 8z" />
          <circle cx="8" cy="8" r="2" />
        </svg>
      );
    case 'ADMIN':
      // Gear — administers the workspace
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="2.2" />
          <path d="M8 1.7v1.7M8 12.6v1.7M14.3 8h-1.7M3.4 8H1.7M12.3 3.7l-1.2 1.2M4.9 11.1l-1.2 1.2M12.3 12.3l-1.2-1.2M4.9 4.9 3.7 3.7" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="5.5" />
        </svg>
      );
  }
}

export type WorkspaceTopbarProps = {
  personas: PersonaOption[];
  activePersonaId: string;
  onPersonaChange?: (personaId: string) => void;
  userInitials: string;
  userName: string;
  userSubtitle?: string;
  /** Receives the DOM node pages can portal their title into (see ConsoleHeader). */
  titleSlotRef?: (el: HTMLDivElement | null) => void;
};

/**
 * Top-right user/role control — replaces the sidebar's "Viewing as" switcher.
 * Shows the active role next to the user's name; opens a dropdown to switch
 * roles when the user has more than one available.
 */
export function WorkspaceTopbar({
  personas,
  activePersonaId,
  onPersonaChange,
  userInitials,
  userName,
  userSubtitle,
  titleSlotRef,
}: WorkspaceTopbarProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const activePersona = personas.find((p) => p.id === activePersonaId);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  return (
    <header className="ws-topbar">
      <div className="ws-topbar-title" ref={titleSlotRef} />
      <div className="ws-profile" ref={rootRef}>
        <button
          type="button"
          className="ws-profile-btn"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="ws-profile-av">{userInitials}</span>
          <span className="ws-profile-meta">
            <span className="ws-profile-name">{userName}</span>
            <span className="ws-profile-role">{activePersona?.label ?? 'Select role'}</span>
          </span>
          <svg
            className={`ws-profile-chev${open ? ' is-open' : ''}`}
            width="11"
            height="11"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path
              d="M4 6l4 4 4-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {open ? (
          <div className="ws-profile-menu" role="menu">
            <div className="ws-profile-menu-head">
              <span className="ws-profile-av ws-profile-av--lg">{userInitials}</span>
              <div>
                <div className="ws-profile-menu-name">{userName}</div>
                {userSubtitle ? (
                  <div className="ws-profile-menu-sub">{userSubtitle}</div>
                ) : null}
              </div>
            </div>
            <div className="ws-profile-menu-label">Switch role</div>
            {personas.map((p) => {
              const enabled = p.enabled !== false;
              const active = p.id === activePersonaId;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  className={`ws-persona-item${active ? ' on' : ''}`}
                  disabled={!enabled}
                  title={enabled ? p.label : 'Available in a future release'}
                  onClick={() => {
                    if (enabled && onPersonaChange) {
                      onPersonaChange(p.id);
                      setOpen(false);
                    }
                  }}
                >
                  <span className="ws-persona-item-lead">
                    <span className="ws-persona-icon">
                      <PersonaIcon personaId={p.id} />
                    </span>
                    <span>{p.label}</span>
                  </span>
                  {active ? (
                    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                      <path
                        d="M3 8.5l3.2 3.2L13 5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : !enabled ? (
                    <span className="ws-persona-locked" aria-hidden="true">
                      Locked
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </header>
  );
}
