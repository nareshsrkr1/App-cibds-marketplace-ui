import { useContext } from 'react';
import { createPortal } from 'react-dom';
import { WorkspaceHeaderSlotContext } from '../../../components/layout/WorkspaceShell/WorkspaceShell';

export type ConsoleHeaderProps = {
  eyebrow: string;
  /** Page title. Optional — the Producer Console omits it and portals into the topbar instead. */
  greeting?: string;
  subtitle: string;
};

export function ConsoleHeader({ eyebrow, greeting, subtitle }: ConsoleHeaderProps) {
  const titleSlot = useContext(WorkspaceHeaderSlotContext);

  if (!greeting && titleSlot) {
    return createPortal(
      <>
        <span className="ws-topbar-eyebrow">{eyebrow}</span>
        <span className="ws-topbar-subtitle">{subtitle}</span>
      </>,
      titleSlot,
    );
  }

  return (
    <div className="sh-hero">
      <div className="sh-eyebrow">{eyebrow}</div>
      {greeting ? <h1>{greeting}</h1> : null}
      <p>{subtitle}</p>
    </div>
  );
}
