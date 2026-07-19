export type PersonaOption = {
  id: string;
  label: string;
  enabled?: boolean;
};

export type PersonaSelectorProps = {
  personas: PersonaOption[];
  activePersonaId: string;
  onChange?: (personaId: string) => void;
};

export function PersonaSelector({
  personas,
  activePersonaId,
  onChange,
}: PersonaSelectorProps) {
  return (
    <div className="sb-persona">
      <div className="sb-plabel">Viewing as</div>
      <div className="sb-pswitch" role="group" aria-label="Persona">
        {personas.map((p) => {
          const enabled = p.enabled !== false;
          const active = p.id === activePersonaId;
          return (
            <button
              key={p.id}
              type="button"
              className={`sb-pbtn${active ? ' on' : ''}`}
              data-role={p.id.toLowerCase()}
              disabled={!enabled}
              aria-pressed={active}
              title={enabled ? p.label : 'Available in a future release'}
              onClick={() => {
                if (enabled && onChange) onChange(p.id);
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
