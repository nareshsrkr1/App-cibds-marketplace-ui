import type { SessionContext, SessionUser } from './session.types';

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

function asStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object') return {};
  const out: Record<string, string> = {};
  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === 'string') out[key] = v;
  }
  return out;
}

function asPersonaProfiles(value: unknown): Record<string, { subtitle?: string }> {
  if (!value || typeof value !== 'object') return {};
  const out: Record<string, { subtitle?: string }> = {};
  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    if (!v || typeof v !== 'object') continue;
    const subtitle = (v as Record<string, unknown>).subtitle;
    out[key] = typeof subtitle === 'string' ? { subtitle } : {};
  }
  return out;
}

function asUser(value: unknown): SessionUser {
  const raw = (value ?? {}) as Record<string, unknown>;
  return {
    id: typeof raw.id === 'string' ? raw.id : '',
    displayName: typeof raw.displayName === 'string' ? raw.displayName : '',
    initials: typeof raw.initials === 'string' ? raw.initials : '',
  };
}

/** Defensive normalization so a real backend's shape can drift from the mock's without crashing the UI. */
export function adaptSessionContext(raw: SessionContext): SessionContext {
  return {
    user: asUser(raw.user),
    roles: asStringArray(raw.roles),
    entitlements: asStringArray(raw.entitlements),
    defaultPersona:
      typeof raw.defaultPersona === 'string' ? raw.defaultPersona : 'PRODUCER',
    userSubtitle: typeof raw.userSubtitle === 'string' ? raw.userSubtitle : undefined,
    availablePersonas: raw.availablePersonas ? asStringArray(raw.availablePersonas) : undefined,
    enabledPersonas: raw.enabledPersonas ? asStringArray(raw.enabledPersonas) : undefined,
    personaLabels: raw.personaLabels ? asStringRecord(raw.personaLabels) : undefined,
    personaProfiles: raw.personaProfiles ? asPersonaProfiles(raw.personaProfiles) : undefined,
  };
}
