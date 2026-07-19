import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PersonaSelector, type PersonaOption } from '../../persona/PersonaSelector/PersonaSelector';
import { ConsoleSidebar } from '../../../features/workspace/components/ConsoleSidebar';

export type WorkspaceShellProps = {
  personas: PersonaOption[];
  activePersonaId: string;
  onPersonaChange?: (personaId: string) => void;
  userInitials: string;
  userName: string;
  userSubtitle?: string;
  children: ReactNode;
};

export function WorkspaceShell({
  personas,
  activePersonaId,
  onPersonaChange,
  userInitials,
  userName,
  userSubtitle,
  children,
}: WorkspaceShellProps) {
  return (
    <div className="appshell show" data-testid="workspace-shell">
      <aside className="sb" aria-label="Workspace sidebar">
        <Link to="/" className="sb-brand">
          <span className="sb-mk">C</span>
          <div>
            <div className="sb-bn">CIB Data Services</div>
            <div className="sb-bs">Data Marketplace</div>
          </div>
        </Link>
        <PersonaSelector
          personas={personas}
          activePersonaId={activePersonaId}
          onChange={onPersonaChange}
        />
        <ConsoleSidebar persona={activePersonaId} />
        <div className="sb-foot">
          <div className="sb-user">
            <span className="sb-av">{userInitials}</span>
            <div>
              <div className="sb-un">{userName}</div>
              {userSubtitle ? <div className="sb-ur">{userSubtitle}</div> : null}
            </div>
          </div>
        </div>
      </aside>
      <div className="sh-main">{children}</div>
    </div>
  );
}
