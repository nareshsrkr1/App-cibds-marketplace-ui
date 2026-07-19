import type { ReactNode } from 'react';

export type AppShellProps = { header?: ReactNode; footer?: ReactNode; children: ReactNode };

export function AppShell({ header, footer, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-shell__header">{header}</header>
      <main className="app-shell__main">{children}</main>
      <footer className="app-shell__footer">{footer}</footer>
    </div>
  );
}
