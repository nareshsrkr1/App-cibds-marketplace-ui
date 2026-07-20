export type SessionUser = {
  id: string;
  displayName: string;
  initials: string;
};

export type SessionContext = {
  user: SessionUser;
  roles: string[];
  entitlements: string[];
  defaultPersona: string;
  /** Optional subtitle under the user name in the shell footer. */
  userSubtitle?: string;
  /** All personas shown in the selector (HTML order). */
  availablePersonas?: string[];
  /** Personas the user may select; others render disabled but visible. */
  enabledPersonas?: string[];
  /** Display labels for persona switcher buttons. */
  personaLabels?: Record<string, string>;
  /** Per-persona footer / profile copy from session API. */
  personaProfiles?: Record<string, { subtitle?: string }>;
};

export const WORKSPACE_VIEW = 'WORKSPACE_VIEW';
export const ADMIN_CONSOLE_VIEW = 'ADMIN_CONSOLE_VIEW';

/** HTML SoT order: Producer → Governance → Consumer → Admin */
export const ALL_PERSONAS = ['PRODUCER', 'GOVERNANCE', 'CONSUMER', 'ADMIN'] as const;
